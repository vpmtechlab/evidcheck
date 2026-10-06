"use client";

import Link from "next/link";
import { ArrowLeft, Printer, RefreshCw, Loader2, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JobHeaderProps {
	jobId: string;
	isPending: boolean;
	isRefreshing: boolean;
	isCancelling: boolean;
	onTerminateClick: () => void;
	onPrint: () => void;
	onRefresh: () => void;
}

export function JobHeader({
	jobId,
	isPending,
	isRefreshing,
	isCancelling,
	onTerminateClick,
	onPrint,
	onRefresh,
}: JobHeaderProps) {
	return (
		<div className="flex items-center justify-between gap-3 flex-wrap">
			<div className="flex items-center gap-2 text-xs">
				<Link
					href="/dashboard/jobs"
					className="text-brand hover:underline font-semibold flex items-center gap-1"
				>
					<ArrowLeft size={14} />
					Verification Jobs
				</Link>
				<span className="text-gray-300">/</span>
				<span className="text-gray-600 font-mono font-medium">{jobId}</span>
			</div>

			<div className="flex items-center gap-2">
				{isPending && (
					<Button
						onClick={onTerminateClick}
						disabled={isCancelling}
						variant="outline"
						className="h-8 text-xs font-bold text-red-700 border-red-300 hover:bg-red-50 rounded-md gap-1.5 shadow-2xs"
					>
						{isCancelling ? <Loader2 size={13} className="animate-spin" /> : <StopCircle size={13} />}
						<span>Terminate Job</span>
					</Button>
				)}

				<Button
					onClick={onPrint}
					size="sm"
					className="h-8 text-xs font-bold bg-brand hover:bg-brand-dark text-white px-3 rounded-md gap-1.5 shadow-2xs"
				>
					<Printer size={13} />
					<span>Print Report</span>
				</Button>

				{!isPending && (
					<Button
						onClick={onRefresh}
						disabled={isRefreshing}
						variant="outline"
						size="sm"
						title="Bypass the registry cache and pull a fresh result"
						className="h-8 text-xs font-bold text-gray-700 border-gray-300 hover:bg-gray-50 rounded-md gap-1.5 shadow-2xs"
					>
						{isRefreshing ? (
							<Loader2 size={13} className="animate-spin" />
						) : (
							<RefreshCw size={13} />
						)}
						<span>{isRefreshing ? "Refreshing…" : "Refresh from Registry"}</span>
					</Button>
				)}
			</div>
		</div>
	);
}
