"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface CompanyInfo {
	companyName: string;
	regNumber: string;
	country: string;
	location: string;
	domain: string;
}

interface CompanyStepProps {
	values: CompanyInfo;
	onChange: (field: keyof CompanyInfo, value: string) => void;
	onNext: () => void;
}

export function CompanyStep({ values, onChange, onNext }: CompanyStepProps) {
	return (
		<div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
			<div className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="companyName">Company Name</Label>
					<Input
						id="companyName"
						value={values.companyName}
						onChange={(e) => onChange("companyName", e.target.value)}
						placeholder="Acme Corporation Ltd"
						className="bg-gray-50 border-gray-200"
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="regNumber">Registration Number</Label>
					<Input
						id="regNumber"
						value={values.regNumber}
						onChange={(e) => onChange("regNumber", e.target.value)}
						placeholder="BN-1234567"
						className="bg-gray-50 border-gray-200"
					/>
				</div>
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="country">Country</Label>
						<Input id="country" value={values.country} onChange={(e) => onChange("country", e.target.value)} placeholder="Kenya" className="bg-gray-50 border-gray-200" />
					</div>
					<div className="space-y-2">
						<Label htmlFor="location">City / Location</Label>
						<Input id="location" value={values.location} onChange={(e) => onChange("location", e.target.value)} placeholder="Nairobi" className="bg-gray-50 border-gray-200" />
					</div>
				</div>
				<div className="space-y-2">
					<Label htmlFor="domain">Company Domain</Label>
					<Input id="domain" value={values.domain} onChange={(e) => onChange("domain", e.target.value)} placeholder="acme.com" className="bg-gray-50 border-gray-200" />
				</div>
			</div>
			<Button onClick={onNext} variant="secondary" className="w-full mt-6 text-white font-semibold shadow-lg gap-2">
				Continue to Profile <ArrowRight size={16} />
			</Button>
		</div>
	);
}
