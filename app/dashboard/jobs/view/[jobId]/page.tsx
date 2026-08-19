"use client";

import React, { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Check,
  Shield,
  Building2,
  UserCheck,
  FileText,
  AlertTriangle,
  Loader2,
  StopCircle,
  Globe,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

// ── Helpers & Authority Mapping ───────────────────────────────────────────────

function getAuthorityInfo(serviceType: string) {
  if (serviceType.includes("kyb") || serviceType === "business_registration") {
    return {
      name: "Business Registration Service",
      code: "BRS Kenya",
      logo: Building2,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    };
  }
  if (serviceType.includes("kra") || serviceType.includes("pin")) {
    return {
      name: "Kenya Revenue Authority",
      code: "KRA iTax",
      logo: FileText,
      color: "text-orange-600 bg-orange-50 border-orange-200",
    };
  }
  if (serviceType.includes("crb")) {
    return {
      name: "Credit Reference Bureau",
      code: "Metropol / TransUnion",
      logo: Shield,
      color: "text-purple-600 bg-purple-50 border-purple-200",
    };
  }
  return {
    name: "Integrated Population Registration System",
    code: "IPRS Kenya",
    logo: UserCheck,
    color: "text-blue-600 bg-blue-50 border-blue-200",
  };
}

function getStatusBadge(status: string) {
  switch (status) {
    case "approved":
      return {
        bg: "bg-emerald-50 text-emerald-800 border-emerald-300",
        pillBg: "bg-emerald-600",
        label: "Approved",
        code: "Code: 1012 Verified",
        icon: CheckCircle2,
      };
    case "failed":
      return {
        bg: "bg-red-50 text-red-800 border-red-300",
        pillBg: "bg-red-600",
        label: "Failed",
        code: "Code: 4004 Mismatch",
        icon: XCircle,
      };
    case "not_found_on_list":
      return {
        bg: "bg-teal-50 text-teal-800 border-teal-300",
        pillBg: "bg-teal-600",
        label: "Not Found on List",
        code: "Code: 2000 Clean",
        icon: CheckCircle2,
      };
    case "cancelled":
      return {
        bg: "bg-gray-100 text-gray-800 border-gray-300",
        pillBg: "bg-gray-600",
        label: "Cancelled",
        code: "Code: 0000 Terminated",
        icon: StopCircle,
      };
    case "pending":
    case "running":
    default:
      return {
        bg: "bg-amber-50 text-amber-800 border-amber-300",
        pillBg: "bg-amber-500",
        label: "Processing",
        code: "Code: 1000 Processing",
        icon: Clock,
      };
  }
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

// ── Payload Renderers ─────────────────────────────────────────────────────────

type Payload = Record<string, unknown>;

function DirectorsTable({ directors }: { directors: Array<Record<string, string>> }) {
  return (
    <div className="overflow-x-auto rounded-md border border-gray-200">
      <table className="w-full text-xs text-left">
        <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold uppercase tracking-wider font-mono text-[10px]">
          <tr>
            <th className="px-3.5 py-2.5">Name</th>
            <th className="px-3.5 py-2.5">ID Number</th>
            <th className="px-3.5 py-2.5">Nationality</th>
            <th className="px-3.5 py-2.5">Role / Position</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
          {directors.map((d, i) => (
            <tr key={i} className="hover:bg-gray-50/60">
              <td className="px-3.5 py-2.5 font-bold text-gray-900 font-sans">{d.name}</td>
              <td className="px-3.5 py-2.5 text-gray-700">{d.idNumber}</td>
              <td className="px-3.5 py-2.5 text-gray-600">{d.nationality}</td>
              <td className="px-3.5 py-2.5 text-gray-700 font-semibold">{d.role ?? "Director"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: unknown }) {
  const SKIP_KEYS = ["verificationStatus", "verificationMessage", "checks", "directors", "watchlistsChecked"];
  if (SKIP_KEYS.includes(label)) return null;

  let display: React.ReactNode;
  if (typeof value === "boolean") {
    display = (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold ${value ? "bg-green-100 text-green-800 border border-green-300" : "bg-red-100 text-red-800 border border-red-300"}`}>
        {value ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
        {value ? "YES" : "NO"}
      </span>
    );
  } else if (typeof value === "object" && value !== null) {
    display = (
      <span className="text-gray-700 font-mono text-[11px] bg-gray-100 px-2 py-0.5 rounded-xs border border-gray-200">
        {JSON.stringify(value)}
      </span>
    );
  } else {
    display = <span className="font-bold text-gray-900">{String(value ?? "N/A")}</span>;
  }

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 text-xs">
      <span className="text-gray-500 font-medium">{formatKey(label)}:</span>
      <div className="text-right">{display}</div>
    </div>
  );
}

// ── Main Page Component ───────────────────────────────────────────────────────

export default function JobViewPage() {
  const params = useParams();
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  const [copiedId, setCopiedId] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(true);

  const jobId = params.jobId as string;
  const job = useQuery(api.verifications.getVerificationById, {
    jobId: jobId as Id<"jobs">,
  });

  const cancelJob = useMutation(api.verifications.cancelJob);

  if (job === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2.5 text-gray-500">
          <Loader2 className="w-7 h-7 animate-spin text-[#188015]" />
          <p className="text-xs font-semibold">Loading verification result details…</p>
        </div>
      </div>
    );
  }

  if (job === null) {
    return (
      <div className="p-4 max-w-2xl mx-auto text-center py-16 bg-white border border-gray-200 rounded-lg shadow-2xs">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <XCircle size={24} />
        </div>
        <h2 className="text-base font-bold text-gray-900">Verification Job Not Found</h2>
        <p className="text-xs text-gray-500 mt-1 mb-5">
          No job record matching ID <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 font-mono">{jobId}</code> exists.
        </p>
        <Button onClick={() => router.push("/dashboard/jobs")} variant="outline" className="text-xs font-semibold rounded-md">
          <ArrowLeft size={14} className="mr-1.5" /> Back to Verification Jobs
        </Button>
      </div>
    );
  }

  const authority = getAuthorityInfo(job.serviceType);
  const AuthLogo = authority.logo;
  const statusBadge = getStatusBadge(job.resultStatus);
  const StatusIcon = statusBadge.icon;
  const payload = (job.resultPayload ?? {}) as Payload;
  const entityData = (job.entityData ?? {}) as Record<string, string>;
  const directors = payload.directors as Array<Record<string, string>> | undefined;

  const isPending = job.resultStatus === "pending" || job.resultStatus === "running";

  const handleCopyId = () => {
    navigator.clipboard.writeText(job._id);
    setCopiedId(true);
    toast.success("Job ID copied to clipboard");
    setTimeout(() => setCopiedId(false), 1500);
  };

  const handleTerminateJob = async () => {
    setIsCancelling(true);
    try {
      await cancelJob({ jobId: job._id });
      toast.success("Verification job terminated successfully!");
      setShowCancelModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to terminate job.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank");
    if (!win) { alert("Please allow popups to print"); return; }
    win.document.write(`<!DOCTYPE html><html><head>
      <title>EvidCheck Verification — ${job.serviceType}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>body{font-family:system-ui,sans-serif;padding:24px}@media print{.no-print{display:none!important}}</style>
      </head><body>${content.innerHTML}</body></html>`);
    win.document.close();
    win.onload = () => setTimeout(() => { win.print(); win.close(); }, 500);
  };

  const dateObj = new Date(job.createdAt);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long", day: "numeric", month: "short", year: "numeric",
  });
  const formattedTime = dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Action Header & Breadcrumb */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/dashboard/jobs"
            className="text-[#188015] hover:underline font-semibold flex items-center gap-1"
          >
            <ArrowLeft size={14} />
            Verification Jobs
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600 font-mono font-medium">{job._id}</span>
        </div>

        <div className="flex items-center gap-2">
          {isPending && (
            <Button
              onClick={() => setShowCancelModal(true)}
              disabled={isCancelling}
              variant="outline"
              className="h-8 text-xs font-bold text-red-700 border-red-300 hover:bg-red-50 rounded-md gap-1.5 shadow-2xs"
            >
              {isCancelling ? <Loader2 size={13} className="animate-spin" /> : <StopCircle size={13} />}
              <span>Terminate Job</span>
            </Button>
          )}

          <Button
            onClick={handlePrint}
            size="sm"
            className="h-8 text-xs font-bold bg-[#188015] hover:bg-[#136610] text-white px-3 rounded-md gap-1.5 shadow-2xs"
          >
            <Printer size={13} />
            <span>Print Report</span>
          </Button>
        </div>
      </div>

      <div ref={printRef} className="space-y-6">
        {/* 2-COLUMN GRID MATCHING SMILEID REFERENCE LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* LEFT CARD: ID Authority Queried */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4 shadow-2xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block font-mono">
                  ID Authority Queried:
                </span>
                <div className="flex items-center gap-2.5 mt-2">
                  <div className={`p-2 rounded-md border ${authority.color}`}>
                    <AuthLogo size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 leading-tight">
                      {authority.name}
                    </h3>
                    <span className="text-[10px] text-gray-500 font-mono">{authority.code}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Country:</span>
                <span className="font-bold text-gray-900 font-mono">{entityData.country || "KE"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">ID Type:</span>
                <span className="font-bold text-gray-900 font-mono uppercase">
                  {job.serviceType?.toUpperCase()}
                </span>
              </div>
              {entityData.companyNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Registration Number:</span>
                  <span className="font-bold text-gray-900 font-mono">{entityData.companyNumber}</span>
                </div>
              )}
              {entityData.idNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">ID / Doc Number:</span>
                  <span className="font-bold text-gray-900 font-mono">{entityData.idNumber}</span>
                </div>
              )}
              {entityData.pin && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">KRA PIN:</span>
                  <span className="font-bold text-gray-900 font-mono">{entityData.pin}</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT CARD: Job Execution & Status */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3.5 shadow-2xs">
            <div className="space-y-2 text-xs divide-y divide-gray-100">
              <div className="flex items-center justify-between pb-2">
                <span className="text-gray-500 font-medium">Job Type:</span>
                <span className="font-bold text-gray-900">{serviceTypeLabel(job.serviceType)}</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-gray-500 font-medium">Job ID:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold font-mono text-gray-900">{job._id}</span>
                  <button
                    onClick={handleCopyId}
                    className="text-gray-400 hover:text-[#188015] p-1 rounded transition-colors"
                    title="Copy Job ID"
                  >
                    {copiedId ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-gray-500 font-medium">Date:</span>
                <span className="font-semibold text-gray-800">{formattedDate}</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-gray-500 font-medium">Time:</span>
                <span className="font-semibold text-gray-800 font-mono">{formattedTime}</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-gray-500 font-medium">Source / Environment:</span>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-gray-100 border border-gray-200 rounded-sm text-gray-800">
                  {job.source === "rest_api" ? "REST API (api.evidcheck.com)" : "EvidCheck Portal"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-gray-500 font-medium">Result:</span>
                <div className={`px-3 py-1 border rounded-md font-bold text-xs flex items-center gap-2 ${statusBadge.bg}`}>
                  <span className={`w-2 h-2 rounded-full ${statusBadge.pillBg}`} />
                  <span>{statusBadge.label}</span>
                  <span className="font-mono text-[10px] opacity-75">({statusBadge.code})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ID AUTHORITY RESPONSE ACCORDION CARD */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-2xs">
          <div
            onClick={() => setAccordionOpen(!accordionOpen)}
            className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-100/60 transition-colors select-none"
          >
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-[#188015]" />
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                ID Authority Response Data
              </h3>
              <Info size={14} className="text-gray-400" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500 font-mono font-medium">
                {Object.keys(payload).length} attributes
              </span>
              {accordionOpen ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
            </div>
          </div>

          {accordionOpen && (
            <div className="p-5 space-y-5">
              {Object.keys(payload).length > 0 ? (
                <>
                  <div className="divide-y divide-gray-100">
                    {Object.entries(payload).map(([k, v]) => (
                      <DataRow key={k} label={k} value={v} />
                    ))}
                  </div>

                  {directors && directors.length > 0 && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs font-bold text-gray-800 uppercase tracking-wider font-mono mb-2">
                        Company Directors & Key Officers
                      </p>
                      <DirectorsTable directors={directors} />
                    </div>
                  )}
                </>
              ) : (
                <div className="py-8 text-center text-xs text-gray-500">
                  {isPending ? "Verification job processing in real-time…" : "No response payload recorded."}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <AlertDialogContent className="sm:max-w-md rounded-lg">
          <AlertDialogHeader className="flex flex-col items-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3 text-red-600">
              <AlertTriangle size={24} />
            </div>
            <AlertDialogTitle className="text-base font-bold">
              Terminate Verification Job?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-xs text-gray-600">
              Are you sure you want to terminate job <code className="font-mono text-gray-900 font-bold bg-gray-100 px-1 py-0.5 rounded">{job._id}</code>? The status will be permanently marked as <span className="font-bold text-red-600">cancelled</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 justify-between mt-4">
            <AlertDialogCancel className="mt-0 flex-1 text-xs rounded-md">
              Keep Running
            </AlertDialogCancel>
            <Button
              onClick={handleTerminateJob}
              disabled={isCancelling}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md gap-1.5"
            >
              {isCancelling ? <Loader2 size={13} className="animate-spin" /> : <StopCircle size={13} />}
              <span>Confirm Termination</span>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function serviceTypeLabel(slug: string): string {
  switch (slug) {
    case "business_registration":
    case "kyb":
      return "Business Registration Check (BRS)";
    case "national_id":
    case "kyc":
      return "Individual Document Verification (IPRS)";
    case "kra":
    case "kra_pin_check":
      return "KRA PIN & Compliance Checker";
    case "crb_check":
      return "CRB Credit Risk Check";
    default:
      return slug?.toUpperCase() || "Verification Check";
  }
}
