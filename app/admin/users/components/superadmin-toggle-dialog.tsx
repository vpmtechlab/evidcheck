"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { ShieldAlert, ShieldOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getSessionToken } from "@/lib/session-token";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export interface SuperAdminTarget {
	_id: Id<"users">;
	firstName: string;
	surname: string;
	email: string;
	companyName: string;
	isSuperAdmin: boolean;
}

interface SuperAdminToggleDialogProps {
	user: SuperAdminTarget | null;
	onClose: () => void;
}

/** Confirms granting or revoking platform superadmin for one user. */
export function SuperAdminToggleDialog({ user, onClose }: SuperAdminToggleDialogProps) {
	const setSuperAdmin = useMutation(api.admin.setUserSuperAdmin);
	const [pending, setPending] = useState(false);

	if (!user) return null;
	const granting = !user.isSuperAdmin;

	const handleConfirm = async () => {
		setPending(true);
		try {
			await setSuperAdmin({
				sessionToken: getSessionToken() ?? "",
				userId: user._id,
				isSuperAdmin: granting,
			});
			toast.success(
				granting
					? `${user.firstName} is now a platform superadmin.`
					: `Superadmin access revoked for ${user.firstName}.`,
			);
			onClose();
		} catch (err) {
			const message =
				err instanceof ConvexError ? String(err.data) : "Could not update superadmin access.";
			toast.error(message);
		} finally {
			setPending(false);
		}
	};

	return (
		<AlertDialog open={!!user} onOpenChange={(open) => !open && onClose()}>
			<AlertDialogContent className="sm:max-w-sm">
				<AlertDialogHeader>
					<AlertDialogTitle>
						{granting ? "Grant superadmin access?" : "Revoke superadmin access?"}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{granting
							? "Superadmins can see and change every company, user, price and payment on the platform."
							: "This user will lose access to the admin console and be signed out."}
					</AlertDialogDescription>
				</AlertDialogHeader>

				<div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-xs">
					<p className="font-bold text-gray-900">
						{user.firstName} {user.surname}
					</p>
					<p className="text-gray-500 font-mono">{user.email}</p>
					<p className="text-gray-500 mt-1">{user.companyName}</p>
				</div>

				<AlertDialogFooter className="flex-row gap-3 justify-between!">
					<AlertDialogCancel className="mt-0 flex-1" disabled={pending}>
						Cancel
					</AlertDialogCancel>
					<Button
						onClick={handleConfirm}
						disabled={pending}
						className={`flex-1 text-white ${granting ? "bg-purple-700 hover:bg-purple-800" : "bg-red-600 hover:bg-red-700"}`}
					>
						{pending ? (
							<Loader2 size={16} className="mr-2 animate-spin" />
						) : granting ? (
							<ShieldAlert size={16} className="mr-2" />
						) : (
							<ShieldOff size={16} className="mr-2" />
						)}
						{granting ? "Grant access" : "Revoke access"}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
