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
	LabelList,
} from "recharts";
import { PieChart as PieIcon, Building2, DollarSign } from "lucide-react";

interface TrendPoint {
	date: string;
	count: number;
	revenue: number;
}

interface LeaderboardPoint {
	name: string;
	count: number;
	revenue: number;
}

interface DistributionPoint {
	name: string;
	value: number;
}

interface AdminChartsSectionProps {
	analytics:
		| {
				metrics: {
					totalVerifications: number;
					totalRevenue: number;
				};
				trendData: TrendPoint[];
				leaderboard: LeaderboardPoint[];
				serviceDistribution: DistributionPoint[];
		  }
		| undefined;
}

const COLORS = ["#188015", "#3b82f6", "#6366f1", "#f59e0b", "#ef4444"];

export function AdminChartsSection({ analytics }: AdminChartsSectionProps) {
	const isLoading = analytics === undefined;

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[300px]">
				<div className="bg-white rounded-lg border border-gray-200 shadow-2xs animate-pulse" />
				<div className="bg-white rounded-lg border border-gray-200 shadow-2xs animate-pulse" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* 1. Global Platform Revenue Trends */}
			<div className="bg-white p-5 rounded-lg border border-gray-200 shadow-2xs space-y-4">
				<div className="flex items-center justify-between pb-3 border-b border-gray-100">
					<div className="flex items-center gap-2.5">
						<div className="p-2 bg-emerald-50 text-emerald-700 rounded-md">
							<DollarSign size={18} />
						</div>
						<div>
							<h3 className="text-sm font-bold text-gray-900">
								Platform Revenue Trends
							</h3>
							<p className="text-[11px] text-gray-500">
								Global income performance over the selected period.
							</p>
						</div>
					</div>
					<div className="text-right">
						<span className="text-lg font-bold text-[#188015] font-mono">
							${analytics.metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
						</span>
						<p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">
							Total Settled
						</p>
					</div>
				</div>

				<div className="h-64 w-full pt-2">
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart data={analytics.trendData}>
							<defs>
								<linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#188015" stopOpacity={0.25} />
									<stop offset="95%" stopColor="#188015" stopOpacity={0.0} />
								</linearGradient>
							</defs>
							<CartesianGrid
								strokeDasharray="3 3"
								vertical={false}
								stroke="#f1f5f9"
							/>
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
								width={45}
								tickFormatter={(v) => `$${v}`}
							/>
							<Tooltip
								contentStyle={{
									borderRadius: "6px",
									border: "1px solid #e2e8f0",
									backgroundColor: "#ffffff",
									fontSize: "12px",
									boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
								}}
							/>
							<Area
								type="monotone"
								dataKey="revenue"
								stroke="#188015"
								strokeWidth={2.5}
								fill="url(#colorRevenue)"
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* 2. Client Performance Leaderboard */}
				<div className="bg-white p-5 rounded-lg border border-gray-200 shadow-2xs space-y-4">
					<div className="flex items-center justify-between pb-3 border-b border-gray-100">
						<div className="flex items-center gap-2.5">
							<div className="p-2 bg-blue-50 text-blue-700 rounded-md">
								<Building2 size={18} />
							</div>
							<div>
								<h3 className="text-sm font-bold text-gray-900">Client Volume Leaderboard</h3>
								<p className="text-[11px] text-gray-500">
									Top 5 Organizations by Check Count
								</p>
							</div>
						</div>
					</div>
					<div className="h-56">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart
								data={analytics.leaderboard}
								layout="vertical"
								margin={{ left: 10, right: 30 }}
							>
								<XAxis type="number" hide />
								<YAxis
									dataKey="name"
									type="category"
									axisLine={false}
									tickLine={false}
									tick={{ fontSize: 11, fill: "#334155", fontWeight: 600 }}
									width={110}
								/>
								<Tooltip 
									contentStyle={{
										borderRadius: "6px",
										border: "1px solid #e2e8f0",
										backgroundColor: "#ffffff",
										fontSize: "12px",
									}}
								/>
								<Bar
									dataKey="count"
									fill="#3b82f6"
									radius={[0, 4, 4, 0]}
									barSize={16}
								>
									<LabelList
										dataKey="count"
										position="right"
										style={{ fontSize: "11px", fontWeight: "bold", fill: "#0f172a" }}
									/>
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* 3. Global Service Distribution */}
				<div className="bg-white p-5 rounded-lg border border-gray-200 shadow-2xs space-y-4">
					<div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
						<div className="p-2 bg-indigo-50 text-indigo-700 rounded-md">
							<PieIcon size={18} />
						</div>
						<div>
							<h3 className="text-sm font-bold text-gray-900">Service Breakdown</h3>
							<p className="text-[11px] text-gray-500">
								Distribution across 4 verification types
							</p>
						</div>
					</div>
					<div className="h-44 relative">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={analytics.serviceDistribution}
									cx="50%"
									cy="50%"
									innerRadius={50}
									outerRadius={70}
									paddingAngle={4}
									dataKey="value"
								>
									{analytics.serviceDistribution.map((_entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={COLORS[index % COLORS.length]}
										/>
									))}
								</Pie>
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
						<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
							<p className="text-lg font-bold text-gray-900 font-mono leading-none">
								{analytics.metrics.totalVerifications}
							</p>
							<p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight mt-0.5">
								Total
							</p>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-y-1.5 pt-2 border-t border-gray-100">
						{analytics.serviceDistribution.map((s, i) => (
							<div key={i} className="flex items-center gap-2 text-xs">
								<div
									className="w-2 h-2 rounded-full shrink-0"
									style={{ backgroundColor: COLORS[i % COLORS.length] }}
								/>
								<span className="text-[11px] font-medium text-gray-700 truncate">
									{s.name}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
