"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface PasswordFields {
	current: string;
	new: string;
	confirm: string;
}

interface ChangePasswordCardProps {
	passwords: PasswordFields;
	loading: boolean;
	onChange: (field: keyof PasswordFields, value: string) => void;
	onSubmit: () => void;
}

export function ChangePasswordCard({ passwords, loading, onChange, onSubmit }: ChangePasswordCardProps) {
	const fields = [
		{ id: "current-password", key: "current", label: "Current Password", placeholder: "Enter current password" },
		{ id: "new-password", key: "new", label: "New Password", placeholder: "Enter new password" },
		{ id: "confirm-password", key: "confirm", label: "Confirm New Password", placeholder: "Confirm new password" },
	] as const;

	return (
		<div>
			<h3 className="text-lg font-bold text-gray-900 mb-4">
				Change Password
			</h3>
			<div className="max-w-md space-y-4">
				{fields.map((field) => (
					<div key={field.id} className="space-y-2">
						<Label htmlFor={field.id}>{field.label}</Label>
						<Input
							id={field.id}
							type="password"
							placeholder={field.placeholder}
							value={passwords[field.key]}
							onChange={(e) => onChange(field.key, e.target.value)}
						/>
					</div>
				))}
			</div>
			<div className="mt-6">
				<Button
					onClick={onSubmit}
					disabled={loading}
					className="bg-secondary hover:bg-gray-800 text-white w-full sm:w-auto"
				>
					{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Update Password
				</Button>
			</div>
		</div>
	);
}
