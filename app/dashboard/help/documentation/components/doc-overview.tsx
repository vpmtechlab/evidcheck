"use client";

import React from "react";
import { Key, AlertCircle, ShieldCheck, Copy, Check, FlaskConical, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocOverviewProps {
	apiKey: string;
	copiedKey: boolean;
	onCopyKey: () => void;
}

export function DocOverview({ apiKey, copiedKey, onCopyKey }: DocOverviewProps) {
	return (
		<div className="space-y-8">
			{/* Base URLs & Environment Separation */}
			<div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 shadow-2xs">
				<div className="flex items-center gap-2">
					<Globe size={18} className="text-[#188015]" />
					<h2 className="text-base font-bold text-gray-900 tracking-tight">
						Environments & Base Endpoints
					</h2>
				</div>
				<p className="text-xs text-gray-600 leading-relaxed">
					EvidCheck provides isolated environments for Live Production and Sandbox Testing. Test keys cannot be used on Production, and Live keys cannot be used on Sandbox.
				</p>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-md space-y-2">
						<div className="flex items-center justify-between">
							<span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
								<ShieldCheck size={15} className="text-emerald-700" />
								Production Environment
							</span>
							<span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
								LIVE
							</span>
						</div>
						<p className="text-[11px] font-mono text-gray-800 font-bold bg-white p-2 rounded border border-emerald-200">
							https://api.evidcheck.com/v1/verifications
						</p>
						<p className="text-[11px] text-gray-600">Requires <code className="font-mono text-gray-900">evid_live_sk_*</code> key. Charges wallet balance.</p>
					</div>

					<div className="p-4 bg-blue-50/50 border border-blue-200 rounded-md space-y-2">
						<div className="flex items-center justify-between">
							<span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
								<FlaskConical size={15} className="text-blue-700" />
								Sandbox Test Environment
							</span>
							<span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
								SANDBOX
							</span>
						</div>
						<p className="text-[11px] font-mono text-gray-800 font-bold bg-white p-2 rounded border border-blue-200">
							https://sandbox.evidcheck.com/v1/sandbox/verifications
						</p>
						<p className="text-[11px] text-gray-600">Requires <code className="font-mono text-gray-900">evid_test_sk_*</code> key. Zero billing charge.</p>
					</div>
				</div>
			</div>

			{/* Authentication & Headers */}
			<div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 shadow-2xs">
				<div className="flex items-center gap-2">
					<Key size={18} className="text-[#188015]" />
					<h2 className="text-base font-bold text-gray-900 tracking-tight">
						Authentication Headers
					</h2>
				</div>
				<p className="text-xs text-gray-600 leading-relaxed">
					All API requests must be authenticated by sending your Secret API Key in the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-900 font-mono">x-api-key</code> request header or as a Bearer Token.
				</p>

				<div className="bg-gray-50 border border-gray-200 rounded-md p-4 space-y-3 font-mono text-xs">
					<div className="flex items-center justify-between">
						<span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Your Active Secret Key:</span>
						<Button
							variant="ghost"
							size="sm"
							onClick={onCopyKey}
							className="h-6 px-2 text-[11px] text-[#188015] hover:bg-[#188015]/10 rounded font-semibold gap-1"
						>
							{copiedKey ? <Check size={12} /> : <Copy size={12} />}
							<span>{copiedKey ? "Copied" : "Copy Key"}</span>
						</Button>
					</div>
					<div className="p-2.5 bg-gray-900 text-green-400 rounded-md font-bold text-xs select-all truncate">
						{apiKey}
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
					<div className="p-3 bg-gray-50 border border-gray-200 rounded-md space-y-1">
						<span className="font-bold text-gray-900 font-mono">x-api-key</span>
						<p className="text-gray-500 text-[11px]">Pass your secret API key directly as an HTTP header.</p>
					</div>
					<div className="p-3 bg-gray-50 border border-gray-200 rounded-md space-y-1">
						<span className="font-bold text-gray-900 font-mono">Content-Type: application/json</span>
						<p className="text-gray-500 text-[11px]">All request payloads must be valid JSON objects.</p>
					</div>
				</div>
			</div>

			{/* HTTP Status Codes */}
			<div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 shadow-2xs">
				<div className="flex items-center gap-2">
					<AlertCircle size={18} className="text-amber-600" />
					<h2 className="text-base font-bold text-gray-900 tracking-tight">
						HTTP Status Codes & Resolution
					</h2>
				</div>

				<div className="border border-gray-200 rounded-md overflow-hidden text-xs">
					<table className="w-full text-left border-collapse">
						<thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold">
							<tr>
								<th className="p-3 border-r border-gray-200">Status</th>
								<th className="p-3 border-r border-gray-200">Code</th>
								<th className="p-3">Description & Resolution</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200 font-mono text-[11px]">
							<tr className="hover:bg-gray-50/50">
								<td className="p-3 font-bold text-green-700 border-r border-gray-200">201 Created</td>
								<td className="p-3 font-bold text-gray-900 border-r border-gray-200">VERIFICATION_SUCCESS</td>
								<td className="p-3 text-gray-600 font-sans">Query executed cleanly. Results returned in payload.</td>
							</tr>
							<tr className="hover:bg-gray-50/50">
								<td className="p-3 font-bold text-amber-700 border-r border-gray-200">400 Bad Request</td>
								<td className="p-3 font-bold text-gray-900 border-r border-gray-200">MISSING_PARAMETER</td>
								<td className="p-3 text-gray-600 font-sans">Required fields missing in request body.</td>
							</tr>
							<tr className="hover:bg-gray-50/50">
								<td className="p-3 font-bold text-rose-700 border-r border-gray-200">401 Unauthorized</td>
								<td className="p-3 font-bold text-gray-900 border-r border-gray-200">INVALID_API_KEY</td>
								<td className="p-3 text-gray-600 font-sans">API Key missing or invalid. Check <code className="bg-gray-100 px-1 rounded">x-api-key</code> header.</td>
							</tr>
							<tr className="hover:bg-gray-50/50">
								<td className="p-3 font-bold text-rose-700 border-r border-gray-200">403 Forbidden</td>
								<td className="p-3 font-bold text-gray-900 border-r border-gray-200">WRONG_ENVIRONMENT</td>
								<td className="p-3 text-gray-600 font-sans">Test key used on Production endpoint, or Live key used on Sandbox URL.</td>
							</tr>
							<tr className="hover:bg-gray-50/50">
								<td className="p-3 font-bold text-rose-700 border-r border-gray-200">402 Payment Required</td>
								<td className="p-3 font-bold text-gray-900 border-r border-gray-200">INSUFFICIENT_BALANCE</td>
								<td className="p-3 text-gray-600 font-sans">Wallet balance low. Top up balance via billing dashboard.</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
