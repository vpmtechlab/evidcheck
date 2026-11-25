"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";

interface SubmitBarProps {
	isLoading: boolean;
	canSubmit: boolean;
	activeFee: number;
	onBack: () => void;
	onSubmit: () => void;
}

export function SubmitBar({ isLoading, canSubmit, activeFee, onBack, onSubmit }: SubmitBarProps) {
	return (
		<div className="flex items-center justify-between pt-2">
			<Button
				onClick={onBack}
				variant="outline"
				disabled={isLoading}
				className="h-9 px-4 text-xs font-semibold rounded-md border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
			>
				<ArrowLeft size={14} />
				<span>Back</span>
			</Button>

			<motion.div whileHover={{ scale: canSubmit && !isLoading ? 1.02 : 1 }} whileTap={{ scale: 0.98 }}>
				<Button
					onClick={onSubmit}
					disabled={isLoading || !canSubmit}
					className="bg-brand hover:bg-brand-dark text-white text-xs font-bold h-9 px-6 rounded-md flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
				>
					{isLoading ? (
						<>
							<Loader2 size={14} className="animate-spin" />
							<span>Querying Registry Node...</span>
						</>
					) : (
						<>
							<span>Execute Check (${activeFee.toFixed(2)})</span>
							<ArrowRight size={14} />
						</>
					)}
				</Button>
			</motion.div>
		</div>
	);
}
