"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, X, Milestone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useApp } from "@/components/providers/app-provider";
import { Id } from "@/convex/_generated/dataModel";

interface TourStep {
	target: string;
	title: string;
	content: string;
	position: "top" | "bottom" | "left" | "right";
}

const TOUR_STEPS: TourStep[] = [
	{
		target: "#nav-dashboard",
		title: "Dashboard Overview",
		content: "Start here to see a high-level summary of your compliance status and recent activity.",
		position: "right",
	},
	{
		target: "#nav-verification",
		title: "4 Core Verification Services",
		content: "Access Business Registration Check, Individual Document Verification (National ID, Alien ID, Passport), KRA PIN Checker, and CRB Check.",
		position: "right",
	},
	{
		target: "#nav-job-list",
		title: "Verification Jobs",
		content: "View, filter, and inspect past verification jobs and JSON audit payloads.",
		position: "right",
	},
	{
		target: "#nav-reports",
		title: "Compliance Reports",
		content: "Generate and export official compliance reports for audits and regulatory requirements.",
		position: "right",
	},
	{
		target: "#nav-user-management",
		title: "Team Access",
		content: "Invite team members and manage organization roles and permissions securely.",
		position: "right",
	},
	{
		target: "#nav-billing",
		title: "Wallet & Credits",
		content: "Top up your wallet balance and view detailed transaction history for all services.",
		position: "right",
	},
	{
		target: "#nav-audit-logs",
		title: "System Audit Logs",
		content: "Track all administrative actions and verification runs for complete transparency.",
		position: "right",
	},
	{
		target: "#nav-settings",
		title: "API Configuration",
		content: "Manage API keys, webhooks, and endpoint parameters for custom integrations.",
		position: "right",
	},
	{
		target: "#header-actions",
		title: "Quick Controls & Search",
		content: "Use Ctrl + K to instantly search services, switch views, or re-run this tour anytime from here.",
		position: "bottom",
	},
];

export function AppTour() {
	const { member, setMember } = useApp();
	const updateTourStatus = useMutation(api.users.updateTourStatus);

	const [currentStep, setCurrentStep] = useState(0);
	const [isVisible, setIsVisible] = useState(false);
	const [coords, setCoords] = useState({
		top: 0,
		left: 0,
		width: 0,
		height: 0,
	});

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
				const rect = element.getBoundingClientRect();
				setCoords({
					top: rect.top + window.scrollY,
					left: rect.left + window.scrollX,
					width: rect.width,
					height: rect.height,
				});
				element.scrollIntoView({ behavior: "smooth", block: "center" });
			} else {
				// Fallback to center screen position if element is collapsed or offscreen
				setCoords({
					top: window.innerHeight / 2 - 40 + window.scrollY,
					left: window.innerWidth / 2 - 100 + window.scrollX,
					width: 200,
					height: 80,
				});
			}
		};

		updatePosition();
		window.addEventListener("resize", updatePosition);
		return () => window.removeEventListener("resize", updatePosition);
	}, [isVisible, currentStep]);

	const handleFinish = async () => {
		setIsVisible(false);
		const userId = (member?.id || member?.userId) as Id<"users">;
		if (userId) {
			try {
				await updateTourStatus({ userId, completed: true });
				setMember({ ...member, has_completed_tour: true });
			} catch (e) {
				console.error("Failed to update tour status", e);
			}
		}
	};

	const handleSkip = async () => {
		setIsVisible(false);
		const userId = (member?.id || member?.userId) as Id<"users">;
		if (userId && member?.has_completed_tour === false) {
			try {
				await updateTourStatus({ userId, completed: true });
				setMember({ ...member, has_completed_tour: true });
			} catch (e) {
				console.error("Failed to update tour status", e);
			}
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
				{/* Backdrop with spotlight hole */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="absolute inset-0 bg-black/65 pointer-events-auto"
					style={{
						clipPath: `polygon(
              0% 0%, 
              0% 100%, 
              ${coords.left}px 100%, 
              ${coords.left}px ${coords.top}px, 
              ${coords.left + coords.width}px ${coords.top}px, 
              ${coords.left + coords.width}px ${coords.top + coords.height}px, 
              ${coords.left}px ${coords.top + coords.height}px, 
              ${coords.left}px 100%, 
              100% 100%, 
              100% 0%
            )`,
					}}
					onClick={handleSkip}
				/>

				{/* Tooltip Card */}
				<motion.div
					key={currentStep}
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
						<div className="flex items-center gap-1.5 text-[#188015]">
							<Milestone size={18} />
							<span className="text-[11px] font-bold uppercase tracking-wider font-mono">
								Step {currentStep + 1} of {TOUR_STEPS.length}
							</span>
						</div>
						<button
							onClick={handleSkip}
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
							onClick={handleSkip}
							className="text-xs text-gray-400 hover:text-gray-600 h-8 px-2"
						>
							Skip Tour
						</Button>

						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={prevStep}
								disabled={currentStep === 0}
								className="h-8 w-8 p-0 rounded-md"
							>
								<ChevronLeft size={16} />
							</Button>
							<Button
								onClick={nextStep}
								className="bg-[#188015] hover:bg-[#136610] text-white rounded-md h-8 px-3.5 text-xs font-semibold shadow-xs"
							>
								{currentStep === TOUR_STEPS.length - 1 ? "Finish" : "Next Step"}
								{currentStep < TOUR_STEPS.length - 1 && (
									<ChevronRight size={16} className="ml-1" />
								)}
							</Button>
						</div>
					</div>
				</motion.div>

				{/* Pulse effect on target */}
				<motion.div
					animate={{ scale: [1, 1.04, 1], opacity: [0.3, 0.7, 0.3] }}
					transition={{ duration: 2, repeat: Infinity }}
					className="absolute border-2 border-[#188015] rounded-lg pointer-events-none"
					style={{
						top: coords.top - 4,
						left: coords.left - 4,
						width: coords.width + 8,
						height: coords.height + 8,
					}}
				/>
			</div>
		</AnimatePresence>
	);
}
