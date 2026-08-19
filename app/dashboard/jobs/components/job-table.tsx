"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Doc } from "@/convex/_generated/dataModel";

interface JobTableProps {
	jobs: Array<Doc<"jobs"> & { serviceName?: string }>;
	currentPage: number;
	itemsPerPage: number;
	onPageChange: (page: number) => void;
}

export function JobTable({ jobs, currentPage, itemsPerPage, onPageChange }: JobTableProps) {
	const router = useRouter();

	const totalPages = Math.ceil(jobs.length / itemsPerPage);
	const paginatedJobs = jobs.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	const handleRowClick = (jobId: string) => {
		router.push(`/dashboard/jobs/view/${jobId}`);
	};

	const formatDateTime = (ts: number) => {
		const d = new Date(ts);
		const dateStr = d.toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});
		const timeStr = d.toLocaleTimeString("en-GB", {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});
		return `${dateStr}, ${timeStr}`;
	};

	const getResultBadgeColor = (result: string) => {
		switch (result) {
			case "approved":
				return "bg-emerald-50 text-emerald-800 border-emerald-300";
			case "pending":
			case "running":
				return "bg-amber-50 text-amber-800 border-amber-300";
			case "cancelled":
				return "bg-gray-100 text-gray-700 border-gray-300";
			case "failed":
			default:
				return "bg-rose-50 text-rose-800 border-rose-300";
		}
	};

	const getSourceBadge = (source?: string) => {
		switch (source) {
			case "rest_api":
				return { label: "REST API", bg: "bg-purple-50 text-purple-700 border-purple-200" };
			case "sandbox":
				return { label: "SANDBOX", bg: "bg-blue-50 text-blue-700 border-blue-200" };
			default:
				return { label: "WEB UI", bg: "bg-gray-100 text-gray-700 border-gray-200" };
		}
	};

	return (
		<div className="bg-white border border-gray-200 border-t-0 text-sm rounded-b-xl overflow-hidden shadow-xs">
			<div className="overflow-x-auto">
				<Table>
					<TableHeader className="bg-gray-50/80 border-b border-gray-200">
						<TableRow>
							<TableHead className="font-bold text-gray-700">Job ID</TableHead>
							<TableHead className="font-bold text-gray-700">Service</TableHead>
							<TableHead className="font-bold text-gray-700">Source</TableHead>
							<TableHead className="font-bold text-gray-700">Date & Time</TableHead>
							<TableHead className="font-bold text-gray-700">Product Slug</TableHead>
							<TableHead className="font-bold text-gray-700">Country</TableHead>
							<TableHead className="font-bold text-gray-700">Status</TableHead>
							<TableHead className="font-bold text-gray-700">Summary Message</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{paginatedJobs.length > 0 ? (
							paginatedJobs.map((row) => {
								const entity = (row.entityData as Record<string, unknown>) || {};
								const sourceBadge = getSourceBadge(row.source);

								return (
									<TableRow
										key={row._id}
										onClick={() => handleRowClick(row._id)}
										className="cursor-pointer hover:bg-gray-50/80 transition-colors"
									>
										<TableCell className="font-mono text-xs font-bold text-gray-900">
											{row._id.substring(0, 12)}…
										</TableCell>
										<TableCell className="font-semibold text-gray-900">
											{row.serviceName}
										</TableCell>
										<TableCell>
											<span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${sourceBadge.bg}`}>
												{sourceBadge.label}
											</span>
										</TableCell>
										<TableCell className="font-mono text-xs text-gray-700 whitespace-nowrap">
											{formatDateTime(row.createdAt)}
										</TableCell>
										<TableCell>
											<span className="font-mono text-[11px] font-bold text-gray-700 uppercase bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
												{row.serviceType}
											</span>
										</TableCell>
										<TableCell className="font-bold text-xs text-gray-800">
											{(entity.country as string) ?? "KE"}
										</TableCell>
										<TableCell>
											<span
												className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getResultBadgeColor(
													row.resultStatus
												)}`}
											>
												{row.resultStatus ?? "Pending"}
											</span>
										</TableCell>
										<TableCell className="max-w-[220px] truncate text-xs text-gray-600" title={row.message}>
											{row.message || "—"}
										</TableCell>
									</TableRow>
								);
							})
						) : (
							<TableRow>
								<TableCell colSpan={8} className="h-36 text-center text-gray-500 text-xs">
									No verification jobs matching the selected filters.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination Controls */}
			<div className="p-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 flex-wrap gap-2">
				<div>
					Showing {jobs.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{" "}
					{Math.min(currentPage * itemsPerPage, jobs.length)} of {jobs.length} total jobs
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => onPageChange(Math.max(1, currentPage - 1))}
						disabled={currentPage === 1}
						className="h-8 px-2 rounded-md"
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<span className="px-2 font-semibold text-gray-700 font-mono">
						Page {currentPage} of {Math.max(1, totalPages)}
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
						disabled={currentPage >= totalPages || totalPages === 0}
						className="h-8 px-2 rounded-md"
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
