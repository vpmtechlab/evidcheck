"use client";

import { useState } from "react";
import { useApp } from "@/components/providers/app-provider";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getSessionToken } from "@/lib/session-token";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * Renders only when there are failed verifications in the last 30 days.
 * Returns null otherwise so attention-free accounts see a clean dashboard.
 */
export function AttentionCard() {
  const { member } = useApp();
  const router = useRouter();
  const [now] = useState(() => Date.now());

  const stats = useQuery(
    api.verifications.getMonthStats,
    member?.companyId
      ? { sessionToken: getSessionToken() ?? "", companyId: member.companyId as Id<"companies">, now }
      : "skip"
  );

  if (stats === undefined || stats.failed === 0) return null;

  return (
    <div className="bg-white border border-amber-200 rounded-lg shadow-2xs overflow-hidden">
      <div className="px-3.5 py-2 flex items-center gap-2 text-xs font-bold bg-amber-500 text-white">
        <AlertTriangle size={14} />
        <span>Needs Attention</span>
        <span className="ml-auto px-1.5 py-0.5 font-mono text-[11px] bg-white/20 rounded-md">
          {stats.failed}
        </span>
      </div>
      <button
        onClick={() => router.push("/dashboard/jobs")}
        className="w-full p-3 flex items-center justify-between text-xs text-gray-700 hover:bg-amber-50/50 transition-colors cursor-pointer"
      >
        <span className="font-medium">
          {stats.failed === 1
            ? "1 verification failed"
            : `${stats.failed} verifications failed`}{" "}
          in the last 30 days
        </span>
        <ArrowRight size={14} className="text-amber-600 shrink-0" />
      </button>
    </div>
  );
}
