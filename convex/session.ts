import { v, ConvexError } from "convex/values";
import {
	query,
	mutation,
	internalQuery,
	internalMutation,
	type QueryCtx,
	type MutationCtx,
} from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

/** Absolute session lifetime (mirrors the session cookie max-age). */
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

/** SHA-256 hex digest (tokens are stored hashed, never plaintext). */
export async function sha256hex(input: string): Promise<string> {
	const digest = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(input),
	);
	return [...new Uint8Array(digest)]
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

/** Mints a 256-bit opaque session token (returned to the client once). */
export function mintSessionToken(): string {
	return [...crypto.getRandomValues(new Uint8Array(32))]
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

export type SessionDoc = Doc<"sessions">;

/**
 * Issues an opaque session for a freshly authenticated user.
 * Returns the plaintext token once — only its hash is stored.
 */
export async function issueSession(
	ctx: MutationCtx,
	user: { _id: Id<"users">; companyId: Id<"companies">; role: string; email: string },
): Promise<{ sessionToken: string; sessionExpiresAt: number }> {
	const sessionToken = mintSessionToken();
	const sessionExpiresAt = Date.now() + SESSION_DURATION_MS;
	await ctx.runMutation(internal.session.create, {
		userId: user._id,
		companyId: user.companyId,
		role: user.role,
		email: user.email,
		expiresAt: sessionExpiresAt,
		tokenHash: await sha256hex(sessionToken),
	});
	return { sessionToken, sessionExpiresAt };
}

/** Internal: persist a fresh session row, returning nothing secret. */
export const create = internalMutation({
	args: {
		userId: v.id("users"),
		companyId: v.id("companies"),
		role: v.string(),
		email: v.string(),
		expiresAt: v.number(),
		tokenHash: v.string(),
	},
	handler: async (ctx, args) => {
		await ctx.db.insert("sessions", {
			tokenHash: args.tokenHash,
			userId: args.userId,
			companyId: args.companyId,
			role: args.role,
			email: args.email,
			expiresAt: args.expiresAt,
			createdAt: Date.now(),
		});
	},
});

/** Internal: look a session up by token hash (for actions, which lack ctx.db). */
export const getByHash = internalQuery({
	args: { tokenHash: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("sessions")
			.withIndex("by_tokenHash", (q) => q.eq("tokenHash", args.tokenHash))
			.first();
	},
});

/** Public: resolve the calling member from a session token (powers hydration). */
export const getSessionUser = query({
	args: { sessionToken: v.string() },
	handler: async (ctx, args) => {
		const session = await validateSession(ctx, args.sessionToken);
		const user = await ctx.db.get(session.userId);
		if (!user) return null;
		return {
			id: user._id,
			first_name: user.firstName,
			last_name: user.surname,
			email: user.email,
			role: user.role,
			companyId: user.companyId,
			needsPasswordChange: user.needsPasswordChange ?? false,
			has_completed_tour: user.has_completed_tour ?? false,
			twoFactorEnabled: !!user.twoFactorEnabled,
			isSuperAdmin: user.isSuperAdmin === true,
			permissions: await getEffectivePermissions(ctx, user),
		};
	},
});

/** Public: destroy a session (logout, best-effort — always succeeds). */
export const destroy = mutation({
	args: { sessionToken: v.string() },
	handler: async (ctx, args) => {
		const hash = await sha256hex(args.sessionToken);
		const session = await ctx.db
			.query("sessions")
			.withIndex("by_tokenHash", (q) => q.eq("tokenHash", hash))
			.first();
		if (session) await ctx.db.delete(session._id);
		return true;
	},
});

/** Internal: resolve+validate a session for actions (which have no ctx.db). */
export const resolve = internalQuery({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    return await validateSession(ctx, args.sessionToken);
  },
});

/** Account states that may hold a session. */
const SESSION_STATUSES = new Set(["active", "invited"]);

/**
 * Company-level roles a member may hold. Platform superadmin is NOT a role;
 * it is the separate `users.isSuperAdmin` flag.
 */
export const COMPANY_ROLES = ["admin", "Admin", "Compliance Officer"] as const;

/** Throws unless `role` is one of the assignable company roles. */
export function assertCompanyRole(role: string): void {
	if (!(COMPANY_ROLES as readonly string[]).includes(role)) {
		throw new ConvexError(`Invalid role "${role}".`);
	}
}

/** True when the user is a company admin (role strings are case-insensitive). */
export function isCompanyAdminRole(role: string | undefined): boolean {
	return (role ?? "").toLowerCase() === "admin";
}

/** True only when the user row carries the platform superadmin flag. */
export function isSuperAdminUser(user: Doc<"users"> | null | undefined): boolean {
	return user?.isSuperAdmin === true;
}

// ── Permissions ─────────────────────────────────────────────────────────────
// Company admins and platform superadmins always hold every permission, so an
// admin can never lock themselves out. Everyone else gets, in order: their
// per-user override, their company's role override, or the member defaults.

export const PERMISSIONS_LIST = [
	"view_users",
	"manage_users",
	"run_verifications",
	"view_history",
	"view_billing",
	"manage_billing",
	"manage_settings",
];

export const DEFAULT_MEMBER_PERMISSIONS = ["view_users", "run_verifications", "view_history"];

/** The permissions a user actually holds (see the rules above). */
export async function getEffectivePermissions(
	ctx: QueryCtx | MutationCtx,
	user: Doc<"users">,
): Promise<string[]> {
	if (isSuperAdminUser(user) || isCompanyAdminRole(user.role)) return [...PERMISSIONS_LIST];
	if (user.customPermissions) return user.customPermissions;
	const roleRecord = await ctx.db
		.query("rolePermissions")
		.withIndex("by_company_and_role", (q) =>
			q.eq("companyId", user.companyId).eq("role", user.role),
		)
		.first();
	return roleRecord?.permissions ?? DEFAULT_MEMBER_PERMISSIONS;
}

/** requireCompany + the caller must hold `permission`. */
export async function requirePermission(
	ctx: QueryCtx | MutationCtx,
	sessionToken: string | undefined,
	companyId: Id<"companies"> | string,
	permission: string,
): Promise<SessionDoc> {
	const session = await requireCompany(ctx, sessionToken, companyId);
	const user = await ctx.db.get(session.userId);
	const permissions = user ? await getEffectivePermissions(ctx, user) : [];
	if (!permissions.includes(permission)) {
		throw new ConvexError(`Forbidden: you don't have the "${permission}" permission.`);
	}
	return session;
}

/** Internal: requirePermission for actions (which have no ctx.db). */
export const resolveWithPermission = internalQuery({
	args: { sessionToken: v.string(), companyId: v.id("companies"), permission: v.string() },
	handler: async (ctx, args) => {
		return await requirePermission(ctx, args.sessionToken, args.companyId, args.permission);
	},
});

/** Strips credentials and secrets from a user row before it leaves the backend. */
export function toPublicUser(user: Doc<"users">) {
	const {
		password: _password,
		passwordHash: _passwordHash,
		twoFactorSecret: _twoFactorSecret,
		pendingTwoFactorSecret: _pendingTwoFactorSecret,
		pendingTwoFactorExpires: _pendingTwoFactorExpires,
		setupToken: _setupToken,
		setupTokenExpires: _setupTokenExpires,
		failedLoginAttempts: _failedLoginAttempts,
		lockedUntil: _lockedUntil,
		...rest
	} = user;
	return { ...rest, isSuperAdmin: user.isSuperAdmin === true };
}

/** Revokes every session belonging to a user (password change, deletion...). */
export async function revokeUserSessions(
	ctx: MutationCtx,
	userId: Id<"users">,
	keepTokenHash?: string,
): Promise<void> {
	const sessions = await ctx.db
		.query("sessions")
		.withIndex("by_userId", (q) => q.eq("userId", userId))
		.take(500);
	for (const s of sessions) {
		if (s.tokenHash !== keepTokenHash) await ctx.db.delete(s._id);
	}
}

/**
 * Throws unless the token maps to a live, unexpired session whose user still
 * exists and is allowed to sign in.
 */
export async function validateSession(
	ctx: QueryCtx | MutationCtx,
	sessionToken: string | undefined,
): Promise<SessionDoc> {
	if (!sessionToken) throw new ConvexError("Unauthorized: missing session.");
	const hash = await sha256hex(sessionToken);
	const session = await ctx.db
		.query("sessions")
		.withIndex("by_tokenHash", (q) => q.eq("tokenHash", hash))
		.first();
	if (!session) throw new ConvexError("Unauthorized: invalid session.");
	if (session.expiresAt <= Date.now()) {
		throw new ConvexError("Session expired. Please sign in again.");
	}
	const user = await ctx.db.get(session.userId);
	if (!user || !SESSION_STATUSES.has(user.status) || user.companyId !== session.companyId) {
		throw new ConvexError("Unauthorized: account is no longer active.");
	}
	return session;
}

/** validateSession + the session must belong to the given company. */
export async function requireCompany(
	ctx: QueryCtx | MutationCtx,
	sessionToken: string | undefined,
	companyId: Id<"companies"> | string,
): Promise<SessionDoc> {
	const session = await validateSession(ctx, sessionToken);
	if (session.companyId !== companyId) {
		throw new ConvexError("Forbidden: company mismatch.");
	}
	return session;
}

/** validateSession + caller must target themselves or a same-company member. */
export async function requireSelfOrCompanyMember(
	ctx: QueryCtx | MutationCtx,
	sessionToken: string | undefined,
	targetUserId: Id<"users"> | string,
): Promise<SessionDoc> {
	const session = await validateSession(ctx, sessionToken);
	if (session.userId === targetUserId) return session;
	const target = await ctx.db.get(targetUserId as Id<"users">);
	if (!target || target.companyId !== session.companyId) {
		throw new ConvexError("Forbidden.");
	}
	return session;
}

/** validateSession + caller must be the target user or a same-company admin. */
export async function requireSelfOrCompanyAdmin(
	ctx: QueryCtx | MutationCtx,
	sessionToken: string | undefined,
	targetUserId: Id<"users"> | string,
): Promise<SessionDoc> {
	const session = await validateSession(ctx, sessionToken);
	if (session.userId === targetUserId) return session;
	const target = await ctx.db.get(targetUserId as Id<"users">);
	if (!target) throw new ConvexError("Forbidden.");
	return await requireCompanyAdmin(ctx, sessionToken, target.companyId);
}

/** validateSession + caller must be a company admin (same company) or platform superadmin. */
export async function requireCompanyAdmin(
	ctx: QueryCtx | MutationCtx,
	sessionToken: string | undefined,
	companyId: Id<"companies"> | string,
): Promise<SessionDoc> {
	const session = await validateSession(ctx, sessionToken);
	const user = await ctx.db.get(session.userId);
	if (isSuperAdminUser(user)) return session;
	if (session.companyId !== companyId) {
		throw new ConvexError("Forbidden: company mismatch.");
	}
	if (!isCompanyAdminRole(user?.role)) {
		throw new ConvexError("Forbidden: admin role required.");
	}
	return session;
}

/** validateSession + caller must be a platform superadmin (any company). */
export async function requireSuperAdmin(
	ctx: QueryCtx | MutationCtx,
	sessionToken: string | undefined,
): Promise<SessionDoc> {
	const session = await validateSession(ctx, sessionToken);
	const user = await ctx.db.get(session.userId);
	if (!isSuperAdminUser(user)) {
		throw new ConvexError("Forbidden: superadmin required.");
	}
	return session;
}
