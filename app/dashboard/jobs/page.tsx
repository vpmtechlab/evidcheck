"use client";

import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "convex/react";
import type { DateRange } from "react-day-picker";
import { api } from "@/convex/_generated/api";
import { useApp } from "@/components/providers/app-provider";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { JobStatsCards } from "@/components/dashboard/jobs/job-stats-cards";
import { JobTableToolbar, JobFilterState } from "./components/job-table-toolbar";
import { JobTable } from "./components/job-table";

const DEFAULT_FILTERS: JobFilterState = {
	search: "",
	sources: [],
	serviceTypes: [],
	statuses: [],
	dateRange: undefined,
};

export default function JobListPage() {
	const { member } = useApp();
	const [currentPage, setCurrentPage] = useState(1);
	const [filters, setFilters] = useState<JobFilterState>(DEFAULT_FILTERS);

	// Compute date boundaries from the DateRange picker
	const startDate = filters.dateRange?.from
		? new Date(filters.dateRange.from.getFullYear(), filters.dateRange.from.getMonth(), filters.dateRange.from.getDate(), 0, 0, 0, 0).getTime()
		: undefined;

	const endDate = filters.dateRange?.to
		? new Date(filters.dateRange.to.getFullYear(), filters.dateRange.to.getMonth(), filters.dateRange.to.getDate(), 23, 59, 59, 999).getTime()
		: filters.dateRange?.from
			? new Date(filters.dateRange.from.getFullYear(), filters.dateRange.from.getMonth(), filters.dateRange.from.getDate(), 23, 59, 59, 999).getTime()
			: undefined;

	// Fetch backend-filtered verification jobs from Convex
	const jobs = useQuery(
		api.verifications.getVerificationsByCompany,
		member?.companyId
			? {
					companyId: member.companyId as Id<"companies">,
					source: filters.sources.length > 0 ? filters.sources : undefined,
					status: filters.statuses.length > 0 ? filters.statuses : undefined,
					serviceType: filters.serviceTypes.length > 0 ? filters.serviceTypes : undefined,
					startDate,
					endDate,
					search: filters.search.trim() !== "" ? filters.search.trim() : undefined,
				}
			: "skip"
	);

	const stats = useQuery(
		api.verifications.getJobStats,
		member?.companyId ? { companyId: member.companyId as Id<"companies"> } : "skip"
	);

	const handleFilterChange = <K extends keyof JobFilterState>(key: K, value: JobFilterState[K]) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
		setCurrentPage(1);
	};

	const handleResetFilters = () => {
		setFilters(DEFAULT_FILTERS);
		setCurrentPage(1);
	};

	const handleExportCSV = () => {
		if (!jobs || jobs.length === 0) {
			toast.error("No verification jobs available to export.");
			return;
		}

		const headers = ["Job ID", "Service Name", "Service Slug", "Source", "Status", "Date & Time", "Message"];
		const rows = jobs.map((j) => [
			j._id,
			j.serviceName || "",
			j.serviceType || "",
			j.source || "web",
			j.resultStatus || "",
			new Date(j.createdAt).toISOString(),
			`"${(j.message || "").replace(/"/g, '""')}"`,
		]);

		const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", `evidcheck_jobs_${Date.now()}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		toast.success(`Exported ${jobs.length} jobs to CSV.`);
	};

	return (
		<div className="flex flex-col gap-6 p-2">
			{/* Page Header */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
						Verification Jobs & Audit Logs
					</h1>
					<p className="text-xs text-gray-500 mt-0.5">
						Real-time query records, status tracking, and authority response logs.
					</p>
				</div>
				<Button
					onClick={handleExportCSV}
					disabled={!jobs || jobs.length === 0}
					className="h-9 text-xs font-semibold bg-[#188015] hover:bg-[#136610] text-white px-3.5 rounded-md gap-1.5 shadow-2xs disabled:opacity-50"
				>
					<Download size={14} />
					<span>Export CSV</span>
				</Button>
			</div>

			{/* Top Summary Stats */}
			<JobStatsCards stats={stats} />

			{/* Filter Toolbar + Table Container */}
			<div>
				<JobTableToolbar
					filters={filters}
					onFilterChange={handleFilterChange}
					onResetFilters={handleResetFilters}
				/>
				{jobs === undefined ? (
					<div className="flex flex-col items-center justify-center h-64 bg-white border border-gray-200 border-t-0 rounded-b-xl">
						<Loader2 className="w-6 h-6 animate-spin text-[#188015] mb-2" />
						<p className="text-xs text-gray-500 font-medium">Loading verification jobs…</p>
					</div>
				) : (
					<JobTable
						jobs={jobs}
						currentPage={currentPage}
						itemsPerPage={10}
						onPageChange={(page) => setCurrentPage(page)}
					/>
				)}
			</div>
		</div>
	);
}
