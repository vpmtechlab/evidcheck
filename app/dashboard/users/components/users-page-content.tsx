"use client";

// Route-level user management implementation.

import React, { useState, useMemo } from "react";
import { UserStatsCards } from "@/components/dashboard/users/user-stats-cards";
import { ViewUserModal } from "@/components/dashboard/users/view-user-modal";
import { EditUserModal } from "@/components/dashboard/users/edit-user-modal";
import { DeleteUserModal } from "@/components/dashboard/users/delete-user-modal";
import { RolePermissionsModal } from "@/components/modals/role-permissions-modal";
import { UserPermissionsModal } from "@/components/modals/user-permissions-modal";
import { useApp } from "@/components/providers/app-provider";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { User } from "@/types/user";
import { getErrorMessage } from "@/lib/utils";
import { getSessionToken } from "@/lib/session-token";
import { UsersHeader } from "./users-header";
import { UsersToolbar } from "./users-toolbar";
import { UsersTable } from "./users-table";
import { UsersPagination } from "./users-pagination";

const ITEMS_PER_PAGE = 10;

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

	const users = useQuery(
		api.users.listUsers,
		member?.companyId
			? {
					sessionToken: getSessionToken() ?? "",
					companyId: member.companyId as Id<"companies">,
					role: roleFilter,
					status: statusFilter,
				}
			: "skip",
	);

	const filteredData = useMemo(() => {
		if (!users) return [];
		const q = searchTerm.toLowerCase();
		return users.filter(
			(row) =>
				row.name.toLowerCase().includes(q) ||
				row.email.toLowerCase().includes(q),
		);
	}, [users, searchTerm]);

	const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
	const currentData = useMemo(() => {
		return filteredData.slice(
			(currentPage - 1) * ITEMS_PER_PAGE,
			currentPage * ITEMS_PER_PAGE,
		);
	}, [filteredData, currentPage]);

	const resetFilters = () => {
		setSearchTerm("");
		setRoleFilter("all");
		setStatusFilter("all");
		setCurrentPage(1);
	};

	const openModal = (user: User, e: React.MouseEvent, open: () => void) => {
		e.stopPropagation();
		setSelectedUser(user);
		open();
	};
	const closeModal = (close: () => void) => {
		close();
		setSelectedUser(null);
	};

	const onDeleteUser = async (user: User) => {
		try {
			await deleteUser({ sessionToken: getSessionToken() ?? "", userId: user.id as Id<"users"> });
			toast.success("User deleted successfully");
			closeModal(() => setShowDeleteModal(false));
		} catch (error) {
			console.error("Failed to delete user:", error);
			toast.error(getErrorMessage(error));
		}
	};

	const onEditUser = async (updatedUser: User) => {
		try {
			const [firstName, ...surnameParts] = updatedUser.name.split(" ");
			await updateUserProfile({
				sessionToken: getSessionToken() ?? "",
				userId: updatedUser.id as Id<"users">,
				firstName: firstName || "",
				surname: surnameParts.join(" ") || "",
				role: updatedUser.role,
				performedBy: (member?.id || member?.userId) as Id<"users">,
			});
			toast.success("User updated successfully");
			closeModal(() => setShowEditModal(false));
		} catch (error) {
			console.error("Failed to update user:", error);
			toast.error(getErrorMessage(error));
		}
	};

	return (
		<div className="flex flex-col gap-6 p-2">
			<UsersHeader
				onRoleSettings={() => setShowRolePermissionsModal(true)}
				onInvite={() => setShowInviteModal(true)}
			/>

			<UserStatsCards />

			<div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-2xs">
				<UsersToolbar
					searchTerm={searchTerm}
					roleFilter={roleFilter}
					statusFilter={statusFilter}
					onSearchChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
					onRoleChange={(v) => { setRoleFilter(v); setCurrentPage(1); }}
					onStatusChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
					onReset={resetFilters}
				/>

				<UsersTable
					loading={users === undefined}
					rows={currentData}
					onView={(u, e) => openModal(u, e, () => setShowViewModal(true))}
					onEdit={(u, e) => openModal(u, e, () => setShowEditModal(true))}
					onPermissions={(u, e) => openModal(u, e, () => setShowUserPermissionsModal(true))}
					onDelete={(u, e) => openModal(u, e, () => setShowDeleteModal(true))}
					onResetFilters={resetFilters}
				/>

				<UsersPagination
					currentPage={currentPage}
					totalPages={totalPages}
					total={filteredData.length}
					itemsPerPage={ITEMS_PER_PAGE}
					onPageChange={setCurrentPage}
				/>
			</div>

			<ViewUserModal
				isOpen={showViewModal}
				onClose={() => closeModal(() => setShowViewModal(false))}
				user={selectedUser}
			/>

			<EditUserModal
				key={selectedUser?.id || "edit-user"}
				isOpen={showEditModal}
				onClose={() => closeModal(() => setShowEditModal(false))}
				user={selectedUser}
				onSave={onEditUser}
			/>

			<DeleteUserModal
				isOpen={showDeleteModal}
				onClose={() => closeModal(() => setShowDeleteModal(false))}
				user={selectedUser}
				onDelete={onDeleteUser}
			/>

			<RolePermissionsModal
				isOpen={showRolePermissionsModal}
				onClose={() => setShowRolePermissionsModal(false)}
			/>

			<UserPermissionsModal
				isOpen={showUserPermissionsModal}
				onClose={() => closeModal(() => setShowUserPermissionsModal(false))}
				user={selectedUser}
			/>
		</div>
	);
}
