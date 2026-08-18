import { mutation } from "./_generated/server";

// ── Service Seed Data ─────────────────────────────────────────────────────────
// Mirrors the hardcoded SERVICES constant in choose-service.tsx and
// the serviceTypes map in fill-details.tsx.

const SERVICE_SEED = [
  {
    name: "Business Registration Check",
    slug: "business_registration",
    icon: "Building2",
    color: "bg-indigo-100 text-indigo-600",
    order: 1,
    description: "Verify registered businesses, sole proprietorships, and limited companies via BRS Kenya.",
    actions: [
      { label: "Business / Company Registration Check", slug: "business_search", order: 1 },
    ],
    checkTypes: [
      { label: "LIMITED COMPANY / BUSINESS REGISTRATION", slug: "business_registration", order: 1, price: 15.0 },
    ],
  },
  {
    name: "ID Check",
    slug: "national_id",
    icon: "UserCheck",
    color: "bg-blue-100 text-blue-600",
    order: 2,
    description: "Government identity validation for individuals (National ID, Alien ID, Passport) via IPRS.",
    actions: [
      { label: "Identity Document Verification", slug: "national_id_verify", order: 1 },
    ],
    checkTypes: [
      { label: "NATIONAL ID (CITIZEN)", slug: "national_id", order: 1, price: 5.0 },
      { label: "ALIEN ID / WORK PERMIT", slug: "alien_id", order: 2, price: 8.0 },
      { label: "PASSPORT NUMBER", slug: "passport", order: 3, price: 10.0 },
    ],
  },
  {
    name: "KRA PIN Checker",
    slug: "kra",
    icon: "FileText",
    color: "bg-orange-100 text-orange-600",
    order: 3,
    description: "Tax compliance and PIN validity checker for businesses, companies, and individuals.",
    actions: [
      { label: "PIN Status & Registration Check", slug: "pin_verification", order: 1 },
    ],
    checkTypes: [
      { label: "KRA PIN CHECK (INDIVIDUAL)", slug: "kra_pin_check", order: 1, price: 10.0 },
      { label: "KRA PIN CHECK (COMPANY / CORPORATE)", slug: "kra_pin_corporate", order: 2, price: 12.0 },
    ],
  },
  {
    name: "CRB Check",
    slug: "crb_check",
    icon: "Shield",
    color: "bg-purple-100 text-purple-600",
    order: 4,
    description: "Credit Reference Bureau listing, score, and default risk report for individuals via ID number.",
    actions: [
      { label: "Credit Score & Listing Status", slug: "crb_score_check", order: 1 },
    ],
    checkTypes: [
      { label: "INDIVIDUAL CREDIT REPORT", slug: "crb_check", order: 1, price: 12.0 },
    ],
  },
];


// ── Mutations ─────────────────────────────────────────────────────────────────

export const seedMockData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if VPMTechLab super admin exists
    const existing = await ctx.db
      .query("companies")
      .withIndex("by_name", (q) => q.eq("name", "VPMTechLab"))
      .first();

    if (existing) {
      const user = await ctx.db.query("users").withIndex("by_company", (q) => q.eq("companyId", existing._id)).first();
      return { companyId: existing._id, userId: user!._id };
    }

    // Insert Super Admin Company
    const companyId = await ctx.db.insert("companies", {
      name: "VPMTechLab",
      reg_number: "PVT-SUPERADMIN",
      country: "Kenya",
      location: "Nairobi",
      domain: "vpmtechlab.com",
      support_email: "superadmin@vpmtechlab.com",
      status: "active",
      isSuperAdmin: true,
      createdAt: Date.now(),
    });

    // Insert Balance
    await ctx.db.insert("balances", {
      companyId,
      availableBalance: 2450.00,
      updatedAt: Date.now(),
    });

    // Insert Super Admin User
    const userId = await ctx.db.insert("users", {
      companyId,
      firstName: "Super",
      surname: "Admin",
      email: "admin@vpmtechlab.com",
      role: "admin",
      status: "active",
      createdAt: Date.now()
    });

    // Insert API Key
    await ctx.db.insert("apiKeys", {
      companyId,
      keyHash: "test_api_key_123",
      name: "Live Key",
      isActive: true,
      createdAt: Date.now()
    });

    return { companyId, userId };
  },
});

/**
 * Seeds the service category hierarchy and pricing. Idempotent — skips 
 * categories and price entries that already exist (matched by slug / serviceId).
 */
export const seedServices = mutation({
  args: {},
  handler: async (ctx) => {
    for (const service of SERVICE_SEED) {
      // Check if category already exists
      const existing = await ctx.db
        .query("serviceCategories")
        .withIndex("by_slug", (q) => q.eq("slug", service.slug))
        .first();

      let categoryId = existing?._id;

      if (!existing) {
        categoryId = await ctx.db.insert("serviceCategories", {
          name: service.name,
          slug: service.slug,
          icon: service.icon,
          color: service.color,
          order: service.order,
          isActive: true,
        });
      }

      if (!categoryId) continue;

      // Seed actions (idempotent by slug)
      for (const action of service.actions) {
        const existingAction = await ctx.db
          .query("serviceActions")
          .withIndex("by_category", (q) => q.eq("categoryId", categoryId!))
          .filter((q) => q.eq(q.field("slug"), action.slug))
          .first();

        if (!existingAction) {
          await ctx.db.insert("serviceActions", {
            categoryId: categoryId!,
            label: action.label,
            slug: action.slug,
            enabled: true,
            order: action.order,
          });
        }
      }

      // Seed check types and pricing (idempotent by slug)
      for (const checkType of service.checkTypes) {
        const existingCheckType = await ctx.db
          .query("serviceCheckTypes")
          .withIndex("by_category", (q) => q.eq("categoryId", categoryId!))
          .filter((q) => q.eq(q.field("slug"), checkType.slug))
          .first();

        if (!existingCheckType) {
          await ctx.db.insert("serviceCheckTypes", {
            categoryId: categoryId!,
            label: checkType.label,
            slug: checkType.slug,
            order: checkType.order,
          });
        }

        // Add/Update Pricing
        const existingPrice = await ctx.db
          .query("pricing")
          .withIndex("by_service", (q) => q.eq("serviceId", checkType.slug))
          .first();

        if (!existingPrice) {
          await ctx.db.insert("pricing", {
            serviceCategory: service.slug,
            serviceId: checkType.slug,
            serviceName: checkType.label,
            price: checkType.price,
            updatedAt: Date.now(),
          });
        } else if (existingPrice.price !== checkType.price) {
          // Update price if it changed in seed
          await ctx.db.patch(existingPrice._id, {
            price: checkType.price,
            updatedAt: Date.now(),
          });
        }
      }
    }

    return { seeded: true };
  },
});

/**
 * Resets and re-seeds all service categories, actions, and check types.
 */
export const resetAndSeedServices = mutation({
  args: {},
  handler: async (ctx) => {
    // Remove old service categories, actions, and check types
    const oldCats = await ctx.db.query("serviceCategories").collect();
    for (const cat of oldCats) {
      await ctx.db.delete(cat._id);
    }
    const oldActs = await ctx.db.query("serviceActions").collect();
    for (const act of oldActs) {
      await ctx.db.delete(act._id);
    }
    const oldTypes = await ctx.db.query("serviceCheckTypes").collect();
    for (const t of oldTypes) {
      await ctx.db.delete(t._id);
    }

    for (const service of SERVICE_SEED) {
      const categoryId = await ctx.db.insert("serviceCategories", {
        name: service.name,
        slug: service.slug,
        icon: service.icon,
        color: service.color,
        order: service.order,
        description: service.description,
        isActive: true,
      });

      for (const action of service.actions) {
        await ctx.db.insert("serviceActions", {
          categoryId,
          label: action.label,
          slug: action.slug,
          enabled: true,
          order: action.order,
        });
      }

      for (const checkType of service.checkTypes) {
        await ctx.db.insert("serviceCheckTypes", {
          categoryId,
          label: checkType.label,
          slug: checkType.slug,
          order: checkType.order,
        });

        const existingPrice = await ctx.db
          .query("pricing")
          .withIndex("by_service", (q) => q.eq("serviceId", checkType.slug))
          .first();

        if (!existingPrice) {
          await ctx.db.insert("pricing", {
            serviceCategory: service.slug,
            serviceId: checkType.slug,
            serviceName: checkType.label,
            price: checkType.price,
            updatedAt: Date.now(),
          });
        } else {
          await ctx.db.patch(existingPrice._id, {
            price: checkType.price,
            updatedAt: Date.now(),
          });
        }
      }
    }

    return { reset: true, count: SERVICE_SEED.length };
  },
});

