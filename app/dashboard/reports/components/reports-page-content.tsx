"use client";

// Route-level reports implementation (lean orchestrator).

import React, { useState } from "react";
import { toast } from "sonner";
import { MetricsGrid } from "@/components/dashboard/reports/metrics-grid";
import { ChartsSection } from "@/components/dashboard/reports/charts-section";
import { CustomReportGenerator } from "@/components/dashboard/reports/custom-report-generator";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useApp } from "@/components/providers/app-provider";
import { format } from "date-fns";
import { downloadCSV, downloadPDF } from "@/lib/export-utils";
import { getErrorMessage } from "@/lib/utils";
import { ReportHero } from "./report-hero";
import { RecentExports, type RecentReport } from "./recent-exports";
import {
	filterVerificationsForReport,
	toComplianceCsvRows,
	toCompliancePdfRows,
} from "@/lib/report-export";
import { getSessionToken } from "@/lib/session-token";

const PERIOD_LABELS: Record<string, string> = {
	"7": "Last 7 Days",
	"30": "Last 30 Days",
	"90": "Last 90 Days",
	"0": "All Time",
};

export default function ReportsPage() {
  const { member } = useApp();
  const [dateRange, setDateRange] = useState("30");
  const [downloading, setDownloading] = useState(false);

  const analytics = useQuery(api.analytics.getDashboardAnalytics,
    member?.companyId ? { sessionToken: getSessionToken() ?? "", companyId: member.companyId as Id<"companies">, days: parseInt(dateRange) || undefined } : "skip"
  );

  const reports = useQuery(api.reports.listReports,
    member?.companyId ? { sessionToken: getSessionToken() ?? "", companyId: member.companyId as Id<"companies">, limit: 5 } : "skip"
  );

  const createReport = useMutation(api.reports.createReport);

  const allVerifications = useQuery(api.verifications.getVerificationsByCompany,
    member?.companyId ? { sessionToken: getSessionToken() ?? "", companyId: member.companyId as Id<"companies"> } : "skip"
  );

  const approved = analytics?.metrics.approvedJobs ?? null;
  const pending = analytics?.metrics.pendingReviews ?? null;

  const handleDownload = (report: RecentReport) => {
    if (!allVerifications) {
      toast.error("Verification data is still loading. Please wait.");
      return;
    }
    const filteredData = filterVerificationsForReport(allVerifications, report.config);
    if (filteredData.length === 0) {
      toast.error("No records match this report's criteria.");
      return;
    }
    const fileName = report.name.replace(/\s+/g, "_");
    if (report.format.toUpperCase() === "CSV") {
      downloadCSV(toComplianceCsvRows(filteredData), fileName);
      toast.success(`Downloaded ${report.name}.csv`);
    } else {
      const { headers, rows } = toCompliancePdfRows(filteredData);
      downloadPDF(headers, rows, fileName, report.name);
      toast.success(`Exported ${report.name} as PDF`);
    }
  };

  const handleGlobalExport = async () => {
    if (!member?.companyId || !member?.id || !allVerifications) {
      toast.error("Data still loading, please wait...");
      return;
    }
    setDownloading(true);
    try {
      const reportName = `Full_Compliance_Export_${format(new Date(), "yyyyMMdd")}`;
      await createReport({
        sessionToken: getSessionToken() ?? "",
        companyId: member.companyId as Id<"companies">,
        name: reportName.replace(/_/g, " "),
        type: "Full Data Export",
        format: "CSV",
        status: "completed",
        config: { allTime: true },
      });
      downloadCSV(toComplianceCsvRows(allVerifications), reportName);
      toast.success("Full report generated and downloaded!");
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error(error);
    } finally {
      setTimeout(() => setDownloading(false), 1000);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-2 max-w-[1600px] mx-auto">
      <ReportHero
        periodLabel={PERIOD_LABELS[dateRange] ?? "Last 30 Days"}
        dateRange={dateRange}
        onRangeChange={setDateRange}
        total={analytics?.metrics.totalJobs ?? null}
        approved={approved}
        pending={pending}
        exporting={downloading}
        onExport={handleGlobalExport}
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <MetricsGrid analytics={analytics} />
          <ChartsSection analytics={analytics} />
          <CustomReportGenerator />
        </div>

        <div>
          <RecentExports reports={reports} onDownload={handleDownload} />
        </div>
      </div>
    </div>
  );
}
