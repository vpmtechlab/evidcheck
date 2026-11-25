"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface KraFieldsProps {
	pin: string;
	taxpayerType: string;
	onChange: (field: string, value: string) => void;
}

export function KraFields({ pin, taxpayerType, onChange }: KraFieldsProps) {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="space-y-4 pt-2 border-t border-gray-100"
		>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div className="space-y-1.5">
					<Label className="text-xs font-semibold text-gray-700">
						KRA PIN <span className="text-red-500">*</span>
					</Label>
					<Input
						placeholder="e.g. P051239845X or A001234567Z"
						value={pin}
						onChange={(e) => onChange("pin", e.target.value)}
						className="h-9 rounded-md border-gray-300 text-xs font-mono uppercase"
						autoFocus
					/>
				</div>

				<div className="space-y-1.5">
					<Label className="text-xs font-semibold text-gray-700">
						Taxpayer Type
					</Label>
					<Select
						value={taxpayerType}
						onValueChange={(val) => onChange("taxpayerType", val || "Individual")}
					>
						<SelectTrigger className="h-9 rounded-md border-gray-300 text-xs">
							<SelectValue placeholder="Select type" />
						</SelectTrigger>
						<SelectContent className="rounded-md border-gray-300">
							<SelectItem value="Individual" className="text-xs">Individual Taxpayer</SelectItem>
							<SelectItem value="Company" className="text-xs">Company / Corporate Taxpayer</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
		</motion.div>
	);
}
