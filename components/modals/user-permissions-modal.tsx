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
import { Loader2, UserCog, ShieldAlert } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { User } from "@/types/user";

interface UserPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
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

export function UserPermissionsModal({ isOpen, onClose, user }: UserPermissionsModalProps) {
  const companyId = user?.companyId as Id<"companies">;
  
  // Get base role permissions
  const rolePermissions = useQuery(
    api.permissions.getRolePermissions,
    companyId && user?.role && isOpen ? { companyId, role: user.role } : "skip"
  );

  // Get user specific custom permissions
  const queryCustomPermissions = useQuery(
    api.permissions.getUserCustomPermissions,
    user?.id && isOpen ? { userId: user.id as Id<"users"> } : "skip"
  );

  const updateUserCustomPermissions = useMutation(api.permissions.updateUserCustomPermissions);

  const [localPermissions, setLocalPermissions] = useState<string[]>([]);
  const [useCustom, setUseCustom] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user && isOpen && rolePermissions !== undefined && queryCustomPermissions !== undefined) {
      if (queryCustomPermissions !== null) {
        setUseCustom(true);
        setLocalPermissions(queryCustomPermissions);
      } else {
        setUseCustom(false);
        setLocalPermissions(rolePermissions);
      }
    }
  }, [user, isOpen, rolePermissions, queryCustomPermissions]);

  const handleToggle = (perm: string) => {
    if (!useCustom) return; // Cannot edit if not using custom overrrides
    setLocalPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleToggleCustom = (checked: boolean) => {
    setUseCustom(checked);
    if (checked) {
      // Initialize with the role's base permissions
      setLocalPermissions(rolePermissions || []);
    } else {
      // Revert to displaying base permissions (saving will clear custom overrides)
      setLocalPermissions(rolePermissions || []);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      await updateUserCustomPermissions({
        userId: user.id as Id<"users">,
        customPermissions: useCustom ? localPermissions : undefined,
      });
      toast.success(`Permissions for ${user.name} updated successfully.`);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update user permissions.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSaving && onClose()}>
      <DialogContent className="!flex max-h-[calc(100dvh-2rem)] !gap-0 !overflow-hidden !p-0 sm:max-w-[550px]">
        <DialogHeader className="shrink-0 px-4 pt-5 sm:px-6">
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-[#023e4a]" />
            User Permissions
          </DialogTitle>
          <DialogDescription>
            Manage specific access for <strong>{user.name}</strong> ({user.role}).
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {rolePermissions === undefined || queryCustomPermissions === undefined ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-teal-50 border border-teal-100 rounded-xl">
              <Checkbox
                id="use-custom"
                checked={useCustom}
                onCheckedChange={handleToggleCustom}
                className="data-[state=checked]:bg-[#023e4a] border-[#023e4a]"
              />
              <div className="grid gap-1 leading-none" onClick={() => handleToggleCustom(!useCustom)}>
                <label htmlFor="use-custom" className="text-sm font-bold text-[#023e4a] cursor-pointer cursor-allowed">
                  Enable Custom Permissions Override
                </label>
                <p className="text-xs text-teal-800">
                  If unchecked, the user will inherit the default permissions for their <span className="font-semibold">{user.role}</span> role.
                </p>
              </div>
            </div>

            <div className={`grid max-h-[300px] gap-3 overflow-y-auto overscroll-contain pr-2 ${!useCustom ? 'opacity-50 pointer-events-none grayscale-[0.5]' : ''}`}>
              <div className="text-xs font-semibold uppercase text-gray-500 mb-1 ml-1 tracking-wider">
                {useCustom ? "Select custom permissions:" : `Inheriting from ${user.role} role:`}
              </div>
              {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                <div
                  key={key}
                  className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Checkbox
                    id={`user-perm-${key}`}
                    checked={localPermissions.includes(key)}
                    onCheckedChange={() => handleToggle(key)}
                    disabled={!useCustom}
                    className="mt-1 border-gray-300 data-[state=checked]:bg-[#023e4a]"
                  />
                  <div className="grid gap-1.5 leading-none cursor-pointer" onClick={() => handleToggle(key)}>
                    <label
                      htmlFor={`user-perm-${key}`}
                      className={`text-sm font-semibold cursor-pointer ${!useCustom ? "cursor-default" : ""}`}
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
            
            {!useCustom && rolePermissions && rolePermissions.length === 0 && (
              <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-3 rounded-lg text-xs font-medium">
                <ShieldAlert size={16} />
                This role currently has no permissions assigned by default.
              </div>
            )}
            </div>
          )}
        </div>

        <DialogFooter className="mx-0 mb-0 mt-0 shrink-0 rounded-b-xl bg-muted/50 px-4 py-4 sm:px-6">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-[#023e4a] hover:bg-[#034e5d] text-white">
            {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Permissions"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
