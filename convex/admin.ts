import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { recordAuditLog } from "./audit";
import { requireSuperAdmin } from "./session";

/**
 * Super Admin Queries
 * These should eventually include auth guards to ensure the caller is a VPMTechLab user.
 */

export const getAllCompanies = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx, args.sessionToken);
    const companies = await ctx.db.query("companies").collect();
    
    // Attach statistics to each company
    const enrichedCompanies = await Promise.all(
      companies.map(async (company) => {
        const users = await ctx.db
          .query("users")
          .withIndex("by_company", (q) => q.eq("companyId", company._id))
          .collect();
          
        const jobs = await ctx.db
          .query("jobs")
          .withIndex("by_company", (q) => q.eq("companyId", company._id))
          .collect();

        const balanceDoc = await ctx.db
          .query("balances")
          .withIndex("by_company", (q) => q.eq("companyId", company._id))
          .first();

        return {
          ...company,
          userCount: users.length,
          verificationCount: jobs.length,
          availableBalance: balanceDoc?.availableBalance || 0,
        };
      })
    );

    return enrichedCompanies;
  },
});

export const getGlobalMetrics = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx, args.sessionToken);
    const companies = await ctx.db.query("companies").collect();
    const jobs = await ctx.db.query("jobs").collect();
    const users = await ctx.db.query("users").collect();

    const totalRevenue = jobs.reduce((sum, job) => sum + (job.feesCharged || 0), 0);
    const activeCompanies = companies.filter(c => c.status === "active").length;

    // Daily verifications
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentJobs = jobs.filter(j => j.createdAt > oneDayAgo);

    return {
      totalRevenue,
      totalCompanies: companies.length,
      activeCompanies,
      totalUsers: users.length,
      totalVerifications: jobs.length,
      verificationsToday: recentJobs.length,
    };
  },
});

export const getAllUsers = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx, args.sessionToken);
    const users = await ctx.db.query("users").collect();
    
    // Enrich with company names
    return await Promise.all(
      users.map(async (user) => {
        const company = await ctx.db.get(user.companyId);
        return {
          ...user,
          companyName: company?.name || "Unknown",
          isSuperAdmin: company?.isSuperAdmin || false,
        };
      })
    );
  },
});

export const getAllJobs = query({
  args: { sessionToken: v.string(), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx, args.sessionToken);
    const jobs = await ctx.db
      .query("jobs")
      .order("desc")
      .paginate(args.paginationOpts);
    
    // Enrich with company and user names
    return {
      ...jobs,
      page: await Promise.all(
        jobs.page.map(async (job) => {
          const company = await ctx.db.get(job.companyId);
          const user = await ctx.db.get(job.userId);
          return {
            ...job,
            companyName: company?.name || "Unknown",
            userName: `${user?.firstName} ${user?.surname}` || "Unknown",
          };
        })
      ),
    };
  },
});

export const getCompanyUsers = query({
  args: { sessionToken: v.string(), companyId: v.id("companies") },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx, args.sessionToken);
    return await ctx.db
      .query("users")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();
  },
});

export const updateCompany = mutation({
  args: {
    sessionToken: v.string(),
    companyId: v.id("companies"),
    name: v.optional(v.string()),
    domain: v.optional(v.string()),
    status: v.optional(v.string()),
    country: v.optional(v.string()),
    location: v.optional(v.string()),
    support_email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx, args.sessionToken);
    const { companyId, sessionToken: _t, ...updates } = args;
    await ctx.db.patch(companyId, updates);

    await recordAuditLog(ctx, {
      companyId,
      action: "COMPANY_UPDATED",
      entityId: companyId,
      entityType: "company",
      details: `Updated company details for ${args.name || "company"}`,
      metadata: { updates },
    });
  },
});

export const getCompanyById = query({
  args: { sessionToken: v.string(), companyId: v.id("companies") },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx, args.sessionToken);
    const company = await ctx.db.get(args.companyId);
    if (!company) return null;
    
    // Statistics for the company
    const users = await ctx.db
      .query("users")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();
      
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();

    const balanceDoc = await ctx.db
      .query("balances")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .first();

    return {
      ...company,
      userCount: users.length,
      verificationCount: jobs.length,
      availableBalance: balanceDoc?.availableBalance || 0,
    };
  },
});

export const getAdminDashboardAnalytics = query({
  args: { 
    sessionToken: v.string(),
    days: v.optional(v.number()) 
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx, args.sessionToken);
    const now = Date.now();
    const threshold = args.days ? now - (args.days * 24 * 60 * 60 * 1000) : 0;

    // 1. Fetch data
    const companies = await ctx.db.query("companies").collect();
    const allJobs = await ctx.db.query("jobs").collect();
    const allUsers = await ctx.db.query("users").collect();

    // 2. Filter jobs and users by date range
    const filteredJobs = allJobs.filter(job => job.createdAt >= threshold);
    const filteredUsers = allUsers.filter(user => user._creationTime >= threshold);

    // ── Global Metrics ────────────────────────────────────────────────────────
    const totalRevenue = filteredJobs.reduce((sum, job) => sum + (job.feesCharged || 0), 0);
    const totalVerifications = filteredJobs.length;
    const activeCompaniesCount = new Set(filteredJobs.map(j => j.companyId)).size;
    
    const approvedJobs = filteredJobs.filter(j => j.resultStatus === "approved").length;
    const failedJobs = filteredJobs.filter(j => j.resultStatus === "failed").length;
    const successRate = totalVerifications > 0 
      ? Math.round((approvedJobs / (approvedJobs + failedJobs || 1)) * 100) 
      : 100;

    // ── Volume, Revenue & User Growth Trends (Daily Mapping) ────────────────────
    const volumeDays = args.days || 30;
    const trendDataMap = new Map<string, { date: string, count: number, revenue: number, userCount: number }>();
    
    for (let i = 0; i < volumeDays; i++) {
        const date = new Date(now - (i * 24 * 60 * 60 * 1000));
        const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        trendDataMap.set(dateStr, { date: dateStr, count: 0, revenue: 0, userCount: 0 });
    }

    // Map Jobs (Revenue & Count)
    filteredJobs.forEach(job => {
        const dateStr = new Date(job.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        if (trendDataMap.has(dateStr)) {
            const current = trendDataMap.get(dateStr)!;
            trendDataMap.set(dateStr, {
                ...current,
                count: current.count + 1,
                revenue: current.revenue + (job.feesCharged || 0)
            });
        }
    });

    // Map Users (Growth)
    filteredUsers.forEach(user => {
        const dateStr = new Date(user._creationTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        if (trendDataMap.has(dateStr)) {
            const current = trendDataMap.get(dateStr)!;
            trendDataMap.set(dateStr, {
                ...current,
                userCount: current.userCount + 1
            });
        }
    });

    const trendData = Array.from(trendDataMap.values()).reverse();

    // ── Company Leaderboard (Bar Chart) ───────────────────────────────────────
    const companyStats = new Map<string, { name: string, count: number, revenue: number }>();
    
    filteredJobs.forEach(job => {
        const company = companies.find(c => c._id === job.companyId);
        const name = company?.name ?? "Unknown Company";
        const current = companyStats.get(job.companyId) || { name, count: 0, revenue: 0 };
        companyStats.set(job.companyId, {
            ...current,
            count: current.count + 1,
            revenue: current.revenue + (job.feesCharged || 0)
        });
    });

    const leaderboard = Array.from(companyStats.values())
        .sort((a,b) => b.count - a.count)
        .slice(0, 5);

    // ── Global Service Distribution (Pie) ────────────────────────────────────
    const serviceCounts = new Map<string, number>();
    const checkTypes = await ctx.db.query("serviceCheckTypes").collect();
    const categories = await ctx.db.query("serviceCategories").collect();

    filteredJobs.forEach(job => {
        const checkType = checkTypes.find(ct => ct.slug === job.serviceType);
        const category = categories.find(c => c._id === checkType?.categoryId);
        const categoryName = category?.name ?? "Other";
        serviceCounts.set(categoryName, (serviceCounts.get(categoryName) || 0) + 1);
    });

    const serviceDistribution = Array.from(serviceCounts.entries()).map(([name, value]) => ({
        name,
        value,
    }));

    return {
      metrics: {
        totalRevenue,
        totalVerifications,
        activeCompanies: activeCompaniesCount,
        successRate
      },
      trendData,
      leaderboard,
      serviceDistribution
    };
  },
});
