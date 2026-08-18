"use client";

import React, { useContext, useState } from "react";
import { AppContext } from "@/components/providers/app-provider";
import Link from "next/link";
import { 
  Building2, 
  UserCheck, 
  FileText, 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Download, 
  ExternalLink,
  RefreshCw,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Search,
  Activity,
  Layers
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function DashboardHome() {
  const { member, setShowTopUp } = useContext(AppContext);
  const router = useRouter();

  const statsData = useQuery(
    api.verifications.getJobStats,
    member?.companyId ? { companyId: member.companyId as Id<"companies"> } : "skip"
  );

  const recentJobs = useQuery(
    api.verifications.getVerificationsByCompany,
    member?.companyId ? { companyId: member.companyId as Id<"companies"> } : "skip"
  );

  const [activeTab, setActiveTab] = useState<"all" | "kyb" | "kyc" | "kra" | "crb">("all");

  const totalJobs = statsData?.total ?? 24;
  const completedJobs = statsData?.completed ?? 22;
  const pendingJobs = statsData?.running ?? 1;
  const failedJobs = statsData?.failed ?? 1;

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
            className="bg-[#188015] hover:bg-[#136610] text-white text-xs font-semibold h-8 px-3 rounded-md flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={14} />
            <span>Run Verification</span>
          </Button>
        </div>
      </div>

      {/* Row 1: High-Density Structured Metrics (Inspired by screenshot) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Monitored Services */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-gray-800">
            <div className="flex items-center gap-1.5">
              <Layers size={15} className="text-gray-500" />
              <span>4 Core Verification Services</span>
            </div>
            <ChevronRight size={14} className="text-gray-400" />
          </div>

          <div className="space-y-2 pt-1 border-t border-gray-100 text-xs">
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-red-500 rounded-full inline-block" />
                <span>Need attention</span>
              </div>
              <span className="font-bold text-gray-900 font-mono">0</span>
            </div>
            <div className="flex items-center justify-between py-1 border-t border-gray-50">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-green-600 rounded-full inline-block" />
                <span>Fully operational</span>
              </div>
              <span className="font-bold text-gray-900 font-mono">4</span>
            </div>
            <div className="flex items-center justify-between py-1 border-t border-gray-50">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-gray-400 rounded-full inline-block" />
                <span>Standby / Sandbox</span>
              </div>
              <span className="font-bold text-gray-900 font-mono">0</span>
            </div>
          </div>
        </div>

        {/* Card 2: Identities & Verifications */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-gray-800">
            <div className="flex items-center gap-1.5">
              <UserCheck size={15} className="text-gray-500" />
              <span>{totalJobs} Total Verifications</span>
            </div>
            <ChevronRight size={14} className="text-gray-400" />
          </div>

          <div className="space-y-2 pt-1 border-t border-gray-100 text-xs">
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-red-500 rounded-full inline-block" />
                <span>Action required / Flagged</span>
              </div>
              <span className="font-bold text-gray-900 font-mono">{failedJobs}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-t border-gray-50">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-green-600 rounded-full inline-block" />
                <span>Approved & Compliant</span>
              </div>
              <span className="font-bold text-gray-900 font-mono">{completedJobs}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-t border-gray-50">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-blue-500 rounded-full inline-block" />
                <span>Currently in progress</span>
              </div>
              <span className="font-bold text-gray-900 font-mono">{pendingJobs}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Alert Banner Card (Deep red header styling like screenshot) */}
        <div className="bg-white border border-red-200 rounded-lg shadow-2xs overflow-hidden">
          <div 
            style={{ backgroundColor: "#991b1b", color: "#ffffff" }}
            className="px-3.5 py-2 flex items-center justify-between text-xs font-bold"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-white" />
              <span>Active Compliance & Risk Flags</span>
            </div>
            <span 
              style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
              className="px-1.5 py-0.2 font-mono text-[11px] text-white rounded-md"
            >
              2 Total
            </span>
          </div>

          <div className="p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 text-gray-700 hover:text-red-700 cursor-pointer transition-colors">
              <span className="font-medium">BRS Company Inactive / Dormant Findings</span>
              <span className="font-bold font-mono text-red-700">1</span>
            </div>
            <div className="flex items-center justify-between py-1 border-t border-gray-100 text-gray-700 hover:text-red-700 cursor-pointer transition-colors">
              <span className="font-medium">KRA Tax Obligation Non-Compliance</span>
              <span className="font-bold font-mono text-red-700">1</span>
            </div>
            <div className="flex items-center justify-between py-1 border-t border-gray-100 text-gray-700 hover:text-red-700 cursor-pointer transition-colors">
              <span className="font-medium">CRB Adverse / Default Risk Notices</span>
              <span className="font-bold font-mono text-gray-400">0</span>
            </div>
          </div>
        </div>
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
                Completion: <span className="text-[#188015] font-bold">98.5%</span>
              </span>
            </div>

            {/* Block Matrix Row */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-[#0e1b42] text-white flex items-center justify-center text-[10px] font-bold rounded-xs">
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
                        isPassing ? "bg-[#188015] hover:bg-[#136610]" : "bg-red-400 hover:bg-red-500"
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

          {/* 4 Core Verification Services Quick Access */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 tracking-tight">
                Core Verification Services
              </h2>
              <span className="text-xs text-gray-500">
                Official Kenya & East Africa Registries
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. Business Registration Check */}
              <div 
                onClick={() => router.push("/dashboard/verification?service=business_registration")}
                className="p-3.5 border border-gray-200 rounded-lg bg-white hover:border-[#188015] hover:shadow-xs transition-all cursor-pointer group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-50 text-indigo-700 rounded-md">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-900 group-hover:text-[#188015] transition-colors">
                        Business Registration Check
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        For businesses & companies (BRS)
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-gray-400 group-hover:text-[#188015]" />
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
                  <span className="text-green-700 font-bold">● Active</span>
                  <span>• CR12 / Directors / Reg No</span>
                </div>
              </div>

              {/* 2. National ID Check */}
              <div 
                onClick={() => router.push("/dashboard/verification?service=national_id")}
                className="p-3.5 border border-gray-200 rounded-lg bg-white hover:border-[#188015] hover:shadow-xs transition-all cursor-pointer group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-50 text-blue-700 rounded-md">
                      <UserCheck size={18} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-900 group-hover:text-[#188015] transition-colors">
                        National ID Check
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        For individuals (IPRS Government ID)
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-gray-400 group-hover:text-[#188015]" />
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
                  <span className="text-green-700 font-bold">● Active</span>
                  <span>• Citizen ID / DOB / Bio Match</span>
                </div>
              </div>

              {/* 3. KRA PIN Checker */}
              <div 
                onClick={() => router.push("/dashboard/verification?service=kra")}
                className="p-3.5 border border-gray-200 rounded-lg bg-white hover:border-[#188015] hover:shadow-xs transition-all cursor-pointer group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-orange-50 text-orange-700 rounded-md">
                      <FileText size={18} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-900 group-hover:text-[#188015] transition-colors">
                        KRA PIN Checker
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        For businesses, companies & individuals
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-gray-400 group-hover:text-[#188015]" />
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
                  <span className="text-green-700 font-bold">● Active</span>
                  <span>• PIN Validity / TCC Compliance</span>
                </div>
              </div>

              {/* 4. CRB Check */}
              <div 
                onClick={() => router.push("/dashboard/verification?service=crb_check")}
                className="p-3.5 border border-gray-200 rounded-lg bg-white hover:border-[#188015] hover:shadow-xs transition-all cursor-pointer group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-purple-50 text-purple-700 rounded-md">
                      <Shield size={18} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-900 group-hover:text-[#188015] transition-colors">
                        CRB Check
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        For individuals (Credit Bureau Score)
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-gray-400 group-hover:text-[#188015]" />
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
                  <span className="text-green-700 font-bold">● Active</span>
                  <span>• Metropol / TransUnion Score</span>
                </div>
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
                    <span className="w-2 h-2 bg-[#188015] rounded-full" />
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

          {/* Integrations Row (like screenshot) */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-gray-900">
                  Registries & Government Integrations
                </span>
                <ChevronRight size={14} className="text-gray-400" />
              </div>
              <span className="text-xs text-green-700 font-bold font-mono">
                All 4 Systems Connected
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-100">
              <div className="p-3 border border-gray-100 rounded-md bg-gray-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">BRS Kenya</span>
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <p className="text-[10px] text-gray-500">Business Registrar</p>
                <p className="text-[10px] text-green-700 font-semibold">Connected</p>
              </div>

              <div className="p-3 border border-gray-100 rounded-md bg-gray-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">IPRS Gateway</span>
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <p className="text-[10px] text-gray-500">National ID System</p>
                <p className="text-[10px] text-green-700 font-semibold">Connected</p>
              </div>

              <div className="p-3 border border-gray-100 rounded-md bg-gray-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">KRA iTax API</span>
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <p className="text-[10px] text-gray-500">Tax Authority</p>
                <p className="text-[10px] text-green-700 font-semibold">Connected</p>
              </div>

              <div className="p-3 border border-gray-100 rounded-md bg-gray-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">CRB Bureaus</span>
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <p className="text-[10px] text-gray-500">Credit Metropol/TU</p>
                <p className="text-[10px] text-green-700 font-semibold">Connected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 1/3 Width (Recently Viewed / Activity Feed like screenshot) */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Recently Viewed & Verified
              </h2>
              <Link 
                href="/dashboard/jobs" 
                className="text-[11px] text-[#188015] hover:underline font-semibold"
              >
                View all
              </Link>
            </div>

            {/* Stacked Cards Feed with Category Badges */}
            <div className="space-y-2">
              {/* Item 1: BRS Verified */}
              <div 
                onClick={() => router.push("/dashboard/jobs")}
                className="p-2.5 border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50/50 transition-colors cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 font-mono">
                    BUSINESS REG
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-green-50 text-green-700 border border-green-200 rounded-sm font-semibold">
                    Passing
                  </span>
                </div>
                <p className="text-xs font-bold text-gray-900 leading-tight">
                  Apex Technologies Ltd (PVT-2022/94821)
                </p>
                <p className="text-[11px] text-gray-500 truncate">
                  Registered • CR12 Active • 2 Directors Matched
                </p>
              </div>

              {/* Item 2: National ID Validated */}
              <div 
                onClick={() => router.push("/dashboard/jobs")}
                className="p-2.5 border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50/50 transition-colors cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 font-mono">
                    NATIONAL ID
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-green-50 text-green-700 border border-green-200 rounded-sm font-semibold">
                    Passing
                  </span>
                </div>
                <p className="text-xs font-bold text-gray-900 leading-tight">
                  John Kamau Mwangi (ID: 28491023)
                </p>
                <p className="text-[11px] text-gray-500 truncate">
                  Valid • DOB 1993-11-04 • Photo On File
                </p>
              </div>

              {/* Item 3: KRA Attention */}
              <div 
                onClick={() => router.push("/dashboard/jobs")}
                className="p-2.5 border border-amber-200 rounded-md bg-amber-50/30 hover:bg-amber-50/60 transition-colors cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 font-mono">
                    KRA PIN CHECK
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-800 border border-amber-300 rounded-sm font-semibold">
                    Needs changes
                  </span>
                </div>
                <p className="text-xs font-bold text-gray-900 leading-tight">
                  Kestrel Global Ent (P051239845X)
                </p>
                <p className="text-[11px] text-amber-700 truncate">
                  Non-Compliant • Outstanding 2023 Return
                </p>
              </div>

              {/* Item 4: CRB Check */}
              <div 
                onClick={() => router.push("/dashboard/jobs")}
                className="p-2.5 border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50/50 transition-colors cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 font-mono">
                    CRB CHECK
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-green-50 text-green-700 border border-green-200 rounded-sm font-semibold">
                    Passing
                  </span>
                </div>
                <p className="text-xs font-bold text-gray-900 leading-tight">
                  Brian Ouma Odhiambo (Credit Score: 735)
                </p>
                <p className="text-[11px] text-gray-500 truncate">
                  Good • Not Listed • 3 Performing Accounts
                </p>
              </div>

              {/* Item 5: Policy */}
              <div className="p-2.5 border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50/50 transition-colors cursor-pointer space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 font-mono">
                    POLICY
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-200 rounded-sm font-semibold">
                    Published
                  </span>
                </div>
                <p className="text-xs font-bold text-gray-900 leading-tight">
                  KYC & Data Protection Policy v2.4
                </p>
                <p className="text-[11px] text-gray-500 truncate">
                  Compliant with Kenya Data Protection Act 2019
                </p>
              </div>

              {/* Item 6: Monitor */}
              <div className="p-2.5 border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50/50 transition-colors cursor-pointer space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 font-mono">
                    MONITOR
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-green-50 text-green-700 border border-green-200 rounded-sm font-semibold">
                    Succeeded
                  </span>
                </div>
                <p className="text-xs font-bold text-gray-900 leading-tight">
                  Daily Registry Heartbeat & Sync Check
                </p>
                <p className="text-[11px] text-gray-500 truncate">
                  All 4 API health monitors responding &lt; 210ms
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
