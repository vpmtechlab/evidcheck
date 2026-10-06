"use client";

import React, { useState, useEffect, Suspense } from "react";
import {
	ChooseService,
	ServiceType,
	ServiceAction,
} from "./components/choose-service";
import { SelectAction } from "./components/select-action";
import { FillDetails } from "./components/fill-details";
import { VerificationBanner } from "./components/verification-banner";
import { VerificationStepper, type VerificationStep } from "./components/verification-stepper";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";

const STEPS_BASE: VerificationStep[] = [
	{ id: 1, label: "Choose Service", description: "Select from 4 core channels" },
	{ id: 2, label: "Select Scope", description: "Choose action depth" },
	{ id: 3, label: "Verification Query", description: "Enter ID/Number & execute" },
];

/** The scope step only exists for services with more than one enabled action. */
function serviceNeedsScope(service: ServiceType | null): boolean {
	return (service?.actions?.filter((a) => a.enabled).length ?? 0) > 1;
}

function defaultActionFor(service: ServiceType): ServiceAction {
	return service.actions?.[0] || {
		_id: "default_act",
		label: "Execute Verification Check",
		slug: service.slug,
		enabled: true,
	};
}

function VerificationFlow() {
	const [currentStep, setCurrentStep] = useState(1);
	const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
	const [selectedAction, setSelectedAction] = useState<ServiceAction | null>(null);

	const router = useRouter();
	const searchParams = useSearchParams();
	const serviceParam = searchParams.get("service");

	const services = useQuery(api.services.list);

	// Auto-select service from ?service= deep links. Applies until a service
	// is chosen (guarding on selectedService rather than a ref, so a reactive
	// re-fetch of `services` can't cancel the pending update).
	useEffect(() => {
		if (!serviceParam || !services || services.length === 0) return;
		if (selectedService) return;
		const matched = services.find(
			(s) => s.slug === serviceParam || s.slug.includes(serviceParam)
		);
		if (!matched) return;
		const matchedService = matched as ServiceType;
		const timer = setTimeout(() => {
			setSelectedService(matchedService);
			setSelectedAction(defaultActionFor(matchedService));
			setCurrentStep(serviceNeedsScope(matchedService) ? 2 : 3);
		}, 0);
		return () => clearTimeout(timer);
	}, [serviceParam, services, selectedService]);

	const handleSelectService = (service: ServiceType) => {
		setSelectedService(service);
		setSelectedAction(defaultActionFor(service));
		setCurrentStep(serviceNeedsScope(service) ? 2 : 3);
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
		if (currentStep === 3) {
			if (!serviceNeedsScope(selectedService)) {
				setSelectedService(null);
				setSelectedAction(null);
				setCurrentStep(1);
			} else {
				setCurrentStep(2);
			}
		} else if (currentStep === 2) {
			setCurrentStep(1);
		}
	};

	const handleStepClick = (stepId: number) => {
		if (stepId === 1) {
			setCurrentStep(1);
			setSelectedService(null);
			setSelectedAction(null);
		} else if (stepId === 2) {
			setCurrentStep(2);
			setSelectedAction(null);
		}
	};

	const steps =
		selectedService && !serviceNeedsScope(selectedService)
			? STEPS_BASE.filter((s) => s.id !== 2)
			: STEPS_BASE;
	const stepIndex = Math.max(
		0,
		steps.findIndex((s) => s.id === currentStep)
	);

	return (
		<div className="flex flex-col gap-6 max-w-5xl mx-auto">
			<VerificationBanner />

			<VerificationStepper
				steps={steps}
				currentStep={currentStep}
				stepIndex={stepIndex}
				onStepClick={handleStepClick}
			/>

			<div className="bg-white border border-gray-200 p-6 shadow-2xs rounded-lg overflow-hidden">
					{currentStep === 1 && (
						<motion.div
							key="step-1"
							initial={{ opacity: 0, x: -12 }}
							animate={{ opacity: 1, x: 0 }}
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
							transition={{ duration: 0.2 }}
						>
							<SelectAction
								key={selectedService._id}
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
