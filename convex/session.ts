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

/** Throws unless the token maps to a live, unexpired session. */
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

/** validateSession + caller must be a company admin or platform superadmin. */
export async function requireCompanyAdmin(
	ctx: QueryCtx | MutationCtx,
	sessionToken: string | undefined,
	companyId: Id<"companies"> | string,
): Promise<SessionDoc> {
	const session = await requireCompany(ctx, sessionToken, companyId);
	const user = await ctx.db.get(session.userId);
	const role = (user?.role || session.role).toLowerCase();
	const email = user?.email || session.email;
	const isSuperAdmin = role === "superadmin" || email.endsWith("@vpmtechlab.com");
	if (role !== "admin" && !isSuperAdmin) {
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
	const role = (user?.role || session.role).toLowerCase();
	const email = user?.email || session.email;
	if (role !== "superadmin" && !email.endsWith("@vpmtechlab.com")) {
		throw new ConvexError("Forbidden: superadmin required.");
	}
	return session;
}
