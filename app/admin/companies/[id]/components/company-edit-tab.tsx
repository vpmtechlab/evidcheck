"use client";

import { Building2, Globe, Mail, MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export interface CompanyFormValues {
	name: string;
	domain: string;
	status: string;
	country: string;
	location: string;
	supportEmail: string;
}

interface CompanyEditTabProps {
	values: CompanyFormValues;
	isSaving: boolean;
	onChange: (field: keyof CompanyFormValues, value: string) => void;
	onCancel: () => void;
	onSave: () => void;
}

function Field({ id, label, icon, children }: { id: string; label: string; icon?: React.ReactNode; children: React.ReactNode }) {
	return (
		<div className="space-y-1.5">
			<Label htmlFor={id} className="text-xs font-bold text-gray-700">{label}</Label>
			<div className="relative">
				{icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
				{children}
			</div>
		</div>
	);
}

export function CompanyEditTab({ values, isSaving, onChange, onCancel, onSave }: CompanyEditTabProps) {
	const inputClass = "h-9 text-xs rounded-md border-gray-300";

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Field id="comp-name" label="Organization Name" icon={<Building2 className="w-4 h-4" />}>
					<Input
						id="comp-name"
						className={`pl-9 ${inputClass}`}
						value={values.name}
						onChange={(e) => onChange("name", e.target.value)}
						required
					/>
				</Field>
				<Field id="comp-domain" label="Domain Registry" icon={<Globe className="w-4 h-4" />}>
					<Input
						id="comp-domain"
						className={`pl-9 font-mono ${inputClass}`}
						value={values.domain}
						onChange={(e) => onChange("domain", e.target.value)}
						required
					/>
				</Field>
				<Field id="comp-email" label="Technical Support Email" icon={<Mail className="w-4 h-4" />}>
					<Input
						id="comp-email"
						type="email"
						className={`pl-9 font-mono ${inputClass}`}
						value={values.supportEmail}
						onChange={(e) => onChange("supportEmail", e.target.value)}
						required
					/>
				</Field>
				<div className="space-y-1.5">
					<Label htmlFor="comp-status" className="text-xs font-bold text-gray-700">Operational Status</Label>
					<select
						id="comp-status"
						className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs focus-visible:outline-none focus:ring-1 focus:ring-gray-400"
						value={values.status}
						onChange={(e) => onChange("status", e.target.value)}
					>
						<option value="active">Active & Operational</option>
						<option value="inactive">Locked / Inactive</option>
					</select>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="comp-country" className="text-xs font-bold text-gray-700">Registration Country</Label>
					<Input
						id="comp-country"
						className={inputClass}
						value={values.country}
						onChange={(e) => onChange("country", e.target.value)}
						required
					/>
				</div>
				<Field id="comp-location" label="Office Location" icon={<MapPin className="w-4 h-4" />}>
					<Input
						id="comp-location"
						className={`pl-9 ${inputClass}`}
						value={values.location}
						onChange={(e) => onChange("location", e.target.value)}
						required
					/>
				</Field>
			</div>

			<div className="pt-4 border-t border-gray-100 flex justify-end gap-2.5">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={onCancel}
					disabled={isSaving}
					className="h-8 px-4 text-xs font-semibold rounded-md border-gray-300"
				>
					Cancel
				</Button>
				<Button
					onClick={onSave}
					disabled={isSaving}
					size="sm"
					className="gap-1.5 h-8 px-4 text-xs font-semibold rounded-md bg-brand hover:bg-brand-dark text-white shadow-xs disabled:opacity-50"
				>
					{isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
					Save Organization Profile
				</Button>
			</div>
		</div>
	);
}
