import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireCompany } from "./session";

export const getBillingAnalytics = query({
  args: {
    sessionToken: v.string(),
    companyId: v.id("companies"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireCompany(ctx, args.sessionToken, args.companyId);
    const days = args.days || 30;
    const now = Date.now();
    const startTime = now - days * 24 * 60 * 60 * 1000;

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .filter((q) => q.gt(q.field("createdAt"), startTime))
      .collect();

    // Group by day using a stable key
    const dailyStats = new Map<string, { date: string; spent: number; toppedUp: number }>();

    for (let i = 0; i < days; i++) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const dayKey = d.toISOString().split("T")[0]; // YYYY-MM-DD
      const displayDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dailyStats.set(dayKey, { date: displayDate, spent: 0, toppedUp: 0 });
    }

    transactions.forEach((tx) => {
      if (!tx.createdAt) return; // Guard against legacy records without timestamps
      const dayDate = new Date(tx.createdAt);
      if (isNaN(dayDate.getTime())) return;

      const dayKey = dayDate.toISOString().split("T")[0];
      const stats = dailyStats.get(dayKey);
      if (stats) {
        if (tx.type === "top_up") {
          stats.toppedUp += tx.amount;
        } else {
          stats.spent += tx.amount;
        }
      }
    });

    return Array.from(dailyStats.values()).reverse();
  },
});
