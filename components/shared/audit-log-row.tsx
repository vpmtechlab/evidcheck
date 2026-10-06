"use client";

import { ChevronRight, Clock, User, Building2 } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { categorizeAuditAction, type AuditCategoryId } from "@/lib/audit-categories";
import type { LucideIcon } from "lucide-react";
import {
	Activity,
	Users,
	ShieldCheck,
	KeyRound,
	Wallet,
	Code2,
	FileText,
	Database,
} from "lucide-react";

export interface FeedAuditLog {
	_id: string;
	action: string;
	details: string;
	userName: string;
	companyName?: string;
	entityType?: string;
	createdAt: number;
	metadata?: Record<string, unknown>;
}

const CATEGORY_STYLE: Record<AuditCategoryId, { icon: LucideIcon; tile: string }> = {
	verification: { icon: ShieldCheck, tile: "bg-green-50 text-green-700" },
	cache: { icon: Database, tile: "bg-blue-50 text-blue-700" },
	team: { icon: Users, tile: "bg-indigo-50 text-indigo-700" },
	security: { icon: KeyRound, tile: "bg-amber-50 text-amber-700" },
	billing: { icon: Wallet, tile: "bg-emerald-50 text-emerald-700" },
	api: { icon: Code2, tile: "bg-purple-50 text-purple-700" },
	reports: { icon: FileText, tile: "bg-orange-50 text-orange-700" },
	system: { icon: Activity, tile: "bg-gray-100 text-gray-600" },
};

interface AuditLogRowProps {
	log: FeedAuditLog;
	showCompany: boolean;
	isExpanded: boolean;
	onToggle: () => void;
}

export function AuditLogRow({ log, showCompany, isExpanded, onToggle }: AuditLogRowProps) {
	const style = CATEGORY_STYLE[categorizeAuditAction(log.action)];
	const Icon = style.icon;

	return (
		<button
			type="button"
			onClick={onToggle}
			aria-expanded={isExpanded}
			className="w-full text-left bg-white border border-gray-200 rounded-lg transition-colors cursor-pointer hover:border-gray-300"
		>
			<div className="flex items-start gap-3 p-3.5">
				<div className={`p-2 rounded-md shrink-0 ${style.tile}`}>
					<Icon size={17} />
				</div>

				<div className="flex-1 min-w-0">
					<div className="flex items-center justify-between gap-2">
						<span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono truncate">
							{log.action.replace(/_/g, " ")}
						</span>
						<span
							className="flex items-center gap-1 text-[11px] text-gray-400 shrink-0 font-mono"
							title={format(new Date(log.createdAt), "d MMM yyyy, h:mm:ss a")}
						>
							<Clock size={11} />
							{formatDistanceToNow(log.createdAt)} ago
						</span>
					</div>

					<p className="text-xs font-semibold text-gray-900 leading-relaxed mt-1">
						{log.details}
					</p>

					<div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px] text-gray-500">
						<span className="inline-flex items-center gap-1 min-w-0">
							<User size={11} className="text-gray-400 shrink-0" />
							<span className="truncate font-medium">{log.userName}</span>
						</span>
						{showCompany && log.companyName && (
							<span className="inline-flex items-center gap-1 min-w-0">
								<Building2 size={11} className="text-gray-400 shrink-0" />
								<span className="truncate font-medium">{log.companyName}</span>
							</span>
						)}
						{log.entityType && (
							<span className="px-1.5 py-px bg-gray-100 border border-gray-200 rounded text-[10px] font-mono font-semibold text-gray-600 uppercase">
								{log.entityType}
							</span>
						)}
						<span className="ml-auto inline-flex items-center gap-0.5 font-semibold text-gray-400">
							{isExpanded ? "Hide" : "Details"}
							<ChevronRight
								size={12}
								className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
							/>
						</span>
					</div>
				</div>
			</div>

			{isExpanded && (
				<div className="mx-3.5 mb-3.5 pt-3 border-t border-gray-100">
					<p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono mb-2">
						Event metadata · {format(new Date(log.createdAt), "d MMM yyyy, h:mm:ss a")}
					</p>
					<pre className="bg-gray-50 rounded-md p-3.5 text-[11px] font-mono text-gray-700 overflow-auto border border-gray-200 max-h-64 custom-scrollbar">
						{log.metadata
							? JSON.stringify(log.metadata, null, 2)
							: "No additional metadata recorded for this event."}
					</pre>
				</div>
			)}
		</button>
	);
}
