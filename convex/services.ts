import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { requireSuperAdmin } from "./session";

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * Returns all active service categories with their actions and check types.
 * This is the primary query used by the verification wizard.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("serviceCategories")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const sorted = categories.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

    return await Promise.all(
      sorted.map(async (cat) => {
        const actions = await ctx.db
          .query("serviceActions")
          .withIndex("by_category", (q) => q.eq("categoryId", cat._id))
          .collect();

        const checkTypes = await ctx.db
          .query("serviceCheckTypes")
          .withIndex("by_category", (q) => q.eq("categoryId", cat._id))
          .collect();

        return {
          ...cat,
          actions: actions
            .filter((a) => a.enabled)
            .sort((a, b) => (a.order ?? 99) - (b.order ?? 99)),
          checkTypes: checkTypes.sort((a, b) => (a.order ?? 99) - (b.order ?? 99)),
        };
      })
    );
  },
});

/**
 * Returns a single category by its slug, with its check types.
 * Used to populate the check type dropdown in step 3.
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const category = await ctx.db
      .query("serviceCategories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!category) return null;

    const checkTypes = await ctx.db
      .query("serviceCheckTypes")
      .withIndex("by_category", (q) => q.eq("categoryId", category._id))
      .collect();

    return {
      ...category,
      checkTypes: checkTypes.sort((a, b) => (a.order ?? 99) - (b.order ?? 99)),
    };
  },
});

// ── Admin Mutations ───────────────────────────────────────────────────────────

export const createCategory = mutation({
  args: {
    sessionToken: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    icon: v.string(),
    color: v.string(),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx, args.sessionToken);
    return await ctx.db.insert("serviceCategories", {
      ...args,
      isActive: true,
    });
  },
});

export const updateCategory = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("serviceCategories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    order: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx, args.sessionToken);
    const { id, sessionToken: _t, ...patch } = args;
    await ctx.db.patch(id, patch);
  },
});

export const createAction = mutation({
  args: {
    sessionToken: v.string(),
    categoryId: v.id("serviceCategories"),
    label: v.string(),
    slug: v.string(),
    enabled: v.boolean(),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx, args.sessionToken);
    const { sessionToken: _t, ...rest } = args;
    return await ctx.db.insert("serviceActions", rest);
  },
});

export const updateAction = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("serviceActions"),
    label: v.optional(v.string()),
    enabled: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx, args.sessionToken);
    const { id, sessionToken: _t, ...patch } = args;
    await ctx.db.patch(id, patch);
  },
});

export const createCheckType = mutation({
  args: {
    sessionToken: v.string(),
    categoryId: v.id("serviceCategories"),
    label: v.string(),
    slug: v.string(),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx, args.sessionToken);
    const { sessionToken: _t, ...rest } = args;
    return await ctx.db.insert("serviceCheckTypes", rest);
  },
});

export const deleteCheckType = mutation({
  args: { sessionToken: v.string(), id: v.id("serviceCheckTypes") },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx, args.sessionToken);
    await ctx.db.delete(args.id);
  },
});
