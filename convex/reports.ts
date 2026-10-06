import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { recordAuditLog } from "./audit";
import { requireCompany } from "./session";

/**
 * Record a new report generation entry for the caller's company.
 */
export const createReport = mutation({
  args: {
    sessionToken: v.string(),
    companyId: v.id("companies"),
    name: v.string(),
    type: v.string(),
    format: v.string(),
    status: v.string(),
    config: v.any(),
  },
  handler: async (ctx, args) => {
    const session = await requireCompany(ctx, args.sessionToken, args.companyId);
    const reportId = await ctx.db.insert("generatedReports", {
      companyId: args.companyId,
      userId: session.userId,
      name: args.name,
      type: args.type,
      format: args.format,
      status: args.status,
      config: args.config,
      createdAt: Date.now(),
    });

    await recordAuditLog(ctx, {
      companyId: args.companyId,
      userId: session.userId,
      action: "REPORT_GENERATED",
      entityId: reportId,
      entityType: "report",
      details: `${args.name} (${args.type}) was generated in ${args.format} format.`,
    });

    return reportId;
  },
});

/**
 * Fetch the latest reports for a company (session-scoped).
 */
export const listReports = query({
  args: {
    sessionToken: v.string(),
    companyId: v.id("companies"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireCompany(ctx, args.sessionToken, args.companyId);
    return await ctx.db
      .query("generatedReports")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .order("desc")
      .take(args.limit || 5);
  },
});

/**
 * Remove a report record from history (own company only).
 */
export const deleteReport = mutation({
  args: { sessionToken: v.string(), reportId: v.id("generatedReports") },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (!report) return;
    await requireCompany(ctx, args.sessionToken, report.companyId);
    await ctx.db.delete(args.reportId);
  },
});
