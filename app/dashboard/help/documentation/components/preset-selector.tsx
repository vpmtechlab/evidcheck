"use client";

import { FlaskConical } from "lucide-react";
import type { ServicePreset } from "./doc-presets";

interface PresetSelectorProps {
	presets: ServicePreset[];
	selectedId: string;
	onSelect: (id: string) => void;
}

export function PresetSelector({ presets, selectedId, onSelect }: PresetSelectorProps) {
	return (
		<div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3 shadow-2xs">
			<div className="flex items-center justify-between flex-wrap gap-2">
				<h3 className="text-sm font-bold text-gray-900 tracking-tight flex items-center gap-2">
					<FlaskConical size={16} className="text-green-600" />
					Interactive Sandbox API Tester
				</h3>
				<span className="text-[10px] font-mono font-bold bg-green-100 text-green-800 border border-green-300 px-2 py-0.5 rounded-sm">
					SANDBOX - ZERO COST
				</span>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
				{presets.map((preset) => {
					const Icon = preset.icon;
					const isSelected = preset.id === selectedId;
					return (
						<button
							key={preset.id}
							onClick={() => onSelect(preset.id)}
							className={`
								p-3 rounded-md border text-left transition-all flex items-start gap-2.5
								${
									isSelected
										? "border-green-500 bg-green-50/40 text-gray-900 shadow-2xs"
										: "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 text-gray-600"
								}
							`}
						>
							<Icon size={16} className={isSelected ? "text-green-600 shrink-0 mt-0.5" : "text-gray-400 shrink-0 mt-0.5"} />
							<div className="min-w-0">
								<p className="text-xs font-bold truncate leading-tight">{preset.label}</p>
								<span className="text-[10px] text-gray-500 font-mono block mt-0.5">{preset.method} {preset.endpoint}</span>
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);
}
