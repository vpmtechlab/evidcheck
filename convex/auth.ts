import { mutation, internalMutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from "otplib";
import { recordAuditLog } from "./audit";
import { validateSession, issueSession, sha256hex, isSuperAdminUser, revokeUserSessions, getEffectivePermissions } from "./session";
import { assertNotLocked, recordLoginFailure, MAX_CHALLENGE_ATTEMPTS } from "./users";

// Standard "Authenticator" configuration for Google Authenticator / Authy compatibility
const PENDING_2FA_TTL_MS = 10 * 60 * 1000;

const totp = new TOTP({
  crypto: new NobleCryptoPlugin(),
  base32: new ScureBase32Plugin(),
});

/**
 * Generate a new TOTP secret for a user.
 * This is the first step of enabling 2FA.
 */
export const generate2FASecret = mutation({
  args: { sessionToken: v.string(), userId: v.id("users") },
  handler: async (ctx, args) => {
    const session = await validateSession(ctx, args.sessionToken);
    if (session.userId !== args.userId) {
      throw new ConvexError("Forbidden.");
    }
    const user = await ctx.db.get(args.userId);
    if (!user) throw new ConvexError("User not found");
    if (user.twoFactorEnabled) {
      throw new ConvexError("2FA is already enabled. Disable it first to set up a new authenticator.");
    }

    const secret = totp.generateSecret();
    const otpauth = totp.toURI({
      issuer: "EvidCheck",
      label: user.email,
      secret,
    });

    // The server remembers which secret it issued; enabling 2FA uses this,
    // never a secret supplied by the client.
    await ctx.db.patch(args.userId, {
      pendingTwoFactorSecret: secret,
      pendingTwoFactorExpires: Date.now() + PENDING_2FA_TTL_MS,
    });

    return { secret, otpauth };
  },
});

/**
 * Verify the first TOTP code and enable 2FA for the user.
 */
export const verifyAndEnable2FA = mutation({
  args: {
    sessionToken: v.string(),
    userId: v.id("users"),
    // Ignored (kept so older clients still validate); the server uses the
    // secret it issued in generate2FASecret.
    secret: v.optional(v.string()),
    code: v.string()
  },
  handler: async (ctx, args) => {
    const session = await validateSession(ctx, args.sessionToken);
    if (session.userId !== args.userId) {
      throw new ConvexError("Forbidden.");
    }
    const user = await ctx.db.get(args.userId);
    if (!user) throw new ConvexError("User not found");
    if (user.twoFactorEnabled) throw new ConvexError("2FA is already enabled.");
    const secret = user.pendingTwoFactorSecret;
    if (!secret || !user.pendingTwoFactorExpires || user.pendingTwoFactorExpires < Date.now()) {
      throw new ConvexError("2FA setup expired. Please start again.");
    }

    // IMPORTANT: verify() in v13 returns an object { valid: boolean, ... }
    const result = await totp.verify(args.code, { secret });

    if (!result.valid) {
      throw new ConvexError("Invalid Code");
    }

    await ctx.db.patch(args.userId, {
      twoFactorEnabled: true,
      twoFactorSecret: secret,
      pendingTwoFactorSecret: undefined,
      pendingTwoFactorExpires: undefined,
    });
    await recordAuditLog(ctx, {
      companyId: session.companyId,
      userId: args.userId,
      action: "2FA_ENABLED",
      details: "Two-factor authentication was enabled.",
    });

    return true;
  },
});

/**
 * Disable 2FA for a user. Requires a current TOTP code as proof of possession.
 */
export const disable2FA = mutation({
  args: { sessionToken: v.string(), userId: v.id("users"), code: v.string() },
  handler: async (ctx, args) => {
    const session = await validateSession(ctx, args.sessionToken);
    if (session.userId !== args.userId) {
      throw new ConvexError("Forbidden.");
    }
    const user = await ctx.db.get(args.userId);
    if (!user?.twoFactorSecret || !user.twoFactorEnabled) {
      throw new ConvexError("2FA is not enabled");
    }
    const result = await totp.verify(args.code, {
      secret: user.twoFactorSecret,
    });
    if (!result.valid) {
      throw new ConvexError("Invalid Code");
    }
    await ctx.db.patch(args.userId, {
      twoFactorEnabled: false,
      twoFactorSecret: undefined,
    });
    // Weakening sign-in security signs out every other device.
    await revokeUserSessions(ctx, args.userId, session.tokenHash);
    await recordAuditLog(ctx, {
      companyId: session.companyId,
      userId: args.userId,
      action: "2FA_DISABLED",
      details: "Two-factor authentication was disabled.",
    });
    return true;
  },
});

/**
 * Verify a 2FA code during login. Requires the single-use challenge token
 * that `users.login` issues after a correct password, so the TOTP code is a
 * true second factor rather than a replacement for the password.
 */
export const verify2FACode = mutation({
  args: {
    challengeToken: v.string(),
    code: v.string()
  },
  handler: async (ctx, args) => {
    const challengeHash = await sha256hex(args.challengeToken);
    const challenge = await ctx.db
      .query("loginChallenges")
      .withIndex("by_tokenHash", (q) => q.eq("tokenHash", challengeHash))
      .first();

    if (!challenge || challenge.expiresAt <= Date.now()) {
      if (challenge) await ctx.db.delete(challenge._id);
      throw new ConvexError("Your sign-in attempt has expired. Please sign in again.");
    }

    const user = await ctx.db.get(challenge.userId);
    if (!user || !user.twoFactorSecret || !user.twoFactorEnabled) {
      await ctx.db.delete(challenge._id);
      throw new ConvexError("2FA is not enabled");
    }
    assertNotLocked(user);

    // IMPORTANT: result is an object { valid: true/false }
    const result = await totp.verify(args.code, {
      secret: user.twoFactorSecret,
    });

    if (!result.valid) {
      // Returned, not thrown, so the attempt counters actually persist.
      const attempts = challenge.attempts + 1;
      if (attempts >= MAX_CHALLENGE_ATTEMPTS) {
        await ctx.db.delete(challenge._id);
        await recordLoginFailure(ctx, user._id);
        return { error: "Too many invalid codes. Please sign in again." };
      }
      await ctx.db.patch(challenge._id, { attempts });
      return { error: "Invalid Code" };
    }

    // Single use: burn the challenge before issuing the session.
    await ctx.db.delete(challenge._id);

    // Record Login in Audit Logs after successful 2FA verification
    await recordAuditLog(ctx, {
      companyId: user.companyId,
      userId: user._id,
      action: "USER_LOGIN",
      details: `User logged in with 2FA`,
      metadata: {
        method: "2FA",
      },
    });

    return {
      userId: user._id,
      companyId: user.companyId,
      role: user.role,
      email: user.email,
      first_name: user.firstName,
      last_name: user.surname,
      needsPasswordChange: user.needsPasswordChange ?? false,
      has_completed_tour: user.has_completed_tour ?? false,
      isSuperAdmin: isSuperAdminUser(user),
      permissions: await getEffectivePermissions(ctx, user),
      ...(await issueSession(ctx, user)),
    };
  },
});

/**
 * One-off cleanup: drop 2FA secrets left on accounts where 2FA is off, and
 * expired pending enrollments. Idempotent. Run from the CLI:
 *   npx convex run auth:clearStaleTwoFactorSecrets
 */
export const clearStaleTwoFactorSecrets = internalMutation({
  args: {},
  handler: async (ctx) => {
    let cleared = 0;
    for await (const user of ctx.db.query("users")) {
      const staleSecret = !user.twoFactorEnabled && user.twoFactorSecret;
      const stalePending =
        user.pendingTwoFactorSecret && (user.pendingTwoFactorExpires ?? 0) < Date.now();
      if (staleSecret || stalePending) {
        await ctx.db.patch(user._id, {
          ...(staleSecret ? { twoFactorSecret: undefined } : {}),
          ...(stalePending ? { pendingTwoFactorSecret: undefined, pendingTwoFactorExpires: undefined } : {}),
        });
        cleared++;
      }
    }
    return { cleared };
  },
});
