"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ServiceType, ServiceAction } from "./choose-service";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { useApp } from "@/components/providers/app-provider";
import { Id } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";

const countries = [
	{ code: "KE", name: "Kenya (Default)", flag: "🇰🇪" },
	{ code: "UG", name: "Uganda", flag: "🇺🇬" },
	{ code: "TZ", name: "Tanzania", flag: "🇹🇿" },
	{ code: "RW", name: "Rwanda", flag: "🇷🇼" },
	{ code: "NG", name: "Nigeria", flag: "🇳🇬" },
	{ code: "GH", name: "Ghana", flag: "🇬🇭" },
];

interface FillDetailsProps {
	service: ServiceType;
	action: ServiceAction;
	onSubmit: (data: Record<string, unknown>) => void;
	onGoBack: () => void;
}

export function FillDetails({
	service,
	action,
	onSubmit,
	onGoBack,
}: FillDetailsProps) {
	const [formData, setFormData] = useState({
		country: "KE",
		serviceType: service.checkTypes?.[0]?.slug || service.slug,
		companyNumber: "",
		idNumber: "",
		pin: "",
		taxpayerType: "Individual",
		crbConsent: true,
	});

	const [isLoading, setIsLoading] = useState(false);
	const { member, setShowTopUp } = useApp();
	const runVerification = useAction(api.verifications.runVerification);

	// Dynamically fetch check types from Convex
	const categoryData = useQuery(api.services.getBySlug, { slug: service.slug });
	const checkTypes = categoryData?.checkTypes ?? service.checkTypes ?? [];

	const isKYB = service.slug === "business_registration" || service.slug === "kyb";
	const isNationalID = service.slug === "national_id" || service.slug === "kyc";
	const isKRA = service.slug === "kra" || service.slug.includes("pin");
	const isCRB = service.slug === "crb_check" || service.slug.includes("crb");

	const effectiveServiceType = formData.serviceType || checkTypes[0]?.slug || service.slug;

	// Set initial serviceType when checkTypes arrive
	useEffect(() => {
		if (checkTypes.length > 0 && !formData.serviceType) {
			setFormData((prev) => ({ ...prev, serviceType: checkTypes[0].slug }));
		}
	}, [checkTypes, formData.serviceType]);

	// Fetch dynamic price for selected service check type
	const pricingData = useQuery(
		api.pricing.getPriceByServiceId,
		effectiveServiceType ? { serviceId: effectiveServiceType } : "skip",
	);

	const priceAmount = pricingData?.price ?? (isKYB ? 15.0 : isNationalID ? 5.0 : isKRA ? 10.0 : 12.0);

	const handleChange = (field: string, value: string | boolean) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const canSubmit = () => {
		if (isKYB) {
			return !!formData.companyNumber && formData.companyNumber.trim().length >= 3;
		}
		if (isNationalID) {
			return !!formData.idNumber && formData.idNumber.trim().length >= 4;
		}
		if (isKRA) {
			return !!formData.pin && formData.pin.trim().length >= 5;
		}
		if (isCRB) {
			return !!formData.idNumber && formData.idNumber.trim().length >= 4 && formData.crbConsent;
		}
		return !!formData.idNumber || !!formData.companyNumber;
	};

	const handleSubmit = async () => {
		if (!member?.companyId || !member?.id) {
			toast.error("User session not found. Please log in again.");
			return;
		}

		setIsLoading(true);
		try {
			const payload = {
				...formData,
				serviceType: effectiveServiceType,
				country: formData.country,
			};

			const result = await runVerification({
				companyId: member.companyId as Id<"companies">,
				userId: member.id as Id<"users">,
				serviceType: effectiveServiceType,
				entityData: payload,
				source: "web_api",
			});

			toast.success("Verification completed successfully!");
			onSubmit({
				...payload,
				jobId: result.jobId,
				resultPayload: result.data,
				resultStatus: result.resultStatus,
			});
		} catch (error: unknown) {
			const err = error as Error;
			console.error("Verification execution error:", err);
			if (err.message.includes("Insufficient balance")) {
				toast.error("Insufficient balance. Please top up your account.", {
					action: {
						label: "Top Up",
						onClick: () => setShowTopUp(true),
					},
				});
			} else {
				toast.error(err.message || "Failed to complete verification.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className="space-y-6 max-w-3xl"
		>
			{/* Header */}
			<div className="flex items-start justify-between pb-3 border-b border-gray-200">
				<div>
					<h2 className="text-base font-bold text-gray-900 tracking-tight">
						Enter Verification Query
					</h2>
					<p className="text-xs text-gray-500 mt-0.5">
						Service: <span className="font-semibold text-gray-800">{service.name}</span> • Action: <span className="font-semibold text-gray-800">{action.label}</span>
					</p>
				</div>

				<div className="text-right bg-green-50/80 border border-green-200 px-3 py-1.5 rounded-md">
					<span className="text-[10px] text-gray-500 font-medium block">Verification Fee</span>
					<span className="text-sm font-bold text-[#188015] font-mono">
						${priceAmount.toFixed(2)} USD
					</span>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6 space-y-5 shadow-2xs">
				{/* Check Type & Country Row */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{checkTypes.length > 0 && (
						<div className="space-y-1.5">
							<Label className="text-xs font-semibold text-gray-700">
								{isNationalID ? "Document Type" : "Check Type"}
							</Label>
							<Select
								value={formData.serviceType}
								onValueChange={(val) => handleChange("serviceType", val || "")}
							>
								<SelectTrigger className="h-9 rounded-md border-gray-300 text-xs">
									<SelectValue placeholder="Select check type" />
								</SelectTrigger>
								<SelectContent className="rounded-md border-gray-300">
									{checkTypes.map((t) => (
										<SelectItem key={t._id} value={t.slug} className="text-xs">
											{t.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}

					<div className="space-y-1.5">
						<Label className="text-xs font-semibold text-gray-700">
							Jurisdiction / Country
						</Label>
						<Select
							value={formData.country}
							onValueChange={(val) => handleChange("country", val || "KE")}
						>
							<SelectTrigger className="h-9 rounded-md border-gray-300 text-xs">
								<SelectValue placeholder="Select country" />
							</SelectTrigger>
							<SelectContent className="rounded-md border-gray-300">
								{countries.map((c) => (
									<SelectItem key={c.code} value={c.code} className="text-xs">
										{c.flag} {c.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* 1. BUSINESS REGISTRATION CHECK FIELDS */}
				{isKYB && (
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
								value={formData.companyNumber}
								onChange={(e) => handleChange("companyNumber", e.target.value)}
								className="h-9 rounded-md border-gray-300 text-xs font-mono"
								autoFocus
							/>
							<p className="text-[11px] text-gray-500">
								Enter the official BRS registration or incorporation number. Business details & directors will be retrieved automatically.
							</p>
						</div>
					</motion.div>
				)}

				{/* 2. ID CHECK (KYC) FIELDS */}
				{isNationalID && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="space-y-4 pt-2 border-t border-gray-100"
					>
						<div className="space-y-1.5">
							<Label className="text-xs font-semibold text-gray-700">
								{formData.serviceType === "passport"
									? "Passport Number"
									: formData.serviceType === "alien_id"
										? "Alien ID / Work Permit Number"
										: "National ID Number"}{" "}
								<span className="text-red-500">*</span>
							</Label>
							<Input
								placeholder={
									formData.serviceType === "passport"
										? "e.g. A1234567"
										: formData.serviceType === "alien_id"
											? "e.g. AL-984210"
											: "e.g. 28491023"
								}
								value={formData.idNumber}
								onChange={(e) => handleChange("idNumber", e.target.value)}
								className="h-9 rounded-md border-gray-300 text-xs font-mono"
								autoFocus
							/>
							<p className="text-[11px] text-gray-500">
								Enter the document number. Official full name, DOB, gender & photo match will be retrieved automatically from IPRS.
							</p>
						</div>
					</motion.div>
				)}

				{/* 3. KRA PIN CHECKER FIELDS */}
				{isKRA && (
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
									value={formData.pin}
									onChange={(e) => handleChange("pin", e.target.value)}
									className="h-9 rounded-md border-gray-300 text-xs font-mono uppercase"
									autoFocus
								/>
							</div>

							<div className="space-y-1.5">
								<Label className="text-xs font-semibold text-gray-700">
									Taxpayer Type
								</Label>
								<Select
									value={formData.taxpayerType}
									onValueChange={(val) => handleChange("taxpayerType", val || "Individual")}
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
				)}

				{/* 4. CRB CHECK FIELDS */}
				{isCRB && (
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
								value={formData.idNumber}
								onChange={(e) => handleChange("idNumber", e.target.value)}
								className="h-9 rounded-md border-gray-300 text-xs font-mono"
								autoFocus
							/>
							<p className="text-[11px] text-gray-500">
								Credit score, listing status, performing & non-performing accounts will be pulled via ID Number.
							</p>
						</div>

						{/* Consent Checkbox */}
						<div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-md flex items-start gap-2.5">
							<input
								type="checkbox"
								id="crb-consent"
								checked={formData.crbConsent}
								onChange={(e) => handleChange("crbConsent", e.target.checked)}
								className="mt-0.5 rounded-sm border-purple-400 text-purple-600 focus:ring-0 cursor-pointer"
							/>
							<Label htmlFor="crb-consent" className="text-xs text-purple-900 leading-relaxed cursor-pointer font-normal">
								I confirm that express consent has been obtained from the individual subject to pull their credit report and listing status from Metropol & TransUnion in compliance with CRB Regulations.
							</Label>
						</div>
					</motion.div>
				)}

				{/* Security Notice */}
				<div className="flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-md text-[11px] text-gray-600 font-mono">
					<ShieldCheck size={14} className="text-[#188015] shrink-0" />
					<span>Encrypted query executed directly against government & regulatory registry nodes.</span>
				</div>
			</div>

			{/* Buttons */}
			<div className="flex items-center justify-between pt-2">
				<Button
					onClick={onGoBack}
					variant="outline"
					disabled={isLoading}
					className="h-9 px-4 text-xs font-semibold rounded-md border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
				>
					<ArrowLeft size={14} />
					<span>Back</span>
				</Button>

				<motion.div whileHover={{ scale: canSubmit() && !isLoading ? 1.02 : 1 }} whileTap={{ scale: 0.98 }}>
					<Button
						onClick={handleSubmit}
						disabled={isLoading || !canSubmit()}
						className="bg-[#188015] hover:bg-[#136610] text-white text-xs font-bold h-9 px-6 rounded-md flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
					>
						{isLoading ? (
							<>
								<Loader2 size={14} className="animate-spin" />
								<span>Querying Registry Node...</span>
							</>
						) : (
							<>
								<span>Execute Check (${priceAmount.toFixed(2)})</span>
								<ArrowRight size={14} />
							</>
						)}
					</Button>
				</motion.div>
			</div>
		</motion.div>
	);
}
