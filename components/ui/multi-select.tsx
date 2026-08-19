"use client";

import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
	value: string;
	label: string;
}

interface MultiSelectProps {
	options: MultiSelectOption[];
	selected: string[];
	onChange: (selected: string[]) => void;
	placeholder?: string;
	className?: string;
}

export function MultiSelect({
	options,
	selected,
	onChange,
	placeholder = "Select...",
	className,
}: MultiSelectProps) {
	const [open, setOpen] = React.useState(false);

	const toggleOption = (value: string) => {
		if (selected.includes(value)) {
			onChange(selected.filter((s) => s !== value));
		} else {
			onChange([...selected, value]);
		}
	};

	const clearAll = (e: React.MouseEvent) => {
		e.stopPropagation();
		onChange([]);
	};

	const selectedLabels = selected
		.map((v) => options.find((o) => o.value === v)?.label)
		.filter(Boolean);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				className={cn(
					"inline-flex items-center justify-between gap-1.5 h-9 px-2.5 bg-white border border-gray-200 rounded-md text-xs font-semibold text-gray-700 outline-none hover:border-gray-300 transition-colors cursor-pointer min-w-[130px]",
					open && "border-[#188015] ring-1 ring-[#188015]/20",
					className
				)}
			>
				<span className="truncate max-w-[160px]">
					{selected.length === 0
						? placeholder
						: selected.length === 1
							? selectedLabels[0]
							: `${selected.length} selected`}
				</span>
				<span className="flex items-center gap-0.5 shrink-0">
					{selected.length > 0 && (
						<button
							onClick={clearAll}
							className="rounded-full p-0.5 hover:bg-gray-200 transition-colors"
							type="button"
						>
							<X size={12} className="text-gray-500" />
						</button>
					)}
					<ChevronDown size={13} className="text-gray-400" />
				</span>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				className="w-[220px] p-1.5"
			>
				<div className="flex flex-col gap-0.5">
					{options.map((option) => {
						const isChecked = selected.includes(option.value);
						return (
							<button
								key={option.value}
								type="button"
								onClick={() => toggleOption(option.value)}
								className={cn(
									"flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer text-left w-full",
									isChecked
										? "bg-[#188015]/5 text-gray-900"
										: "text-gray-700 hover:bg-gray-100"
								)}
							>
								<Checkbox
									checked={isChecked}
									onCheckedChange={() => toggleOption(option.value)}
									className="pointer-events-none"
								/>
								<span className="truncate">{option.label}</span>
							</button>
						);
					})}
				</div>
			</PopoverContent>
		</Popover>
	);
}
