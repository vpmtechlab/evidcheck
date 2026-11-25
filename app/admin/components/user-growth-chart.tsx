"use client";

import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import { Users } from "lucide-react";
import type { TrendPoint } from "./revenue-chart";

export function UserGrowthChart({ data, total }: { data: TrendPoint[]; total: number }) {
	return (
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
					+{total} Total
				</span>
			</div>

			<div className="h-64 w-full pt-2">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart data={data}>
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
							cursor={{ fill: "#f8fafc" }}
							contentStyle={{
								borderRadius: "6px",
								border: "1px solid #e2e8f0",
								backgroundColor: "#ffffff",
								fontSize: "12px",
								boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
							}}
							labelStyle={{ fontWeight: "bold", color: "#0f172a", fontSize: "11px", marginBottom: "2px" }}
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
	);
}
