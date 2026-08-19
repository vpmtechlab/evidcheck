"use client";

// Route-level analytics implementation.

import React from "react";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { TrendChart } from "@/components/dashboard/analytics/trend-chart";
import { StatusChart } from "@/components/dashboard/analytics/status-chart";
import { StatsCards } from "@/components/dashboard/analytics/stats-cards";
import { WeeklyComparisonChart } from "@/components/dashboard/analytics/weekly-comparison-chart";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useApp } from "@/components/providers/app-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { Id } from "@/convex/_generated/dataModel";

export default function AnalyticsPage() {
  const { member } = useApp();
  
  const analytics = useQuery(api.analytics.getDashboardAnalytics, member?.companyId ? { 
    companyId: member.companyId as Id<"companies"> 
  } : "skip");

  const handleExport = (type: string) => {
    toast.success(`Exporting Analytics as ${type}...`);
  };

  if (analytics === undefined) {
    return (
      <div className="flex flex-col gap-6 p-5">
        <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-48" />
            <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-[350px]" />
                <Skeleton className="h-[350px]" />
            </div>
            <Skeleton className="h-[600px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">
            Insights into your verification performance and usage.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => handleExport("CSV")}
            className="flex items-center gap-2 bg-white text-gray-700 rounded-xl"
          >
            <FileText size={16} />
            Export CSV
          </Button>
          <Button
            onClick={() => handleExport("PDF")}
            className="flex items-center gap-2 bg-black text-white hover:bg-gray-800 rounded-xl"
          >
            <Download size={16} />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Stats Cards */}
        <StatsCards data={analytics.stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            <TrendChart data={analytics.trendData} />
            <WeeklyComparisonChart data={analytics.comparisonData} />
          </div>

          {/* Side Column */}
          <div className="lg:col-span-1">
            <StatusChart data={analytics.statusData} />
          </div>
        </div>
      </div>
    </div>
  );
}
