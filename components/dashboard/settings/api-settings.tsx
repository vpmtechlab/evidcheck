import React, { useState, useContext } from "react";
import {
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Loader2,
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
  const apiKeys = useQuery(api.apiKeys.list, 
    member?.companyId ? { companyId: member.companyId as Id<"companies"> } : "skip"
  );
  const generateApiKey = useMutation(api.apiKeys.generate);

  const [showApiKey, setShowApiKey] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  const activeKey = apiKeys?.[0]; // Support multiple if needed, but UI shows one for now
  const displayKey = newKey || activeKey?.keyHash || "api_live_••••••••••••••••••••••••";

  const handleCopyApiKey = () => {
    if (!displayKey || displayKey.includes("•••")) {
      toast.error("No key available to copy.");
      return;
    }
    navigator.clipboard.writeText(displayKey);
    toast.success("API Key copied to clipboard!");
  };

  const handleRegenerateKey = () => {
    setShowConfirmModal(true);
  };

  const confirmRegenerate = async () => {
    if (!member?.companyId || !member?.id) return;
    setLoading(true);
    try {
      const result = await generateApiKey({
        companyId: member.companyId as Id<"companies">,
        userId: member.id as Id<"users">,
        name: "Standard Access Key",
      });
      setNewKey(result.rawKey);
      setShowApiKey(true);
      toast.success("New API Key generated successfully!");
      setShowConfirmModal(false);
    } catch {
      toast.error("Failed to generate API Key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-gray-900">API Configuration</h2>
        <p className="text-sm text-gray-500">
          Manage your API keys and access tokens for external integrations.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-2xs">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-2 bg-purple-50 rounded-md shrink-0 border border-purple-200">
            <div className="w-6 h-6 rounded-md border border-purple-500 flex items-center justify-center text-xs font-bold text-purple-600 font-mono">
              K
            </div>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Secret Key</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Use this key to authenticate your server-side API requests. Keep
              it secret and never share it in client-side code.
            </p>
          </div>
        </div>

        {/* Key Display */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 flex items-center gap-3 p-3 bg-gray-50 rounded-md border border-gray-200 font-mono text-xs text-gray-700 relative group transition-colors hover:border-gray-300">
            <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
              {showApiKey ? displayKey : "api_live_••••••••••••••••••••••••"}
            </span>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-all"
                title={showApiKey ? "Hide Key" : "Show Key"}
              >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                onClick={handleCopyApiKey}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-all"
                title="Copy Key"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        </div>

        {newKey && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 font-medium">
            IMPORTANT: Copy your new key now. You won&apos;t be able to see it again!
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-xs text-gray-400 font-mono">
            {activeKey ? `Created on ${new Date(activeKey.createdAt).toLocaleDateString()}` : "No active keys"}
          </p>
          <Button
            variant="ghost"
            onClick={handleRegenerateKey}
            disabled={loading}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors w-full sm:w-auto rounded-md border border-red-200 text-xs font-semibold h-8"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            Roll Key
          </Button>
        </div>
      </div>

      {/* Info Box */}
      <div className="flex gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-xs">
        <AlertCircle className="shrink-0 text-amber-700" size={18} />
        <div>
          <p className="font-bold mb-1">Security Best Practices</p>
          <ul className="list-disc list-inside space-y-0.5 text-amber-800">
            <li>Rotate your keys periodically (e.g. every 90 days)</li>
            <li>Review usage logs regularly for suspicious activity</li>
            <li>Immediately roll your key if you suspect it has been compromised</li>
          </ul>
        </div>
      </div>

      <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <AlertDialogContent className="sm:max-w-sm">
          <AlertDialogHeader className="flex flex-col items-center">
            <div className="flex justify-center mb-4 w-full">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
            </div>
            <AlertDialogTitle className="text-xl">Regenerate API Key?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Are you sure you want to regenerate your API key? Your current key
              will be invalidated immediately and any applications using it will
              stop working.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3 justify-between! mt-4">
            <AlertDialogCancel className="mt-0 flex-1">Cancel</AlertDialogCancel>
            <Button
              onClick={confirmRegenerate}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Regenerate
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
