"use client";

import { Copy, Check } from "lucide-react";
import { getStatusBadge, serviceTypeLabel } from "./job-display";

interface ExecutionCardProps {
	jobId: string;
	serviceType: string;
	resultStatus: string;
	source: string;
	formattedDate: string;
	formattedTime: string;
	fromCache: boolean;
	cacheFetchedLabel: string | null;
	copiedId: boolean;
	onCopyId: () => void;
}

export function ExecutionCard({
	jobId,
	serviceType,
	resultStatus,
	source,
	formattedDate,
	formattedTime,
	fromCache,
	cacheFetchedLabel,
	copiedId,
	onCopyId,
}: ExecutionCardProps) {
	const statusBadge = getStatusBadge(resultStatus);

	return (
		<div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3.5 shadow-2xs">
			<div className="space-y-2 text-xs divide-y divide-gray-100">
				<div className="flex items-center justify-between pb-2">
					<span className="text-gray-500 font-medium">Job Type:</span>
					<span className="font-bold text-gray-900">{serviceTypeLabel(serviceType)}</span>
				</div>

				<div className="flex items-center justify-between pt-2">
					<span className="text-gray-500 font-medium">Job ID:</span>
					<div className="flex items-center gap-1.5">
						<span className="font-bold font-mono text-gray-900">{jobId}</span>
						<button
							onClick={onCopyId}
							className="text-gray-400 hover:text-brand p-1 rounded transition-colors"
							title="Copy Job ID"
						>
							{copiedId ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
						</button>
					</div>
				</div>

				<div className="flex items-center justify-between pt-2">
					<span className="text-gray-500 font-medium">Date:</span>
					<span className="font-semibold text-gray-800">{formattedDate}</span>
				</div>

				<div className="flex items-center justify-between pt-2">
					<span className="text-gray-500 font-medium">Time:</span>
					<span className="font-semibold text-gray-800 font-mono">{formattedTime}</span>
				</div>

				<div className="flex items-center justify-between pt-2">
					<span className="text-gray-500 font-medium">Source / Environment:</span>
					<span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-gray-100 border border-gray-200 rounded-sm text-gray-800">
						{source === "rest_api" ? "REST API (api.evidcheck.com)" : "EvidCheck Portal"}
					</span>
				</div>

				<div className="flex items-center justify-between pt-3">
					<span className="text-gray-500 font-medium">Result:</span>
					<div className={`px-3 py-1 border rounded-md font-bold text-xs flex items-center gap-2 ${statusBadge.bg}`}>
						<span className={`w-2 h-2 rounded-full ${statusBadge.pillBg}`} />
						<span>{statusBadge.label}</span>
						<span className="font-mono text-[10px] opacity-75">({statusBadge.code})</span>
					</div>
				</div>

				<div className="flex items-center justify-between pt-2">
					<span className="text-gray-500 font-medium">Data Source:</span>
					{fromCache ? (
						<span
							title={`Served from the EvidCheck registry cache${cacheFetchedLabel ? ` (verified ${cacheFetchedLabel})` : ""}. Use Refresh from Registry for a live pull.`}
							className="font-mono text-[11px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-sm"
						>
							Registry Cache{cacheFetchedLabel ? ` · ${cacheFetchedLabel}` : ""}
						</span>
					) : (
						<span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-gray-100 border border-gray-200 rounded-sm text-gray-800">
							Live Registry
						</span>
					)}
				</div>
			</div>
		</div>
	);
}
