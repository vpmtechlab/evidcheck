"use client";

import React, { useContext } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppContext } from "@/components/providers/app-provider";
import { 
  Building2, 
  Users, 
  DollarSign, 
  Activity,
  ChevronRight,
  TrendingUp,
  ShieldCheck
} from "lucide-react";
import { Loader2 } from "lucide-react";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function SuperAdminDashboard() {
  const { member } = useContext(AppContext);
  const metrics = useQuery(api.admin.getGlobalMetrics);
  const analytics = useQuery(api.admin.getAdminDashboardAnalytics, { days: 30 });

  if (metrics === undefined || analytics === undefined) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#188015]" />
        <p className="text-xs font-semibold text-gray-500 font-mono">
           Loading Super Admin Intelligence...
        </p>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Revenue",
      value: `$${metrics.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-700",
      bg: "bg-green-50",
      trend: "+12.5% MTD",
      detail: "Settled platform revenue",
    },
    {
      label: "Active Companies",
      value: metrics.activeCompanies.toString(),
      icon: Building2,
      color: "text-blue-700",
      bg: "bg-blue-50",
      trend: "+2 this week",
      detail: "Verified enterprise clients",
    },
    {
      label: "Total Users",
      value: metrics.totalUsers.toString(),
      icon: Users,
      color: "text-indigo-700",
      bg: "bg-indigo-50",
      trend: `+${analytics.trendData[analytics.trendData.length - 1]?.userCount || 0} today`,
      detail: "Registered platform users",
    },
    {
      label: "Verifications Today",
      value: metrics.verificationsToday.toString(),
      icon: Activity,
      color: "text-orange-700",
      bg: "bg-orange-50",
      trend: "Live feed",
      detail: "All 4 registries active",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Admin Command Center
            </h1>
            <span className="px-2 py-0.5 bg-[#0e1b42] text-white text-[10px] font-bold uppercase tracking-wider rounded-md">
              Super Admin
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Welcome back, {member?.first_name || "Admin"}. Real-time monitoring of all tenants, billing, and verification pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-md self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
          <span>All Production Registries Connected</span>
        </div>
      </div>

      {/* Row 1: High-Density Structured 4-Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={i} 
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-md ${stat.bg} ${stat.color}`}>
                    <Icon size={16} />
                  </div>
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-sm">
                  {stat.trend}
                </span>
              </div>

              <div className="pt-1 border-t border-gray-100">
                <div className="text-2xl font-bold text-gray-900 font-mono tracking-tight">
                  {stat.value}
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {stat.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Analytics */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-md">
                <DollarSign size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Revenue Analytics</h3>
                <p className="text-[11px] text-gray-500">Past 30 Days Cumulative Revenue</p>
              </div>
            </div>
            <span className="text-sm font-bold text-[#188015] font-mono">
              ${metrics.totalRevenue.toFixed(2)}
            </span>
          </div>
          
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.trendData}>
                <defs>
                  <linearGradient id="colorRevDashboard" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#188015" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#188015" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '6px', 
                    border: '1px solid #e2e8f0', 
                    backgroundColor: '#ffffff',
                    fontSize: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a', fontSize: '11px', marginBottom: '2px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#188015" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorRevDashboard)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Growth */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-700 rounded-md">
                <Users size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">User Acquisition</h3>
                <p className="text-[11px] text-gray-500">Daily New Verified Registrations</p>
              </div>
            </div>
            <span className="text-sm font-bold text-indigo-700 font-mono">
              +{metrics.totalUsers} Total
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: "#64748b" }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '6px', 
                    border: '1px solid #e2e8f0', 
                    backgroundColor: '#ffffff',
                    fontSize: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a', fontSize: '11px', marginBottom: '2px' }}
                />
                <Bar 
                  dataKey="userCount" 
                  fill="#4f46e5" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
