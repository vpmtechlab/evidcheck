"use client";

interface AdminHeaderProps {
	firstName: string;
}

export function AdminHeader({ firstName }: AdminHeaderProps) {
	return (
		<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200">
			<div>
				<div className="flex items-center gap-2">
					<h1 className="text-xl font-bold text-gray-900 tracking-tight">
						Admin Command Center
					</h1>
					<span className="px-2 py-0.5 bg-navy text-white text-[10px] font-bold uppercase tracking-wider rounded-md">
						Super Admin
					</span>
				</div>
				<p className="text-xs text-gray-500 mt-0.5">
					Welcome back, {firstName}. Real-time monitoring of all tenants, billing, and verification pipelines.
				</p>
			</div>

			<div className="flex items-center gap-2 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-md self-start sm:self-auto">
				<span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
				<span>All Production Registries Connected</span>
			</div>
		</div>
	);
}
