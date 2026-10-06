"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ShieldAlert } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useApp } from "@/components/providers/app-provider";
import { Id } from "@/convex/_generated/dataModel";

interface RolePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PERMISSION_LABELS: Record<string, string> = {
  view_users: "View Users & Team",
  manage_users: "Manage Users (Invite, Edit, Delete)",
  run_verifications: "Run New Verifications",
  view_history: "View Verification History",
  view_billing: "View Wallet & Billing Info",
  manage_billing: "Manage Billing (Top Up Wallet)",
  manage_settings: "Manage Company Settings & API Keys",
};

export function RolePermissionsModal({ isOpen, onClose }: RolePermissionsModalProps) {
  const { member } = useApp();
  const [selectedRole, setSelectedRole] = useState<"Admin" | "Compliance Officer">("Admin");
  
  const companyId = member?.companyId as Id<"companies">;

  const rolePermissions = useQuery(
    api.permissions.getRolePermissions,
    companyId && isOpen ? { companyId, role: selectedRole } : "skip"
  );

  const updateRolePermissions = useMutation(api.permissions.updateRolePermissions);

  const [localPermissions, setLocalPermissions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (rolePermissions) {
      setLocalPermissions(rolePermissions);
    }
  }, [rolePermissions, selectedRole]);

  const handleToggle = (perm: string) => {
    setLocalPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSave = async () => {
    if (!companyId) return;
    setIsSaving(true);
    try {
      await updateRolePermissions({
        companyId,
        role: selectedRole,
        permissions: localPermissions,
      });
      toast.success(`Permissions for ${selectedRole} updated successfully.`);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update permissions.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSaving && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-brand" />
            Role Permissions
          </DialogTitle>
          <DialogDescription>
            Configure default access levels for each company role.
          </DialogDescription>
        </DialogHeader>

        <div className="flex bg-gray-100 rounded-lg p-1 my-4">
          <button
            onClick={() => setSelectedRole("Admin")}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
              selectedRole === "Admin" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => setSelectedRole("Compliance Officer")}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
              selectedRole === "Compliance Officer" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
            }`}
          >
            Compliance Officer
          </button>
        </div>

        {rolePermissions === undefined ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2">
            {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
              <div
                key={key}
                className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <Checkbox
                  id={`perm-${key}`}
                  checked={localPermissions.includes(key)}
                  onCheckedChange={() => handleToggle(key)}
                  className="mt-1 border-gray-300 data-[state=checked]:bg-brand"
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor={`perm-${key}`}
                    className="text-sm font-semibold text-gray-900 cursor-pointer"
                  >
                    {label}
                  </label>
                  <p className="text-xs text-gray-500 font-medium">
                    {key}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-brand hover:bg-brand-dark text-white">
            {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Permissions"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
