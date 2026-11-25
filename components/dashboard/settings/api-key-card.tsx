"use client";

import { Eye, EyeOff, Copy, Check, RefreshCw, ShieldCheck, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ApiKeyMode = "live" | "test";

interface ApiKeyCardProps {
	mode: ApiKeyMode;
	displayKey: string | null;
	visible: boolean;
	copied: boolean;
	onToggleVisibility: () => void;
	onCopy: () => void;
	onRoll: () => void;
}

const MODE_META: Record<ApiKeyMode, {
	title: string;
	badge: string;
	badgeClass: string;
	iconTile: string;
	icon: React.ReactNode;
	baseUrl: string;
	keyLabel: string;
	masked: string;
}> = {
	live: {
		title: "Production Environment",
		badge: "LIVE BILLABLE",
		badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
		iconTile: "bg-emerald-50 text-emerald-700 border-emerald-200",
		icon: <ShieldCheck size={20} />,
		baseUrl: "https://api.evidcheck.com/v1/verifications",
		keyLabel: "Production Secret Key (evid_live_sk_*)",
		masked: "evid_live_sk_••••••••••••••••••••••••",
	},
	test: {
		title: "Sandbox Environment",
		badge: "TEST / ZERO COST",
		badgeClass: "bg-blue-100 text-blue-800 border-blue-300",
		iconTile: "bg-blue-50 text-blue-700 border-blue-200",
		icon: <FlaskConical size={20} />,
		baseUrl: "https://sandbox.evidcheck.com/v1/sandbox/verifications",
		keyLabel: "Sandbox Test Key (evid_test_sk_*)",
		masked: "evid_test_sk_••••••••••••••••••••••••",
	},
};

export function ApiKeyCard({ mode, displayKey, visible, copied, onToggleVisibility, onCopy, onRoll }: ApiKeyCardProps) {
	const meta = MODE_META[mode];

	return (
		<div className="bg-white p-5 rounded-lg border border-gray-200 shadow-2xs space-y-4">
			<div className="flex items-center gap-3">
				<div className={`p-2 rounded-md border shrink-0 ${meta.iconTile}`}>
					{meta.icon}
				</div>
				<div>
					<div className="flex items-center gap-2 flex-wrap">
						<h3 className="font-bold text-gray-900 text-sm">{meta.title}</h3>
						<span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm border ${meta.badgeClass}`}>
							{meta.badge}
						</span>
					</div>
					<p className="text-[11px] text-gray-500 font-mono mt-0.5">
						Base URL: <code className="text-gray-900 font-bold bg-gray-100 px-1.5 py-0.5 rounded">{meta.baseUrl}</code>
					</p>
				</div>
			</div>

			<div className="space-y-1">
				<label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider font-mono">
					{meta.keyLabel}
				</label>
				<div className="flex items-center gap-2">
					<div className="flex-1 flex items-center justify-between p-2.5 bg-gray-50 rounded-md border border-gray-200 font-mono text-xs text-gray-900 min-w-0">
						<span className="truncate">
							{!displayKey ? "No key on file — roll one to generate" : visible ? displayKey : meta.masked}
						</span>

						{displayKey && (
							<div className="flex items-center gap-1 shrink-0 ml-2">
								<button
									onClick={onToggleVisibility}
									className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md transition-colors"
									title={visible ? "Hide Key" : "Show Key"}
								>
									{visible ? <EyeOff size={15} /> : <Eye size={15} />}
								</button>
								<button
									onClick={onCopy}
									className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md transition-colors"
									title="Copy Key"
								>
									{copied ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}
								</button>
							</div>
						)}
					</div>

					<Button
						variant="outline"
						size="sm"
						onClick={onRoll}
						className="h-9 text-xs font-semibold rounded-md border-gray-300 text-gray-700 hover:bg-gray-50 shrink-0"
					>
						<RefreshCw size={13} className="mr-1.5" /> Roll Key
					</Button>
				</div>
			</div>
		</div>
	);
}
