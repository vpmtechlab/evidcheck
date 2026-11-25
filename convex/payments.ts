"use node";

import { action, internalAction } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { internal } from "./_generated/api";
import { createHmac, timingSafeEqual } from "crypto";

const USD_TO_KES = 135; // Example rate: 1 USD = 135 KES
const MIN_TOPUP_USD = 1;
const MAX_TOPUP_USD = 100_000;

/**
 * Only lets Paystack redirect back to our own site after checkout, so the
 * payment flow can't be used as an open redirect.
 */
function safeCallbackUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const site = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.hostname !== "localhost") return undefined;
    if (site && parsed.origin !== new URL(site).origin) return undefined;
    return parsed.toString();
  } catch {
    return undefined;
  }
}

/**
 * Initializes a Paystack transaction on the backend.
 * Returns an access_code to be used on the frontend.
 */
export const initializeTransactionInternal = internalAction({
  args: {
    amount: v.number(), // Amount in dollars
    email: v.string(),
    companyId: v.id("companies"),
    userId: v.id("users"),
    callback_url: v.optional(v.string()), // URL to redirect to after payment
  },
  handler: async (ctx, args) => {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) throw new Error("PAYSTACK_SECRET_KEY not set");

    if (!Number.isFinite(args.amount) || args.amount < MIN_TOPUP_USD || args.amount > MAX_TOPUP_USD) {
      throw new ConvexError(`Top-up amount must be between $${MIN_TOPUP_USD} and $${MAX_TOPUP_USD.toLocaleString()}.`);
    }

    // Convert USD to KES for initialization (since the account is KES-based)
    const amountInKesCents = Math.round(args.amount * USD_TO_KES * 100);

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: args.email,
        amount: amountInKesCents, 
        currency: "KES",
        callback_url: safeCallbackUrl(args.callback_url),
        metadata: {
          companyId: args.companyId,
          userId: args.userId,
          amount: args.amount, // Original USD amount to credit
        },
      }),
    });

    const data = await response.json();
    if (!data.status) {
      throw new Error(data.message || "Failed to initialize Paystack transaction.");
    }

    await ctx.runMutation(internal.balances.recordPendingTopUp, {
      companyId: args.companyId,
      amount: args.amount,
      referenceId: data.data.reference,
    });

    return {
      access_code: data.data.access_code,
      reference: data.data.reference,
      publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      authorization_url: data.data.authorization_url,
    };
  },
});

/**
 * Public Webhook Handler for Paystack events.
 * Triggered by Convex HTTP actions.
 */
export const handleWebhook = internalAction({
  args: {
    body: v.string(),
    signature: v.string(),
  },
  handler: async (ctx, args) => {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) throw new Error("PAYSTACK_SECRET_KEY not set");

    // 1. Verify Signature
    const hash = createHmac("sha512", paystackSecret)
      .update(args.body)
      .digest("hex");

    const expected = Buffer.from(hash, "hex");
    const received = Buffer.from(args.signature, "hex");
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
      console.error("Invalid Paystack webhook signature.");
      return { success: false, message: "Invalid signature" };
    }

    const event = JSON.parse(args.body);
    console.log(`Received Paystack event: ${event.event}`);

    // 2. Handle Charge Success
    if (event.event === "charge.success") {
      const { reference, amount, currency, metadata } = event.data;
      const { companyId, userId } = metadata ?? {};

      if (currency !== "KES" || !Number.isFinite(amount) || amount <= 0 || !companyId || !userId) {
        console.error(`Rejected malformed charge.success for reference ${reference}`);
        return { success: false, message: "Malformed charge event" };
      }

      // Credit what Paystack actually charged (KES cents), never the
      // metadata amount, which the payer's client could have chosen.
      const creditUsd = Math.floor((amount / 100 / USD_TO_KES) * 100) / 100;

      console.log(`Processing successful payment for reference: ${reference}`);

      try {
        await ctx.runMutation(internal.balances.addFunds, {
          companyId: companyId,
          userId: userId,
          amount: creditUsd,
          referenceId: reference,
          requirePending: true,
        });
        return { success: true };
      } catch (error) {
        console.error("Failed to credit balance from webhook:", error);
        return { success: false };
      }
    }

    return { success: true };
  },
});

/**
 * Public: initialize a Paystack transaction for the caller's own company.
 * Delegates to the internal action after verifying the session company.
 */
export const initializeTransaction = action({
  args: {
    sessionToken: v.string(),
    amount: v.number(),
    email: v.string(),
    companyId: v.id("companies"),
    userId: v.id("users"),
    callback_url: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    access_code: string;
    reference: string;
    publicKey: string | undefined;
    authorization_url: string;
  }> => {
    const session = await ctx.runQuery(internal.session.resolveWithPermission, {
      sessionToken: args.sessionToken,
      companyId: args.companyId,
      permission: "manage_billing",
    });
    if (session.userId !== args.userId) {
      throw new ConvexError("Forbidden.");
    }
    return await ctx.runAction(internal.payments.initializeTransactionInternal, {
      amount: args.amount,
      email: args.email,
      companyId: args.companyId,
      userId: args.userId,
      callback_url: args.callback_url,
    });
  },
});
