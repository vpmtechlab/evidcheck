"use client";

import React from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AuditFeed } from "@/components/shared/audit-feed";
import { Activity, ShieldCheck, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminAuditPage() {
  const { results: logs, status, loadMore } = usePaginatedQuery(
    api.audit.getGlobalAuditLogs,
    {},
    { initialNumItems: 10 }
  );

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
             variant="outline" 
             size="sm"
             className="rounded-md px-3 text-xs font-semibold gap-1.5 h-8 border-gray-300 text-gray-700 hover:bg-gray-50"
           >
              <Filter size={13} /> Filter
           </Button>
           <Button 
             size="sm"
             className="rounded-md px-3 text-xs font-semibold gap-1.5 h-8 bg-[#0e1b42] text-white hover:bg-[#172758] shadow-xs"
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
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">Audit Integrity</h3>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full w-[98%] bg-[#188015] rounded-full transition-all duration-1000" />
                  </div>
               </div>
               
               <div className="space-y-2 pt-1 border-t border-gray-100">
                  <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
                     <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Total Captured Events</p>
                     <p className="text-xl font-bold text-gray-900 font-mono tracking-tight">{logs?.length || "--"}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-md border border-green-200 text-green-900">
                     <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-0.5">Stream Health</p>
                     <p className="text-sm font-bold text-green-800 flex items-center gap-1.5">
                        <Activity size={14} className="text-green-600 animate-pulse" />
                        Operational
                     </p>
                  </div>
               </div>

               <p className="text-[11px] text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                  All audit entries are tamper-evident and cryptographically retained in compliance with Kenya Data Protection Act standards.
               </p>
            </div>
         </div>

         {/* Main Audit Feed */}
         <div className="lg:col-span-3 space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs">
              <AuditFeed 
                 logs={logs} 
                 title="Platform Interactions" 
                 showCompany={true} 
              />
            </div>
            
            {/* Pagination Controls */}
            {status !== "Exhausted" && (
               <div className="flex justify-center pt-2">
                  <Button
                     onClick={() => loadMore(10)}
                     disabled={status === "LoadingMore"}
                     variant="outline"
                     size="sm"
                     className="rounded-md px-6 text-xs font-semibold border-gray-300 hover:bg-gray-50 text-gray-700 h-8"
                  >
                     {status === "LoadingMore" ? "Synchronizing..." : "Load More Activity"}
                  </Button>
               </div>
            )}

            {status === "Exhausted" && logs.length > 0 && (
               <p className="text-center text-xs font-mono text-gray-400 pt-2">
                  End of Audit Trail
               </p>
            )}
         </div>
      </div>
    </div>
  );
}
