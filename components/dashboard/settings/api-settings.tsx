"use client";

import React, { useState, useContext } from "react";
import {
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Check,
  ShieldCheck,
  FlaskConical,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
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
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppContext } from "@/components/providers/app-provider";
import { Id } from "@/convex/_generated/dataModel";

export function ApiSettings() {
  const { member } = useContext(AppContext);
  const apiKeys = useQuery(
    api.apiKeys.list,
    member?.companyId ? { companyId: member.companyId as Id<"companies"> } : "skip"
  );
  const generateApiKey = useMutation(api.apiKeys.generate);

  const [showLiveKey, setShowLiveKey] = useState(false);
  const [showTestKey, setShowTestKey] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<"live" | "test" | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [newLiveKey, setNewLiveKey] = useState<string | null>(null);
  const [newTestKey, setNewTestKey] = useState<string | null>(null);

  const liveKeyObj = apiKeys?.find((k) => k.mode === "live" || k.keyHash?.startsWith("evid_live_sk_") || k.keyHash?.startsWith("api_live_"));
  const testKeyObj = apiKeys?.find((k) => k.mode === "test" || k.keyHash?.startsWith("evid_test_sk_"));

  const displayLiveKey = newLiveKey || liveKeyObj?.keyHash || "evid_live_sk_8942104829104821";
  const displayTestKey = newTestKey || testKeyObj?.keyHash || "evid_test_sk_3948102948102948";

  const handleCopyKey = (keyString: string, type: string) => {
    navigator.clipboard.writeText(keyString);
    setCopiedKey(type);
    toast.success(`${type} API Key copied to clipboard!`);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const confirmGenerateKey = async (mode: "live" | "test") => {
    if (!member?.companyId || !member?.id) return;
    setLoading(true);
    try {
      const result = await generateApiKey({
        companyId: member.companyId as Id<"companies">,
        userId: member.id as Id<"users">,
        name: mode === "live" ? "Production Live Key" : "Sandbox Test Key",
        mode,
      });

      if (mode === "live") {
        setNewLiveKey(result.rawKey);
        setShowLiveKey(true);
      } else {
        setNewTestKey(result.rawKey);
        setShowTestKey(true);
      }

      toast.success(`New ${mode.toUpperCase()} API Key generated!`);
      setShowConfirmModal(null);
    } catch {
      toast.error(`Failed to generate ${mode} API Key.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">
          API Environments & Access Credentials
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          EvidCheck enforces strict separation between Production and Sandbox test environments.
        </p>
      </div>

      {/* Production Live API Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-2xs space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-sm">Production Environment</h3>
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-sm border border-emerald-300">
                  LIVE BILLABLE
                </span>
              </div>
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                Base URL: <code className="text-gray-900 font-bold bg-gray-100 px-1.5 py-0.5 rounded">https://api.evidcheck.com/v1/verifications</code>
              </p>
            </div>
          </div>
        </div>

        {/* Live Key Display */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider font-mono">
            Production Secret Key (evid_live_sk_*)
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center justify-between p-2.5 bg-gray-50 rounded-md border border-gray-200 font-mono text-xs text-gray-900">
              <span className="truncate">
                {showLiveKey ? displayLiveKey : "evid_live_sk_••••••••••••••••••••••••"}
              </span>

              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button
                  onClick={() => setShowLiveKey(!showLiveKey)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md transition-colors"
                  title={showLiveKey ? "Hide Key" : "Show Key"}
                >
                  {showLiveKey ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button
                  onClick={() => handleCopyKey(displayLiveKey, "Production Live")}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md transition-colors"
                  title="Copy Key"
                >
                  {copiedKey === "Production Live" ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}
                </button>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirmModal("live")}
              className="h-9 text-xs font-semibold rounded-md border-gray-300 text-gray-700 hover:bg-gray-50 shrink-0"
            >
              <RefreshCw size={13} className="mr-1.5" /> Roll Key
            </Button>
          </div>
        </div>
      </div>

      {/* Sandbox Test API Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-2xs space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-md border border-blue-200 shrink-0">
              <FlaskConical size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-sm">Sandbox Environment</h3>
                <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-sm border border-blue-300">
                  TEST / ZERO COST
                </span>
              </div>
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                Base URL: <code className="text-gray-900 font-bold bg-gray-100 px-1.5 py-0.5 rounded">https://sandbox.evidcheck.com/v1/sandbox/verifications</code>
              </p>
            </div>
          </div>
        </div>

        {/* Test Key Display */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider font-mono">
            Sandbox Test Key (evid_test_sk_*)
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center justify-between p-2.5 bg-gray-50 rounded-md border border-gray-200 font-mono text-xs text-gray-900">
              <span className="truncate">
                {showTestKey ? displayTestKey : "evid_test_sk_••••••••••••••••••••••••"}
              </span>

              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button
                  onClick={() => setShowTestKey(!showTestKey)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md transition-colors"
                  title={showTestKey ? "Hide Key" : "Show Key"}
                >
                  {showTestKey ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button
                  onClick={() => handleCopyKey(displayTestKey, "Sandbox Test")}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md transition-colors"
                  title="Copy Key"
                >
                  {copiedKey === "Sandbox Test" ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}
                </button>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirmModal("test")}
              className="h-9 text-xs font-semibold rounded-md border-gray-300 text-gray-700 hover:bg-gray-50 shrink-0"
            >
              <RefreshCw size={13} className="mr-1.5" /> Roll Key
            </Button>
          </div>
        </div>
      </div>

      {/* Security Info Box */}
      <div className="flex gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-xs">
        <AlertCircle className="shrink-0 text-amber-700" size={18} />
        <div>
          <p className="font-bold mb-1">Environment Isolation Rules</p>
          <ul className="list-disc list-inside space-y-0.5 text-amber-800">
            <li><code className="font-mono">evid_test_sk_*</code> keys only work against the Sandbox endpoint and will not charge real balance.</li>
            <li><code className="font-mono">evid_live_sk_*</code> keys will be rejected by the Sandbox URL with HTTP 403 Forbidden.</li>
            <li>Always store API keys securely in server environment variables (<code className="font-mono">.env</code>).</li>
          </ul>
        </div>
      </div>

      <AlertDialog open={!!showConfirmModal} onOpenChange={() => setShowConfirmModal(null)}>
        <AlertDialogContent className="sm:max-w-sm rounded-lg">
          <AlertDialogHeader className="flex flex-col items-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3 text-red-600">
              <AlertTriangle size={24} />
            </div>
            <AlertDialogTitle className="text-base font-bold">
              Roll {showConfirmModal?.toUpperCase()} API Key?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-xs text-gray-600">
              Your existing {showConfirmModal} API key will be immediately revoked. Any active applications using this key will fail to authenticate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 justify-between mt-4">
            <AlertDialogCancel className="mt-0 flex-1 text-xs rounded-md">Cancel</AlertDialogCancel>
            <Button
              onClick={() => showConfirmModal && confirmGenerateKey(showConfirmModal)}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : "Confirm Roll"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
