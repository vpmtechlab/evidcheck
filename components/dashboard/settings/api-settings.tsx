"use client";

import React, { useState, useContext } from "react";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppContext } from "@/components/providers/app-provider";
import { Id } from "@/convex/_generated/dataModel";
import { getSessionToken } from "@/lib/session-token";
import { ApiKeyCard, type ApiKeyMode } from "./api-key-card";
import { RollKeyDialog } from "./roll-key-dialog";

export function ApiSettings() {
  const { member } = useContext(AppContext);
  const apiKeys = useQuery(
    api.apiKeys.list,
    member?.companyId ? { sessionToken: getSessionToken() ?? "", companyId: member.companyId as Id<"companies"> } : "skip"
  );
  const generateApiKey = useMutation(api.apiKeys.generate);

  const [showLiveKey, setShowLiveKey] = useState(false);
  const [showTestKey, setShowTestKey] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<ApiKeyMode | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [newLiveKey, setNewLiveKey] = useState<string | null>(null);
  const [newTestKey, setNewTestKey] = useState<string | null>(null);

  const liveKeyObj = apiKeys?.find((k) => k.mode === "live");
  const testKeyObj = apiKeys?.find((k) => k.mode === "test");

  // Full key material is only available immediately after generation; after
  // that we can only show a non-sensitive prefix.
  const displayLiveKey = newLiveKey || liveKeyObj?.keyPrefix || null;
  const displayTestKey = newTestKey || testKeyObj?.keyPrefix || null;

  const handleCopyKey = (keyString: string, type: string) => {
    navigator.clipboard.writeText(keyString);
    setCopiedKey(type);
    toast.success(`${type} API Key copied to clipboard!`);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const confirmGenerateKey = async (mode: ApiKeyMode) => {
    if (!member?.companyId || !member?.id) return;
    setLoading(true);
    try {
      const result = await generateApiKey({
        sessionToken: getSessionToken() ?? "",
        companyId: member.companyId as Id<"companies">,
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
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">
          API Environments & Access Credentials
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          EvidCheck enforces strict separation between Production and Sandbox test environments.
        </p>
      </div>

      <ApiKeyCard
        mode="live"
        displayKey={displayLiveKey}
        visible={showLiveKey}
        copied={copiedKey === "Production Live"}
        onToggleVisibility={() => setShowLiveKey(!showLiveKey)}
        onCopy={() => displayLiveKey && handleCopyKey(displayLiveKey, "Production Live")}
        onRoll={() => setShowConfirmModal("live")}
      />

      <ApiKeyCard
        mode="test"
        displayKey={displayTestKey}
        visible={showTestKey}
        copied={copiedKey === "Sandbox Test"}
        onToggleVisibility={() => setShowTestKey(!showTestKey)}
        onCopy={() => displayTestKey && handleCopyKey(displayTestKey, "Sandbox Test")}
        onRoll={() => setShowConfirmModal("test")}
      />

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

      <RollKeyDialog
        mode={showConfirmModal}
        loading={loading}
        onClose={() => setShowConfirmModal(null)}
        onConfirm={confirmGenerateKey}
      />
    </div>
  );
}
