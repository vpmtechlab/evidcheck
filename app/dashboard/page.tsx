"use client";

import React from "react";
import { ChevronRight, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { BalanceCard } from "./components/balance-card";
import { MonthSnapshotCard } from "./components/month-snapshot-card";
import { QuickActions } from "./components/quick-actions";
import { AttentionCard } from "./components/attention-card";

export default function DashboardHome() {
  const router = useRouter();

  // Grid blocks for the visual control matrix
  const totalBlocks = 64;
  const passingBlocks = 62;

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto text-gray-900">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time compliance monitoring, identity validation, and registry intelligence
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Updated live</span>
          </div>

          <Button
            onClick={() => router.push("/dashboard/verification")}
            className="bg-brand hover:bg-brand-dark text-white text-xs font-semibold h-8 px-3 rounded-md flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={14} />
            <span>Run Verification</span>
          </Button>
        </div>
      </div>

      {/* Row 1: Wallet balance and last-30-day activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BalanceCard />
        <MonthSnapshotCard />
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 2/3 Width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Program Overview / Verification Matrix (Inspired by SOC 2 Matrix in screenshot) */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-gray-900">
                  Program Overview & Service Health
                </span>
                <ChevronRight size={14} className="text-gray-400" />
              </div>
              <span className="text-xs font-semibold text-gray-500 font-mono">
                Completion: <span className="text-brand font-bold">98.5%</span>
              </span>
            </div>

            {/* Block Matrix Row */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-navy text-white flex items-center justify-center text-[10px] font-bold rounded-xs">
                    EC
                  </div>
                  <span className="font-bold text-gray-800">
                    EvidCheck Multi-Registry Verification Engine
                  </span>
                </div>
                <span className="text-xs text-gray-500 font-mono">
                  {passingBlocks}/{totalBlocks} checkpoints passing
                </span>
              </div>

              {/* Status Squares Matrix */}
              <div className="grid grid-cols-16 sm:grid-cols-32 gap-1 py-1">
                {Array.from({ length: totalBlocks }).map((_, i) => {
                  const isPassing = i < passingBlocks;
                  return (
                    <div
                      key={i}
                      title={isPassing ? `Checkpoint ${i + 1}: Passed` : `Checkpoint ${i + 1}: Attention required`}
                      className={`h-4 w-full rounded-[2px] transition-all ${
                        isPassing ? "bg-brand hover:bg-brand-dark" : "bg-red-400 hover:bg-red-500"
                      }`}
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                <span>92/92 active compliance controls passing</span>
                <span>100% automated coverage</span>
              </div>
            </div>
          </div>

          {/* Audit & Compliance Pipeline Timeline (Inspired by screenshot) */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900">
                Verification & Audit Pipelines
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard/reports")}
                className="h-7 px-2.5 text-xs font-semibold rounded-md border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
              >
                <Download size={13} />
                <span>Export Summary</span>
              </Button>
            </div>

            <div className="space-y-4 pt-2 border-t border-gray-100">
              {/* Pipeline 1 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-brand rounded-full" />
                    <span>Business & Corporate Verification Pipeline (BRS + KRA)</span>
                  </div>
                  <span className="text-[11px] text-gray-500 font-mono">99.4% SLA</span>
                </div>
                {/* Visual Pipeline Bar */}
                <div className="grid grid-cols-5 gap-1.5 text-[10px] font-medium text-center">
                  <div className="p-1.5 bg-green-100 text-green-800 rounded-md border-b-2 border-green-600">
                    Input Ingestion
                  </div>
                  <div className="p-1.5 bg-green-100 text-green-800 rounded-md border-b-2 border-green-600">
                    BRS Registry
                  </div>
                  <div className="p-1.5 bg-green-100 text-green-800 rounded-md border-b-2 border-green-600">
                    KRA PIN Audit
                  </div>
                  <div className="p-1.5 bg-green-100 text-green-800 rounded-md border-b-2 border-green-600">
                    Directors Check
                  </div>
                  <div className="p-1.5 bg-green-50 text-green-800 rounded-md border-b-2 border-green-400">
                    CR12 Certified
                  </div>
                </div>
              </div>

              {/* Pipeline 2 */}
              <div className="space-y-2 pt-2 border-t border-gray-50">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full" />
                    <span>Individual Identity & Credit Risk Pipeline (IPRS + CRB)</span>
                  </div>
                  <span className="text-[11px] text-gray-500 font-mono">100% SLA</span>
                </div>
                {/* Visual Pipeline Bar */}
                <div className="grid grid-cols-5 gap-1.5 text-[10px] font-medium text-center">
                  <div className="p-1.5 bg-blue-100 text-blue-800 rounded-md border-b-2 border-blue-600">
                    National ID
                  </div>
                  <div className="p-1.5 bg-blue-100 text-blue-800 rounded-md border-b-2 border-blue-600">
                    IPRS Match
                  </div>
                  <div className="p-1.5 bg-blue-100 text-blue-800 rounded-md border-b-2 border-blue-600">
                    CRB Credit Bureau
                  </div>
                  <div className="p-1.5 bg-blue-100 text-blue-800 rounded-md border-b-2 border-blue-600">
                    Risk Scoring
                  </div>
                  <div className="p-1.5 bg-blue-50 text-blue-800 rounded-md border-b-2 border-blue-400">
                    Verification Issued
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 1/3 Width */}
        <div className="space-y-4">
          <AttentionCard />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
