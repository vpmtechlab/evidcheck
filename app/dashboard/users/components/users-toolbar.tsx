"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface UsersToolbarProps {
	searchTerm: string;
	roleFilter: string;
	statusFilter: string;
	onSearchChange: (value: string) => void;
	onRoleChange: (value: string) => void;
	onStatusChange: (value: string) => void;
	onReset: () => void;
}

export function UsersToolbar({
	searchTerm,
	roleFilter,
	statusFilter,
	onSearchChange,
	onRoleChange,
	onStatusChange,
	onReset,
}: UsersToolbarProps) {
	const hasActiveFilters =
		searchTerm !== "" || roleFilter !== "all" || statusFilter !== "all";

	return (
		<div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-50/50">
			<div className="relative w-full sm:w-72">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
				<Input
					placeholder="Search by name or email…"
					aria-label="Search team members"
					className="pl-9 bg-white border-gray-200 h-9 text-xs"
					value={searchTerm}
					onChange={(e) => onSearchChange(e.target.value)}
				/>
			</div>

			<div className="flex items-center gap-2 flex-wrap">
				<Select value={roleFilter} onValueChange={(v) => v && onRoleChange(v)}>
					<SelectTrigger aria-label="Filter by role" className="w-[130px] bg-white border-gray-200 h-9 text-xs rounded-md">
						<SelectValue placeholder="Role" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Roles</SelectItem>
						<SelectItem value="admin">Admin</SelectItem>
						<SelectItem value="user">User</SelectItem>
						<SelectItem value="viewer">Viewer</SelectItem>
					</SelectContent>
				</Select>

				<Select value={statusFilter} onValueChange={(v) => v && onStatusChange(v)}>
					<SelectTrigger aria-label="Filter by status" className="w-[130px] bg-white border-gray-200 h-9 text-xs rounded-md">
						<SelectValue placeholder="Status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Status</SelectItem>
						<SelectItem value="active">Active</SelectItem>
						<SelectItem value="invited">Invited</SelectItem>
						<SelectItem value="disabled">Disabled</SelectItem>
					</SelectContent>
				</Select>

				{hasActiveFilters && (
					<Button
						variant="ghost"
						size="sm"
						onClick={onReset}
						className="text-gray-400 hover:text-red-500 h-8 text-xs"
					>
						<X size={14} className="mr-1" /> Clear
					</Button>
				)}
			</div>
		</div>
	);
}
