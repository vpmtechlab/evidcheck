"use client";

import { Plus } from "lucide-react";

const CHECKS_PER_TOPUP_UNIT = 15;

export function SpendingPowerCard({ balance }: { balance: number | undefined }) {
	const checks = balance ? Math.floor(balance / CHECKS_PER_TOPUP_UNIT) : 0;

	return (
		<div className="bg-navy text-white p-5 rounded-lg shadow-2xs flex flex-col justify-between relative overflow-hidden">
			<div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />

			<div className="relative z-10">
				<h3 className="text-sm font-bold tracking-tight">Spending Power</h3>
				<p className="text-[11px] text-gray-300 mt-0.5 leading-relaxed">
					Estimated checks available at the standard rate.
				</p>
			</div>

			<div className="relative z-10 py-5">
				<div className="flex justify-between items-end border-b border-white/10 pb-3">
					<span className="text-[10px] text-gray-300 uppercase tracking-wider font-bold">Avail. Checks</span>
					<span className="text-3xl font-bold font-mono tracking-tight tabular-nums">
						{balance === undefined ? "—" : checks.toLocaleString()}
					</span>
				</div>
			</div>

			<div className="relative z-10 bg-white/5 border border-white/10 p-3.5 rounded-md">
				<div className="flex items-center gap-1.5 mb-1.5">
					<Plus size={12} className="text-green-300" />
					<p className="text-[10px] uppercase font-bold text-green-300 tracking-wider">Growth Tip</p>
				</div>
				<p className="text-[11px] text-gray-300 leading-relaxed">
					Deposit <span className="text-white font-bold">$500+</span> to unlock custom corporate tiers and bulk verification discounts.
				</p>
			</div>
		</div>
	);
}
