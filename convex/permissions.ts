import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  assertCompanyRole,
  requireCompany,
  requireCompanyAdmin,
  requireSelfOrCompanyMember,
} from "./session";
import { recordAuditLog } from "./audit";

export const PERMISSIONS_LIST = [
  "view_users",
  "manage_users",
  "run_verifications",
  "view_history",
  "view_billing",
  "manage_billing",
  "manage_settings",
];

/** Throws unless every entry is a known permission. */
function assertKnownPermissions(permissions: string[] | undefined): void {
  for (const p of permissions ?? []) {
    if (!PERMISSIONS_LIST.includes(p)) throw new ConvexError(`Unknown permission "${p}".`);
  }
}

const DEFAULT_ADMIN_PERMISSIONS = PERMISSIONS_LIST;
const DEFAULT_COMPLIANCE_OFFICER_PERMISSIONS = [
  "view_users",
  "run_verifications",
  "view_history",
];

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

    if (roleRecord) {
      return roleRecord.permissions;
    }

    // Return defaults if no custom overrides exist for this role at this company
    if (args.role === "Admin") {
      return DEFAULT_ADMIN_PERMISSIONS;
    } else {
      return DEFAULT_COMPLIANCE_OFFICER_PERMISSIONS;
    }
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
