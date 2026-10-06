import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireCompany } from "./session";

/**
 * Fetch transaction history for a specific company (session-scoped).
 */
export const list = query({
  args: {
    sessionToken: v.string(),
    companyId: v.id("companies"),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    await requireCompany(ctx, args.sessionToken, args.companyId);
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .order("desc")
      .take(args.limit || 50);

    return transactions;
  },
});
