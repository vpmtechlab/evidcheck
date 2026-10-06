"use client";

import { Loader2, User } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface CompanyUser {
	_id: string;
	firstName: string;
	surname: string;
	email: string;
	role: string;
	status: string;
}

export function CompanyUsersTab({ users }: { users: CompanyUser[] | undefined }) {
	if (users === undefined) {
		return (
			<div className="flex justify-center py-12">
				<Loader2 className="w-8 h-8 animate-spin text-brand" />
			</div>
		);
	}

	if (users.length === 0) {
		return (
			<div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
				<User className="w-10 h-10 text-gray-300 mx-auto mb-2" />
				<h3 className="text-xs font-bold text-gray-900">No users found</h3>
				<p className="text-gray-500 text-[11px]">There are no team members registered under this organization.</p>
			</div>
		);
	}

	return (
		<div className="border border-gray-200 rounded-lg overflow-hidden">
			<Table>
				<TableHeader className="bg-gray-50/80 border-b border-gray-200">
					<TableRow>
						<TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider py-2.5">Name</TableHead>
						<TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider py-2.5">Email Address</TableHead>
						<TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider py-2.5">Role</TableHead>
						<TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider py-2.5">Status</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{users.map((user) => (
						<TableRow key={user._id} className="hover:bg-gray-50/40 transition-colors border-b border-gray-100">
							<TableCell className="font-bold text-xs text-gray-900 py-3">
								{user.firstName} {user.surname}
							</TableCell>
							<TableCell className="text-gray-600 font-mono text-xs py-3">{user.email}</TableCell>
							<TableCell className="py-3">
								<span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
									{user.role}
								</span>
							</TableCell>
							<TableCell className="py-3">
								<span className={cn(
									"inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border",
									user.status === "active" ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-700 border-gray-200"
								)}>
									{user.status}
								</span>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
