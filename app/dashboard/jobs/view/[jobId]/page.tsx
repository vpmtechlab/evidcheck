"use client";

import React, { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, XCircle, Loader2 } from "lucide-react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { JobHeader } from "./components/job-header";
import { AuthorityCard } from "./components/authority-card";
import { ExecutionCard } from "./components/execution-card";
import { ResponseAccordion, type Payload } from "./components/response-accordion";
import { CancelJobDialog } from "./components/cancel-job-dialog";
import { getSessionToken } from "@/lib/session-token";

export default function JobViewPage() {
  const params = useParams();
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  const [copiedId, setCopiedId] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const jobId = params.jobId as string;
  const job = useQuery(api.verifications.getVerificationById, {
    sessionToken: getSessionToken() ?? "",
    jobId: jobId as Id<"jobs">,
  });

  const cancelJob = useMutation(api.verifications.cancelJob);
  const runVerification = useAction(api.verifications.runVerification);

  const handleCopyId = () => {
    if (!job) return;
    navigator.clipboard.writeText(job._id);
    setCopiedId(true);
    toast.success("Job ID copied to clipboard");
    setTimeout(() => setCopiedId(false), 1500);
  };

  const handleTerminateJob = async () => {
    if (!job) return;
    setIsCancelling(true);
    try {
      await cancelJob({ jobId: job._id });
      toast.success("Verification job terminated successfully!");
      setShowCancelModal(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to terminate job.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRefresh = async () => {
    if (!job) return;
    setIsRefreshing(true);
    try {
      const result = await runVerification({
        sessionToken: getSessionToken() ?? "",
        companyId: job.companyId,
        userId: job.userId,
        serviceType: job.serviceType,
        entityData: job.entityData,
        source: job.source,
        forceRefresh: true,
      });
      toast.success("Fresh registry result retrieved.");
      router.push(`/dashboard/jobs/view/${result.jobId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to refresh from registry.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank");
    if (!win) { alert("Please allow popups to print"); return; }
    win.document.write(`<!DOCTYPE html><html><head>
      <title>EvidCheck Verification — ${job?.serviceType}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>body{font-family:system-ui,sans-serif;padding:24px}@media print{.no-print{display:none!important}}</style>
      </head><body>${content.innerHTML}</body></html>`);
    win.document.close();
    win.onload = () => setTimeout(() => { win.print(); win.close(); }, 500);
  };

  if (job === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2.5 text-gray-500">
          <Loader2 className="w-7 h-7 animate-spin text-brand" />
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

  const payload = (job.resultPayload ?? {}) as Payload;
  const entityData = (job.entityData ?? {}) as Record<string, string>;
  const directors = payload.directors as Array<Record<string, string>> | undefined;
  const isPending = job.resultStatus === "pending" || job.resultStatus === "running";

  const dateObj = new Date(job.createdAt);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long", day: "numeric", month: "short", year: "numeric",
  });
  const formattedTime = dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
  });

  const cacheFetchedAt = payload.cacheFetchedAt as number | undefined;
  const cacheFetchedLabel = cacheFetchedAt
    ? new Date(cacheFetchedAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <JobHeader
        jobId={job._id}
        isPending={isPending}
        isRefreshing={isRefreshing}
        isCancelling={isCancelling}
        onTerminateClick={() => setShowCancelModal(true)}
        onPrint={handlePrint}
        onRefresh={handleRefresh}
      />

      <div ref={printRef} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AuthorityCard serviceType={job.serviceType} entityData={entityData} />
          <ExecutionCard
            jobId={job._id}
            serviceType={job.serviceType}
            resultStatus={job.resultStatus}
            source={job.source}
            formattedDate={formattedDate}
            formattedTime={formattedTime}
            fromCache={job.fromCache ?? false}
            cacheFetchedLabel={cacheFetchedLabel}
            copiedId={copiedId}
            onCopyId={handleCopyId}
          />
        </div>

        <ResponseAccordion
          payload={payload}
          directors={directors}
          isPending={isPending}
          open={accordionOpen}
          onToggle={() => setAccordionOpen(!accordionOpen)}
        />
      </div>

      <CancelJobDialog
        open={showCancelModal}
        onOpenChange={setShowCancelModal}
        jobId={job._id}
        isCancelling={isCancelling}
        onConfirm={handleTerminateJob}
      />
    </div>
  );
}
