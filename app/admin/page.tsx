"use client";

import React, { useContext } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppContext } from "@/components/providers/app-provider";
import { Loader2 } from "lucide-react";
import { AdminHeader } from "./components/admin-header";
import { AdminStatsGrid } from "./components/admin-stats-grid";
import { RevenueChart } from "./components/revenue-chart";
import { UserGrowthChart } from "./components/user-growth-chart";
import { getSessionToken } from "@/lib/session-token";

export default function SuperAdminDashboard() {
  const { member } = useContext(AppContext);
  const metrics = useQuery(api.admin.getGlobalMetrics, { sessionToken: getSessionToken() ?? "" });
  const analytics = useQuery(api.admin.getAdminDashboardAnalytics, { sessionToken: getSessionToken() ?? "", days: 30 });

  if (metrics === undefined || analytics === undefined) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
        <p className="text-xs font-semibold text-gray-500 font-mono">
           Loading Super Admin Intelligence...
        </p>
      </div>
    );
  }

  const todayUsers = analytics.trendData[analytics.trendData.length - 1]?.userCount || 0;

  return (
    <div className="space-y-6">
      <AdminHeader firstName={member?.first_name || "Admin"} />

      <AdminStatsGrid metrics={metrics} todayUsers={todayUsers} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={analytics.trendData} total={metrics.totalRevenue} />
        <UserGrowthChart data={analytics.trendData} total={metrics.totalUsers} />
      </div>
    </div>
  );
}
