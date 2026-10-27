import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { notifyCompanyUsers } from "./audit";
import { Doc } from "./_generated/dataModel";
import { requireCompany } from "./session";

/**
 * Fetch the available balance for a specific company (session-scoped).
 */
export const getAvailableBalance = query({
  args: { sessionToken: v.string(), companyId: v.id("companies") },
  handler: async (ctx, args) => {
    await requireCompany(ctx, args.sessionToken, args.companyId);
    const balance = await ctx.db
      .query("balances")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .first();

    return balance?.availableBalance ?? 0;
  },
});

/**
 * Fetch the full balance document for a specific company (session-scoped).
 */
export const get = query({
  args: { sessionToken: v.string(), companyId: v.id("companies") },
  handler: async (ctx, args) => {
    await requireCompany(ctx, args.sessionToken, args.companyId);
    const balance = await ctx.db
      .query("balances")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .first();

    return balance;
  },
});

/**
 * Add funds to a company balance.
 * INTERNAL ONLY: called by the payment webhook and REST API after funds are
 * confirmed. Never exposed to clients directly.
 */
export const addFunds = internalMutation({
  args: {
    companyId: v.id("companies"),
    userId: v.id("users"),
    amount: v.number(),
    referenceId: v.optional(v.string()),
    // When true, the reference must match a checkout we initialized
    // (recordPendingTopUp) for this same company.
    requirePending: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!Number.isFinite(args.amount) || args.amount <= 0) {
      throw new Error("Top-up amount must be a positive number");
    }

    // 0. Each payment reference credits exactly once, platform-wide.
    let pending: Doc<"transactions"> | null = null;
    if (args.referenceId) {
      const existing = await ctx.db
        .query("transactions")
        .withIndex("by_referenceId", (q) => q.eq("referenceId", args.referenceId))
        .first();

      if (existing && existing.status !== "pending") {
        console.warn(`Duplicate transaction attempt: ${args.referenceId}`);
        return false;
      }
      if (existing && existing.companyId !== args.companyId) {
        console.error(`Reference ${args.referenceId} belongs to another company`);
        return false;
      }
      pending = existing;
    }
    if (args.requirePending && !pending) {
      console.error(`No initialized checkout for reference ${args.referenceId}`);
      return false;
    }

    const balance = await ctx.db
      .query("balances")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .first();

    if (!balance) {
      await ctx.db.insert("balances", {
        companyId: args.companyId,
        availableBalance: args.amount,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.patch(balance._id, {
        availableBalance: balance.availableBalance + args.amount,
        updatedAt: Date.now(),
      });
    }

    // Record the transaction (settling the pending checkout row if any)
    if (pending) {
      await ctx.db.patch(pending._id, { amount: args.amount, status: "success" });
    } else {
      await ctx.db.insert("transactions", {
        companyId: args.companyId,
        type: "top_up",
        amount: args.amount,
        status: "success",
        referenceId: args.referenceId,
        createdAt: Date.now(),
      });
    }

    // Record personalized notifications for the performer and the rest of the company
    const performer = await ctx.db.get(args.userId);
    await notifyCompanyUsers(ctx, {
      companyId: args.companyId,
      title: "Funds Added",
      type: "success",
      getMessage: (user: Doc<"users">) =>
        user._id === args.userId
          ? `Successfully added $${args.amount.toLocaleString()} to your available balance.`
          : `${performer?.firstName || 'A team member'} added $${args.amount.toLocaleString()} to the company balance.`,
    });

    return true;
  },
});

/**
 * Records a Paystack checkout we initialized, so the webhook only credits
 * references that started in our own flow, for the company that started them.
 */
export const recordPendingTopUp = internalMutation({
  args: {
    companyId: v.id("companies"),
    amount: v.number(),
    referenceId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("transactions", {
      companyId: args.companyId,
      type: "top_up",
      amount: args.amount,
      status: "pending",
      referenceId: args.referenceId,
      createdAt: Date.now(),
    });
  },
});
