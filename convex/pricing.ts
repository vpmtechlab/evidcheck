import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireSuperAdmin } from "./session";

export const getPrices = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pricing").collect();
  },
});

export const getPriceByServiceId = query({
  args: { serviceId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pricing")
      .withIndex("by_service", (q) => q.eq("serviceId", args.serviceId))
      .first();
  },
});

export const updatePrice = mutation({
  args: { sessionToken: v.string(), pricingId: v.id("pricing"), newPrice: v.number() },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx, args.sessionToken);
    await ctx.db.patch(args.pricingId, {
      price: args.newPrice,
      updatedAt: Date.now()
    });
  },
});

export const addPrice = mutation({
  args: {
    sessionToken: v.string(),
    serviceCategory: v.string(),
    serviceId: v.string(),
    serviceName: v.string(),
    price: v.number(),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx, args.sessionToken);
    // Check if the serviceId already exists
    const existing = await ctx.db
      .query("pricing")
      .withIndex("by_service", (q) => q.eq("serviceId", args.serviceId))
      .first();
    
    if (existing) {
      throw new Error("Service with this ID already exists.");
    }
    
    await ctx.db.insert("pricing", {
      ...args,
      updatedAt: Date.now(),
    });
  },
});
