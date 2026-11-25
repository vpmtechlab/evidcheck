"use client";

import { motion } from "framer-motion";
import { Milestone, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TourStep } from "./tour-steps";
import type { TourCoords } from "./tour-spotlight";

interface TourTooltipProps {
	step: TourStep;
	stepIndex: number;
	totalSteps: number;
	coords: TourCoords;
	onSkip: () => void;
	onNext: () => void;
	onPrev: () => void;
}

export function TourTooltip({ step, stepIndex, totalSteps, coords, onSkip, onNext, onPrev }: TourTooltipProps) {
	const isLast = stepIndex === totalSteps - 1;

	return (
		<motion.div
			key={stepIndex}
			initial={{ opacity: 0, scale: 0.92, y: 10 }}
			animate={{
				opacity: 1,
				scale: 1,
				y: 0,
				top: Math.max(
					20,
					step.position === "bottom"
						? coords.top + coords.height + 16
						: step.position === "top"
							? coords.top - 200
							: coords.top + coords.height / 2 - 100
				),
				left: Math.max(
					16,
					Math.min(
						window.innerWidth - 340,
						step.position === "right"
							? coords.left + coords.width + 16
							: step.position === "left"
								? coords.left - 340
								: coords.left + coords.width / 2 - 160
					)
				),
			}}
			className="absolute w-[320px] max-w-[calc(100vw-32px)] bg-white rounded-xl shadow-2xl p-5 pointer-events-auto border border-gray-200 z-[10000]"
		>
			<div className="flex justify-between items-start mb-3">
				<div className="flex items-center gap-1.5 text-brand">
					<Milestone size={18} />
					<span className="text-[11px] font-bold uppercase tracking-wider font-mono">
						Step {stepIndex + 1} of {totalSteps}
					</span>
				</div>
				<button
					onClick={onSkip}
					className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
				>
					<X size={15} />
				</button>
			</div>

			<h3 className="text-sm font-bold text-gray-900 mb-1.5">{step.title}</h3>
			<p className="text-xs text-gray-600 leading-relaxed mb-5">
				{step.content}
			</p>

			<div className="flex justify-between items-center">
				<Button
					variant="ghost"
					size="sm"
					onClick={onSkip}
					className="text-xs text-gray-400 hover:text-gray-600 h-8 px-2"
				>
					Skip Tour
				</Button>

				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={onPrev}
						disabled={stepIndex === 0}
						className="h-8 w-8 p-0 rounded-md"
					>
						<ChevronLeft size={16} />
					</Button>
					<Button
						onClick={onNext}
						className="bg-brand hover:bg-brand-dark text-white rounded-md h-8 px-3.5 text-xs font-semibold shadow-xs"
					>
						{isLast ? "Finish" : "Next Step"}
						{!isLast && (
							<ChevronRight size={16} className="ml-1" />
						)}
					</Button>
				</div>
			</div>
		</motion.div>
	);
}
