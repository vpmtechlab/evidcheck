"use client";

// Route-level user management implementation.

import React, { useState, useMemo } from "react";
import {
	Eye,
	Edit2,
	Trash2,
	Search,
	ChevronLeft,
	ChevronRight,
	UserPlus,
	X,
	Shield,
	Settings2,
} from "lucide-react";
import { UserStatsCards } from "@/components/dashboard/users/user-stats-cards";
import { ViewUserModal } from "@/components/dashboard/users/view-user-modal";
import { EditUserModal } from "@/components/dashboard/users/edit-user-modal";
import { DeleteUserModal } from "@/components/dashboard/users/delete-user-modal";
import { RolePermissionsModal } from "@/components/modals/role-permissions-modal";
import { UserPermissionsModal } from "@/components/modals/user-permissions-modal";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Id } from "@/convex/_generated/dataModel";
import { User } from "@/types/user";
import { getErrorMessage } from "@/lib/utils";

export default function UserManagementPage() {
	const { setShowInviteModal, member } = useApp();
	const [currentPage, setCurrentPage] = useState(1);
	const deleteUser = useMutation(api.users.deleteUser);
	const updateUserProfile = useMutation(api.users.updateUserProfile);

	const [showViewModal, setShowViewModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showRolePermissionsModal, setShowRolePermissionsModal] = useState(false);
	const [showUserPermissionsModal, setShowUserPermissionsModal] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);

	const [searchTerm, setSearchTerm] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const itemsPerPage = 10;

	// Real data from Convex
	const users = useQuery(
		api.users.listUsers,
		member?.companyId
			? {
					companyId: member.companyId as Id<"companies">,
					role: roleFilter,
					status: statusFilter,
				}
			: "skip",
	);

	const filteredData = useMemo(() => {
		if (!users) return [];
		return users.filter(
			(row) =>
				row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				row.email.toLowerCase().includes(searchTerm.toLowerCase()),
		);
	}, [users, searchTerm]);

	const totalPages = Math.ceil(filteredData.length / itemsPerPage);
	const currentData = useMemo(() => {
		return filteredData.slice(
			(currentPage - 1) * itemsPerPage,
			currentPage * itemsPerPage,
		);
	}, [filteredData, currentPage]);

	const handleView = (user: User, e: React.MouseEvent) => {
		e.stopPropagation();
		setSelectedUser(user);
		setShowViewModal(true);
	};

	const handleEdit = (user: User, e: React.MouseEvent) => {
		e.stopPropagation();
		setSelectedUser(user);
		setShowEditModal(true);
	};

	const handleDelete = (user: User, e: React.MouseEvent) => {
		e.stopPropagation();
		setSelectedUser(user);
		setShowDeleteModal(true);
	};

	const handlePermissions = (user: User, e: React.MouseEvent) => {
		e.stopPropagation();
		setSelectedUser(user);
		setShowUserPermissionsModal(true);
	};

	const onDeleteUser = async (user: User) => {
		try {
			await deleteUser({ userId: user.id as Id<"users"> });
			toast.success("User deleted successfully");
			setShowDeleteModal(false);
			setSelectedUser(null);
		} catch (error) {
			console.error("Failed to delete user:", error);
			toast.error(getErrorMessage(error));
		}
	};

	const onEditUser = async (updatedUser: User) => {
		try {
			// Split name into firstName and surname
			const [firstName, ...surnameParts] = updatedUser.name.split(" ");
			const surname = surnameParts.join(" ");

			await updateUserProfile({
				userId: updatedUser.id as Id<"users">,
				firstName: firstName || "",
				surname: surname || "",
				role: updatedUser.role,
				performedBy: (member?.id || member?.userId) as Id<"users">,
			});
			toast.success("User updated successfully");
			setShowEditModal(false);
			setSelectedUser(null);
		} catch (error) {
			console.error("Failed to update user:", error);
			toast.error(getErrorMessage(error));
		}
	};

	const getStatusColor = (status: string) => {
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
	};

	return (
		<div className="p-2 space-y-8 animate-in fade-in duration-500">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 tracking-tight">
						Team Management
					</h1>
					<p className="text-gray-500 mt-1">
						Manage your team members and their access levels.
					</p>
				</div>
				<div className="flex items-center gap-3">
					<Button
						variant="outline"
						onClick={() => setShowRolePermissionsModal(true)}
						className="hidden md:flex h-11 px-4 rounded-xl border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
					>
						<Settings2 className="mr-2 h-4 w-4" /> Role Settings
					</Button>
					<Button
						onClick={() => setShowInviteModal(true)}
						className="bg-[#023e4a] hover:bg-[#034e5d] text-white font-semibold shadow-lg hover:shadow-xl transition-all h-11 px-6 rounded-xl"
					>
						<UserPlus className="mr-2 h-4 w-4" /> Invite New Member
					</Button>
				</div>
			</div>

			<UserStatsCards />

			<div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
				{/* Toolbar */}
				<div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-5 bg-gray-50/50">
					<div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
						<div className="relative w-full sm:w-80 group">
							<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 transition-colors group-focus-within:text-[#023e4a]" />
							<Input
								placeholder="Search by Name or Email..."
								className="pl-10 bg-white border-gray-200 focus:border-[#023e4a] focus:ring-[#023e4a]/10 rounded-xl h-11 shadow-sm"
								value={searchTerm}
								onChange={(e) => {
									setSearchTerm(e.target.value);
									setCurrentPage(1);
								}}
							/>
						</div>

						<div className="flex items-center gap-2">
							<Select
								value={roleFilter}
								onValueChange={(val) => {
									if (val) setRoleFilter(val);
									setCurrentPage(1);
								}}
							>
								<SelectTrigger className="w-[140px] bg-white border-gray-200 rounded-xl h-11 shadow-sm">
									<SelectValue placeholder="User Role" />
								</SelectTrigger>
								<SelectContent className="rounded-xl border-gray-100 shadow-xl">
									<SelectItem value="all">All Roles</SelectItem>
									<SelectItem value="admin">Admin</SelectItem>
									<SelectItem value="user">User</SelectItem>
									<SelectItem value="viewer">Viewer</SelectItem>
								</SelectContent>
							</Select>

							<Select
								value={statusFilter}
								onValueChange={(val) => {
									if (val) setStatusFilter(val);
									setCurrentPage(1);
								}}
							>
								<SelectTrigger className="w-[130px] bg-white border-gray-200 rounded-xl h-11 shadow-sm">
									<SelectValue placeholder="Status" />
								</SelectTrigger>
								<SelectContent className="rounded-xl border-gray-100 shadow-xl">
									<SelectItem value="all">All Status</SelectItem>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="invited">Invited</SelectItem>
									<SelectItem value="disabled">Disabled</SelectItem>
								</SelectContent>
							</Select>

							{(searchTerm ||
								roleFilter !== "all" ||
								statusFilter !== "all") && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => {
										setSearchTerm("");
										setRoleFilter("all");
										setStatusFilter("all");
									}}
									className="text-gray-400 hover:text-red-500 rounded-xl"
								>
									<X className="h-4 w-4 mr-1" /> Clear
								</Button>
							)}
						</div>
					</div>
				</div>

				{/* Table */}
				<div className="overflow-x-auto min-h-[400px]">
					<Table>
						<TableHeader className="bg-gray-50/50">
							<TableRow className="hover:bg-transparent border-gray-100">
								<TableHead className="py-4 font-semibold text-gray-700">
									Member
								</TableHead>
								<TableHead className="py-4 font-semibold text-gray-700">
									Email Address
								</TableHead>
								<TableHead className="py-4 font-semibold text-gray-700">
									Role
								</TableHead>
								<TableHead className="py-4 font-semibold text-gray-700">
									Status
								</TableHead>
								<TableHead className="py-4 font-semibold text-gray-700 text-right">
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{users === undefined ? (
								// Loading state
								Array.from({ length: 5 }).map((_, i) => (
									<TableRow key={i} className="border-gray-50">
										<TableCell>
											<div className="flex items-center gap-3">
												<Skeleton className="h-9 w-9 rounded-full" />
												<Skeleton className="h-4 w-32" />
											</div>
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 w-40" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 w-20" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-6 w-16" />
										</TableCell>
										<TableCell className="text-right">
											<Skeleton className="h-8 w-24 ml-auto" />
										</TableCell>
									</TableRow>
								))
							) : currentData.length > 0 ? (
								currentData.map((row) => (
									<TableRow
										key={row.id}
										className="hover:bg-gray-50/80 transition-colors border-gray-50 cursor-pointer"
										onClick={(e) => handleView(row, e as React.MouseEvent)}
									>
										<TableCell>
											<div className="flex items-center gap-3">
												<span className="font-semibold text-gray-900">
													{row.name}
												</span>
											</div>
										</TableCell>
										<TableCell className="text-gray-600 font-medium">
											{row.email}
										</TableCell>
										<TableCell>
											<Badge
												variant="outline"
												className="bg-white text-gray-600 font-medium border-gray-200 capitalize rounded-lg px-2.5 py-0.5"
											>
												{row.role}
											</Badge>
										</TableCell>
										<TableCell>
											<Badge
												className={`${getStatusColor(row.status)} border rounded-full px-3 py-1 font-semibold text-[10px] uppercase tracking-wider`}
											>
												{row.status}
											</Badge>
										</TableCell>
										<TableCell
											className="text-right"
											onClick={(e) => e.stopPropagation()}
										>
											<div className="flex items-center justify-end gap-1.5">
												<Button
													variant="ghost"
													size="icon"
													onClick={(e) => handleView(row, e)}
													className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
													title="View Details"
												>
													<Eye size={18} />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onClick={(e) => handleEdit(row, e)}
													className="text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
													title="Edit Profile"
												>
													<Edit2 size={18} />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onClick={(e) => handlePermissions(row, e)}
													className="text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all"
													title="Custom Permissions"
												>
													<Shield size={18} />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onClick={(e) => handleDelete(row, e)}
													className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
													title="Remove user"
												>
													<Trash2 size={18} />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={5} className="h-64 text-center">
										<div className="flex flex-col items-center justify-center space-y-3">
											<div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
												<Search className="h-6 w-6 text-gray-400" />
											</div>
											<p className="text-gray-500 font-medium">
												No team members found matched your criteria.
											</p>
											<Button
												variant="outline"
												onClick={() => {
													setSearchTerm("");
													setRoleFilter("all");
													setStatusFilter("all");
												}}
												className="rounded-xl border-gray-200"
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

				{/* Pagination Details */}
				<div className="p-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 bg-gray-50/50">
					<div className="font-medium">
						Showing{" "}
						<span className="text-gray-900">
							{(currentPage - 1) * itemsPerPage + 1}
						</span>{" "}
						to{" "}
						<span className="text-gray-900">
							{Math.min(currentPage * itemsPerPage, filteredData.length)}
						</span>{" "}
						of <span className="text-gray-900">{filteredData.length}</span>{" "}
						entries
					</div>
					<div className="flex items-center gap-3">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
							disabled={currentPage === 1}
							className="h-9 px-3 rounded-xl border-gray-200 bg-white"
						>
							<ChevronLeft className="h-4 w-4 mr-1" /> Previous
						</Button>
						<div className="flex items-center px-4 font-bold text-gray-900">
							{currentPage}{" "}
							<span className="font-medium text-gray-400 mx-2">/</span>{" "}
							{Math.max(1, totalPages)}
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
							disabled={currentPage >= totalPages || totalPages === 0}
							className="h-9 px-3 rounded-xl border-gray-200 bg-white"
						>
							Next <ChevronRight className="h-4 w-4 ml-1" />
						</Button>
					</div>
				</div>
			</div>

			<ViewUserModal
				isOpen={showViewModal}
				onClose={() => {
					setShowViewModal(false);
					setSelectedUser(null);
				}}
				user={selectedUser}
			/>

			<EditUserModal
				key={selectedUser?.id || "edit-user"}
				isOpen={showEditModal}
				onClose={() => {
					setShowEditModal(false);
					setSelectedUser(null);
				}}
				user={selectedUser}
				onSave={onEditUser}
			/>

			<DeleteUserModal
				isOpen={showDeleteModal}
				onClose={() => {
					setShowDeleteModal(false);
					setSelectedUser(null);
				}}
				user={selectedUser}
				onDelete={onDeleteUser}
			/>

			<RolePermissionsModal
				isOpen={showRolePermissionsModal}
				onClose={() => setShowRolePermissionsModal(false)}
			/>

			<UserPermissionsModal
				isOpen={showUserPermissionsModal}
				onClose={() => {
					setShowUserPermissionsModal(false);
					setSelectedUser(null);
				}}
				user={selectedUser}
			/>
		</div>
	);
}
