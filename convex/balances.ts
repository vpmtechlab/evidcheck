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
  },
  handler: async (ctx, args) => {
    // 0. Prevent double-spending if reference is provided
    if (args.referenceId) {
      const existing = await ctx.db
        .query("transactions")
        .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
        .filter((q) => q.eq(q.field("referenceId"), args.referenceId))
        .first();

      if (existing) {
        console.warn(`Duplicate transaction attempt: ${args.referenceId}`);
        return false;
      }
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

    // Record the transaction
    await ctx.db.insert("transactions", {
      companyId: args.companyId,
      type: "top_up",
      amount: args.amount,
      status: "success",
      referenceId: args.referenceId,
      createdAt: Date.now(),
    });

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
