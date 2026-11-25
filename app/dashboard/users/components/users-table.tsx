"use client";

import React from "react";
import { Eye, Edit2, Trash2, Shield, Search } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from "@/types/user";

export function getUserStatusStyle(status: string): string {
	switch (status.toLowerCase()) {
		case "active":
			return "bg-green-100 text-green-700 border-green-200";
		case "invited":
			return "bg-orange-100 text-orange-700 border-orange-200";
		case "inactive":
			return "bg-gray-100 text-gray-700 border-gray-200";
		case "disabled":
			return "bg-red-100 text-red-700 border-red-200";
		default:
			return "bg-blue-100 text-blue-700 border-blue-200";
	}
}

interface UsersTableProps {
	loading: boolean;
	rows: User[];
	onView: (user: User, e: React.MouseEvent) => void;
	onEdit: (user: User, e: React.MouseEvent) => void;
	onPermissions: (user: User, e: React.MouseEvent) => void;
	onDelete: (user: User, e: React.MouseEvent) => void;
	onResetFilters: () => void;
}

function LoadingRows() {
	return (
		<>
			{Array.from({ length: 5 }).map((_, i) => (
				<TableRow key={i} className="border-gray-50">
					<TableCell>
						<div className="flex items-center gap-3">
							<Skeleton className="h-9 w-9 rounded-full" />
							<Skeleton className="h-4 w-32" />
						</div>
					</TableCell>
					<TableCell><Skeleton className="h-4 w-40" /></TableCell>
					<TableCell><Skeleton className="h-4 w-20" /></TableCell>
					<TableCell><Skeleton className="h-6 w-16" /></TableCell>
					<TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
				</TableRow>
			))}
		</>
	);
}

export function UsersTable({ loading, rows, onView, onEdit, onPermissions, onDelete, onResetFilters }: UsersTableProps) {
	return (
		<div className="overflow-x-auto min-h-[320px]">
			<Table>
				<TableHeader className="bg-gray-50/80 border-b border-gray-200">
					<TableRow>
						<TableHead className="font-bold text-gray-700">Member</TableHead>
						<TableHead className="font-bold text-gray-700">Email Address</TableHead>
						<TableHead className="font-bold text-gray-700">Role</TableHead>
						<TableHead className="font-bold text-gray-700">Status</TableHead>
						<TableHead className="font-bold text-gray-700 text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{loading ? (
						<LoadingRows />
					) : rows.length > 0 ? (
						rows.map((row) => (
							<TableRow
								key={row.id}
								tabIndex={0}
								role="link"
								className="hover:bg-gray-50/80 transition-colors cursor-pointer focus-visible:outline-none focus-visible:bg-gray-50/80"
								onClick={(e) => onView(row, e as React.MouseEvent)}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										onView(row, e as unknown as React.MouseEvent);
									}
								}}
							>
								<TableCell className="font-semibold text-gray-900">
									{row.name}
								</TableCell>
								<TableCell className="text-gray-600 font-medium text-xs">
									{row.email}
								</TableCell>
								<TableCell>
									<Badge
										variant="outline"
										className="bg-white text-gray-600 font-medium border-gray-200 capitalize rounded-md px-2 py-0.5 text-[11px]"
									>
										{row.role}
									</Badge>
								</TableCell>
								<TableCell>
									<Badge
										className={`${getUserStatusStyle(row.status)} border rounded-full px-2.5 py-0.5 font-bold text-[10px] uppercase tracking-wider`}
									>
										{row.status}
									</Badge>
								</TableCell>
								<TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
									<div className="flex items-center justify-end gap-1">
										{(
											[
												{ icon: Eye, title: "View Details", hover: "hover:text-indigo-600 hover:bg-indigo-50", handler: onView },
												{ icon: Edit2, title: "Edit Profile", hover: "hover:text-amber-600 hover:bg-amber-50", handler: onEdit },
												{ icon: Shield, title: "Custom Permissions", hover: "hover:text-green-600 hover:bg-green-50", handler: onPermissions },
												{ icon: Trash2, title: "Remove user", hover: "hover:text-red-600 hover:bg-red-50", handler: onDelete },
											] as const
										).map((action) => (
											<Button
												key={action.title}
												variant="ghost"
												size="icon"
												onClick={(e) => action.handler(row, e)}
												className={`text-gray-400 ${action.hover} rounded-md transition-colors h-8 w-8`}
												title={action.title}
											>
												<action.icon size={16} />
											</Button>
										))}
									</div>
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={5} className="h-56 text-center">
								<div className="flex flex-col items-center justify-center space-y-3">
									<div className="w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center">
										<Search size={20} className="text-gray-400" />
									</div>
									<p className="text-xs text-gray-500 font-medium">
										No team members match your filters.
									</p>
									<Button
										variant="outline"
										size="sm"
										onClick={onResetFilters}
										className="rounded-md border-gray-300 text-xs"
									>
										Reset Filters
									</Button>
								</div>
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
