"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CrbFieldsProps {
	idNumber: string;
	crbConsent: boolean;
	onChange: (field: string, value: string | boolean) => void;
}

export function CrbFields({ idNumber, crbConsent, onChange }: CrbFieldsProps) {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="space-y-4 pt-2 border-t border-gray-100"
		>
			<div className="space-y-1.5">
				<Label className="text-xs font-semibold text-gray-700">
					Subject National ID / Document Number <span className="text-red-500">*</span>
				</Label>
				<Input
					placeholder="e.g. 31948201"
					value={idNumber}
					onChange={(e) => onChange("idNumber", e.target.value)}
					className="h-9 rounded-md border-gray-300 text-xs font-mono"
					autoFocus
				/>
				<p className="text-[11px] text-gray-500">
					Credit score, listing status, performing & non-performing accounts will be pulled via ID Number.
				</p>
			</div>

			<div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-md flex items-start gap-2.5">
				<input
					type="checkbox"
					id="crb-consent"
					checked={crbConsent}
					onChange={(e) => onChange("crbConsent", e.target.checked)}
					className="mt-0.5 rounded-sm border-purple-400 text-purple-600 focus:ring-0 cursor-pointer"
				/>
				<Label htmlFor="crb-consent" className="text-xs text-purple-900 leading-relaxed cursor-pointer font-normal">
					I confirm that express consent has been obtained from the individual subject to pull their credit report and listing status from Metropol & TransUnion in compliance with CRB Regulations.
				</Label>
			</div>
		</motion.div>
	);
}
