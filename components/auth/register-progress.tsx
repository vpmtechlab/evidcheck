"use client";

import { cn } from "@/lib/utils";

const STEPS = ["Company", "Profile", "Verify", "Security"];

export function RegisterProgress({ step }: { step: number }) {
	return (
		<div className="flex items-center justify-between mb-8 px-2 relative">
			<div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gray-100 -z-10 -translate-y-1/2 rounded" />
			{STEPS.map((label, i) => {
				const active = step >= i + 1;
				return (
					<div key={label} className="flex flex-col items-center">
						<div className={cn(
							"w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors",
							active ? "bg-brand text-white" : "bg-gray-100 text-gray-400"
						)}>
							{i + 1}
						</div>
						<span className="text-[10px] text-center mt-2 font-medium text-gray-600">
							{label}
						</span>
					</div>
				);
			})}
		</div>
	);
}
