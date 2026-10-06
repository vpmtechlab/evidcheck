"use client";

import React, { useState } from "react";
import { FileText, File, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useApp } from "@/components/providers/app-provider";
import { Id } from "@/convex/_generated/dataModel";
import { format as formatDate } from "date-fns";
import { downloadCSV, downloadPDF } from "@/lib/export-utils";
import {
  filterVerificationsForReport,
  toComplianceCsvRows,
  toCompliancePdfRows,
} from "@/lib/report-export";
import { cn } from "@/lib/utils";
import { getSessionToken } from "@/lib/session-token";

const TYPE_LABELS: Record<string, string> = {
  compliance: "Compliance Summary",
  audit: "Audit Log",
  financial: "Financial Report",
  activity: "User Activity",
};

function DateField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-semibold text-gray-700">{label}</Label>
      <Input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-md border-gray-300 text-xs"
      />
    </div>
  );
}

export function CustomReportGenerator() {
  const { member } = useApp();
  const company = useQuery(api.companies.getDefaultCompany, { sessionToken: getSessionToken() ?? "" });
  const allVerifications = useQuery(api.verifications.getVerificationsByCompany,
    company?._id ? { sessionToken: getSessionToken() ?? "", companyId: company._id } : "skip"
  );
  const createReport = useMutation(api.reports.createReport);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportType, setReportType] = useState("compliance");
  const [status, setStatus] = useState("all");
  const [format, setFormat] = useState("pdf");
  const [generating, setGenerating] = useState(false);

  const handleGenerateCustomReport = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select a date range.");
      return;
    }
    if (!company?._id || !member?.id) {
      toast.error("Organization context not found.");
      return;
    }
    if (!allVerifications) {
      toast.error("Verification data is not yet loaded.");
      return;
    }
    setGenerating(true);
    try {
      const typeLabel = TYPE_LABELS[reportType] || "Custom Report";
      const reportName = `${typeLabel} - ${formatDate(new Date(startDate), "MMM dd")} to ${formatDate(new Date(endDate), "MMM dd")}`;

      const filteredLogs = filterVerificationsForReport(allVerifications, {
        startDate,
        endDate,
        reportType,
        status,
      });
      if (filteredLogs.length === 0) {
        toast.error("No records found for the selected criteria.");
        return;
      }

      await createReport({
        sessionToken: getSessionToken() ?? "",
        companyId: company._id,
        name: reportName,
        type: typeLabel,
        format: format.toUpperCase(),
        status: "completed",
        config: { startDate, endDate, reportType, status },
      });

      const fileName = reportName.replace(/\s+/g, "_");
      if (format.toLowerCase() === "csv") {
        downloadCSV(toComplianceCsvRows(filteredLogs), fileName);
      } else {
        const { headers, rows } = toCompliancePdfRows(filteredLogs);
        downloadPDF(headers, rows, fileName, typeLabel);
      }
      toast.success(`${typeLabel} generated and downloaded successfully!`);
      setStartDate("");
      setEndDate("");
    } catch (error) {
      toast.error("Failed to generate report.");
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-2xs space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-navy text-white rounded-md">
          <FileText size={18} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">Generate Custom Report</h3>
          <p className="text-[11px] text-gray-500">Filter data and export in your preferred format.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DateField id="start-date" label="Start Date" value={startDate} onChange={setStartDate} />
        <DateField id="end-date" label="End Date" value={endDate} onChange={setEndDate} />

        <div className="space-y-1.5 w-full">
          <Label htmlFor="report-type" className="text-xs font-semibold text-gray-700">Report Type</Label>
          <Select value={reportType} onValueChange={(value: string | null) => setReportType(value ?? "compliance")}>
            <SelectTrigger id="report-type" className="w-full h-9 rounded-md border-gray-300 text-xs">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compliance">Compliance Summary</SelectItem>
              <SelectItem value="audit">Audit Log</SelectItem>
              <SelectItem value="financial">Financial Report</SelectItem>
              <SelectItem value="activity">User Activity</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="status" className="text-xs font-semibold text-gray-700">Status</Label>
          <Select value={status} onValueChange={(value: string | null) => setStatus(value ?? "all")}>
            <SelectTrigger id="status" className="w-full h-9 rounded-md border-gray-300 text-xs">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="failed">Failed / Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-700">Export Format:</span>
          <div className="flex bg-gray-100 p-1 rounded-md" role="group" aria-label="Export format">
            {(
              [
                { id: "pdf", label: "PDF", icon: File },
                { id: "csv", label: "CSV", icon: FileSpreadsheet },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setFormat(opt.id)}
                aria-pressed={format === opt.id}
                className={cn(
                  "flex items-center gap-1.5 cursor-pointer px-3.5 py-1.5 rounded text-xs font-semibold transition-all",
                  format === opt.id ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <opt.icon size={14} /> {opt.label}
              </button>
            ))}
          </div>
        </div>
        <Button
          onClick={handleGenerateCustomReport}
          disabled={generating}
          className="w-full md:w-auto min-w-[150px] bg-brand hover:bg-brand-dark text-white h-9 text-xs font-bold rounded-md disabled:opacity-50"
        >
          {generating ? "Generating..." : "Generate Report"}
        </Button>
      </div>
    </div>
  );
}
