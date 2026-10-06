import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  companies: defineTable({
    name: v.string(),
    reg_number: v.string(),
    no_of_employees: v.optional(v.number()),
    year_founded: v.optional(v.number()),
    country: v.string(),
    location: v.string(),
    domain: v.string(),
    support_email: v.string(),
    status: v.string(), // e.g., 'active', 'inactive'
    isSuperAdmin: v.optional(v.boolean()), // Flag for VPPMTechLab
    createdAt: v.number(), // Unix timestamp
  }).index("by_name", ["name"]).index("by_domain", ["domain"]),

  registrationVerifications: defineTable({
    email: v.string(),
    otpCode: v.string(),
    expiresAt: v.number(),
    attempts: v.number(),
    companyData: v.any(), // Stores { companyName, regNumber, country, location, domain, firstName, surname }
  }).index("by_email", ["email"]),

  rolePermissions: defineTable({
    companyId: v.id("companies"),
    role: v.string(), // e.g., 'Admin', 'Compliance Officer'
    permissions: v.array(v.string()),
  }).index("by_company_and_role", ["companyId", "role"]),

  users: defineTable({
    companyId: v.id("companies"),
    firstName: v.string(),
    surname: v.string(),
    email: v.string(),
    password: v.optional(v.string()), // Added for local auth
    role: v.string(), // e.g., 'admin', 'viewer'
    status: v.string(), // e.g., 'active', 'inactive'
    passwordHash: v.optional(v.string()), // Optional, depending on Auth provider
    needsPasswordChange: v.optional(v.boolean()), // For first-time login
    has_completed_tour: v.optional(v.boolean()), // App tour status
    setupToken: v.optional(v.string()), // For token-based password setup
    setupTokenExpires: v.optional(v.number()), // Expiration for the token
    customPermissions: v.optional(v.array(v.string())), // User specific permissions override
    phone: v.optional(v.string()),
    bio: v.optional(v.string()),
    notificationPreferences: v.optional(v.any()), // JSON object for toggles
    twoFactorEnabled: v.optional(v.boolean()),
    twoFactorSecret: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_company", ["companyId"]).index("by_email", ["email"]),

  apiKeys: defineTable({
    companyId: v.id("companies"),
    keyHash: v.string(), // SHA-256 hex of the API key (never the raw key)
    keyPrefix: v.optional(v.string()), // e.g. "evid_live_sk_…9f3a" for display
    name: v.string(), // e.g., 'Live Key', 'Test Key'
    mode: v.optional(v.string()), // "live" or "test"
    isActive: v.boolean(),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_company", ["companyId"]),

  balances: defineTable({
    companyId: v.id("companies"),
    availableBalance: v.number(),
    updatedAt: v.number(),
  }).index("by_company", ["companyId"]),

  transactions: defineTable({
    companyId: v.id("companies"),
    type: v.string(), // e.g., 'top_up', 'verification_fee'
    amount: v.number(),
    status: v.string(), // e.g., 'success', 'pending', 'failed'
    referenceId: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_company", ["companyId"]),

  jobs: defineTable({
    companyId: v.id("companies"),
    userId: v.id("users"), // the user who initiated it
    serviceType: v.string(), // e.g., 'kyc', 'kyb'
    entityData: v.any(), // JSON payload of the requested entity (firstName, reg_number, etc.)
    resultStatus: v.string(), // e.g., 'pending', 'approved', 'failed', 'not_found_on_list'
    message: v.optional(v.string()),
    source: v.string(), // e.g., 'web_api', 'rest_api'
    resultPayload: v.optional(v.any()), // The simulated/returned JSON from BRS/DCI/iTax
    feesCharged: v.optional(v.number()), // Keep track of how much was charged
    fromCache: v.optional(v.boolean()), // True when the result was served from the registry cache
    createdAt: v.number(),
  }).index("by_company", ["companyId"]).index("by_user", ["userId"]),

  // ── Sessions ──────────────────────────────────────────────────────────
  // Opaque server-side sessions. Only a SHA-256 hash of the token is stored;
  // the plaintext token lives in the client's cookie/localStorage. Every
  // protected function validates the token against this table.

  sessions: defineTable({
    tokenHash: v.string(), // SHA-256 hex of the opaque session token
    userId: v.id("users"),
    companyId: v.id("companies"),
    role: v.string(),
    email: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_tokenHash", ["tokenHash"]),

  // ── Registry Cache ──────────────────────────────────────────────────────────
  // Shared platform-level cache of registry lookups (BRS companies, IPRS
  // identities, KRA, CRB). Entries expire after 30 days; stale entries are
  // refreshed live and overwritten. Keyed by normalized lookup so repeat
  // searches across companies hit the cache instead of the registry.

  registryCache: defineTable({
    cacheKey: v.string(), // e.g. 'business_registration|KE|PVT-2022/94821'
    serviceType: v.string(),
    lookupId: v.string(), // Normalized ID/registration/PIN number
    country: v.string(),
    payload: v.any(), // Full registry result payload (incl. directors[])
    registrySource: v.string(), // e.g. 'BRS Kenya', 'IPRS', 'Gava Connect', 'EvidCheck Engine'
    fetchedAt: v.number(),
    expiresAt: v.number(),
    hitCount: v.number(),
  }).index("by_cache_key", ["cacheKey"]),

  pricing: defineTable({
    serviceCategory: v.string(), // e.g., 'kyc', 'kyb', 'aml'
    serviceId: v.string(), // e.g., 'national_id', 'passport'
    serviceName: v.string(), // e.g., 'National ID Verification'
    price: v.number(), // e.g. 15.00
    updatedAt: v.number(),
  }).index("by_service", ["serviceId"]),

  // ── Service Management ──────────────────────────────────────────────────────

  // Top-level service categories (e.g. "KYC Services", "AML")
  serviceCategories: defineTable({
    name: v.string(),        // "KYC Services"
    slug: v.string(),        // "kyc" — stable ID for business logic
    description: v.optional(v.string()),
    icon: v.string(),        // lucide icon name, e.g. "UserCheck"
    color: v.string(),       // tailwind classes, e.g. "bg-blue-100 text-blue-600"
    order: v.optional(v.number()), // for display ordering
    isActive: v.boolean(),
  }).index("by_slug", ["slug"]),

  // Actions within a category (step 2 in the wizard, e.g. "Enhanced KYC")
  serviceActions: defineTable({
    categoryId: v.id("serviceCategories"),
    label: v.string(),       // "Enhanced KYC"
    slug: v.string(),        // "enhanced_kyc"
    enabled: v.boolean(),
    order: v.optional(v.number()),
  }).index("by_category", ["categoryId"]),

  // Check types within a category (step 3 dropdown, e.g. "National ID", "Passport")
  serviceCheckTypes: defineTable({
    categoryId: v.id("serviceCategories"),
    label: v.string(),       // "NATIONAL ID"
    slug: v.string(),        // "national_id" — matches pricing.serviceId
    order: v.optional(v.number()),
  }).index("by_category", ["categoryId"]),

  auditLogs: defineTable({
    companyId: v.optional(v.id("companies")),
    userId: v.optional(v.id("users")),
    action: v.string(),       // e.g. "VERIFICATION_CREATED", "FUNDS_ADDED"
    entityId: v.optional(v.string()), // ID of the affected record
    entityType: v.optional(v.string()), // e.g. "job", "balance", "user"
    details: v.string(),      // Human friendly summary
    metadata: v.optional(v.any()), // JSON payload for diffs or details
    createdAt: v.number(),
  }).index("by_company", ["companyId"])
    .index("by_user", ["userId"])
    .index("by_action", ["action"]),

  notifications: defineTable({
    companyId: v.id("companies"),
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.string(), // 'info', 'success', 'warning', 'error'
    isRead: v.boolean(),
    createdAt: v.number(),
  }).index("by_company", ["companyId"])
    .index("by_user", ["userId"]),

  generatedReports: defineTable({
    companyId: v.id("companies"),
    userId: v.id("users"),
    name: v.string(),
    type: v.string(), // e.g., 'Compliance Summary', 'Financial Report'
    format: v.string(), // 'PDF', 'CSV'
    status: v.string(), // 'completed', 'generating', 'failed'
    config: v.any(), // Stores filter settings
    createdAt: v.number(),
  }).index("by_company", ["companyId"]),
});

