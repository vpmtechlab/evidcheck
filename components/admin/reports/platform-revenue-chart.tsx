"use client";

import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import { DollarSign } from "lucide-react";

export interface RevenueTrendPoint {
	date: string;
	revenue: number;
}

export function PlatformRevenueChart({ data, total }: { data: RevenueTrendPoint[]; total: number }) {
	return (
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
					<span className="text-lg font-bold text-brand font-mono">
						${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
					</span>
					<p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">
						Total Settled
					</p>
				</div>
			</div>

			<div className="h-64 w-full pt-2">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart data={data}>
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
							tickFormatter={(v: number) => `$${v}`}
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
							fillOpacity={1}
							fill="url(#colorRevenue)"
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
