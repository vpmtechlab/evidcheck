"use client";

import { getSessionToken } from "@/lib/session-token";

import React, { useMemo, useState } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AuditFeed } from "@/components/shared/audit-feed";
import { AuditToolbar, type AuditCategoryFilter } from "@/components/shared/audit-toolbar";
import { Activity, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
	AUDIT_CATEGORIES,
	auditLogMatchesSearch,
	categorizeAuditAction,
	downloadAuditCsv,
} from "@/lib/audit-categories";

export default function AdminAuditPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<AuditCategoryFilter>("all");

  const { results: rawLogs, status, loadMore } = usePaginatedQuery(
    api.audit.getGlobalAuditLogs,
    { sessionToken: getSessionToken() ?? "" },
    { initialNumItems: 20 }
  );

  const logs = useMemo(() => {
    if (!rawLogs) return undefined;
    return rawLogs.filter(
      (log) =>
        (category === "all" || categorizeAuditAction(log.action) === category) &&
        auditLogMatchesSearch(log, search)
    );
  }, [rawLogs, category, search]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const log of rawLogs ?? []) {
      const id = categorizeAuditAction(log.action);
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return AUDIT_CATEGORIES.map((cat) => ({
      ...cat,
      count: counts.get(cat.id) ?? 0,
    })).filter((cat) => cat.count > 0);
  }, [rawLogs]);

  const handleExportCsv = () => {
    if (!logs || logs.length === 0) {
      toast.error("No audit events available to export.");
      return;
    }
    downloadAuditCsv(logs, `evidcheck_platform_audit_${Date.now()}.csv`);
    toast.success(`Exported ${logs.length} audit events to CSV.`);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Platform Governance & Audit Trail
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Immutable log of all configuration changes, administrative overrides, and high-level platform events.
          </p>
        </div>

        <div className="flex items-center gap-2">
           <Button
             onClick={handleExportCsv}
             disabled={!logs || logs.length === 0}
             size="sm"
             className="rounded-md px-3 text-xs font-semibold gap-1.5 h-8 bg-navy text-white hover:bg-navy-soft shadow-xs disabled:opacity-50"
           >
              <Download size={13} /> Export Logs
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         {/* Stats Sidebar */}
         <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs space-y-4">
               <div>
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">Live Stream</h3>
                  <p className="text-sm font-bold text-green-800 flex items-center gap-1.5">
                     <Activity size={14} className="text-green-600 animate-pulse" />
                     Operational
                  </p>
               </div>

               <div className="space-y-2 pt-3 border-t border-gray-100">
                  <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
                     <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Events in view</p>
                     <p className="text-xl font-bold text-gray-900 font-mono tracking-tight">{logs?.length ?? "--"}</p>
                  </div>
               </div>

               {categoryCounts.length > 0 && (
                 <div className="space-y-1.5 pt-3 border-t border-gray-100">
                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">By category</p>
                   {categoryCounts.map((cat) => (
                     <div key={cat.id} className="flex items-center justify-between text-xs">
                       <span className="text-gray-600 font-medium">{cat.label}</span>
                       <span className="font-bold text-gray-900 font-mono">{cat.count}</span>
                     </div>
                   ))}
                 </div>
               )}

               <p className="text-[11px] text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                  Audit entries are append-only and retained for compliance review.
               </p>
            </div>
         </div>

         {/* Main Audit Feed */}
         <div className="lg:col-span-3 space-y-4">
            <AuditToolbar
              search={search}
              onSearchChange={setSearch}
              category={category}
              onCategoryChange={setCategory}
            />

            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs">
              <AuditFeed
                 logs={logs}
                 title="Platform Interactions"
                 subtitle="Newest first · click any event for technical details"
                 showCompany={true}
              />
            </div>

            {/* Pagination Controls */}
            {status !== "Exhausted" && (
               <div className="flex justify-center pt-2">
                  <Button
                     onClick={() => loadMore(20)}
                     disabled={status === "LoadingMore"}
                     variant="outline"
                     size="sm"
                     className="rounded-md px-6 text-xs font-semibold border-gray-300 hover:bg-gray-50 text-gray-700 h-8 disabled:opacity-50"
                  >
                     {status === "LoadingMore" ? "Synchronizing..." : "Load More Activity"}
                  </Button>
               </div>
            )}

            {status === "Exhausted" && logs && logs.length > 0 && (
               <p className="text-center text-xs font-mono text-gray-400 pt-2">
                  End of Audit Trail
               </p>
            )}
         </div>
      </div>
    </div>
  );
}
