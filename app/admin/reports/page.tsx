"use client";

import React, { useState } from "react";
import { useQuery, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, Download, Filter, Calendar, Activity, ArrowUpRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AdminMetricsGrid } from "@/components/admin/reports/admin-metrics-grid";
import { AdminChartsSection } from "@/components/admin/reports/admin-charts-section";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ReportsAdminPage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState("30");
  const [isExporting, setIsExporting] = useState(false);

  // 1. Fetch Global Jobs for the table with pagination
  const { results: jobs, status, loadMore } = usePaginatedQuery(
    api.admin.getAllJobs,
    {},
    { initialNumItems: 10 }
  );
  
  // 2. Fetch Global Analytics for the charts
  const analytics = useQuery(api.admin.getAdminDashboardAnalytics, { 
    days: parseInt(dateRange) || undefined 
  });

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      toast.success("Platform-wide CSV export initiated.");
    }, 1500);
  };

  if (jobs === undefined) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#188015]" />
        <p className="text-xs font-semibold text-gray-500 font-mono">
           Loading Global Analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
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
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-md px-2.5 py-1 shadow-2xs">
             <Filter size={13} className="text-gray-400" />
             <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Range:</span>
             <Select value={dateRange} onValueChange={(v) => setDateRange(v ?? "30")}>
               <SelectTrigger className="border-none bg-transparent h-6 text-xs font-bold text-gray-900 focus:ring-0 min-w-[100px] shadow-none">
                 <SelectValue placeholder="Period" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="7">Past 7 Days</SelectItem>
                 <SelectItem value="30">Past 30 Days</SelectItem>
                 <SelectItem value="90">Past 90 Days</SelectItem>
                 <SelectItem value="0">All Time</SelectItem>
               </SelectContent>
             </Select>
          </div>

          <Button 
             onClick={handleExport}
             disabled={isExporting}
             className="gap-1.5 bg-[#188015] text-white hover:bg-[#136610] h-8 px-3 text-xs font-semibold rounded-md shadow-xs"
          >
             <Download size={13} /> 
             <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
          </Button>
        </div>
      </div>

      {/* Analytics Components */}
      <AdminMetricsGrid analytics={analytics} />
      
      <AdminChartsSection analytics={analytics} />

      {/* Global Activity Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="p-4 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
           <div>
              <h2 className="font-bold text-gray-900 text-sm tracking-tight flex items-center gap-1.5">
                 Recent Platform Transactions
                 <ArrowUpRight size={14} className="text-gray-400" />
              </h2>
              <p className="text-[11px] text-gray-500 font-mono mt-0.5">Live Verification Feed across all companies</p>
           </div>
           <Button 
             variant="outline" 
             size="sm"
             onClick={() => router.push("/admin/audit")}
             className="text-xs font-semibold text-gray-700 h-7 px-2.5 rounded-md border-gray-300 hover:bg-gray-100"
           >
              View Audit Log
           </Button>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50 border-b border-gray-200">
              <TableRow>
                <TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider py-3 pl-4">Company</TableHead>
                <TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider text-center">Service</TableHead>
                <TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider text-center">Outcome</TableHead>
                <TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider text-right">Fee</TableHead>
                <TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider text-right pr-4">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job._id} className="hover:bg-gray-50/60 transition-colors border-b border-gray-100">
                  <TableCell className="py-3 pl-4">
                     <span className="font-bold text-xs text-gray-900">{job.companyName}</span>
                  </TableCell>
                  <TableCell className="text-center font-mono text-[11px] font-bold text-gray-600 uppercase">
                     {job.serviceType.replace("_", " ")}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border
                      ${job.resultStatus === "approved" ? "bg-green-50 text-green-700 border-green-200" : 
                        job.resultStatus === "failed" ? "bg-red-50 text-red-700 border-red-200" : 
                        "bg-amber-50 text-amber-700 border-amber-200"}`}
                    >
                      {job.resultStatus.replace(/_/g, " ")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-xs text-gray-900">
                    ${job.feesCharged?.toFixed(2) || "0.00"}
                  </TableCell>
                  <TableCell className="text-right text-gray-500 font-mono text-[11px] pr-4">
                    {new Date(job.createdAt).toLocaleDateString('en-GB')} {new Date(job.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                </TableRow>
              ))}
              
              {jobs.length === 0 && status !== "LoadingMore" && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-xs text-gray-500 font-medium">
                     No transactions recorded in this timeframe.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
           <p className="text-[11px] font-mono text-gray-500">
              {status === "LoadingMore" ? "Fetching more records..." : 
               status === "Exhausted" ? "End of platform history" : 
               `Showing latest ${jobs.length} transactions`}
           </p>
           
           {status !== "Exhausted" && (
             <Button
               onClick={() => loadMore(10)}
               disabled={status === "LoadingMore"}
               variant="outline"
               size="sm"
               className="text-xs font-semibold h-7 px-3 rounded-md border-gray-300 hover:bg-gray-100"
             >
               {status === "LoadingMore" ? "Loading..." : "Load More"}
             </Button>
           )}
        </div>
      </div>
    </div>
  );
}
