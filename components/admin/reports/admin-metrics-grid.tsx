"use client";

import React from "react";
import { TrendingUp, Users, FileText, DollarSign, Globe } from "lucide-react";

interface AdminMetricsGridProps {
  analytics: {
    metrics: {
      totalRevenue: number;
      totalVerifications: number;
      activeCompanies: number;
      successRate: number;
    };
  } | undefined;
}

export function AdminMetricsGrid({ analytics }: AdminMetricsGridProps) {
  const isLoading = analytics === undefined;
  
  const stats = [
    {
      label: "Platform Revenue",
      value: isLoading ? "--" : `$${analytics.metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      trend: "Total Fees Collected",
      icon: <DollarSign className="text-green-700" size={16} />,
      color: "text-green-700",
      bgColor: "bg-green-50",
    },
    {
      label: "Total Verifications",
      value: isLoading ? "--" : analytics.metrics.totalVerifications.toLocaleString(),
      trend: "Global Transactions",
      icon: <FileText className="text-blue-700" size={16} />,
      color: "text-blue-700",
      bgColor: "bg-blue-50"
    },
    {
      label: "Active Clients",
      value: isLoading ? "--" : analytics.metrics.activeCompanies.toLocaleString(),
      trend: "Companies On-boarded",
      icon: <Users className="text-indigo-700" size={16} />,
      color: "text-indigo-700",
      bgColor: "bg-indigo-50"
    },
    {
      label: "System Success",
      value: isLoading ? "--" : `${analytics.metrics.successRate}%`,
      trend: "Cross-Platform Avg",
      icon: <Globe className="text-teal-700" size={16} />,
      color: "text-teal-700",
      bgColor: "bg-teal-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div 
          key={i} 
          className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs space-y-3"
        >
          <div className="flex items-center justify-between">
             <div className={`p-2 ${stat.bgColor} ${stat.color} rounded-md`}>
                {stat.icon}
             </div>
             <span className="text-[10px] font-mono font-bold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                <TrendingUp size={11} /> Active
             </span>
          </div>
          
          <div className="pt-1 border-t border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 font-mono tracking-tight tabular-nums truncate">
              {stat.value}
            </h3>
            <p className="text-xs font-bold text-gray-700 mt-0.5">{stat.label}</p>
            <p className="text-[11px] text-gray-500">
               {stat.trend}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
