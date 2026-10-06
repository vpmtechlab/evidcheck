"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export interface BillingDayPoint {
	date: string;
	spent: number;
	toppedUp: number;
}

function ChartSkeleton() {
	return (
		<div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
			<div className="animate-pulse flex flex-col items-center gap-2">
				<div className="h-4 w-32 bg-gray-200 rounded" />
				<div className="h-2 w-24 bg-gray-100 rounded" />
			</div>
		</div>
	);
}

export function SpendingTrendsChart({ data }: { data: BillingDayPoint[] | undefined }) {
	return (
		<div className="bg-white p-5 rounded-lg border border-gray-200 shadow-2xs">
			<div className="flex items-center justify-between mb-5 flex-wrap gap-2">
				<div>
					<h3 className="text-sm font-bold text-gray-900 tracking-tight">Spending Trends</h3>
					<p className="text-[11px] text-gray-500">Daily verification costs over the last 30 days</p>
				</div>
				<div className="flex items-center gap-3 text-[11px] font-semibold text-gray-500">
					<span className="flex items-center gap-1.5">
						<span className="w-2.5 h-2.5 rounded-full bg-brand" />
						Spent
					</span>
					<span className="flex items-center gap-1.5">
						<span className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-slate-400" />
						Top-ups
					</span>
				</div>
			</div>

			<div className="h-[240px] w-full">
				{!data ? (
					<ChartSkeleton />
				) : (
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
							<defs>
								<linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#188015" stopOpacity={0.15} />
									<stop offset="95%" stopColor="#188015" stopOpacity={0} />
								</linearGradient>
							</defs>
							<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
							<XAxis
								dataKey="date"
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 10, fill: "#94a3b8" }}
								dy={10}
								interval={data.length ? Math.floor(data.length / 6) : 0}
							/>
							<YAxis
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 10, fill: "#94a3b8" }}
							/>
							<Tooltip
								contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
							/>
							<Area
								type="monotone"
								dataKey="spent"
								stroke="#188015"
								strokeWidth={2}
								fillOpacity={1}
								fill="url(#colorSpent)"
							/>
							<Area
								type="monotone"
								dataKey="toppedUp"
								stroke="#64748b"
								strokeWidth={1.5}
								fill="transparent"
								strokeDasharray="5 5"
							/>
						</AreaChart>
					</ResponsiveContainer>
				)}
			</div>
		</div>
	);
}
