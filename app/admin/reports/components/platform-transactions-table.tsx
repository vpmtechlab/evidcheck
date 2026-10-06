"use client";

import { ArrowUpRight } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export interface PlatformJob {
	_id: string;
	companyName: string;
	serviceType: string;
	resultStatus: string;
	feesCharged?: number;
	createdAt: number;
}

interface PlatformTransactionsTableProps {
	jobs: PlatformJob[];
	canLoadMore: boolean;
	loadingMore: boolean;
	emptyHint: string;
	onLoadMore: () => void;
}

const STATUS_STYLES: Record<string, string> = {
	approved: "bg-green-50 text-green-700 border-green-200",
	failed: "bg-red-50 text-red-700 border-red-200",
};

function formatTimestamp(ts: number): string {
	const d = new Date(ts);
	return `${d.toLocaleDateString("en-GB")} ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}

export function PlatformTransactionsTable({
	jobs,
	canLoadMore,
	loadingMore,
	emptyHint,
	onLoadMore,
}: PlatformTransactionsTableProps) {
	const router = useRouter();

	return (
		<div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-2xs">
			<div className="p-4 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between gap-3 flex-wrap">
				<div>
					<h2 className="font-bold text-gray-900 text-sm tracking-tight flex items-center gap-1.5">
						Recent Platform Transactions
						<ArrowUpRight size={14} className="text-gray-400" />
					</h2>
					<p className="text-[11px] text-gray-500 font-mono mt-0.5">
						Live verification feed across all companies
					</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={() => router.push("/admin/audit")}
					className="text-xs font-semibold text-gray-700 h-7 px-2.5 rounded-md border-gray-300 hover:bg-gray-100"
				>
					View Audit Log
				</Button>
			</div>

			<div className="overflow-x-auto">
				<Table>
					<TableHeader className="bg-gray-50/50 border-b border-gray-200">
						<TableRow>
							<TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider py-3 pl-4">Company</TableHead>
							<TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider text-center">Service</TableHead>
							<TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider text-center">Outcome</TableHead>
							<TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider text-right">Fee</TableHead>
							<TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider text-right pr-4">Timestamp</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{jobs.map((job) => (
							<TableRow key={job._id} className="hover:bg-gray-50/60 transition-colors border-b border-gray-100">
								<TableCell className="py-3 pl-4">
									<span className="font-bold text-xs text-gray-900">{job.companyName}</span>
								</TableCell>
								<TableCell className="text-center font-mono text-[11px] font-bold text-gray-600 uppercase">
									{job.serviceType.replace("_", " ")}
								</TableCell>
								<TableCell className="text-center">
									<span className={cn(
										"inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border",
										STATUS_STYLES[job.resultStatus] ?? "bg-amber-50 text-amber-700 border-amber-200"
									)}>
										{job.resultStatus.replace(/_/g, " ")}
									</span>
								</TableCell>
								<TableCell className="text-right font-mono font-bold text-xs text-gray-900">
									${job.feesCharged?.toFixed(2) || "0.00"}
								</TableCell>
								<TableCell className="text-right text-gray-500 font-mono text-[11px] pr-4 whitespace-nowrap">
									{formatTimestamp(job.createdAt)}
								</TableCell>
							</TableRow>
						))}

						{jobs.length === 0 && !loadingMore && (
							<TableRow>
								<TableCell colSpan={5} className="text-center py-12 text-xs text-gray-500 font-medium">
									No transactions recorded in this timeframe.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
				<p className="text-[11px] font-mono text-gray-500">{emptyHint}</p>
				{canLoadMore && (
					<Button
						onClick={onLoadMore}
						disabled={loadingMore}
						variant="outline"
						size="sm"
						className="text-xs font-semibold h-7 px-3 rounded-md border-gray-300 hover:bg-gray-100 disabled:opacity-50"
					>
						{loadingMore ? "Loading..." : "Load More"}
					</Button>
				)}
			</div>
		</div>
	);
}
