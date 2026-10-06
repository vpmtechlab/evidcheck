"use client";

import { Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BillingHeader({ onTopUp }: { onTopUp: () => void }) {
	return (
		<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
			<div>
				<h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Billing & FinOps</h1>
				<p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
					<Wallet size={13} className="text-brand" />
					Manage your organization&apos;s credits, spending trends, and transaction history.
				</p>
			</div>

			<Button
				onClick={onTopUp}
				className="bg-brand hover:bg-brand-dark text-white px-4 h-9 text-xs font-bold rounded-md gap-1.5 shadow-2xs"
			>
				<Plus size={15} />
				Top Up Balance
			</Button>
		</div>
	);
}
