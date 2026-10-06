import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { recordAuditLog } from "./audit";
import { sha256hex, requireCompany, requireCompanyAdmin } from "./session";

/**
 * List active API keys for a company.
 * Only metadata is returned — key material is never exposed after creation.
 */
export const list = query({
  args: { sessionToken: v.string(), companyId: v.id("companies") },
  handler: async (ctx, args) => {
    await requireCompany(ctx, args.sessionToken, args.companyId);
    const keys = await ctx.db
      .query("apiKeys")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    return keys.map((k) => ({
      _id: k._id,
      name: k.name,
      mode: k.mode,
      keyPrefix: k.keyPrefix ?? `${k.keyHash.slice(0, 15)}…`,
      isActive: k.isActive,
      createdAt: k.createdAt,
    }));
  },
});

/**
 * Generate a new API key (Live or Test mode) for the company.
 * Only the SHA-256 hash is stored; the raw key is returned once.
 */
export const generate = mutation({
  args: {
    sessionToken: v.string(),
    companyId: v.id("companies"),
    name: v.string(), // e.g. "Live Production Key", "Sandbox Test Key"
    mode: v.optional(v.string()), // "live" or "test"
  },
  handler: async (ctx, args) => {
    const session = await requireCompanyAdmin(ctx, args.sessionToken, args.companyId);
    const mode = args.mode === "test" ? "test" : "live";
    const prefix = mode === "test" ? "evid_test_sk_" : "evid_live_sk_";
    const randomPart = [...crypto.getRandomValues(new Uint8Array(24))]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const rawKey = `${prefix}${randomPart}`;

    const apiKeyId = await ctx.db.insert("apiKeys", {
      companyId: args.companyId,
      name: args.name,
      keyHash: await sha256hex(rawKey),
      keyPrefix: `${prefix}…${randomPart.slice(-4)}`,
      mode: mode,
      isActive: true,
      createdAt: Date.now(),
    });

    await recordAuditLog(ctx, {
      companyId: args.companyId,
      userId: session.userId,
      action: "API_KEY_GENERATED",
      entityId: apiKeyId,
      entityType: "apiKey",
      details: `Generated new ${mode.toUpperCase()} API key: ${args.name}`,
    });

    return { id: apiKeyId, rawKey, mode };
  },
});

/**
 * Revoke/Deactivate an API key. Company admins only.
 */
export const revoke = mutation({
  args: {
    sessionToken: v.string(),
    apiKeyId: v.id("apiKeys"),
  },
  handler: async (ctx, args) => {
    const key = await ctx.db.get(args.apiKeyId);
    if (!key) throw new ConvexError("API Key not found");
    const session = await requireCompanyAdmin(ctx, args.sessionToken, key.companyId);

    await ctx.db.patch(args.apiKeyId, { isActive: false });

    await recordAuditLog(ctx, {
      companyId: key.companyId,
      userId: session.userId,
      action: "API_KEY_REVOKED",
      entityId: args.apiKeyId,
      entityType: "apiKey",
      details: `Revoked API key: ${key.name}`,
    });

    return true;
  },
});
