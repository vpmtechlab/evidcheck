import React, { useState, useContext, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppContext } from "@/components/providers/app-provider";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { getSessionToken } from "@/lib/session-token";
import { Loader2 } from "lucide-react";

export function NotificationSettings() {
  const { member } = useContext(AppContext);
  const preferredSettings = useQuery(api.users.getUserPreferences, 
    member?.id ? { sessionToken: getSessionToken() ?? "", userId: member.id as Id<"users"> } : "skip"
  );
  const updatePreferences = useMutation(api.users.updateNotificationPreferences);

  const [settings, setSettings] = useState({
    emailNews: true,
    emailActivity: true,
    emailLogin: true,
    pushComments: false,
    pushMentions: true,
    smsSecurity: true,
    marketing: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (preferredSettings) {
      setSettings((prev) => ({ ...prev, ...preferredSettings }));
    }
  }, [preferredSettings]);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!member?.id) return;
    setLoading(true);
    try {
      await updatePreferences({
        sessionToken: getSessionToken() ?? "",
        userId: member.id as Id<"users">,
        preferences: settings,
      });
      toast.success("Notification preferences saved!");
    } catch {
      toast.error("Failed to save preferences.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Notification Preferences</h2>
        <p className="text-sm text-gray-500">Choose how you receive updates and alerts.</p>
      </div>

      <div className="grid gap-8">
        {/* Email Group */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Email Notifications
          </h3>
          <div className="space-y-5">
            <div className="flex flex-row items-center justify-between rounded-lg border border-gray-100 shadow-sm p-4 bg-white">
              <div className="space-y-0.5">
                <Label className="text-base font-medium text-gray-900">News & Updates</Label>
                <div className="text-sm text-gray-500">Receive the latest news and feature updates.</div>
              </div>
              <Switch checked={settings.emailNews} onCheckedChange={() => handleToggle("emailNews")} />
            </div>
            <div className="flex flex-row items-center justify-between rounded-lg border border-gray-100 shadow-sm p-4 bg-white">
              <div className="space-y-0.5">
                <Label className="text-base font-medium text-gray-900">Account Activity</Label>
                <div className="text-sm text-gray-500">Get notified about important activity in your account.</div>
              </div>
              <Switch checked={settings.emailActivity} onCheckedChange={() => handleToggle("emailActivity")} />
            </div>
            <div className="flex flex-row items-center justify-between rounded-lg border border-gray-100 shadow-sm p-4 bg-white">
              <div className="space-y-0.5">
                <Label className="text-base font-medium text-gray-900">Login Alerts</Label>
                <div className="text-sm text-gray-500">Receive an email when your account is accessed from a new device.</div>
              </div>
              <Switch checked={settings.emailLogin} onCheckedChange={() => handleToggle("emailLogin")} />
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Push Group */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Push Notifications
          </h3>
          <div className="space-y-5">
            <div className="flex flex-row items-center justify-between rounded-lg border border-gray-100 shadow-sm p-4 bg-white">
              <div className="space-y-0.5">
                <Label className="text-base font-medium text-gray-900">Comments & Mentions</Label>
                <div className="text-sm text-gray-500">Get notified when someone mentions you or comments on your work.</div>
              </div>
              <Switch checked={settings.pushMentions} onCheckedChange={() => handleToggle("pushMentions")} />
            </div>
            <div className="flex flex-row items-center justify-between rounded-lg border border-gray-100 shadow-sm p-4 bg-white">
              <div className="space-y-0.5">
                <Label className="text-base font-medium text-gray-900">System Status</Label>
                <div className="text-sm text-gray-500">Receive alerts about system maintenance and status.</div>
              </div>
              <Switch checked={settings.pushComments} onCheckedChange={() => handleToggle("pushComments")} />
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* SMS Group */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            SMS Notifications
          </h3>
          <div className="space-y-5">
            <div className="flex flex-row items-center justify-between rounded-lg border border-gray-100 shadow-sm p-4 bg-white">
              <div className="space-y-0.5">
                <Label className="text-base font-medium text-gray-900">Security Alerts (Critical)</Label>
                <div className="text-sm text-gray-500">Receive critical security alerts via SMS (e.g. password resets).</div>
              </div>
              <Switch checked={settings.smsSecurity} onCheckedChange={() => handleToggle("smsSecurity")} />
            </div>
            <div className="flex flex-row items-center justify-between rounded-lg border border-gray-100 shadow-sm p-4 bg-white">
              <div className="space-y-0.5">
                <Label className="text-base font-medium text-gray-900">Marketing</Label>
                <div className="text-sm text-gray-500">Allow us to send you marketing offers via SMS.</div>
              </div>
              <Switch checked={settings.marketing} onCheckedChange={() => handleToggle("marketing")} />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={loading}
          className="bg-secondary hover:bg-gray-800 text-white w-full sm:w-auto"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
