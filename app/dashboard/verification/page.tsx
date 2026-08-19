"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Shield, CheckCircle2 } from "lucide-react";
import {
	ChooseService,
	ServiceType,
	ServiceAction,
} from "./components/choose-service";
import { SelectAction } from "./components/select-action";
import { FillDetails } from "./components/fill-details";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
	{ id: 1, label: "Choose Service", description: "Select from 4 core channels" },
	{ id: 2, label: "Select Scope", description: "Choose action depth" },
	{ id: 3, label: "Verification Query", description: "Enter ID/Number & execute" },
];

function VerificationFlow() {
	const [currentStep, setCurrentStep] = useState(1);
	const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
	const [selectedAction, setSelectedAction] = useState<ServiceAction | null>(null);

	const router = useRouter();
	const searchParams = useSearchParams();
	const serviceParam = searchParams.get("service");

	const services = useQuery(api.services.list);

	// Auto-select service if passed via URL query parameter (e.g. ?service=business_registration)
	useEffect(() => {
		if (serviceParam && services && services.length > 0) {
			const matched = services.find(
				(s) => s.slug === serviceParam || s.slug.includes(serviceParam)
			);
			if (matched) {
				setSelectedService(matched as ServiceType);
				const defaultAction = matched.actions?.[0] || {
					_id: "default_act",
					label: "Execute Verification Check",
					slug: matched.slug,
					enabled: true,
				};
				setSelectedAction(defaultAction);
				setCurrentStep(3);
			}
		}
	}, [serviceParam, services]);

	const handleSelectService = (service: ServiceType) => {
		setSelectedService(service);
		const defaultAction = service.actions?.[0] || {
			_id: "default_act",
			label: "Execute Verification Check",
			slug: service.slug,
			enabled: true,
		};
		setSelectedAction(defaultAction);
		setCurrentStep(3);
	};

	const handleSelectAction = (action: ServiceAction) => {
		setSelectedAction(action);
		setCurrentStep(3);
	};

	const handleSubmit = (data: Record<string, unknown>) => {
		if (data.jobId) {
			router.push(`/dashboard/jobs/view/${data.jobId}`);
		} else {
			setCurrentStep(1);
			setSelectedService(null);
			setSelectedAction(null);
		}
	};

	const handleGoBack = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleStepClick = (stepId: number) => {
		if (stepId < currentStep) {
			setCurrentStep(stepId);
			if (stepId === 1) {
				setSelectedService(null);
				setSelectedAction(null);
			} else if (stepId === 2) {
				setSelectedAction(null);
			}
		}
	};

	return (
		<div className="flex flex-col gap-6 max-w-5xl mx-auto">
			{/* Top Header Banner */}
			<motion.div 
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				style={{ backgroundColor: "#0e1b42", color: "#ffffff" }}
				className="p-6 border-b-2 border-[#188015] rounded-lg shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
			>
				<div className="flex items-center gap-3.5">
					<div 
						style={{ backgroundColor: "#188015", color: "#ffffff" }}
						className="p-2.5 rounded-md shrink-0 shadow-xs"
					>
						<Shield size={24} />
					</div>
					<div>
						<h1 className="text-lg md:text-xl font-bold tracking-tight text-white">
							Identity & Compliance Verification
						</h1>
						<p className="text-gray-300 text-xs mt-0.5">
							Direct validation against BRS, IPRS, KRA iTax & CRB Databases
						</p>
					</div>
				</div>

				<div 
					style={{ backgroundColor: "rgba(255, 255, 255, 0.12)" }}
					className="flex items-center gap-2 px-3 py-1 text-xs font-mono font-medium text-white rounded-md shrink-0"
				>
					<span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
					<span>4 Core Verification Services</span>
				</div>
			</motion.div>

			{/* Stepper Header */}
			<div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs">
				<div className="flex items-center justify-between">
					{steps.map((step, index) => {
						const isActive = step.id === currentStep;
						const isCompleted = step.id < currentStep;
						const isClickable = step.id < currentStep;

						return (
							<React.Fragment key={step.id}>
								<div
									onClick={() => isClickable && handleStepClick(step.id)}
									className={`flex items-center gap-3 select-none ${
										isClickable ? "cursor-pointer" : ""
									}`}
								>
									<motion.div
										animate={{
											scale: isActive ? 1.05 : 1,
										}}
										transition={{ duration: 0.2 }}
										className={`
											w-8 h-8 rounded-md flex items-center justify-center font-mono font-bold text-xs transition-colors
											${
												isCompleted
													? "bg-[#188015] text-white shadow-xs"
													: isActive
														? "bg-[#0e1b42] text-white border-2 border-[#188015] shadow-xs"
														: "bg-gray-100 text-gray-500 border border-gray-200"
											}
										`}
									>
										{isCompleted ? <CheckCircle2 size={16} /> : step.id}
									</motion.div>

									<div className="hidden sm:block">
										<p
											className={`text-xs font-bold ${
												isActive
													? "text-gray-900"
													: isCompleted
														? "text-[#188015]"
														: "text-gray-500"
											}`}
										>
											{step.label}
										</p>
										<p className="text-[10px] text-gray-400">
											{step.description}
										</p>
									</div>
								</div>

								{index < steps.length - 1 && (
									<div className="flex-1 mx-3 h-0.5 bg-gray-200">
										<motion.div
											className="h-full bg-[#188015]"
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

			{/* Main Step Content with Animated Step Transitions */}
			<div className="bg-white border border-gray-200 p-6 shadow-2xs rounded-lg overflow-hidden">
				<AnimatePresence mode="wait">
					{currentStep === 1 && (
						<motion.div
							key="step-1"
							initial={{ opacity: 0, x: -12 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 12 }}
							transition={{ duration: 0.2 }}
						>
							<ChooseService
								onSelectService={handleSelectService}
								selectedSlug={selectedService?.slug}
							/>
						</motion.div>
					)}

					{currentStep === 2 && selectedService && (
						<motion.div
							key="step-2"
							initial={{ opacity: 0, x: -12 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 12 }}
							transition={{ duration: 0.2 }}
						>
							<SelectAction
								service={selectedService}
								onSelectAction={handleSelectAction}
								onGoBack={handleGoBack}
							/>
						</motion.div>
					)}

					{currentStep === 3 && selectedService && selectedAction && (
						<motion.div
							key="step-3"
							initial={{ opacity: 0, x: -12 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 12 }}
							transition={{ duration: 0.2 }}
						>
							<FillDetails
								service={selectedService}
								action={selectedAction}
								onSubmit={handleSubmit}
								onGoBack={handleGoBack}
							/>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}

export default function VerificationPage() {
	return (
		<Suspense fallback={<div className="p-8 text-center text-xs text-gray-400">Loading verification suite...</div>}>
			<VerificationFlow />
		</Suspense>
	);
}
