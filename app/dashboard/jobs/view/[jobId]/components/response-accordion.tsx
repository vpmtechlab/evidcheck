"use client";

import { Building2, Info, ChevronDown, ChevronUp } from "lucide-react";
import { DataRow, DirectorsTable } from "./payload-renderers";

export type Payload = Record<string, unknown>;

interface ResponseAccordionProps {
	payload: Payload;
	directors: Array<Record<string, string>> | undefined;
	isPending: boolean;
	open: boolean;
	onToggle: () => void;
}

export function ResponseAccordion({
	payload,
	directors,
	isPending,
	open,
	onToggle,
}: ResponseAccordionProps) {
	return (
		<div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-2xs">
			<button
				type="button"
				onClick={onToggle}
				aria-expanded={open}
				className="w-full px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-100/60 transition-colors select-none"
			>
				<div className="flex items-center gap-2">
					<Building2 size={16} className="text-brand" />
					<h3 className="text-sm font-bold text-gray-900 tracking-tight">
						ID Authority Response Data
					</h3>
					<Info size={14} className="text-gray-400" />
				</div>

				<div className="flex items-center gap-2">
					<span className="text-[11px] text-gray-500 font-mono font-medium">
						{Object.keys(payload).length} attributes
					</span>
					{open ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
				</div>
			</button>

			{open && (
				<div className="p-5 space-y-5">
					{Object.keys(payload).length > 0 ? (
						<>
							<div className="divide-y divide-gray-100">
								{Object.entries(payload).map(([k, v]) => (
									<DataRow key={k} label={k} value={v} />
								))}
							</div>

							{directors && directors.length > 0 && (
								<div className="pt-3 border-t border-gray-100">
									<p className="text-xs font-bold text-gray-800 uppercase tracking-wider font-mono mb-2">
										Company Directors & Key Officers
									</p>
									<DirectorsTable directors={directors} />
								</div>
							)}
						</>
					) : (
						<div className="py-8 text-center text-xs text-gray-500">
							{isPending ? "Verification job processing in real-time…" : "No response payload recorded."}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
