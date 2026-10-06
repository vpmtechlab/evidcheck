"use client";

import React, { useState, useMemo } from "react";
import { ScrollText } from "lucide-react";
import { AuditLogRow, type FeedAuditLog } from "./audit-log-row";

interface AuditFeedProps {
	logs: FeedAuditLog[] | undefined;
	title: string;
	subtitle?: string;
	showCompany?: boolean;
}

function FeedSkeleton() {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="h-5 w-40 bg-gray-100 rounded animate-pulse" />
				<div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse" />
			</div>
			{[1, 2, 3, 4].map((i) => (
				<div
					key={i}
					className="h-[76px] bg-white rounded-lg border border-gray-200 animate-pulse"
				/>
			))}
		</div>
	);
}

function dayKey(ts: number): string {
	return new Date(ts).toDateString();
}

function dayLabel(ts: number): string {
	const d = new Date(ts);
	const today = new Date();
	const yesterday = new Date(Date.now() - 86400000);
	if (d.toDateString() === today.toDateString()) return "Today";
	if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
	return d.toLocaleDateString("en-GB", {
		weekday: "short",
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

export function AuditFeed({
	logs,
	title,
	subtitle = "Immutable record of system events",
	showCompany = false,
}: AuditFeedProps) {
	const [expandedId, setExpandedId] = useState<string | null>(null);

	const grouped = useMemo(() => {
		if (!logs) return null;
		const groups = new Map<string, FeedAuditLog[]>();
		for (const log of logs) {
			const key = dayKey(log.createdAt);
			const bucket = groups.get(key);
			if (bucket) bucket.push(log);
			else groups.set(key, [log]);
		}
		return [...groups.entries()];
	}, [logs]);

	if (logs === undefined) return <FeedSkeleton />;

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-sm font-bold text-gray-900 tracking-tight">
						{title}
					</h2>
					<p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>
				</div>
				<span className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 font-mono">
					<span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
					Live
				</span>
			</div>

			{grouped !== null && grouped.length > 0 ? (
				<div className="space-y-5">
					{grouped.map(([key, dayLogs]) => (
						<div key={key} className="space-y-2">
							<p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 font-mono px-1">
								{dayLabel(dayLogs[0].createdAt)}
							</p>
							{dayLogs.map((log) => (
								<AuditLogRow
									key={log._id}
									log={log}
									showCompany={showCompany}
									isExpanded={expandedId === log._id}
									onToggle={() =>
										setExpandedId(expandedId === log._id ? null : log._id)
									}
								/>
							))}
						</div>
					))}
				</div>
			) : (
				<div className="py-14 text-center bg-white border border-dashed border-gray-200 rounded-lg">
					<div className="w-11 h-11 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
						<ScrollText size={20} />
					</div>
					<p className="text-sm font-bold text-gray-900">
						No audit events found
					</p>
					<p className="text-xs text-gray-500 mt-1">
						Events will appear here as your team works. Try adjusting
						filters.
					</p>
				</div>
			)}
		</div>
	);
}
