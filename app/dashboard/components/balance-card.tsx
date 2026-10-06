"use client";

import { useApp } from "@/components/providers/app-provider";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getSessionToken } from "@/lib/session-token";
import { Wallet, Plus, ArrowUpRight, AlertTriangle } from "lucide-react";
import Link from "next/link";

const LOW_BALANCE_USD = 50;

export function BalanceCard() {
  const { member, setShowTopUp } = useApp();

  const balance = useQuery(
    api.balances.get,
    member?.companyId ? { sessionToken: getSessionToken() ?? "", companyId: member.companyId as Id<"companies"> } : "skip"
  );

  const amount =
    balance === undefined ? undefined : (balance?.availableBalance ?? 0);
  const isLow = amount !== undefined && amount < LOW_BALANCE_USD;
  const subtitle =
    amount === 0
      ? "Top up to run your first verification."
      : isLow
        ? "Top up to keep verifications running without interruption."
        : "Available for verification checks across all 4 registries.";

  return (
    <div
      className="rounded-lg p-4 shadow-2xs space-y-3 bg-navy text-white border-b-2 border-brand flex flex-col justify-between"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-white">
          <Wallet size={15} className="text-gray-300" />
          <span>Wallet Balance</span>
        </div>
        {amount !== undefined &&
          (isLow ? (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-md">
              <AlertTriangle size={11} />
              Low balance
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-gray-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Ready
            </span>
          ))}
      </div>

      <div className="pt-1 border-t border-white/10">
        {amount === undefined ? (
          <div className="py-2 space-y-2 animate-pulse">
            <div className="h-7 w-32 bg-white/10 rounded" />
            <div className="h-3 w-40 bg-white/10 rounded" />
          </div>
        ) : (
          <>
            <p className="text-3xl font-bold font-mono tracking-tight text-white">
              ${amount.toFixed(2)}
            </p>
            <p className="text-[11px] text-gray-300 mt-0.5">{subtitle}</p>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowTopUp(true)}
          className="flex-1 h-9 px-3 bg-brand hover:bg-brand-dark text-white text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus size={14} />
          <span>Top Up</span>
        </button>
        <Link
          href="/dashboard/billing"
          className="h-9 px-3 flex items-center gap-1 text-xs font-semibold text-gray-200 hover:text-white border border-white/20 hover:border-white/40 rounded-md transition-colors"
        >
          <span>History</span>
          <ArrowUpRight size={13} />
        </Link>
      </div>
    </div>
  );
}
