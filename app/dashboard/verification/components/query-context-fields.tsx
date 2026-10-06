"use client";

import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export interface CheckTypeOption {
	_id: string;
	slug: string;
	label: string;
}

const countries = [
	{ code: "KE", name: "Kenya (Default)", flag: "🇰🇪" },
	{ code: "UG", name: "Uganda", flag: "🇺🇬" },
	{ code: "TZ", name: "Tanzania", flag: "🇹🇿" },
	{ code: "RW", name: "Rwanda", flag: "🇷🇼" },
	{ code: "NG", name: "Nigeria", flag: "🇳🇬" },
	{ code: "GH", name: "Ghana", flag: "🇬🇭" },
];

interface QueryContextFieldsProps {
	checkTypes: CheckTypeOption[];
	serviceType: string;
	country: string;
	isNationalID: boolean;
	onChange: (field: string, value: string) => void;
}

export function QueryContextFields({ checkTypes, serviceType, country, isNationalID, onChange }: QueryContextFieldsProps) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
			{checkTypes.length > 0 && (
				<div className="space-y-1.5">
					<Label className="text-xs font-semibold text-gray-700">
						{isNationalID ? "Document Type" : "Check Type"}
					</Label>
					<Select
						value={serviceType}
						onValueChange={(val) => onChange("serviceType", val || "")}
					>
						<SelectTrigger className="h-9 rounded-md border-gray-300 text-xs">
							<SelectValue placeholder="Select check type" />
						</SelectTrigger>
						<SelectContent className="rounded-md border-gray-300">
							{checkTypes.map((t) => (
								<SelectItem key={t._id} value={t.slug} className="text-xs">
									{t.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			)}

			<div className="space-y-1.5">
				<Label className="text-xs font-semibold text-gray-700">
					Jurisdiction / Country
				</Label>
				<Select
					value={country}
					onValueChange={(val) => onChange("country", val || "KE")}
				>
					<SelectTrigger className="h-9 rounded-md border-gray-300 text-xs">
						<SelectValue placeholder="Select country" />
					</SelectTrigger>
					<SelectContent className="rounded-md border-gray-300">
						{countries.map((c) => (
							<SelectItem key={c.code} value={c.code} className="text-xs">
								{c.flag} {c.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
