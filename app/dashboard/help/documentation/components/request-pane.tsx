"use client";

import { Play, Loader2, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RequestPaneProps {
	method: string;
	payloadJson: string;
	isRunning: boolean;
	onPayloadChange: (value: string) => void;
	onExecute: () => void;
}

export function RequestPane({ method, payloadJson, isRunning, onPayloadChange, onExecute }: RequestPaneProps) {
	return (
		<div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-2xs flex flex-col">
			<div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
				<span className="text-xs font-bold text-gray-700 flex items-center gap-1.5 font-mono uppercase">
					<Code2 size={14} className="text-gray-500" />
					Request {method} Payload (JSON)
				</span>
				<Button
					size="sm"
					onClick={onExecute}
					disabled={isRunning}
					className="h-7 text-xs font-bold bg-green-600 hover:bg-green-700 text-white px-3 rounded-md gap-1.5 shadow-2xs disabled:opacity-50"
				>
					{isRunning ? (
						<Loader2 size={13} className="animate-spin" />
					) : (
						<Play size={13} />
					)}
					<span>{isRunning ? "Executing..." : "Send Sandbox Request"}</span>
				</Button>
			</div>

			<div className="p-4 flex-1 bg-neutral-50">
				<textarea
					value={payloadJson}
					onChange={(e) => onPayloadChange(e.target.value)}
					disabled={method === "GET"}
					aria-label="Request payload JSON"
					className="w-full h-[320px] font-mono text-xs text-gray-900 bg-white border border-gray-200 rounded-md p-3 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 leading-relaxed resize-none shadow-2xs disabled:bg-gray-100 disabled:text-gray-400"
					spellCheck={false}
				/>
			</div>
		</div>
	);
}
