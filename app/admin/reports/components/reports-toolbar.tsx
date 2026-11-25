"use client";

import { Filter } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface ReportsToolbarProps {
	dateRange: string;
	onRangeChange: (value: string) => void;
}

export function ReportsToolbar({ dateRange, onRangeChange }: ReportsToolbarProps) {
	return (
		<div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-md px-2.5 py-1 shadow-2xs">
			<Filter size={13} className="text-gray-400" />
			<span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
				Range:
			</span>
			<Select value={dateRange} onValueChange={(v) => onRangeChange(v ?? "30")}>
				<SelectTrigger
					aria-label="Report period"
					className="border-none bg-transparent h-6 text-xs font-bold text-gray-900 focus:ring-0 min-w-[100px] shadow-none"
				>
					<SelectValue placeholder="Period" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="7">Past 7 Days</SelectItem>
					<SelectItem value="30">Past 30 Days</SelectItem>
					<SelectItem value="90">Past 90 Days</SelectItem>
					<SelectItem value="0">All Time</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
