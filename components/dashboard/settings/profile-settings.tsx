"use client";

import React, { useState, useContext, useEffect } from "react";
import { BadgeCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppContext } from "@/components/providers/app-provider";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getSessionToken } from "@/lib/session-token";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export function ProfileSettings() {
  const { member, setMember } = useContext(AppContext);
  const updateProfile = useMutation(api.users.updateUserProfile);
  
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    bio: "",
  });

  // Sync state with member context
  useEffect(() => {
    if (member) {
      setProfileData({
        firstName: member.first_name || "",
        lastName: member.last_name || "",
        email: member.email || "",
        phone: (member.phone as string) || "",
        role: member.role || "Administrator",
        bio: (member.bio as string) || "",
      });
    }
  }, [member]);

  const handleChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!member?.id) return;
    setLoading(true);
    try {
      await updateProfile({
        sessionToken: getSessionToken() ?? "",
        userId: member.id as Id<"users">,
        firstName: profileData.firstName,
        surname: profileData.lastName,
        role: profileData.role,
        phone: profileData.phone,
        bio: profileData.bio,
        performedBy: member.id as Id<"users">,
      });
      
      // Update local context
      setMember({
        ...member,
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        role: profileData.role,
        phone: profileData.phone,
        bio: profileData.bio,
      });

      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">Profile Information</h2>
        <p className="text-sm text-gray-500">Update your photo and personal details here.</p>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
      
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            {profileData.firstName} {profileData.lastName}
            <BadgeCheck size={16} className="text-blue-500" />
          </h3>
          <p className="text-sm text-gray-500">{profileData.role}</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={profileData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={profileData.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={profileData.email}
            disabled
          />
          <p className="text-xs text-gray-500">Contact admin to change your email address.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={profileData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Job Title</Label>
          <Input
            id="role"
            value={profileData.role}
            onChange={(e) => handleChange("role", e.target.value)}
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none resize-none text-sm"
            value={profileData.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            placeholder="Brief description for your profile..."
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-100">
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="bg-secondary hover:bg-gray-800 text-white w-full sm:w-auto"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
