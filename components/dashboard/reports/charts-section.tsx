"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LabelList
} from "recharts";
import { PieChart as PieIcon, BarChart3, TrendingUp, HelpCircle } from "lucide-react";
import { ChartCard } from "./chart-card";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface ChartDataPoint {
  date: string;
  count: number;
}

interface DistributionPoint {
  name: string;
  value: number;
}

interface RejectionPoint {
  reason: string;
  count: number;
  percentage: number;
}

interface ChartsSectionProps {
  analytics: {
    metrics: {
      totalJobs: number;
    };
    volumeData: ChartDataPoint[];
    serviceDistribution: DistributionPoint[];
    topReasons: RejectionPoint[];
  } | undefined;
}

function ChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white rounded-lg border border-gray-200 h-72 animate-pulse lg:col-span-2" />
      <div className="bg-white rounded-lg border border-gray-200 h-64 animate-pulse" />
      <div className="bg-white rounded-lg border border-gray-200 h-64 animate-pulse" />
    </div>
  );
}

export function ChartsSection({ analytics }: ChartsSectionProps) {
  if (analytics === undefined) return <ChartsSkeleton />;

  return (
    <div className="space-y-4">
      <ChartCard
        icon={<TrendingUp size={18} />}
        iconTile="bg-green-50 text-green-700"
        title="Verification Volume Trends"
        description="Daily transaction volume across all services."
        aside={
          <div className="text-right">
             <span className="text-xl font-bold text-brand font-mono">+{Math.round(analytics.metrics.totalJobs / 7)}+</span>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Avg / Day</p>
          </div>
        }
      >
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.volumeData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#188015" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#188015" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                width={30}
              />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#188015"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorCount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          icon={<PieIcon size={18} />}
          iconTile="bg-blue-50 text-blue-700"
          title="Product Distribution"
        >
          <div className="h-60 relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                   <Pie
                      data={analytics.serviceDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                   >
                      {analytics.serviceDistribution.map((_entry: DistributionPoint, index: number) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                   </Pie>
                   <Tooltip />
                </PieChart>
             </ResponsiveContainer>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Usage</p>
                <p className="text-xl font-bold text-gray-900 font-mono leading-none">{analytics.metrics.totalJobs}</p>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-y-2 pt-1 border-t border-gray-100">
             {analytics.serviceDistribution.map((s: DistributionPoint, i: number) => (
                <div key={i} className="flex items-center gap-2 min-w-0">
                   <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                   <span className="text-[11px] font-semibold text-gray-600 truncate">{s.name}</span>
                </div>
             ))}
          </div>
        </ChartCard>

        <ChartCard
          icon={<BarChart3 size={18} />}
          iconTile="bg-red-50 text-red-700"
          title="Compliance Rejections"
        >
          <div className="h-60">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topReasons} layout="vertical" margin={{ left: 20 }}>
                   <XAxis type="number" hide />
                   <YAxis
                      dataKey="reason"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                      width={100}
                   />
                   <Tooltip />
                   <Bar
                      dataKey="count"
                      fill="#ef4444"
                      radius={[0, 6, 6, 0]}
                      barSize={18}
                   >
                      <LabelList dataKey="percentage" position="right" formatter={(v: number) => `${v}%`} style={{ fontSize: '10px', fontWeight: 'bold' }} />
                   </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-gray-400 flex items-center gap-1.5 font-semibold uppercase tracking-wider pt-1 border-t border-gray-100">
             <HelpCircle size={12} />
             Based on failure logs from the past 30 days.
          </p>
        </ChartCard>
      </div>
    </div>
  );
}
