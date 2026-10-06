"use client";

import { ArrowRight } from "lucide-react";
import type { ServiceOption } from "./command-palette";

interface PaletteServiceItemProps {
	service: ServiceOption;
	isSelected: boolean;
	onSelect: (service: ServiceOption) => void;
	onHover: () => void;
}

export function PaletteServiceItem({ service, isSelected, onSelect, onHover }: PaletteServiceItemProps) {
	const Icon = service.icon;

	return (
		<button
			onClick={() => onSelect(service)}
			onMouseEnter={onHover}
			className={`
				w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors
				${isSelected ? "bg-green-50 ring-1 ring-brand/20" : "hover:bg-gray-50"}
			`}
		>
			<div
				className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 transition-colors ${
					isSelected ? "bg-brand text-white" : "bg-gray-100 text-gray-500"
				}`}
			>
				<Icon size={18} />
			</div>
			<div className="flex-1 min-w-0">
				<p className={`text-sm font-semibold truncate ${isSelected ? "text-brand" : "text-gray-900"}`}>
					{service.label}
				</p>
				<p className="text-xs text-gray-500 truncate">{service.description}</p>
			</div>
			<div className="flex items-center gap-1.5 shrink-0">
				<span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:block">
					{service.category}
				</span>
				<ArrowRight
					size={14}
					className={`transition-colors ${isSelected ? "text-brand" : "text-gray-300"}`}
				/>
			</div>
		</button>
	);
}
