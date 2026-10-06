"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface KybFieldsProps {
	companyNumber: string;
	onChange: (field: string, value: string) => void;
}

export function KybFields({ companyNumber, onChange }: KybFieldsProps) {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="space-y-4 pt-2 border-t border-gray-100"
		>
			<div className="space-y-1.5">
				<Label className="text-xs font-semibold text-gray-700">
					Company / Registration Certificate Number <span className="text-red-500">*</span>
				</Label>
				<Input
					placeholder="e.g. PVT-2022/94821 or CPR/2021/89421"
					value={companyNumber}
					onChange={(e) => onChange("companyNumber", e.target.value)}
					className="h-9 rounded-md border-gray-300 text-xs font-mono"
					autoFocus
				/>
				<p className="text-[11px] text-gray-500">
					Enter the official BRS registration or incorporation number. Business details & directors will be retrieved automatically.
				</p>
			</div>
		</motion.div>
	);
}
