"use client";

import { UserPlus, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UsersHeaderProps {
	onRoleSettings: () => void;
	onInvite: () => void;
}

export function UsersHeader({ onRoleSettings, onInvite }: UsersHeaderProps) {
	return (
		<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
			<div>
				<h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
					Team Management
				</h1>
				<p className="text-xs text-gray-500 mt-0.5">
					Manage your team members and their access levels.
				</p>
			</div>
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					onClick={onRoleSettings}
					className="hidden md:flex h-9 px-3 rounded-md border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold"
				>
					<Settings2 size={14} className="mr-1.5" /> Role Settings
				</Button>
				<Button
					onClick={onInvite}
					className="bg-brand hover:bg-brand-dark text-white text-xs font-semibold h-9 px-3.5 rounded-md gap-1.5 shadow-2xs"
				>
					<UserPlus size={14} className="mr-1" /> Invite New Member
				</Button>
			</div>
		</div>
	);
}
