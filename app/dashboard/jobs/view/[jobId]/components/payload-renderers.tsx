"use client";

import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { formatKey } from "./job-display";

export function DirectorsTable({ directors }: { directors: Array<Record<string, string>> }) {
	return (
		<div className="overflow-x-auto rounded-md border border-gray-200">
			<table className="w-full text-xs text-left">
				<thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold uppercase tracking-wider font-mono text-[10px]">
					<tr>
						<th className="px-3.5 py-2.5">Name</th>
						<th className="px-3.5 py-2.5">ID Number</th>
						<th className="px-3.5 py-2.5">Nationality</th>
						<th className="px-3.5 py-2.5">Role / Position</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-gray-100 font-mono text-[11px]">
					{directors.map((d, i) => (
						<tr key={i} className="hover:bg-gray-50/60">
							<td className="px-3.5 py-2.5 font-bold text-gray-900 font-sans">{d.name}</td>
							<td className="px-3.5 py-2.5 text-gray-700">{d.idNumber}</td>
							<td className="px-3.5 py-2.5 text-gray-600">{d.nationality}</td>
							<td className="px-3.5 py-2.5 text-gray-700 font-semibold">{d.role ?? "Director"}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export function DataRow({ label, value }: { label: string; value: unknown }) {
	const SKIP_KEYS = ["verificationStatus", "verificationMessage", "checks", "directors", "watchlistsChecked"];
	if (SKIP_KEYS.includes(label)) return null;

	let display: React.ReactNode;
	if (typeof value === "boolean") {
		display = (
			<span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold ${value ? "bg-green-100 text-green-800 border border-green-300" : "bg-red-100 text-red-800 border border-red-300"}`}>
				{value ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
				{value ? "YES" : "NO"}
			</span>
		);
	} else if (typeof value === "object" && value !== null) {
		display = (
			<span className="text-gray-700 font-mono text-[11px] bg-gray-100 px-2 py-0.5 rounded-xs border border-gray-200">
				{JSON.stringify(value)}
			</span>
		);
	} else {
		display = <span className="font-bold text-gray-900">{String(value ?? "N/A")}</span>;
	}

	return (
		<div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 text-xs">
			<span className="text-gray-500 font-medium">{formatKey(label)}:</span>
			<div className="text-right">{display}</div>
		</div>
	);
}
