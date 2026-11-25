"use client";

interface CompanyStats {
	availableBalance: number;
	userCount: number;
	verificationCount: number;
	createdAt: number;
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
	return (
		<div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs space-y-1">
			<p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</p>
			<p className={`text-2xl font-bold font-mono ${accent ? "text-brand" : "text-gray-900"}`}>{value}</p>
		</div>
	);
}

export function CompanyStats({ company }: { company: CompanyStats }) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<StatCard label="Wallet Balance" value={`$${company.availableBalance.toFixed(2)}`} accent />
			<StatCard label="Total Users" value={String(company.userCount)} />
			<StatCard label="Verifications" value={String(company.verificationCount)} />
			<StatCard label="Joined Date" value={new Date(company.createdAt).toLocaleDateString()} />
		</div>
	);
}
