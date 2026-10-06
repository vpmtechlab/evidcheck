"use client";

import { LogOut } from "lucide-react";

interface SideUserFooterProps {
	firstName: string;
	lastName: string;
	email: string;
	sidebarCollapsed: boolean;
	onLogout: () => void;
}

export function SideUserFooter({
	firstName,
	lastName,
	email,
	sidebarCollapsed,
	onLogout,
}: SideUserFooterProps) {
	return (
		<div className="p-3 border-t border-navy-line">
			{!sidebarCollapsed ? (
				<div className="flex items-center justify-between p-2 bg-white/5 border border-white/10 rounded-md">
					<div className="flex items-center gap-2.5 min-w-0">
						<div className="w-7 h-7 bg-brand text-white rounded-md flex items-center justify-center font-bold text-xs shrink-0">
							{firstName[0] || "A"}
						</div>
						<div className="flex flex-col min-w-0">
							<span className="text-xs font-bold text-white truncate leading-tight">
								{firstName} {lastName}
							</span>
							<span className="text-[10px] text-gray-400 truncate font-mono">
								{email}
							</span>
						</div>
					</div>

					<button
						onClick={onLogout}
						className="text-gray-400 hover:text-red-400 p-1 rounded-md transition-colors shrink-0"
						title="Sign out"
					>
						<LogOut size={16} />
					</button>
				</div>
			) : (
				<div className="flex justify-center">
					<button
						onClick={onLogout}
						className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-md transition-colors"
						title="Sign out"
					>
						<LogOut size={18} />
					</button>
				</div>
			)}
		</div>
	);
}
