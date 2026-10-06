"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useApp } from "@/components/providers/app-provider";
import { Id } from "@/convex/_generated/dataModel";
import { getSessionToken } from "@/lib/session-token";
import { TOUR_STEPS } from "./tour-steps";
import {
	TourSpotlight,
	coordsForElement,
	centerFallbackCoords,
	EMPTY_COORDS,
	type TourCoords,
} from "./tour-spotlight";
import { TourTooltip } from "./tour-tooltip";

export function AppTour() {
	const { member, setMember } = useApp();
	const updateTourStatus = useMutation(api.users.updateTourStatus);

	const [currentStep, setCurrentStep] = useState(0);
	const [isVisible, setIsVisible] = useState(false);
	const [coords, setCoords] = useState<TourCoords>(EMPTY_COORDS);

	const startTour = useCallback(() => {
		setCurrentStep(0);
		setIsVisible(true);
	}, []);

	useEffect(() => {
		// Automatically start tour for new users who haven't completed it
		if (member && member.has_completed_tour === false && !isVisible) {
			const timer = setTimeout(() => {
				startTour();
			}, 1500);
			return () => clearTimeout(timer);
		}
	}, [member, isVisible, startTour]);

	useEffect(() => {
		window.startAppTour = startTour;
		return () => {
			delete window.startAppTour;
		};
	}, [startTour]);

	useEffect(() => {
		if (!isVisible) return;

		const updatePosition = () => {
			const step = TOUR_STEPS[currentStep];
			const element = document.querySelector(step.target);
			if (element && element.getBoundingClientRect().width > 0) {
				setCoords(coordsForElement(element));
				element.scrollIntoView({ behavior: "smooth", block: "center" });
			} else {
				setCoords(centerFallbackCoords());
			}
		};

		updatePosition();
		window.addEventListener("resize", updatePosition);
		return () => window.removeEventListener("resize", updatePosition);
	}, [isVisible, currentStep]);

	const markTourComplete = async () => {
		const userId = (member?.id || member?.userId) as Id<"users">;
		if (userId) {
			try {
				await updateTourStatus({ sessionToken: getSessionToken() ?? "", userId, completed: true });
				setMember({ ...member, has_completed_tour: true });
			} catch (e) {
				console.error("Failed to update tour status", e);
			}
		}
	};

	const handleFinish = async () => {
		setIsVisible(false);
		await markTourComplete();
	};

	const handleSkip = async () => {
		setIsVisible(false);
		if (member?.has_completed_tour === false) {
			await markTourComplete();
		}
	};

	const nextStep = () => {
		if (currentStep < TOUR_STEPS.length - 1) {
			setCurrentStep((prev) => prev + 1);
		} else {
			handleFinish();
		}
	};

	const prevStep = () => {
		if (currentStep > 0) {
			setCurrentStep((prev) => prev - 1);
		}
	};

	if (!isVisible) return null;

	const step = TOUR_STEPS[currentStep];

	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-[9999] pointer-events-none">
				<TourSpotlight coords={coords} onSkip={handleSkip} />

				<TourTooltip
					step={step}
					stepIndex={currentStep}
					totalSteps={TOUR_STEPS.length}
					coords={coords}
					onSkip={handleSkip}
					onNext={nextStep}
					onPrev={prevStep}
				/>
			</div>
		</AnimatePresence>
	);
}
