"use client";

import React from "react";
import { Users, UserCheck, UserPlus, Shield } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useApp } from "@/components/providers/app-provider";
import { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { getSessionToken } from "@/lib/session-token";

export function UserStatsCards() {
  const { member } = useApp();
  const statsData = useQuery(api.users.getUserStats, member?.companyId ? { 
    sessionToken: getSessionToken() ?? "",
    companyId: member.companyId as Id<"companies"> 
  } : "skip");

  if (statsData === undefined) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
        </div>
    );
  }

  const stats = [
    {
      label: "Total Users",
      value: statsData.total,
      change: "+1 new",
      trend: "up" as const,
      icon: Users,
      color: "blue" as const,
    },
    {
      label: "Active Users",
      value: statsData.active,
      change: "Stable",
      trend: "neutral" as const,
      icon: UserCheck,
      color: "green" as const,
    },
    {
      label: "Pending Invites",
      value: statsData.invited,
      change: "Awaiting",
      trend: "neutral" as const,
      icon: UserPlus,
      color: "orange" as const,
    },
    {
      label: "Admin Users",
      value: statsData.admins,
      change: "Privileged",
      trend: "neutral" as const,
      icon: Shield,
      color: "purple" as const,
    },
  ];

  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
      accent: "bg-blue-500",
    },
    green: {
      bg: "bg-green-50",
      icon: "text-green-600",
      accent: "bg-green-500",
    },
    orange: {
      bg: "bg-orange-50",
      icon: "text-orange-600",
      accent: "bg-orange-500",
    },
    purple: {
      bg: "bg-purple-50",
      icon: "text-purple-600",
      accent: "bg-purple-500",
    },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const colors = colorClasses[stat.color];

        return (
          <div
            key={index}
            className="relative overflow-hidden bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
          >
            {/* Accent bar */}
            <div className={`absolute top-0 left-0 w-full h-1 ${colors.accent}`} />

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <span className="text-[10px] text-gray-400 font-medium">{stat.change}</span>
                </div>
              </div>

              {/* Icon */}
              <div className={`p-3 rounded-xl ${colors.bg}`}>
                <Icon size={22} className={colors.icon} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
