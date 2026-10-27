import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  PERMISSIONS_LIST,
  DEFAULT_MEMBER_PERMISSIONS,
  isCompanyAdminRole,
  assertCompanyRole,
  requireCompany,
  requireCompanyAdmin,
  requireSelfOrCompanyMember,
} from "./session";
import { recordAuditLog } from "./audit";

/** Throws unless every entry is a known permission. */
function assertKnownPermissions(permissions: string[] | undefined): void {
  for (const p of permissions ?? []) {
    if (!PERMISSIONS_LIST.includes(p)) throw new ConvexError(`Unknown permission "${p}".`);
  }
}


export const getRolePermissions = query({
  args: {
    sessionToken: v.string(),
    companyId: v.id("companies"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    await requireCompany(ctx, args.sessionToken, args.companyId);
    const roleRecord = await ctx.db
      .query("rolePermissions")
      .withIndex("by_company_and_role", (q) =>
        q.eq("companyId", args.companyId).eq("role", args.role)
      )
      .first();

    // Admins always hold every permission (see session.getEffectivePermissions).
    if (isCompanyAdminRole(args.role)) {
      return PERMISSIONS_LIST;
    }
    return roleRecord?.permissions ?? DEFAULT_MEMBER_PERMISSIONS;
  },
});

export const updateRolePermissions = mutation({
  args: {
    sessionToken: v.string(),
    companyId: v.id("companies"),
    role: v.string(),
    permissions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await requireCompanyAdmin(ctx, args.sessionToken, args.companyId);
    assertCompanyRole(args.role);
    if (isCompanyAdminRole(args.role)) {
      throw new ConvexError("Admins always have every permission; this role can't be restricted.");
    }
    assertKnownPermissions(args.permissions);
    const existing = await ctx.db
      .query("rolePermissions")
      .withIndex("by_company_and_role", (q) =>
        q.eq("companyId", args.companyId).eq("role", args.role)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { permissions: args.permissions });
    } else {
      await ctx.db.insert("rolePermissions", {
        companyId: args.companyId,
        role: args.role,
        permissions: args.permissions,
      });
    }
    await recordAuditLog(ctx, {
      companyId: args.companyId,
      userId: session.userId,
      action: "ROLE_PERMISSIONS_UPDATED",
      details: `Updated permissions for role ${args.role}`,
      metadata: { permissions: args.permissions },
    });
    return true;
  },
});

export const getUserCustomPermissions = query({
  args: {
    sessionToken: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireSelfOrCompanyMember(ctx, args.sessionToken, args.userId);
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    return user.customPermissions || null;
  },
});

export const updateUserCustomPermissions = mutation({
  args: {
    sessionToken: v.string(),
    userId: v.id("users"),
    customPermissions: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const target = await ctx.db.get(args.userId);
    if (!target) throw new ConvexError("User not found");
    const session = await requireCompanyAdmin(ctx, args.sessionToken, target.companyId);
    assertKnownPermissions(args.customPermissions);
    await recordAuditLog(ctx, {
      companyId: target.companyId,
      userId: session.userId,
      action: "USER_PERMISSIONS_UPDATED",
      entityId: args.userId,
      entityType: "user",
      details: `Updated custom permissions for ${target.email}`,
      metadata: { customPermissions: args.customPermissions ?? null },
    });
    await ctx.db.patch(args.userId, {
      customPermissions: args.customPermissions,
    });
    return true;
  },
});
