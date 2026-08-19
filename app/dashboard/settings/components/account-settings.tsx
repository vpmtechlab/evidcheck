"use client";

import { useState } from "react";
import { Bell, CreditCard, Key, Lock, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProfileSettings } from "@/components/dashboard/settings/profile-settings";
import { SecuritySettings } from "@/components/dashboard/settings/security-settings";
import { NotificationSettings } from "@/components/dashboard/settings/notification-settings";
import { ApiSettings } from "@/components/dashboard/settings/api-settings";
import { BillingSettings } from "@/components/dashboard/settings/billing-settings";

const settingsTabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "api", label: "API Keys", icon: Key },
  { id: "billing", label: "Billing", icon: CreditCard },
] as const;

type SettingsTab = (typeof settingsTabs)[number]["id"];

export function AccountSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const handleTabChange = (value: string | null) => {
    if (settingsTabs.some((tab) => tab.id === value)) {
      setActiveTab(value as SettingsTab);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6 p-2 lg:w-4/5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Account Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your profile, security, and preferences.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full gap-4"
      >
        <div className="hidden sm:block">
          <TabsList className="h-auto w-full grid-cols-5 gap-1 rounded-xl bg-gray-100 py-5">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;

              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="h-9 w-full rounded-lg px-2 text-sm text-gray-500 cursor-pointer hover:text-gray-900 data-active:border-gray-200 data-active:bg-white data-active:text-[#0e1b42] data-active:shadow-sm"
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <div className="sm:hidden">
          <Select value={activeTab} onValueChange={handleTabChange}>
            <SelectTrigger className="h-11 border-gray-200 bg-white text-sm font-semibold text-gray-900 shadow-sm focus-visible:border-[#188015] focus-visible:ring-[#188015]/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-gray-200 bg-white">
              {settingsTabs.map((tab) => {
                const Icon = tab.icon;

                return (
                  <SelectItem
                    key={tab.id}
                    value={tab.id}
                    className="py-2 text-sm"
                  >
                    <Icon size={16} className="text-gray-500" />
                    {tab.label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="min-h-[500px] rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <TabsContent value="profile" className="mt-0">
            <ProfileSettings />
          </TabsContent>
          <TabsContent value="security" className="mt-0">
            <SecuritySettings />
          </TabsContent>
          <TabsContent value="notifications" className="mt-0">
            <NotificationSettings />
          </TabsContent>
          <TabsContent value="api" className="mt-0">
            <ApiSettings />
          </TabsContent>
          <TabsContent value="billing" className="mt-0">
            <BillingSettings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
