"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AUDIT_CATEGORIES, type AuditCategoryId } from "@/lib/audit-categories";
import { cn } from "@/lib/utils";

export type AuditCategoryFilter = "all" | AuditCategoryId;

interface AuditToolbarProps {
	search: string;
	onSearchChange: (value: string) => void;
	category: AuditCategoryFilter;
	onCategoryChange: (value: AuditCategoryFilter) => void;
}

export function AuditToolbar({
	search,
	onSearchChange,
	category,
	onCategoryChange,
}: AuditToolbarProps) {
	return (
		<div className="bg-white border border-gray-200 rounded-lg p-3.5 shadow-2xs space-y-3">
			<div className="relative max-w-sm">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
				<Input
					placeholder="Search events, actors, actions…"
					aria-label="Search audit events"
					className="pl-9 bg-white border-gray-200 h-9 text-xs"
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
				/>
			</div>

			<div
				className="flex items-center gap-1.5 flex-wrap"
				role="group"
				aria-label="Filter by event category"
			>
				<button
					onClick={() => onCategoryChange("all")}
					className={cn(
						"h-7 px-2.5 text-[11px] font-bold rounded-md border transition-colors cursor-pointer",
						category === "all"
							? "bg-navy text-white border-navy"
							: "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
					)}
				>
					All events
				</button>
				{AUDIT_CATEGORIES.map((cat) => (
					<button
						key={cat.id}
						onClick={() => onCategoryChange(cat.id)}
						className={cn(
							"h-7 px-2.5 text-[11px] font-bold rounded-md border transition-colors cursor-pointer",
							category === cat.id
								? "bg-navy text-white border-navy"
								: "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
						)}
					>
						{cat.label}
					</button>
				))}
			</div>
		</div>
	);
}
