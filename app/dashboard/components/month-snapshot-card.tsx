"use client";

import { useState } from "react";
import { useApp } from "@/components/providers/app-provider";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getSessionToken } from "@/lib/session-token";
import { Activity, ChevronRight, Play } from "lucide-react";
import { useRouter } from "next/navigation";

export function MonthSnapshotCard() {
  const { member } = useApp();
  const router = useRouter();
  const [now] = useState(() => Date.now());

  const stats = useQuery(
    api.verifications.getMonthStats,
    member?.companyId
      ? { sessionToken: getSessionToken() ?? "", companyId: member.companyId as Id<"companies">, now }
      : "skip"
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs space-y-3 flex flex-col justify-between">
      <div className="flex items-center justify-between text-xs font-bold text-gray-800">
        <div className="flex items-center gap-1.5">
          <Activity size={15} className="text-gray-500" />
          <span>Last 30 Days</span>
        </div>
        <ChevronRight size={14} className="text-gray-400" />
      </div>

      {stats === undefined ? (
        <div className="space-y-2 pt-1 border-t border-gray-100 animate-pulse">
          <div className="h-4 bg-gray-100 rounded" />
          <div className="h-4 bg-gray-100 rounded" />
          <div className="h-4 bg-gray-100 rounded" />
        </div>
      ) : stats.verifications === 0 ? (
        <div className="pt-3 border-t border-gray-100 text-center space-y-2">
          <p className="text-xs text-gray-500">
            No verifications run in the last 30 days.
          </p>
          <button
            onClick={() => router.push("/dashboard/verification")}
            className="inline-flex items-center gap-1.5 h-8 px-3 bg-brand hover:bg-brand-dark text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
          >
            <Play size={13} />
            <span>Run your first check</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2 pt-1 border-t border-gray-100 text-xs">
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-600">Verifications run</span>
            <span className="font-bold text-gray-900 font-mono">
              {stats.verifications}
            </span>
          </div>
          <div className="flex items-center justify-between py-1 border-t border-gray-50">
            <span className="text-gray-600">Pass rate</span>
            <span className="font-bold text-brand font-mono">
              {stats.passRate}%
            </span>
          </div>
          <div className="flex items-center justify-between py-1 border-t border-gray-50">
            <span className="text-gray-600">Billed spend</span>
            <span className="font-bold text-gray-900 font-mono">
              ${stats.spend.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
