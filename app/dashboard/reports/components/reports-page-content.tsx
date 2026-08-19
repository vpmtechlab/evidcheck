"use client";

// Route-level reports implementation.

import React, { useState } from "react";
import { Download, FileText, Calendar, Filter } from "lucide-react";
import { toast } from "sonner";
import { MetricsGrid } from "@/components/dashboard/reports/metrics-grid";
import { ChartsSection } from "@/components/dashboard/reports/charts-section";
import { CustomReportGenerator } from "@/components/dashboard/reports/custom-report-generator";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useApp } from "@/components/providers/app-provider";
import { format } from "date-fns";
import { downloadCSV, downloadPDF } from "@/lib/export-utils";
import { getErrorMessage } from "@/lib/utils";

// Types for our reports
interface GeneratedReport {
  _id: Id<"generatedReports">;
  name: string;
  type: string;
  format: string;
  config?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    reportType?: string;
    allTime?: boolean;
  };
  createdAt: number;
}

export default function ReportsPage() {
  const { member } = useApp();
  const [dateRange, setDateRange] = useState("30");
  const [downloading, setDownloading] = useState(false);

  // 1. Fetch analytics based on date range
  const analytics = useQuery(api.analytics.getDashboardAnalytics, 
    member?.companyId ? { companyId: member.companyId as Id<"companies">, days: parseInt(dateRange) || undefined } : "skip"
  );

  // 2. Fetch real report history
  const reports = useQuery(api.reports.listReports, 
    member?.companyId ? { companyId: member.companyId as Id<"companies">, limit: 5 } : "skip"
  );

  const createReport = useMutation(api.reports.createReport);

  const allVerifications = useQuery(api.verifications.getVerificationsByCompany, 
    member?.companyId ? { companyId: member.companyId as Id<"companies"> } : "skip"
  );

  const handleDownload = (report: GeneratedReport) => {
    const isReportObj = typeof report !== "string";
    const name = isReportObj ? report.name : report;
    const formatType = isReportObj ? report.format.toUpperCase() : "CSV";
    
    if (!allVerifications) {
      toast.error("Verification data is still loading. Please wait.");
      return;
    }

    // 1. Filter data based on the report's stored configuration
    const filteredData = allVerifications.filter(v => {
      // If it's a simple string call (legacy), don't filter
      if (!isReportObj || !report.config) return true;
      
      const { startDate, endDate, status, allTime } = report.config;
      if (allTime) return true;

      const createdAt = v.createdAt;
      
      // Date range filtering
      if (startDate) {
        const startMs = new Date(startDate).getTime();
        if (createdAt < startMs) return false;
      }
      if (endDate) {
        const endMs = new Date(endDate).getTime() + 86400000;
        if (createdAt > endMs) return false;
      }
      
      // Status filtering
      if (status && status !== "all" && v.resultStatus !== status) return false;
      
      return true;
    });

    if (filteredData.length === 0) {
      toast.error("No records match this report's criteria.");
      return;
    }

    // 2. Export based on format
    if (formatType === "CSV") {
      const exportData = filteredData.map(v => ({
        Date: format(v.createdAt, "yyyy-MM-dd HH:mm"),
        Service: v.serviceName || v.serviceType,
        Status: v.resultStatus.toUpperCase(),
        Subject: v.entityData?.firstName ? `${v.entityData.firstName} ${v.entityData.lastName || ""}` : (v.entityData?.companyName || "N/A"),
        "Reference ID": v._id.slice(-8).toUpperCase(),
        Fee: v.feesCharged ? `$${v.feesCharged.toFixed(2)}` : "$0.00",
        Source: v.source
      }));

      downloadCSV(exportData, name.replace(/\s+/g, "_"));
      toast.success(`Downloaded ${name}.csv`);
    } else {
      const headers = ["Date", "Service", "Status", "Subject", "Ref ID", "Fee"];
      const rows = filteredData.map(v => [
        format(v.createdAt, "MM/dd/yy"),
        v.serviceName || v.serviceType,
        v.resultStatus.toUpperCase(),
        v.entityData?.firstName ? `${v.entityData.firstName} ${v.entityData.lastName || ""}` : (v.entityData?.companyName || "N/A"),
        v._id.slice(-6).toUpperCase(),
        v.feesCharged ? `$${v.feesCharged.toFixed(2)}` : "$0.00"
      ]);
      
      downloadPDF(headers, rows, name.replace(/\s+/g, "_"), name);
      toast.success(`Exported ${name} as PDF`);
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
      
      // 1. Create record in history
      await createReport({
        companyId: member.companyId as Id<"companies">,
        userId: member.id as Id<"users">,
        name: reportName.replace(/_/g, " "),
        type: "Full Data Export",
        format: "CSV",
        status: "completed",
        config: { allTime: true },
      });
      
      // 2. Prepare high-quality data
      const exportData = allVerifications.map(v => ({
        "Verification Date": format(v.createdAt, "yyyy-MM-dd HH:mm:ss"),
        "Service Type": v.serviceName || v.serviceType,
        "Result Status": v.resultStatus.toUpperCase(),
        "Subject Name": v.entityData?.firstName ? `${v.entityData.firstName} ${v.entityData.lastName || ""}` : (v.entityData?.companyName || "N/A"),
        "ID/Reg Number": v.entityData?.idNumber || v.entityData?.companyNumber || v.entityData?.pin || "N/A",
        "Fees (USD)": v.feesCharged || 0,
        "Source Channel": v.source,
        "Message": v.message || "Processed"
      }));
      
      downloadCSV(exportData, reportName);
      toast.success("Full report generated and downloaded!");
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error(error);
    } finally {
      setTimeout(() => setDownloading(false), 1000);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-2 max-w-[1600px] mx-auto">
      {/* Reports Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-gray-500 text-sm mt-1.5 flex items-center gap-2">
            <Calendar size={14} className="text-primary" />
            Performance insights and compliance tracking for your organization.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-xs">
            <Filter size={14} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Range:</span>
            <Select value={dateRange} onValueChange={(val) => setDateRange(val ?? "30")}>
              <SelectTrigger className="border-none bg-transparent h-7 font-bold text-gray-900 focus:ring-0">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="0">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGlobalExport}
            disabled={downloading}
            className="bg-primary space-x-2 text-white hover:bg-[#146c11] px-5 shadow-sm"
          >
            <Download size={18} />
            <span>{downloading ? "Exporting..." : "Export All"}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Dashboard Content */}
        <div className="xl:col-span-3 space-y-8">
          <MetricsGrid analytics={analytics} />
          <ChartsSection analytics={analytics} />
          
          <div className="bg-linear-to-br from-white to-gray-50/50 p-1 rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <CustomReportGenerator />
          </div>
        </div>

        {/* Sidebar: Recent Exports */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <FileText size={18} className="text-primary" />
                Recent Exports
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-1 rounded">
                PDF / CSV
              </span>
            </div>
            
            <div className="space-y-4">
              {!reports ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse" />
                ))
              ) : reports.length === 0 ? (
                <p className="text-xs text-center py-8 text-gray-400 font-medium italic">No recent exports found.</p>
              ) : (
                reports.map((report) => (
                  <div 
                    key={report._id} 
                    className="group p-4 bg-gray-50/50 hover:bg-white hover:shadow-lg hover:border-primary/20 border border-transparent rounded-2xl transition-all duration-300 cursor-pointer"
                    onClick={() => handleDownload(report)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                        {report.name}
                      </p>
                      <Download size={14} className="text-gray-300 group-hover:text-primary shrink-0 transition-colors" />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      <span>{format(report.createdAt, "MMM dd, yyyy")}</span>
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{report.type}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Button variant="ghost" className="w-full text-xs text-primary font-bold hover:bg-primary/5 rounded-xl">
              View All History →
            </Button>
          </div>

          <div className="bg-linear-to-br from-primary/10 to-secondary/10 p-6 rounded-3xl border border-primary/5 text-center space-y-3">
             <h4 className="font-bold text-gray-900">Need Custom Data?</h4>
             <p className="text-xs text-gray-600 leading-relaxed">Use our generator to create filtered reports for audits or internal reviews.</p>
             <Button variant="outline" className="w-full h-9 text-xs font-bold border-primary/20 hover:bg-white/50">Open Generator</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
