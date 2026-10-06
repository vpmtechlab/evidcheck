"use client";

import React, { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useApp } from "@/components/providers/app-provider";
import { Id } from "@/convex/_generated/dataModel";
import { getErrorMessage } from "@/lib/utils";
import { isWorkEmail } from "@/lib/work-email";
import { getSessionToken } from "@/lib/session-token";
import { InviteUserForm, type InviteFormValues } from "./invite-user-form";

interface InviteUserModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const EMPTY_FORM: InviteFormValues = {
	email: "",
	firstName: "",
	surname: "",
	role: "Compliance Officer",
};

export default function InviteUserModal({
	isOpen,
	onClose,
}: InviteUserModalProps) {
	const { member } = useApp();
	const inviteUser = useMutation(api.users.inviteUser);
	const sendEmail = useAction(api.emails.sendWelcomeEmail);

	const [form, setForm] = useState<InviteFormValues>(EMPTY_FORM);
	const [isLoading, setIsLoading] = useState(false);

	const handleInvite = async () => {
		if (!member?.companyId) {
			toast.error("Company information missing. Please log in again.");
			return;
		}
		if (!form.email || !form.firstName || !form.surname) {
			toast.error("Please fill in all details.");
			return;
		}
		if (!isWorkEmail(form.email)) {
			toast.error("Please use a work email address. Personal emails (e.g. Gmail, Yahoo) are not permitted.");
			return;
		}

		setIsLoading(true);
		try {
			const result = await inviteUser({
				sessionToken: getSessionToken() ?? "",
				companyId: member.companyId as Id<"companies">,
				firstName: form.firstName,
				surname: form.surname,
				email: form.email,
				role: form.role,
			});

			toast.success("User invited! Sending welcome email...");

			const emailResult = await sendEmail({
				email: form.email,
				firstName: form.firstName,
				tempPassword: result.tempPassword,
				setupToken: result.setupToken,
			});

			if (emailResult.sent) {
				toast.success(`Welcome email sent to ${form.email}`);
			} else {
				toast.warning(`User invited, but email delivery failed: ${emailResult.error}`);
				console.warn("Email failed:", emailResult.error, "Temp Pass was:", result.tempPassword);
			}

			setForm(EMPTY_FORM);
			onClose();
		} catch (error) {
			toast.error(getErrorMessage(error));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => !open && !isLoading && onClose()}
		>
			<DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none rounded-2xl shadow-2xl">
				<div className="bg-secondary p-6 text-white">
					<DialogHeader>
						<DialogTitle className="text-xl font-bold text-white">
							Invite Team Member
						</DialogTitle>
						<DialogDescription className="text-green-50/70">
							Grow your team by inviting a new member. They will receive an
							email with login credentials.
						</DialogDescription>
					</DialogHeader>
				</div>

				<InviteUserForm
					values={form}
					isLoading={isLoading}
					onChange={(field, value) => setForm((prev) => ({ ...prev, [field]: value }))}
					onCancel={onClose}
					onSubmit={handleInvite}
				/>
			</DialogContent>
		</Dialog>
	);
}
