import { query, internalMutation, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { Id, Doc } from "./_generated/dataModel";
import { MutationCtx } from "./_generated/server";
import { requireCompany, requireSuperAdmin, requireSelfOrCompanyMember, validateSession } from "./session";

/**
 * Internal helper to record an audit log.
 * Can be used within mutations.
 */
export async function recordAuditLog(ctx: MutationCtx, args: {
  companyId?: Id<"companies">;
  userId?: Id<"users">;
  action: string;
  entityId?: string;
  entityType?: string;
  details: string;
  metadata?: Record<string, unknown>;
}) {
  await ctx.db.insert("auditLogs", {
    ...args,
    createdAt: Date.now(),
  });
}

/**
 * Record an audit log entry via internal mutation.
 */
export const recordLog = internalMutation({
  args: {
    companyId: v.optional(v.id("companies")),
    userId: v.optional(v.id("users")),
    action: v.string(),
    entityId: v.optional(v.string()),
    entityType: v.optional(v.string()),
    details: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await recordAuditLog(ctx, args);
  },
});

/**
 * Fetch audit logs for a specific company.
 * Used by client-side dashboard audit view.
 */
export const getAuditLogsByCompany = query({
  args: { 
    sessionToken: v.string(),
    companyId: v.id("companies"),
    paginationOpts: paginationOptsValidator 
  },
  handler: async (ctx, args) => {
    await requireCompany(ctx, args.sessionToken, args.companyId);
    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .order("desc")
      .paginate(args.paginationOpts);

    // Enrich with user information
    return {
      ...logs,
      page: await Promise.all(
        logs.page.map(async (log) => {
          const user = log.userId ? await ctx.db.get(log.userId) : null;
          return {
            ...log,
            userName: user ? `${user.firstName} ${user.surname}` : "System",
          };
        })
      ),
    };
  },
});

/**
 * Fetch all audit logs across the platform.
 * Used by super-admin audit view.
 */
export const getGlobalAuditLogs = query({
  args: { sessionToken: v.string(), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx, args.sessionToken);
    const logs = await ctx.db
      .query("auditLogs")
      .order("desc")
      .paginate(args.paginationOpts);

    // Enrich with company and user information
    return {
      ...logs,
      page: await Promise.all(
        logs.page.map(async (log) => {
          const user = log.userId ? await ctx.db.get(log.userId) : null;
          const company = log.companyId ? await ctx.db.get(log.companyId) : null;
          return {
            ...log,
            userName: user ? `${user.firstName} ${user.surname}` : "System",
            companyName: company?.name || "Global",
          };
        })
      ),
    };
  },
});

/**
 * Internal helper to record a notification.
 */
export async function recordNotification(ctx: MutationCtx, args: {
  companyId: Id<"companies">;
  userId: Id<"users">;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
}) {
  await ctx.db.insert("notifications", {
    companyId: args.companyId,
    userId: args.userId,
    title: args.title,
    message: args.message,
    type: args.type || "info",
    isRead: false,
    createdAt: Date.now(),
  });
}

/**
 * Fetch notifications for a specific user.
 */
export const getActiveNotificationsByUser = query({
  args: { sessionToken: v.string(), userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireSelfOrCompanyMember(ctx, args.sessionToken, args.userId);
    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
  },
});

/**
 * Mark all notifications as read for a specific user.
 */
export const clearNotifications = mutation({
  args: { sessionToken: v.string(), userId: v.id("users") },
  handler: async (ctx, args) => {
    const session = await validateSession(ctx, args.sessionToken);
    if (session.userId !== args.userId) {
      throw new ConvexError("Forbidden.");
    }
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    for (const n of notifications) {
      await ctx.db.patch(n._id, { isRead: true });
    }
  },
});

/**
 * Mark a single notification as read.
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
 * Internal helper to notify multiple users in a company.
 * Useful for broadcasting company-wide events with personalized messages.
 */
export async function notifyCompanyUsers(ctx: MutationCtx, args: {
  companyId: Id<"companies">;
  title: string;
  type?: "info" | "success" | "warning" | "error";
  excludeUserId?: Id<"users">;
  getMessage: (user: Doc<"users">) => string;
}) {
  const users = await ctx.db
    .query("users")
    .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
    .collect();

  for (const user of users) {
    if (args.excludeUserId && user._id === args.excludeUserId) continue;
    
    await recordNotification(ctx, {
      companyId: args.companyId,
      userId: user._id,
      title: args.title,
      message: args.getMessage(user),
      type: args.type || "info",
    });
  }
}

/**
 * Fetch recent login history for a specific user.
 */
export const getLoginHistoryByUser = query({
  args: { sessionToken: v.string(), userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireSelfOrCompanyMember(ctx, args.sessionToken, args.userId);
    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("action"), "USER_LOGIN"))
      .order("desc")
      .take(10);

    return logs;
  },
});
