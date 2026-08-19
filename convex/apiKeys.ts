import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { recordAuditLog } from "./audit";

/**
 * List all active API keys for a company.
 * Returns mode (live vs test), name, keyHash, createdAt.
 */
export const list = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("apiKeys")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

/**
 * Generate a new API key (Live or Test mode) for the company.
 */
export const generate = mutation({
  args: {
    companyId: v.id("companies"),
    name: v.string(), // e.g. "Live Production Key", "Sandbox Test Key"
    mode: v.optional(v.string()), // "live" or "test"
    userId: v.id("users"), // who generated it
  },
  handler: async (ctx, args) => {
    const mode = args.mode === "test" ? "test" : "live";
    const prefix = mode === "test" ? "evid_test_sk_" : "evid_live_sk_";
    const randomHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const rawKey = `${prefix}${randomHash}`;

    const apiKeyId = await ctx.db.insert("apiKeys", {
      companyId: args.companyId,
      name: args.name,
      keyHash: rawKey,
      mode: mode,
      isActive: true,
      createdAt: Date.now(),
    });

    await recordAuditLog(ctx, {
      companyId: args.companyId,
      userId: args.userId,
      action: "API_KEY_GENERATED",
      entityId: apiKeyId,
      entityType: "apiKey",
      details: `Generated new ${mode.toUpperCase()} API key: ${args.name}`,
    });

    return { id: apiKeyId, rawKey, mode };
  },
});

/**
 * Revoke/Deactivate an API key.
 */
export const revoke = mutation({
  args: { 
    apiKeyId: v.id("apiKeys"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const key = await ctx.db.get(args.apiKeyId);
    if (!key) throw new Error("API Key not found");

    await ctx.db.patch(args.apiKeyId, { isActive: false });

    await recordAuditLog(ctx, {
      companyId: key.companyId,
      userId: args.userId,
      action: "API_KEY_REVOKED",
      entityId: args.apiKeyId,
      entityType: "apiKey",
      details: `Revoked API key: ${key.name}`,
    });

    return true;
  },
});
