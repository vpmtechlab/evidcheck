"use client";

import { Server } from "lucide-react";

interface ResponsePaneProps {
	status: number;
	output: string;
}

export function ResponsePane({ status, output }: ResponsePaneProps) {
	return (
		<div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-2xs flex flex-col">
			<div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
				<span className="text-xs font-bold text-gray-700 flex items-center gap-1.5 font-mono uppercase">
					<Server size={14} className="text-gray-500" />
					Sandbox Response Payload
				</span>
				<span className="text-[10px] font-mono text-green-700 font-bold bg-green-50 px-2 py-0.5 border border-green-200 rounded-sm">
					HTTP {status} OK
				</span>
			</div>

			<div className="p-4 flex-1 bg-slate-50 overflow-x-auto custom-scrollbar font-mono text-xs leading-relaxed min-h-[320px]">
				<pre className="text-gray-900">
					<code>{output}</code>
				</pre>
			</div>
		</div>
	);
}
