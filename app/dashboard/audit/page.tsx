"use client";

import { getSessionToken } from "@/lib/session-token";

import { useContext, useMemo, useState } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AuditFeed } from "@/components/shared/audit-feed";
import { Download, ScrollText } from "lucide-react";
import { AppContext } from "@/components/providers/app-provider";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AuditToolbar, type AuditCategoryFilter } from "@/components/shared/audit-toolbar";
import {
	auditLogMatchesSearch,
	categorizeAuditAction,
	downloadAuditCsv,
} from "@/lib/audit-categories";

export default function AuditDashboardPage() {
	const { member } = useContext(AppContext);
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState<AuditCategoryFilter>("all");

	const { results: rawLogs, status, loadMore } = usePaginatedQuery(
		api.audit.getAuditLogsByCompany,
		member?.companyId
			? { sessionToken: getSessionToken() ?? "", companyId: member.companyId as Id<"companies"> }
			: "skip",
		{ initialNumItems: 20 }
	);

	const logs = useMemo(() => {
		if (!rawLogs) return undefined;
		return rawLogs.filter(
			(log) =>
				(category === "all" || categorizeAuditAction(log.action) === category) &&
				auditLogMatchesSearch(log, search)
		);
	}, [rawLogs, category, search]);

	const handleExportCsv = () => {
		if (!logs || logs.length === 0) {
			toast.error("No audit events available to export.");
			return;
		}
		downloadAuditCsv(logs, `evidcheck_audit_${Date.now()}.csv`);
		toast.success(`Exported ${logs.length} audit events to CSV.`);
	};

	return (
		<div className="flex flex-col gap-6 p-2">
			{/* Page Header */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-navy text-white rounded-md shrink-0">
						<ScrollText size={18} />
					</div>
					<div>
						<h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
							Organization Audit
						</h1>
						<p className="text-xs text-gray-500 mt-0.5">
							Every team action and system event, in one tamper-evident trail.
						</p>
					</div>
				</div>
				<Button
					onClick={handleExportCsv}
					disabled={!logs || logs.length === 0}
					variant="outline"
					className="h-9 text-xs font-semibold px-3.5 rounded-md gap-1.5 shadow-2xs border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
				>
					<Download size={14} />
					<span>Export CSV</span>
				</Button>
			</div>

			<AuditToolbar
				search={search}
				onSearchChange={setSearch}
				category={category}
				onCategoryChange={setCategory}
			/>

			<AuditFeed
				logs={logs}
				title="Activity History"
				subtitle="Newest first · click any event for technical details"
				showCompany={false}
			/>

			{status !== "Exhausted" && (
				<div className="flex justify-center">
					<Button
						onClick={() => loadMore(20)}
						disabled={status === "LoadingMore"}
						variant="outline"
						size="sm"
						className="rounded-md px-6 text-xs font-semibold border-gray-300 hover:bg-gray-50 text-gray-700 h-8 disabled:opacity-50"
					>
						{status === "LoadingMore" ? "Loading…" : "Load Older Records"}
					</Button>
				</div>
			)}

			{status === "Exhausted" && logs && logs.length > 0 && (
				<p className="text-center text-xs font-mono text-gray-400">
					End of audit trail
				</p>
			)}
		</div>
	);
}
