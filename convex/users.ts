import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import bcrypt from "bcryptjs";
import { recordNotification, recordAuditLog } from "./audit";
import { internal } from "./_generated/api";
import {
  issueSession,
  sha256hex,
  validateSession,
  requireCompany,
  requireCompanyAdmin,
  requireSelfOrCompanyMember,
  requireSuperAdmin,
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

// Internal: verifies a REST API key by SHA-256 hash. Only backend code may
// call this — it is the authentication boundary for the public REST API.
export const verifyApiKey = internalMutation({
  args: { apiKey: v.string() },
  handler: async (ctx, args) => {
    const hashed = await sha256hex(args.apiKey);
    const hashedMatch = await ctx.db
      .query("apiKeys")
      .filter((q) => q.eq(q.field("keyHash"), hashed))
      .first();

    if (hashedMatch) {
      if (!hashedMatch.isActive) return null;
      return await ctx.db.get(hashedMatch.companyId);
    }

    // Legacy plaintext rows: verify once, then upgrade to a hash in place.
    const legacyMatch = await ctx.db
      .query("apiKeys")
      .filter((q) => q.eq(q.field("keyHash"), args.apiKey))
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

export const createCompanyAndUser = mutation({
  args: {
    companyName: v.string(),
    regNumber: v.string(),
    country: v.string(),
    location: v.string(),
    domain: v.string(),
    firstName: v.string(),
    surname: v.string(),
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if email is personal
    if (isPersonalEmail(args.email)) {
      throw new ConvexError(PERSONAL_EMAIL_ERROR);
    }

    // Check if user email already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new ConvexError("User with this email already exists.");
    }

    // 1. Create company
    const companyId = await ctx.db.insert("companies", {
      name: args.companyName,
      reg_number: args.regNumber,
      country: args.country,
      location: args.location,
      domain: args.domain,
      support_email: args.email,
      status: "active",
      createdAt: Date.now(),
    });

    // Hash the password before saving
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(args.password, salt);

    // 2. Create the user
    const userId = await ctx.db.insert("users", {
      companyId,
      firstName: args.firstName,
      surname: args.surname,
      email: args.email,
      password: hashedPassword,
      role: "admin",
      status: "active",
      createdAt: Date.now(),
    });

    // 3. Initialize company balance
    await ctx.db.insert("balances", {
      companyId,
      availableBalance: 0,
      updatedAt: Date.now(),
    });

    return { companyId, userId };
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
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) {
      throw new ConvexError("Invalid email or password");
    }

    // Compare passwords
    if (!user.password) {
      throw new ConvexError("Invalid email or password");
    }
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      throw new ConvexError("Invalid email or password");
    }

    if (user.status !== "active" && user.status !== "invited") {
      throw new ConvexError("Account is inactive. Please contact support.");
    }

    // If 2FA is enabled, return a temporary flag instead of complete member data
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      return { 
        twoFactorRequired: true, 
        userId: user._id 
      };
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
    await requireCompanyAdmin(ctx, args.sessionToken, args.companyId);

    // Check if email is personal
    if (isPersonalEmail(args.email)) {
      throw new ConvexError(PERSONAL_EMAIL_ERROR);
    }

    // Check if user email already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new ConvexError("User with this email already exists.");
    }

    // Generate a random temporary password (cryptographically secure)
    const tempPassword = randomCredential(10);
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(tempPassword, salt);

    const setupToken = randomCredential(16);
    const userId = await ctx.db.insert("users", {
      companyId: args.companyId,
      firstName: args.firstName,
      surname: args.surname,
      email: args.email,
      password: hashedPassword,
      role: args.role,
      status: "invited",
      needsPasswordChange: true,
      has_completed_tour: false,
      setupToken,
      setupTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      createdAt: Date.now(),
    });

    const user = await ctx.db.get(userId);
    return { userId, tempPassword, setupToken: user?.setupToken };
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

    // Validation: 8+ chars, uppercase, lowercase, special char
    const hasUpperCase = /[A-Z]/.test(args.newPassword);
    const hasLowerCase = /[a-z]/.test(args.newPassword);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(args.newPassword);
    
    if (args.newPassword.length < 8 || !hasUpperCase || !hasLowerCase || !hasSpecialChar) {
      throw new ConvexError("Password must be at least 8 characters long, and include an uppercase letter, a lowercase letter, and a special character.");
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(args.newPassword, salt);

    await ctx.db.patch(args.userId, {
      password: hashedPassword,
      needsPasswordChange: false,
      status: "active", // Activate the user if they were 'invited'
    });

    return true;
  },
});

export const setupPasswordWithToken = mutation({
  args: {
    token: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("setupToken"), args.token))
      .first();

    if (!user) {
      throw new ConvexError("Invalid or expired setup link. Please contact your administrator.");
    }

    if (user.setupTokenExpires && Date.now() > user.setupTokenExpires) {
      throw new ConvexError("Setup link has expired. Please contact your administrator.");
    }

    const hasUpperCase = /[A-Z]/.test(args.newPassword);
    const hasLowerCase = /[a-z]/.test(args.newPassword);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(args.newPassword);
    
    if (args.newPassword.length < 8 || !hasUpperCase || !hasLowerCase || !hasSpecialChar) {
      throw new ConvexError("Password must be at least 8 characters long, and include an uppercase letter, a lowercase letter, and a special character.");
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(args.newPassword, salt);

    await ctx.db.patch(user._id, {
      password: hashedPassword,
      needsPasswordChange: false,
      status: "active",
      setupToken: undefined, // Clear the token
      setupTokenExpires: undefined,
    });

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
    performedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { userId, performedBy, sessionToken, ...updateData } = args;
    // Caller must be the user themselves or a same-company admin.
    await requireSelfOrCompanyMember(ctx, sessionToken, userId);
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    // Only admins may change roles (prevents self-escalation).
    const roleChanged = updateData.role && updateData.role !== user.role;
    if (roleChanged) {
      await requireCompanyAdmin(ctx, sessionToken, user.companyId);
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
    if (performedBy && performedBy !== user._id) {
       await recordNotification(ctx, {
         companyId: user.companyId,
         userId: performedBy,
         title: "User Updated",
         message: roleChanged ? `You updated ${user.firstName}'s role to "${updateData.role}".` : `You updated ${user.firstName}'s profile.`,
         type: "info",
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

    // Record the deletion in audit log BEFORE actual delete since we need the user object
    await ctx.db.insert("auditLogs", {
      companyId: user.companyId,
      action: "USER_DELETED",
      entityId: args.userId,
      entityType: "user",
      details: `User ${user.firstName} ${user.surname} (${user.email}) was deleted.`,
      createdAt: Date.now(),
    });

    // Delete the user
    await ctx.db.delete(args.userId);

    return true;
  },
});


export const getUserStats = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
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
    userId: v.id("users"),
    preferences: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      notificationPreferences: args.preferences,
    });
    return true;
  },
});

export const getUserPreferences = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
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
    // Check if email is personal
    if (isPersonalEmail(args.email)) {
      throw new ConvexError(PERSONAL_EMAIL_ERROR);
    }

    // 1. Check if domain is already taken
    const existingCompany = await ctx.db
      .query("companies")
      .withIndex("by_domain", (q) => q.eq("domain", args.domain))
      .first();
    
    if (existingCompany) {
      throw new ConvexError("Company with this domain is already registered. Please use another domain.");
    }

    // 2. Check if user email already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new ConvexError("A user with this email address already exists.");
    }

    // 3. Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

    // 4. Store in registrationVerifications (upsert by email)
    const existingVerification = await ctx.db
      .query("registrationVerifications")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (existingVerification) {
        await ctx.db.delete(existingVerification._id);
    }

    await ctx.db.insert("registrationVerifications", {
      email: args.email,
      otpCode,
      expiresAt,
      attempts: 0,
      companyData: args,
    });

    return { success: true, otpCode }; // Return OTP for development/testing if emails are mocked
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
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!verification) {
      throw new ConvexError("Verification session not found. Please start over.");
    }

    if (verification.expiresAt < Date.now()) {
      await ctx.db.delete(verification._id);
      throw new ConvexError("Verification code has expired. Please request a new one.");
    }

    if (verification.otpCode !== args.code) {
      await ctx.db.patch(verification._id, {
        attempts: (verification.attempts || 0) + 1,
      });
      
      if ((verification.attempts || 0) >= 5) {
          await ctx.db.delete(verification._id);
          throw new ConvexError("Too many failed attempts. Please restart registration.");
      }

      throw new ConvexError("Invalid verification code. Please check and try again.");
    }

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
    // 1. Verify OTP one last time (security precaution)
    const verification = await ctx.db
      .query("registrationVerifications")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!verification || verification.otpCode !== args.code) {
      throw new ConvexError("Invalid verification state.");
    }

    const { companyData } = verification;

    // 2. Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(args.password, salt);

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

    // 4. Create User
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

