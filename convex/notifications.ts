import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { validateSession, requireSelfOrCompanyMember } from "./session";

/**
 * Fetch the latest notifications for the caller (self-scoped).
 */
export const getRecent = query({
  args: { sessionToken: v.string(), userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireSelfOrCompanyMember(ctx, args.sessionToken, args.userId);
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(10); // Take 10 for more info

    return notifications.map((n) => ({
      id: n._id,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      createdAt: n.createdAt,
    }));
  },
});

/**
 * Mark a single notification as read (only your own).
 */
export const markAsRead = mutation({
  args: { sessionToken: v.string(), notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) throw new ConvexError("Notification not found");
    await requireSelfOrCompanyMember(ctx, args.sessionToken, notification.userId);
    await ctx.db.patch(args.notificationId, { isRead: true });
  },
});

/**
 * Clear all notifications for the caller (self-scoped).
 */
export const clearAll = mutation({
  args: { sessionToken: v.string(), userId: v.id("users") },
  handler: async (ctx, args) => {
    const session = await validateSession(ctx, args.sessionToken);
    if (session.userId !== args.userId) {
      throw new ConvexError("Forbidden.");
    }
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    for (const n of unread) {
      await ctx.db.patch(n._id, { isRead: true });
    }
  },
});
