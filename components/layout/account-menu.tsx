"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, Shield } from "lucide-react";
import { IoChevronDown } from "react-icons/io5";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Member } from "@/components/providers/app-provider";

interface AccountMenuProps {
	member: Member | null;
	viewMode: "dashboard" | "admin";
	canSwitchView: boolean;
	onToggleViewMode: () => void;
	onLogout: () => void;
}

export function AccountMenu({ member, viewMode, canSwitchView, onToggleViewMode, onLogout }: AccountMenuProps) {
	const [open, setOpen] = useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-100 p-1 rounded-md transition-colors outline-none">
				<Avatar className="h-7 w-7 rounded-md">
					<AvatarImage src={member?.profile_image_url || ""} />
					<AvatarFallback className="bg-navy text-white font-bold text-xs rounded-md">
						{member?.first_name?.[0] || <User size={14} />}
					</AvatarFallback>
				</Avatar>
				<IoChevronDown className="text-sm text-gray-500" />
			</PopoverTrigger>
			<PopoverContent className="w-56 p-1 rounded-md border border-gray-200 shadow-md bg-white" align="end">
				<div className="flex flex-col space-y-0.5 p-2.5 bg-gray-50 border-b border-gray-100 rounded-t-md">
					<p className="text-xs font-bold text-gray-900 leading-tight">
						{member?.first_name || "Admin"} {member?.last_name || "User"}
					</p>
					<p className="text-[11px] text-gray-500 font-mono truncate">
						{member?.email || "admin@evidcheck.com"}
					</p>
				</div>

				<div className="p-1 space-y-0.5 text-xs">
					<Link
						href="/dashboard/settings"
						onClick={() => setOpen(false)}
						className="flex items-center gap-2 px-2.5 py-1.5 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
					>
						<User className="h-3.5 w-3.5 text-gray-500" />
						<span>Account Settings</span>
					</Link>

					{canSwitchView && (
						<button
							type="button"
							className="w-full flex items-center gap-2 px-2.5 py-1.5 text-blue-600 hover:bg-blue-50 cursor-pointer font-medium rounded-md transition-colors"
							onClick={() => {
								setOpen(false);
								onToggleViewMode();
							}}
						>
							<Shield className="h-3.5 w-3.5 text-blue-600" />
							<span>
								{viewMode === "admin"
									? "Switch to Client View"
									: "Switch to Admin View"}
							</span>
						</button>
					)}

					<button
						type="button"
						className="w-full flex items-center gap-2 px-2.5 py-1.5 text-red-600 hover:bg-red-50 cursor-pointer rounded-md transition-colors"
						onClick={onLogout}
					>
						<span className="h-3.5 w-3.5 flex items-center justify-center font-bold text-xs">⎋</span>
						<span>Sign out</span>
					</button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
