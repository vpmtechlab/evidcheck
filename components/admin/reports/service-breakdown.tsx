"use client";

import {
	PieChart,
	Pie,
	Cell,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import { PieChart as PieIcon } from "lucide-react";

export interface ServiceSlice {
	name: string;
	value: number;
}

const COLORS = ["#188015", "#3b82f6", "#6366f1", "#f59e0b", "#ef4444"];

interface ServiceBreakdownProps {
	data: ServiceSlice[];
	total: number;
}

export function ServiceBreakdown({ data, total }: ServiceBreakdownProps) {
	return (
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
							data={data}
							cx="50%"
							cy="50%"
							innerRadius={50}
							outerRadius={70}
							paddingAngle={4}
							dataKey="value"
						>
							{data.map((_entry, index) => (
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
						{total}
					</p>
					<p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight mt-0.5">
						Total
					</p>
				</div>
			</div>
			<div className="grid grid-cols-2 gap-y-1.5 pt-2 border-t border-gray-100">
				{data.map((s, i) => (
					<div key={i} className="flex items-center gap-2 text-xs min-w-0">
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
	);
}
