"use client";

import { Download, FileText, FileClock } from "lucide-react";
import { format } from "date-fns";
import type { Id } from "@/convex/_generated/dataModel";
import type { ReportFilterConfig } from "@/lib/report-export";

export interface RecentReport {
	_id: Id<"generatedReports">;
	name: string;
	type: string;
	format: string;
	config?: ReportFilterConfig;
	createdAt: number;
}

interface RecentExportsProps {
	reports: RecentReport[] | undefined;
	onDownload: (report: RecentReport) => void;
}

export function RecentExports({ reports, onDownload }: RecentExportsProps) {
	return (
		<div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs space-y-3">
			<div className="flex items-center justify-between pb-2 border-b border-gray-100">
				<h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
					<FileText size={14} className="text-gray-500" />
					Recent Exports
				</h3>
				{reports !== undefined && reports.length > 0 && (
					<span className="text-[10px] font-bold font-mono text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded">
						{reports.length}
					</span>
				)}
			</div>

			<div className="space-y-2">
				{reports === undefined ? (
					Array.from({ length: 3 }).map((_, i) => (
						<div key={i} className="h-16 bg-gray-50 rounded-md animate-pulse" />
					))
				) : reports.length === 0 ? (
					<div className="text-center py-6">
						<FileClock size={20} className="mx-auto text-gray-300 mb-2" />
						<p className="text-xs text-gray-500 font-medium">
							No exports yet.
						</p>
						<p className="text-[11px] text-gray-400 mt-0.5">
							Generated reports will appear here.
						</p>
					</div>
				) : (
					reports.map((report) => (
						<button
							key={report._id}
							onClick={() => onDownload(report)}
							title={`Download ${report.name}`}
							className="w-full group p-2.5 bg-gray-50/60 hover:bg-white hover:border-gray-300 border border-transparent rounded-md transition-colors cursor-pointer text-left"
						>
							<div className="flex justify-between items-start gap-2 mb-1.5">
								<p className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-brand transition-colors">
									{report.name}
								</p>
								<Download
									size={13}
									className="text-gray-300 group-hover:text-brand shrink-0 mt-0.5 transition-colors"
								/>
							</div>
							<div className="flex items-center justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
								<span className="font-mono">
									{format(report.createdAt, "MMM dd, yyyy")}
								</span>
								<span className="px-1.5 py-px bg-gray-100 border border-gray-200 text-gray-500 rounded">
									{report.format}
								</span>
							</div>
						</button>
					))
				)}
			</div>
		</div>
	);
}
