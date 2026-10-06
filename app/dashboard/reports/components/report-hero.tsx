"use client";

import { Download, FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface ReportHeroProps {
	periodLabel: string;
	dateRange: string;
	onRangeChange: (value: string) => void;
	total: number | null;
	approved: number | null;
	pending: number | null;
	exporting: boolean;
	onExport: () => void;
}

function HeroStat({ label, value }: { label: string; value: number | null }) {
	return (
		<div>
			<p className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
				{value === null ? "—" : value.toLocaleString()}
			</p>
			<p className="text-[11px] text-gray-300 font-medium mt-0.5">{label}</p>
		</div>
	);
}

export function ReportHero({
	periodLabel,
	dateRange,
	onRangeChange,
	total,
	approved,
	pending,
	exporting,
	onExport,
}: ReportHeroProps) {
	return (
		<div className="bg-navy text-white rounded-lg shadow-xs overflow-hidden">
			<div className="p-6 border-b-2 border-brand flex flex-col lg:flex-row lg:items-center justify-between gap-5">
				<div className="flex items-start gap-3.5">
					<div className="p-2.5 bg-brand text-white rounded-md shrink-0 shadow-xs">
						<FileCheck2 size={22} />
					</div>
					<div>
						<p className="text-[11px] font-bold uppercase tracking-wider text-gray-300 font-mono">
							Compliance Reports · {periodLabel}
						</p>
						<h1 className="text-lg md:text-xl font-bold tracking-tight text-white mt-0.5">
							Reports & Analytics
						</h1>
						<p className="text-gray-300 text-xs mt-0.5">
							Performance insights and compliance tracking for your organization.
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2 flex-wrap">
					<Select value={dateRange} onValueChange={(v) => onRangeChange(v ?? "30")}>
						<SelectTrigger
							aria-label="Report period"
							className="h-9 text-xs font-semibold bg-white/10 border-white/20 text-white rounded-md w-[150px] [&_svg]:text-gray-300"
						>
							<SelectValue placeholder="Period" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="7">Last 7 Days</SelectItem>
							<SelectItem value="30">Last 30 Days</SelectItem>
							<SelectItem value="90">Last 90 Days</SelectItem>
							<SelectItem value="0">All Time</SelectItem>
						</SelectContent>
					</Select>

					<Button
						onClick={onExport}
						disabled={exporting}
						className="bg-brand hover:bg-brand-dark text-white h-9 px-4 text-xs font-bold rounded-md gap-1.5 shadow-xs disabled:opacity-50"
					>
						<Download size={14} />
						<span>{exporting ? "Exporting…" : "Export All"}</span>
					</Button>
				</div>
			</div>

			<div className="px-6 py-4 grid grid-cols-3 gap-4 bg-white/[0.03]">
				<HeroStat label="Verifications" value={total} />
				<HeroStat label="Approved" value={approved} />
				<HeroStat label="Pending review" value={pending} />
			</div>
		</div>
	);
}
