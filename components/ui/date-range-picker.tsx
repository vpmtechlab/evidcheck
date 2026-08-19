"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
	dateRange: DateRange | undefined;
	onChange: (range: DateRange | undefined) => void;
	className?: string;
}

export function DateRangePicker({ dateRange, onChange, className }: DateRangePickerProps) {
	const [open, setOpen] = React.useState(false);

	const clearRange = (e: React.MouseEvent) => {
		e.stopPropagation();
		onChange(undefined);
	};

	const label = dateRange?.from
		? dateRange.to
			? `${format(dateRange.from, "dd MMM")} – ${format(dateRange.to, "dd MMM yyyy")}`
			: format(dateRange.from, "dd MMM yyyy")
		: "Pick date range";

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				className={cn(
					"inline-flex items-center justify-between gap-1.5 h-9 px-2.5 bg-white border border-gray-200 rounded-md text-xs font-semibold text-gray-700 outline-none hover:border-gray-300 transition-colors cursor-pointer min-w-[160px]",
					open && "border-[#188015] ring-1 ring-[#188015]/20",
					!dateRange?.from && "text-gray-400",
					className
				)}
			>
				<span className="flex items-center gap-1.5 truncate">
					<CalendarIcon size={13} className="text-gray-400 shrink-0" />
					<span className="truncate">{label}</span>
				</span>
				<span className="flex items-center gap-0.5 shrink-0">
					{dateRange?.from && (
						<button
							onClick={clearRange}
							className="rounded-full p-0.5 hover:bg-gray-200 transition-colors"
							type="button"
						>
							<X size={12} className="text-gray-500" />
						</button>
					)}
				</span>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-auto p-0">
				<Calendar
					mode="range"
					defaultMonth={dateRange?.from}
					selected={dateRange}
					onSelect={(range) => {
						onChange(range);
						if (range?.from && range?.to) {
							setOpen(false);
						}
					}}
					numberOfMonths={2}
					disabled={{ after: new Date() }}
				/>
			</PopoverContent>
		</Popover>
	);
}
