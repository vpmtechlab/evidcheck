"use client";

import { getSessionToken } from "@/lib/session-token";

import React, { useState } from "react";
import { useQuery, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminMetricsGrid } from "@/components/admin/reports/admin-metrics-grid";
import { AdminChartsSection } from "@/components/admin/reports/admin-charts-section";
import { toast } from "sonner";
import { format } from "date-fns";
import { downloadCSV } from "@/lib/export-utils";
import { ReportsToolbar } from "./components/reports-toolbar";
import { PlatformTransactionsTable } from "./components/platform-transactions-table";

export default function ReportsAdminPage() {
  const [dateRange, setDateRange] = useState("30");
  const [isExporting, setIsExporting] = useState(false);

  const { results: jobs, status, loadMore } = usePaginatedQuery(
    api.admin.getAllJobs,
    { sessionToken: getSessionToken() ?? "" },
    { initialNumItems: 10 }
  );

  const analytics = useQuery(api.admin.getAdminDashboardAnalytics, {
    sessionToken: getSessionToken() ?? "",
    days: parseInt(dateRange) || undefined
  });

  const handleExport = () => {
    if (!jobs || jobs.length === 0) {
      toast.error("No platform transactions available to export.");
      return;
    }
    setIsExporting(true);
    try {
      const rows = jobs.map((job) => ({
        Date: format(job.createdAt, "yyyy-MM-dd HH:mm"),
        Company: job.companyName,
        Service: job.serviceType,
        Status: job.resultStatus.toUpperCase(),
        "Fee (USD)": job.feesCharged ?? 0,
      }));
      downloadCSV(rows, `platform_transactions_${format(new Date(), "yyyyMMdd")}`);
      toast.success(`Exported ${jobs.length} platform transactions.`);
    } finally {
      setIsExporting(false);
    }
  };

  if (jobs === undefined) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
        <p className="text-xs font-semibold text-gray-500 font-mono">
           Loading Global Analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Global Analytics & Reports
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Cross-tenant performance, financial aggregates, and real-time transaction activity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <ReportsToolbar dateRange={dateRange} onRangeChange={setDateRange} />
          <Button
             onClick={handleExport}
             disabled={isExporting || jobs.length === 0}
             className="gap-1.5 bg-brand text-white hover:bg-brand-dark h-8 px-3 text-xs font-semibold rounded-md shadow-xs disabled:opacity-50"
          >
             <Download size={13} />
             <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
          </Button>
        </div>
      </div>

      <AdminMetricsGrid analytics={analytics} />

      <AdminChartsSection analytics={analytics} />

      <PlatformTransactionsTable
        jobs={jobs}
        canLoadMore={status !== "Exhausted"}
        loadingMore={status === "LoadingMore"}
        emptyHint={
          status === "LoadingMore" ? "Fetching more records..." :
          status === "Exhausted" ? "End of platform history" :
          `Showing latest ${jobs.length} transactions`
        }
        onLoadMore={() => loadMore(10)}
      />
    </div>
  );
}
