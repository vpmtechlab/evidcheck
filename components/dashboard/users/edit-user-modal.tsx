"use client";

import React, { useState } from "react";
import { UserCog, Save } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { User } from "@/types/user";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (user: User) => void;
}

export function EditUserModal({ isOpen, onClose, user, onSave }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "",
    status: user?.status || "",
  });

  const roles = [
    { value: "Admin", label: "Admin" },
    { value: "Compliance Officer", label: "Compliance Officer" },
  ];

  const statuses = [
    { value: "Active", label: "Active" },
    { value: "Disabled", label: "Disabled" },
  ];

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (user) {
      onSave({ ...user, ...formData });
      onClose();
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Edit User</DialogTitle>
          <DialogDescription className="sr-only">Update user information</DialogDescription>
        </DialogHeader>

        {/* Header content */}
        <div className="flex items-center gap-3 mb-6 mt-2">
          <div className="p-2 bg-blue-100 rounded-xl">
            <UserCog className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Edit User</h2>
            <p className="text-sm text-gray-500">Update user information</p>
          </div>
        </div>

        {/* Avatar Preview */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="font-medium text-gray-900">{formData.name || user.name}</p>
            <p className="text-sm text-gray-500">{formData.email || user.email}</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Full Name</Label>
            <Input
              id="edit-name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-email">Email Address</Label>
            <Input
              id="edit-email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-role">Role</Label>
            <Select value={formData.role} onValueChange={(val) => handleChange("role", val || "")}>
              <SelectTrigger id="edit-role" className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select value={formData.status} onValueChange={(val) => handleChange("status", val || "")}>
              <SelectTrigger id="edit-status" className="w-full">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formData.name || !formData.email}
            className="flex-1 bg-primary hover:bg-brand-dark text-white"
          >
            <Save size={18} className="mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
