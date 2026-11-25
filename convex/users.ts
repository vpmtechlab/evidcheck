import { query, mutation, internalMutation, internalQuery, type MutationCtx } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import bcrypt from "bcryptjs";
import { recordNotification, recordAuditLog } from "./audit";
import { internal } from "./_generated/api";
import {
  issueSession,
  sha256hex,
  mintSessionToken,
  validateSession,
  requireCompany,
  requirePermission,
  requireCompanyAdmin,
  requireSelfOrCompanyAdmin,
  requireSelfOrCompanyMember,
  requireSuperAdmin,
  assertCompanyRole,
  revokeUserSessions,
  isSuperAdminUser,
  getEffectivePermissions,
} from "./session";
import { Id } from "./_generated/dataModel";

/** Cryptographically secure random credential material (passwords, tokens). */
function randomCredential(numBytes = 10): string {
	return [...crypto.getRandomValues(new Uint8Array(numBytes))]
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

// Blocklist of common personal email domains
const PERSONAL_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "aol.com",
  "mail.com",
  "protonmail.com",
  "zoho.com",
  "yandex.com",
];

function isPersonalEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return PERSONAL_EMAIL_DOMAINS.includes(domain);
}

const PERSONAL_EMAIL_ERROR = "Please use a work email address. Personal emails (e.g. Gmail, Yahoo) are not permitted.";

const PASSWORD_POLICY_ERROR =
  "Password must be at least 8 characters long, and include an uppercase letter, a lowercase letter, and a special character.";

/** Throws unless the password meets the platform policy. */
function assertStrongPassword(password: string): void {
  const ok =
    password.length >= 8 &&
    password.length <= 128 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
  if (!ok) throw new ConvexError(PASSWORD_POLICY_ERROR);
}

/** Canonical form for stored and looked-up emails. */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** "https://www.Acme.com/about" -> "acme.com" */
function normalizeDomain(domain: string): string {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, "")
    .replace(/^www\./, "")
    .split(/[/?#]/)[0];
}

/** True when the email's domain is the company domain or one of its subdomains. */
function emailMatchesDomain(email: string, domain: string): boolean {
  const emailDomain = email.split("@")[1] ?? "";
  return emailDomain === domain || emailDomain.endsWith("." + domain);
}

/** Looks a user up by email, tolerating rows stored before emails were normalized. */
async function findUserByEmail(ctx: MutationCtx, email: string) {
  const normalized = normalizeEmail(email);
  const byNormalized = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", normalized))
    .first();
  if (byNormalized) return byNormalized;
  const trimmed = email.trim();
  if (trimmed === normalized) return null;
  return await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", trimmed))
    .first();
}

/** 6-digit code from a CSPRNG. */
function randomSixDigitCode(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  return n.toString().padStart(6, "0");
}

const MAX_LOGIN_FAILURES = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const LOGIN_CHALLENGE_TTL_MS = 5 * 60 * 1000;
export const MAX_CHALLENGE_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const INVALID_LOGIN = "Invalid email or password";
// bcrypt hash of a random string, compared against when the email is unknown
// so response timing doesn't reveal which emails are registered.
const DUMMY_BCRYPT_HASH = "$2b$10$Rm2mMg99RtOlZp9/1eKmyuVEJePnazAdrMKHCDRfw6TIQRRi4m7CK";

/**
 * Records a failed sign-in and locks the account after repeated failures.
 * Callers must RETURN (not throw) afterwards, or the write is rolled back.
 */
export async function recordLoginFailure(ctx: MutationCtx, userId: Id<"users">): Promise<void> {
  const user = await ctx.db.get(userId);
  if (!user) return;
  const failures = (user.failedLoginAttempts ?? 0) + 1;
  if (failures >= MAX_LOGIN_FAILURES) {
    await ctx.db.patch(userId, { failedLoginAttempts: 0, lockedUntil: Date.now() + LOCKOUT_MS });
    await recordAuditLog(ctx, {
      companyId: user.companyId,
      userId,
      action: "ACCOUNT_LOCKED",
      details: `Account locked for ${LOCKOUT_MS / 60000} minutes after repeated failed sign-ins.`,
    });
  } else {
    await ctx.db.patch(userId, { failedLoginAttempts: failures });
  }
}

/** Throws if the account is currently locked out. */
export function assertNotLocked(user: { lockedUntil?: number }): void {
  if (user.lockedUntil && user.lockedUntil > Date.now()) {
    const minutes = Math.ceil((user.lockedUntil - Date.now()) / 60000);
    throw new ConvexError(`Too many failed sign-in attempts. Try again in ${minutes} minute(s).`);
  }
}

// Internal: verifies a REST API key by SHA-256 hash. Only backend code may
// call this — it is the authentication boundary for the public REST API.
export const verifyApiKey = internalMutation({
  args: { apiKey: v.string() },
  handler: async (ctx, args) => {
    const hashed = await sha256hex(args.apiKey);
    const hashedMatch = await ctx.db
      .query("apiKeys")
      .withIndex("by_keyHash", (q) => q.eq("keyHash", hashed))
      .first();

    if (hashedMatch) {
      if (!hashedMatch.isActive) return null;
      return await ctx.db.get(hashedMatch.companyId);
    }

    // Legacy plaintext rows: verify once, then upgrade to a hash in place.
    const legacyMatch = await ctx.db
      .query("apiKeys")
      .withIndex("by_keyHash", (q) => q.eq("keyHash", args.apiKey))
      .first();
    if (!legacyMatch || !legacyMatch.isActive) return null;
    await ctx.db.patch(legacyMatch._id, { keyHash: hashed });

    const company = await ctx.db.get(legacyMatch.companyId);
    return company;
  },
});

export const deductBalance = internalMutation({
  args: { companyId: v.id("companies"), amount: v.number() },
  handler: async (ctx, args) => {
    const balanceRecord = await ctx.db
      .query("balances")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .first();

    if (!balanceRecord) {
      throw new Error("Company balance not found");
    }

    if (balanceRecord.availableBalance < args.amount) {
      throw new Error("Insufficient balance");
    }

    // Deduct balance
    await ctx.db.patch(balanceRecord._id, {
      availableBalance: balanceRecord.availableBalance - args.amount,
      updatedAt: Date.now(),
    });

    // Record the transaction
    await ctx.db.insert("transactions", {
      companyId: args.companyId,
      type: "verification_fee",
      amount: args.amount,
      status: "success",
      createdAt: Date.now(),
    });

    return true;
  },
});

/** Internal: raw company balance lookup for backend flows (no session). */
export const getCompanyBalanceInternal = internalQuery({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    const balanceRecord = await ctx.db
      .query("balances")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .first();
    return balanceRecord?.availableBalance ?? 0;
  },
});

export const getCompanyBalance = query({
  args: { sessionToken: v.string(), companyId: v.id("companies") },
  handler: async (ctx, args) => {
    await requireCompany(ctx, args.sessionToken, args.companyId);
    const balanceRecord = await ctx.db
      .query("balances")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .first();

    return balanceRecord?.availableBalance ?? 0;
  },
});

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    userAgent: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { email, password, userAgent, location } = args;
    const user = await findUserByEmail(ctx, email);

    if (!user || !user.password) {
      bcrypt.compareSync(password, DUMMY_BCRYPT_HASH);
      return { error: INVALID_LOGIN };
    }

    assertNotLocked(user);

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      // Returned, not thrown, so the failure counter actually persists.
      await recordLoginFailure(ctx, user._id);
      return { error: INVALID_LOGIN };
    }

    if (user.status !== "active" && user.status !== "invited") {
      throw new ConvexError("Account is inactive. Please contact support.");
    }

    if (user.failedLoginAttempts || user.lockedUntil) {
      await ctx.db.patch(user._id, { failedLoginAttempts: 0, lockedUntil: undefined });
    }

    // 2FA: issue a short-lived, single-use challenge proving the password
    // step succeeded. verify2FACode requires it; a userId alone is useless.
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      const stale = await ctx.db
        .query("loginChallenges")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .take(20);
      for (const c of stale) await ctx.db.delete(c._id);

      const challengeToken = mintSessionToken();
      await ctx.db.insert("loginChallenges", {
        tokenHash: await sha256hex(challengeToken),
        userId: user._id,
        expiresAt: Date.now() + LOGIN_CHALLENGE_TTL_MS,
        attempts: 0,
      });
      return { twoFactorRequired: true as const, challengeToken };
    }

    // Record Login in Audit Logs (only if 2FA is not required or already verified)
    await recordAuditLog(ctx, {
      companyId: user.companyId,
      userId: user._id,
      action: "USER_LOGIN",
      details: `User logged in from ${userAgent || "unknown device"}`,
      metadata: {
        userAgent,
        location: location || "Unknown Location",
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

export const inviteUser = mutation({
  args: {
    sessionToken: v.string(),
    companyId: v.id("companies"),
    firstName: v.string(),
    surname: v.string(),
    email: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    // Only company admins (or superadmins) may invite new members.
    const session = await requireCompanyAdmin(ctx, args.sessionToken, args.companyId);
    assertCompanyRole(args.role);

    const email = normalizeEmail(args.email);
    if (isPersonalEmail(email)) {
      throw new ConvexError(PERSONAL_EMAIL_ERROR);
    }

    if (await findUserByEmail(ctx, email)) {
      throw new ConvexError("User with this email already exists.");
    }

    // Random temporary password (cryptographically secure). It only ever
    // leaves the backend inside the welcome email.
    const tempPassword = randomCredential(10);
    const hashedPassword = bcrypt.hashSync(tempPassword, bcrypt.genSaltSync(10));

    // The setup link carries the plaintext token; only its hash is stored.
    const setupToken = randomCredential(16);
    const userId = await ctx.db.insert("users", {
      companyId: args.companyId,
      firstName: args.firstName,
      surname: args.surname,
      email,
      password: hashedPassword,
      role: args.role,
      status: "invited",
      needsPasswordChange: true,
      has_completed_tour: false,
      setupToken: await sha256hex(setupToken),
      setupTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      createdAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.emails.sendWelcomeEmail, {
      email,
      firstName: args.firstName,
      tempPassword,
      setupToken,
    });

    await recordAuditLog(ctx, {
      companyId: args.companyId,
      userId: session.userId,
      action: "USER_INVITED",
      entityId: userId,
      entityType: "user",
      details: `Invited ${email} as ${args.role}`,
    });

    return { userId };
  },
});

/** Internal: raw member list for a company (no session). */
export const listUsersInternal = internalQuery({
  args: {
    companyId: v.id("companies"),
    role: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();

    return users.filter(u => {
      const matchRole = !args.role || args.role === "all" || u.role.toLowerCase() === args.role.toLowerCase();
      const matchStatus = !args.status || args.status === "all" || u.status.toLowerCase() === args.status.toLowerCase();
      return matchRole && matchStatus;
    }).map(u => ({
      id: u._id,
      name: `${u.firstName} ${u.surname}`,
      email: u.email,
      role: u.role,
      status: u.status,
      companyId: u.companyId,
      avatar: "",
      needsPasswordChange: u.needsPasswordChange ?? false,
      has_completed_tour: u.has_completed_tour ?? false,
      createdAt: u.createdAt,
    }));
  },
});

export const listUsers = query({
  args: {
    sessionToken: v.string(),
    companyId: v.id("companies"),
    role: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<
    Array<{
      id: Id<"users">;
      name: string;
      email: string;
      role: string;
      status: string;
      companyId: Id<"companies">;
      avatar: string;
      needsPasswordChange: boolean;
      has_completed_tour: boolean;
      createdAt: number;
    }>
  > => {
    // Callers may only list members of their own company (or superadmins).
    const session = await validateSession(ctx, args.sessionToken);
    if (session.companyId !== args.companyId) {
      await requireSuperAdmin(ctx, args.sessionToken);
    } else {
      await requirePermission(ctx, args.sessionToken, args.companyId, "view_users");
    }
    return await ctx.runQuery(internal.users.listUsersInternal, {
      companyId: args.companyId,
      role: args.role,
      status: args.status,
    });
  },
});

export const changePassword = mutation({
  args: {
    sessionToken: v.string(),
    userId: v.id("users"),
    currentPassword: v.optional(v.string()),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    // Callers may only change their own password.
    const session = await validateSession(ctx, args.sessionToken);
    if (session.userId !== args.userId) {
      throw new ConvexError("Forbidden.");
    }
    const user = await ctx.db.get(args.userId);
    if (!user || !user.password) throw new ConvexError("User not found");

    // Prove knowledge of the current password, unless this is a forced
    // first-login change (the user just authenticated with the temp password).
    if (args.currentPassword !== undefined) {
      const isMatch = bcrypt.compareSync(args.currentPassword, user.password);
      if (!isMatch) throw new ConvexError("Current password is incorrect.");
    } else if (!user.needsPasswordChange) {
      throw new ConvexError("Current password is required.");
    }

    assertStrongPassword(args.newPassword);
    const hashedPassword = bcrypt.hashSync(args.newPassword, bcrypt.genSaltSync(10));

    await ctx.db.patch(args.userId, {
      password: hashedPassword,
      needsPasswordChange: false,
      status: "active", // Activate the user if they were 'invited'
      setupToken: undefined,
      setupTokenExpires: undefined,
    });

    // Sign out every other device; keep the session that made the change.
    await revokeUserSessions(ctx, args.userId, session.tokenHash);

    return true;
  },
});

export const setupPasswordWithToken = mutation({
  args: {
    token: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const tokenHash = await sha256hex(args.token);
    const user =
      (await ctx.db
        .query("users")
        .withIndex("by_setupToken", (q) => q.eq("setupToken", tokenHash))
        .first()) ??
      // Invites sent before tokens were hashed stored them in plaintext.
      (await ctx.db
        .query("users")
        .withIndex("by_setupToken", (q) => q.eq("setupToken", args.token))
        .first());

    if (!user || user.status === "inactive") {
      throw new ConvexError("Invalid or expired setup link. Please contact your administrator.");
    }

    if (!user.setupTokenExpires || Date.now() > user.setupTokenExpires) {
      throw new ConvexError("Setup link has expired. Please contact your administrator.");
    }

    assertStrongPassword(args.newPassword);
    const hashedPassword = bcrypt.hashSync(args.newPassword, bcrypt.genSaltSync(10));

    await ctx.db.patch(user._id, {
      password: hashedPassword,
      needsPasswordChange: false,
      status: "active",
      setupToken: undefined, // Clear the token
      setupTokenExpires: undefined,
      failedLoginAttempts: 0,
      lockedUntil: undefined,
    });
    await revokeUserSessions(ctx, user._id);

    // Return user info for immediate login, plus a fresh session.
    return {
      userId: user._id,
      companyId: user.companyId,
      role: user.role,
      email: user.email,
      first_name: user.firstName,
      last_name: user.surname,
      needsPasswordChange: false,
      has_completed_tour: user.has_completed_tour ?? false,
      isSuperAdmin: isSuperAdminUser(user),
      permissions: await getEffectivePermissions(ctx, user),
      ...(await issueSession(ctx, user)),
    };
  },
});

export const updateTourStatus = mutation({
  args: {
    sessionToken: v.string(),
    userId: v.id("users"),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const session = await validateSession(ctx, args.sessionToken);
    if (session.userId !== args.userId) {
      throw new ConvexError("Forbidden.");
    }
    await ctx.db.patch(args.userId, {
      has_completed_tour: args.completed,
    });
    return true;
  },
});

export const getUserById = query({
  args: { sessionToken: v.string(), userId: v.id("users") },
  handler: async (ctx, args) => {
    // Callers may only load themselves or a same-company member.
    await requireSelfOrCompanyMember(ctx, args.sessionToken, args.userId);
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    return {
      id: user._id,
      first_name: user.firstName,
      last_name: user.surname,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      profile_image_url: "", // Add if available in future
      has_completed_tour: user.has_completed_tour ?? false,
      twoFactorEnabled: !!user.twoFactorEnabled,
    };
  },
});

export const updateUserProfile = mutation({
  args: {
    sessionToken: v.string(),
    userId: v.id("users"),
    firstName: v.string(),
    surname: v.string(),
    role: v.optional(v.string()),
    phone: v.optional(v.string()),
    bio: v.optional(v.string()),
    // Ignored: the editor is always derived from the session. Kept so older
    // clients that still send it don't fail validation.
    performedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { userId, performedBy: _ignored, sessionToken, ...updateData } = args;
    // Caller must be the user themselves or a same-company admin.
    const session = await requireSelfOrCompanyAdmin(ctx, sessionToken, userId);
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    // Only admins may change roles (prevents self-escalation), and only to a
    // real company role. Platform superadmin is never a role.
    const roleChanged = updateData.role !== undefined && updateData.role !== user.role;
    if (roleChanged) {
      assertCompanyRole(updateData.role!);
      await requireCompanyAdmin(ctx, sessionToken, user.companyId);
    } else {
      delete updateData.role;
    }

    await ctx.db.patch(userId, updateData);

    // Notify the user being edited
    await recordNotification(ctx, {
      companyId: user.companyId,
      userId: user._id,
      title: "Profile Updated",
      message: roleChanged ? `Your role has been updated to ${updateData.role}.` : `Your profile details have been successfully updated.`,
      type: "info",
    });

    // Notify the person who performed the edit (if they are editing someone else)
    if (session.userId !== user._id) {
       await recordNotification(ctx, {
         companyId: user.companyId,
         userId: session.userId,
         title: "User Updated",
         message: roleChanged ? `You updated ${user.firstName}'s role to "${updateData.role}".` : `You updated ${user.firstName}'s profile.`,
         type: "info",
       });
    }

    if (roleChanged) {
      await recordAuditLog(ctx, {
        companyId: user.companyId,
        userId: session.userId,
        action: "USER_ROLE_CHANGED",
        entityId: userId,
        entityType: "user",
        details: `Changed ${user.email}'s role from ${user.role} to ${updateData.role}`,
      });
    }

    return true;
  },
});

export const deleteUser = mutation({
  args: { sessionToken: v.string(), userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    // Only a same-company admin may delete, and never themselves.
    const session = await requireCompanyAdmin(ctx, args.sessionToken, user.companyId);
    if (session.userId === args.userId) {
      throw new ConvexError("You cannot delete your own account.");
    }
    // Company admins cannot remove platform superadmins; revoke the flag first.
    if (isSuperAdminUser(user)) {
      throw new ConvexError("Revoke this user's superadmin access before deleting them.");
    }

    // Record the deletion in audit log BEFORE actual delete since we need the user object
    await ctx.db.insert("auditLogs", {
      companyId: user.companyId,
      userId: session.userId,
      action: "USER_DELETED",
      entityId: args.userId,
      entityType: "user",
      details: `User ${user.firstName} ${user.surname} (${user.email}) was deleted.`,
      createdAt: Date.now(),
    });

    // Kill any live sessions, then delete the user
    await revokeUserSessions(ctx, args.userId);
    await ctx.db.delete(args.userId);

    return true;
  },
});


export const getUserStats = query({
  args: { sessionToken: v.string(), companyId: v.id("companies") },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.sessionToken, args.companyId, "view_users");
    const users = await ctx.db
      .query("users")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();

    const total = users.length;
    const active = users.filter((u) => u.status === "active").length;
    const invited = users.filter((u) => u.status === "invited").length;
    const admins = users.filter((u) => u.role === "admin" || u.role === "Admin").length;

    return {
      total,
      active,
      invited,
      admins,
    };
  },
});

export const updateNotificationPreferences = mutation({
  args: {
    sessionToken: v.string(),
    userId: v.id("users"),
    preferences: v.record(v.string(), v.boolean()),
  },
  handler: async (ctx, args) => {
    const session = await validateSession(ctx, args.sessionToken);
    if (session.userId !== args.userId) throw new ConvexError("Forbidden.");
    await ctx.db.patch(args.userId, {
      notificationPreferences: args.preferences,
    });
    return true;
  },
});

export const getUserPreferences = query({
  args: { sessionToken: v.string(), userId: v.id("users") },
  handler: async (ctx, args) => {
    const session = await validateSession(ctx, args.sessionToken);
    if (session.userId !== args.userId) throw new ConvexError("Forbidden.");
    const user = await ctx.db.get(args.userId);
    return user?.notificationPreferences || null;
  },
});

export const startRegistration = mutation({
  args: {
    companyName: v.string(),
    regNumber: v.string(),
    country: v.string(),
    location: v.string(),
    domain: v.string(),
    firstName: v.string(),
    surname: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    const domain = normalizeDomain(args.domain);

    // Check if email is personal
    if (isPersonalEmail(email)) {
      throw new ConvexError(PERSONAL_EMAIL_ERROR);
    }
    if (!domain || !emailMatchesDomain(email, domain)) {
      throw new ConvexError(`Your email address must belong to your company domain (${domain || "domain"}).`);
    }

    // 1. Check if domain is already taken
    const existingCompany = await ctx.db
      .query("companies")
      .withIndex("by_domain", (q) => q.eq("domain", domain))
      .first();

    if (existingCompany) {
      throw new ConvexError("Company with this domain is already registered. Please use another domain.");
    }

    // 2. Check if user email already exists
    if (await findUserByEmail(ctx, email)) {
      throw new ConvexError("A user with this email address already exists.");
    }

    // 3. Throttle resends so the endpoint can't be used to spam an inbox.
    const existingVerification = await ctx.db
      .query("registrationVerifications")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existingVerification) {
      const issuedAt = existingVerification.expiresAt - 15 * 60 * 1000;
      if (Date.now() - issuedAt < OTP_RESEND_COOLDOWN_MS) {
        throw new ConvexError("Please wait a minute before requesting another code.");
      }
      await ctx.db.delete(existingVerification._id);
    }

    // 4. Generate a 6-digit OTP; store only its hash and email the plaintext.
    const otpCode = randomSixDigitCode();
    await ctx.db.insert("registrationVerifications", {
      email,
      otpCode: await sha256hex(otpCode),
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins
      attempts: 0,
      verified: false,
      companyData: { ...args, email, domain },
    });

    await ctx.scheduler.runAfter(0, internal.emails.sendOTPEmail, {
      email,
      firstName: args.firstName,
      otpCode,
    });

    return { success: true };
  },
});

export const verifyOTP = mutation({
  args: {
    email: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const verification = await ctx.db
      .query("registrationVerifications")
      .withIndex("by_email", (q) => q.eq("email", normalizeEmail(args.email)))
      .first();

    if (!verification) {
      throw new ConvexError("Verification session not found. Please start over.");
    }

    if (verification.expiresAt < Date.now()) {
      await ctx.db.delete(verification._id);
      return { success: false, error: "Verification code has expired. Please request a new one." };
    }

    if (verification.otpCode !== (await sha256hex(args.code.trim()))) {
      // Errors are returned (not thrown) so these writes persist.
      const attempts = (verification.attempts || 0) + 1;
      if (attempts >= MAX_OTP_ATTEMPTS) {
        await ctx.db.delete(verification._id);
        return { success: false, error: "Too many failed attempts. Please restart registration." };
      }
      await ctx.db.patch(verification._id, { attempts });
      return { success: false, error: "Invalid verification code. Please check and try again." };
    }

    await ctx.db.patch(verification._id, { verified: true });
    return { success: true };
  },
});

export const completeRegistration = mutation({
  args: {
    email: v.string(),
    code: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. The OTP must already have been verified, still be live, and match.
    const verification = await ctx.db
      .query("registrationVerifications")
      .withIndex("by_email", (q) => q.eq("email", normalizeEmail(args.email)))
      .first();

    if (
      !verification ||
      verification.verified !== true ||
      verification.expiresAt < Date.now() ||
      verification.otpCode !== (await sha256hex(args.code.trim()))
    ) {
      throw new ConvexError("Invalid verification state. Please restart registration.");
    }

    assertStrongPassword(args.password);

    const companyData = verification.companyData as {
      companyName: string;
      regNumber: string;
      country: string;
      location: string;
      domain: string;
      firstName: string;
      surname: string;
      email: string;
    };

    // Re-check uniqueness: another registration may have completed meanwhile.
    const domainTaken = await ctx.db
      .query("companies")
      .withIndex("by_domain", (q) => q.eq("domain", companyData.domain))
      .first();
    if (domainTaken || (await findUserByEmail(ctx, companyData.email))) {
      throw new ConvexError("This company or email is already registered.");
    }

    // 2. Hash password
    const hashedPassword = bcrypt.hashSync(args.password, bcrypt.genSaltSync(10));

    // 3. Create Company
    const companyId = await ctx.db.insert("companies", {
      name: companyData.companyName,
      reg_number: companyData.regNumber,
      country: companyData.country,
      location: companyData.location,
      domain: companyData.domain,
      support_email: companyData.email,
      status: "active",
      createdAt: Date.now(),
    });

    // 4. Create User (never a superadmin: that is granted from the admin console)
    const userId = await ctx.db.insert("users", {
      companyId,
      firstName: companyData.firstName,
      surname: companyData.surname,
      email: companyData.email,
      password: hashedPassword,
      role: "admin",
      status: "active",
      createdAt: Date.now(),
    });

    // 5. Initialize Balance
    await ctx.db.insert("balances", {
        companyId,
        availableBalance: 0,
        updatedAt: Date.now(),
    });

    // 6. Delete verification record
    await ctx.db.delete(verification._id);

    return { companyId, userId };
  },
});
