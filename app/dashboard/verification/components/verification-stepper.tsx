"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export interface VerificationStep {
	id: number;
	label: string;
	description: string;
}

interface VerificationStepperProps {
	steps: VerificationStep[];
	currentStep: number;
	stepIndex: number;
	onStepClick: (stepId: number) => void;
}

export function VerificationStepper({ steps, currentStep, stepIndex, onStepClick }: VerificationStepperProps) {
	return (
		<div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs">
			<div className="flex items-center justify-between">
				{steps.map((step, index) => {
					const isActive = step.id === currentStep;
					const isCompleted = index < stepIndex;
					const isClickable = index < stepIndex;

					return (
						<React.Fragment key={step.id}>
							<button
								type="button"
								disabled={!isClickable}
								onClick={() => onStepClick(step.id)}
								className={`flex items-center gap-3 select-none text-left ${
									isClickable ? "cursor-pointer" : "cursor-default"
								}`}
							>
								<motion.div
									animate={{ scale: isActive ? 1.05 : 1 }}
									transition={{ duration: 0.2 }}
									className={`
										w-8 h-8 rounded-md flex items-center justify-center font-mono font-bold text-xs transition-colors
										${
											isCompleted
												? "bg-brand text-white shadow-xs"
												: isActive
													? "bg-navy text-white border-2 border-brand shadow-xs"
													: "bg-gray-100 text-gray-500 border border-gray-200"
										}
									`}
								>
									{isCompleted ? <CheckCircle2 size={16} /> : index + 1}
								</motion.div>

								<div className="hidden sm:block">
									<p
										className={`text-xs font-bold ${
											isActive
												? "text-gray-900"
												: isCompleted
													? "text-brand"
													: "text-gray-500"
										}`}
									>
										{step.label}
									</p>
									<p className="text-[10px] text-gray-400">
										{step.description}
									</p>
								</div>
							</button>

							{index < steps.length - 1 && (
								<div className="flex-1 mx-3 h-0.5 bg-gray-200">
									<motion.div
										className="h-full bg-brand"
										initial={{ width: "0%" }}
										animate={{ width: isCompleted ? "100%" : "0%" }}
										transition={{ duration: 0.3 }}
									/>
								</div>
							)}
						</React.Fragment>
					);
				})}
			</div>
		</div>
	);
}
