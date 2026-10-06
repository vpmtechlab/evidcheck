"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NationalIdFieldsProps {
	serviceType: string;
	idNumber: string;
	onChange: (field: string, value: string) => void;
}

export function NationalIdFields({ serviceType, idNumber, onChange }: NationalIdFieldsProps) {
	const label =
		serviceType === "passport"
			? "Passport Number"
			: serviceType === "alien_id"
				? "Alien ID / Work Permit Number"
				: "National ID Number";
	const placeholder =
		serviceType === "passport"
			? "e.g. A1234567"
			: serviceType === "alien_id"
				? "e.g. AL-984210"
				: "e.g. 28491023";

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="space-y-4 pt-2 border-t border-gray-100"
		>
			<div className="space-y-1.5">
				<Label className="text-xs font-semibold text-gray-700">
					{label} <span className="text-red-500">*</span>
				</Label>
				<Input
					placeholder={placeholder}
					value={idNumber}
					onChange={(e) => onChange("idNumber", e.target.value)}
					className="h-9 rounded-md border-gray-300 text-xs font-mono"
					autoFocus
				/>
				<p className="text-[11px] text-gray-500">
					Enter the document number. Official full name, DOB, gender & photo match will be retrieved automatically from IPRS.
				</p>
			</div>
		</motion.div>
	);
}
