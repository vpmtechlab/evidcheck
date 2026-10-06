"use client";

import React from "react";
import { PlatformRevenueChart } from "./platform-revenue-chart";
import { ClientLeaderboard, type LeaderboardPoint } from "./client-leaderboard";
import { ServiceBreakdown, type ServiceSlice } from "./service-breakdown";

interface AdminChartsSectionProps {
	analytics:
		| {
				metrics: {
					totalVerifications: number;
					totalRevenue: number;
				};
				trendData: { date: string; count: number; revenue: number }[];
				leaderboard: LeaderboardPoint[];
				serviceDistribution: ServiceSlice[];
		  }
		| undefined;
}

function ChartsSkeleton() {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[300px]">
			<div className="bg-white rounded-lg border border-gray-200 shadow-2xs animate-pulse" />
			<div className="bg-white rounded-lg border border-gray-200 shadow-2xs animate-pulse" />
		</div>
	);
}

export function AdminChartsSection({ analytics }: AdminChartsSectionProps) {
	if (analytics === undefined) return <ChartsSkeleton />;

	return (
		<div className="space-y-6">
			<PlatformRevenueChart
				data={analytics.trendData}
				total={analytics.metrics.totalRevenue}
			/>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<ClientLeaderboard data={analytics.leaderboard} />
				<ServiceBreakdown
					data={analytics.serviceDistribution}
					total={analytics.metrics.totalVerifications}
				/>
			</div>
		</div>
	);
}
