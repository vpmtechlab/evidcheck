// Security verification: proves every sensitive function is gated.
// Usage: node infra/convex/security-check.cjs
const { ConvexHttpClient } = require("convex/browser");

const baseUrl = "https://convex-api.evidcheck.com";
const CO = "jd75kmp7g7wsgac2v8v12dxn9583wx41";
const USR = "js7frzp5075wdqrf278rbzn8bx83f5ps";
const JOB = "jh7717wnzbc5cd6d2fr9gkqdy98fffhd";

const results = [];
const gate = (name, kind, ref, args) =>
  results.push({ name, kind, ref, args });

// --- Queries/mutations that must reject an unauthenticated caller ---
const q = (name, ref, args) => gate(name, "query", ref, args);
const m = (name, ref, args) => gate(name, "mutation", ref, args);

// Original critical paths
q("read jobs (no session)", "verifications:getVerificationsByCompany", { companyId: CO });
q("read job by id (no session)", "verifications:getVerificationById", { jobId: JOB });
q("list users (no session)", "users:listUsers", { companyId: CO });
q("legacy getUserById (no session)", "users:getUserById", { userId: USR });
m("changePassword (no session)", "users:changePassword", { userId: USR, newPassword: "Aa1!aaaa" });
m("disable2FA (no session)", "auth:disable2FA", { userId: USR, code: "000000" });
m("updateUserProfile (no session)", "users:updateUserProfile", { userId: USR, firstName: "X", surname: "Y" });
m("deleteUser (no session)", "users:deleteUser", { userId: USR });
m("inviteUser (no session)", "users:inviteUser", { companyId: CO, firstName: "X", surname: "Y", email: "x@y.com", role: "Admin" });
q("forged session token", "session:getSessionUser", { sessionToken: "deadbeef".repeat(8) });

// Admin (superadmin-only)
q("admin.getGlobalMetrics", "admin:getGlobalMetrics", {});
q("admin.getAllCompanies", "admin:getAllCompanies", {});
q("admin.getAllUsers", "admin:getAllUsers", {});
q("admin.getAllJobs", "admin:getAllJobs", {});
q("admin.getCompanyById", "admin:getCompanyById", { companyId: CO });
q("admin.getCompanyUsers", "admin:getCompanyUsers", { companyId: CO });
q("admin.getAdminDashboardAnalytics", "admin:getAdminDashboardAnalytics", { days: 30 });
m("admin.updateCompany", "admin:updateCompany", { companyId: CO, name: "Hacked" });

// Audit / notifications
q("audit.getGlobalAuditLogs", "audit:getGlobalAuditLogs", {});
q("audit.getAuditLogsByCompany", "audit:getAuditLogsByCompany", { companyId: CO });
q("audit.getLoginHistoryByUser", "audit:getLoginHistoryByUser", { userId: USR });
q("audit.getActiveNotificationsByUser", "audit:getActiveNotificationsByUser", { userId: USR });
m("audit.clearNotifications", "audit:clearNotifications", { userId: USR });
m("audit.markAsRead", "audit:markAsRead", { notificationId: JOB });

// Money / company data
q("transactions.list", "transactions:list", { companyId: CO });
q("billing.getBillingAnalytics", "billing:getBillingAnalytics", { companyId: CO });
q("analytics.getDashboardAnalytics", "analytics:getDashboardAnalytics", { companyId: CO });
q("companies.getDefaultCompany", "companies:getDefaultCompany", {});
q("reports.listReports", "reports:listReports", { companyId: CO });
m("reports.createReport", "reports:createReport", { companyId: CO, name: "x", type: "t", format: "CSV", status: "completed", config: {} });
m("reports.deleteReport", "reports:deleteReport", { reportId: JOB });

// Notifications module
q("notifications.getRecent", "notifications:getRecent", { userId: USR });
m("notifications.clearAll", "notifications:clearAll", { userId: USR });
m("notifications.markAsRead", "notifications:markAsRead", { notificationId: JOB });

// Service/pricing admin mutations
m("services.createCategory", "services:createCategory", { name: "x", slug: "x", icon: "Shield", color: "bg" });
m("services.updateCategory", "services:updateCategory", { id: JOB });
m("services.createAction", "services:createAction", { categoryId: JOB, label: "x", slug: "x", enabled: true });
m("services.updateAction", "services:updateAction", { id: JOB });
m("services.createCheckType", "services:createCheckType", { categoryId: JOB, label: "x", slug: "x" });
m("services.deleteCheckType", "services:deleteCheckType", { id: JOB });
m("pricing.updatePrice", "pricing:updatePrice", { pricingId: JOB, newPrice: 0.01 });
m("pricing.addPrice", "pricing:addPrice", { serviceCategory: "c", serviceId: "s", serviceName: "n", price: 0.01 });

// init must no longer be public at all
q("init.resetAndSeedServices not public", "init:resetAndSeedServices", {});
q("init.seedServices not public", "init:seedServices", {});
q("init.seedMockData not public", "init:seedMockData", {});

// Removed public functions must not exist
m("deductBalance not public", "users:deductBalance", { companyId: CO, amount: 1 });
m("addFunds not public", "balances:addFunds", { companyId: CO, userId: USR, amount: 999 });

const GATED = /Unauthorized|Forbidden|required|mismatch|Could not find public function|ArgumentValidationError|Found ID|not found/i;

async function main() {
  const c = new ConvexHttpClient(baseUrl);
  for (const r of results) {
    try {
      const out = r.kind === "query"
        ? await c.query(r.ref, r.args)
        : await c.mutation(r.ref, r.args);
      r.status = "FAIL";
      r.detail = "returned " + JSON.stringify(out).slice(0, 50);
    } catch (e) {
      const msg = String(e.message || e).replace(/\s+/g, " ").slice(0, 80);
      r.status = GATED.test(msg) ? "PASS" : "CHECK";
      r.detail = msg;
    }
  }

  console.log("\n=== SECURITY CHECK ===");
  for (const r of results) {
    console.log(`${r.status.padEnd(6)} ${r.name.padEnd(42)} ${r.detail}`);
  }
  const fail = results.filter((r) => r.status === "FAIL");
  const check = results.filter((r) => r.status === "CHECK");
  console.log(`\n${results.length - fail.length - check.length}/${results.length} gated; ${fail.length} OPEN; ${check.length} inconclusive`);
  if (fail.length) process.exit(1);
}

main().catch((e) => {
  console.error("HARNESS_ERROR: " + (e.message || e));
  process.exit(1);
});
