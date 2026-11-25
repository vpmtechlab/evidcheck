"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";

export interface InviteFormValues {
	firstName: string;
	surname: string;
	email: string;
	role: string;
}

interface InviteUserFormProps {
	values: InviteFormValues;
	isLoading: boolean;
	onChange: (field: keyof InviteFormValues, value: string) => void;
	onCancel: () => void;
	onSubmit: () => void;
}

export function InviteUserForm({ values, isLoading, onChange, onCancel, onSubmit }: InviteUserFormProps) {
	const inputClass = "bg-gray-50 border-gray-100 focus:border-brand focus:ring-brand/10";

	return (
		<div className="p-6 space-y-4 bg-white">
			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="firstName" className="text-gray-700 font-medium">
						First Name
					</Label>
					<Input
						id="firstName"
						placeholder="Jane"
						value={values.firstName}
						onChange={(e) => onChange("firstName", e.target.value)}
						required
						disabled={isLoading}
						className={inputClass}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="surname" className="text-gray-700 font-medium">
						Surname
					</Label>
					<Input
						id="surname"
						placeholder="Smith"
						value={values.surname}
						onChange={(e) => onChange("surname", e.target.value)}
						required
						disabled={isLoading}
						className={inputClass}
					/>
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="email" className="text-gray-700 font-medium">
					Email Address
				</Label>
				<Input
					id="email"
					type="email"
					placeholder="jane.smith@company.com"
					value={values.email}
					onChange={(e) => onChange("email", e.target.value)}
					required
					disabled={isLoading}
					className={inputClass}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="role" className="text-gray-700 font-medium">
					Assigned Role
				</Label>
				<Select
					value={values.role}
					onValueChange={(val) => val && onChange("role", val)}
					disabled={isLoading}
				>
					<SelectTrigger className="bg-gray-50 border-gray-100 focus:border-brand focus:ring-brand/10 w-full">
						<SelectValue placeholder="Select a role" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="Admin">Admin</SelectItem>
						<SelectItem value="Compliance Officer">Compliance Officer</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<DialogFooter className="pt-4 gap-4">
				<div className="gap-4">
					<Button
						type="button"
						variant="outline"
						onClick={onCancel}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button onClick={onSubmit} disabled={isLoading}>
						{isLoading ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin mr-2" />{" "}
								Inviting...
							</>
						) : (
							"Send Invitation"
						)}
					</Button>
				</div>
			</DialogFooter>
		</div>
	);
}
