"use client";

import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	LabelList,
} from "recharts";
import { Building2 } from "lucide-react";

export interface LeaderboardPoint {
	name: string;
	count: number;
	revenue: number;
}

export function ClientLeaderboard({ data }: { data: LeaderboardPoint[] }) {
	return (
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
						data={data}
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
	);
}
