"use client";

import {
	Building2,
	Users,
	DollarSign,
	Activity,
	type LucideIcon,
} from "lucide-react";

export interface AdminMetrics {
	totalRevenue: number;
	activeCompanies: number;
	totalUsers: number;
	verificationsToday: number;
}

interface StatDef {
	label: string;
	value: string;
	icon: LucideIcon;
	color: string;
	bg: string;
	trend: string;
	detail: string;
}

export function AdminStatsGrid({ metrics, todayUsers }: { metrics: AdminMetrics; todayUsers: number }) {
	const stats: StatDef[] = [
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
			trend: `+${todayUsers} today`,
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
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{stats.map((stat) => {
				const Icon = stat.icon;
				return (
					<div
						key={stat.label}
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
	);
}
