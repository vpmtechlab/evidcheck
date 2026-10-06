"use node";

import { action, internalAction } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { internal } from "./_generated/api";
import { createHmac } from "crypto";

const USD_TO_KES = 135; // Example rate: 1 USD = 135 KES

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
        callback_url: args.callback_url,
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

    if (hash !== args.signature) {
      console.error("Invalid Paystack webhook signature.");
      return { success: false, message: "Invalid signature" };
    }

    const event = JSON.parse(args.body);
    console.log(`Received Paystack event: ${event.event}`);

    // 2. Handle Charge Success
    if (event.event === "charge.success") {
      const { reference, amount, metadata } = event.data;
      const { companyId, userId, amount: displayAmount } = metadata;

      console.log(`Processing successful payment for reference: ${reference}`);

      try {
        await ctx.runMutation(internal.balances.addFunds, {
          companyId: companyId,
          userId: userId,
          amount: Number(displayAmount || amount / 100),
          referenceId: reference,
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
 * Legacy: Verifies a Paystack transaction directly (Manual check)
 */
export const verifyTransaction = action({
  args: {
    reference: v.string(),
    companyId: v.id("companies"),
    userId: v.id("users"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) throw new Error("PAYSTACK_SECRET_KEY not set");

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(args.reference)}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${paystackSecret}` },
      }
    );

    const data = await response.json();
    if (!data.status || data.data.status !== "success") return { success: false };

    await ctx.runMutation(internal.balances.addFunds, {
      companyId: args.companyId,
      userId: args.userId,
      amount: args.amount,
      referenceId: args.reference,
    });

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
    const session = await ctx.runQuery(internal.session.resolve, {
      sessionToken: args.sessionToken,
    });
    if (session.companyId !== args.companyId || session.userId !== args.userId) {
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
