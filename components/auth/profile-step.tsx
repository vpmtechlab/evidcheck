"use client";

import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ProfileInfo {
	firstName: string;
	surname: string;
	email: string;
}

interface ProfileStepProps {
	values: ProfileInfo;
	isLoading: boolean;
	onChange: (field: keyof ProfileInfo, value: string) => void;
	onBack: () => void;
	onSubmit: () => void;
}

export function ProfileStep({ values, isLoading, onChange, onBack, onSubmit }: ProfileStepProps) {
	return (
		<div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
			<button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-2">
				<ArrowLeft size={14} /> Back to Company
			</button>
			<div className="space-y-4">
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="firstName">First Name</Label>
						<Input id="firstName" value={values.firstName} onChange={(e) => onChange("firstName", e.target.value)} placeholder="John" className="bg-gray-50 border-gray-200" />
					</div>
					<div className="space-y-2">
						<Label htmlFor="surname">Surname</Label>
						<Input id="surname" value={values.surname} onChange={(e) => onChange("surname", e.target.value)} placeholder="Doe" className="bg-gray-50 border-gray-200" />
					</div>
				</div>
				<div className="space-y-2">
					<Label htmlFor="email">Work Email</Label>
					<div className="relative">
						<Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
						<Input id="email" type="email" value={values.email} onChange={(e) => onChange("email", e.target.value)} placeholder="john@company.com" className="bg-gray-50 border-gray-200 pl-9" />
					</div>
				</div>
			</div>
			<Button onClick={onSubmit} disabled={isLoading} variant="secondary" className="w-full mt-6 text-white font-semibold shadow-lg gap-2">
				{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Verification Code"}
			</Button>
		</div>
	);
}
