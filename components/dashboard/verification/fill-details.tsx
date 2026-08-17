"use client";

import React, { useState } from "react";
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
import { Loader2, Info } from "lucide-react";
import { useApp } from "@/components/providers/app-provider";
import { Id } from "@/convex/_generated/dataModel";
import { CameraCapture } from "./camera-capture";
import { DocumentUpload } from "./document-upload";

const countries = [
	{ code: "KE", name: "Kenya", flag: "🇰🇪" },
	{ code: "UG", name: "Uganda", flag: "🇺🇬" },
	{ code: "TZ", name: "Tanzania", flag: "🇹🇿" },
	{ code: "NG", name: "Nigeria", flag: "🇳🇬" },
	{ code: "GH", name: "Ghana", flag: "🇬🇭" },
	{ code: "ZA", name: "South Africa", flag: "🇿🇦" },
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
		serviceType: "",
		companyNumber: "",
		postalAddress: "",
		postalCode: "",
		idNumber: "",
		firstName: "",
		lastName: "",
	});

	const [selfieImage, setSelfieImage] = useState<string | null>(null);
	const [documentData, setDocumentData] = useState<string | null>(null);
	const [documentName, setDocumentName] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const { member, setShowTopUp } = useApp();
	const runVerification = useAction(api.verifications.runVerification);

	// Dynamically fetch check types from Convex using the service slug
	const categoryData = useQuery(api.services.getBySlug, { slug: service.slug });
	const checkTypes = categoryData?.checkTypes ?? [];

	const isBiometric =
		service?.slug === "user_registration" ||
		service?.slug === "biometric_2fa" ||
		action?.slug?.includes("selfie") ||
		action?.slug?.includes("biometric");

	const isAddress =
		service?.slug === "address_verification" ||
		action?.slug?.includes("address");

	const isKYB = service?.slug === "kyb";
	const isAML = service?.slug === "aml";
	const isKRA = service?.slug === "kra";

	// Effective service type (fallback to action/service slug if no check types in dropdown)
	const effectiveServiceType =
		formData.serviceType ||
		(checkTypes.length === 0 ? action?.slug || service?.slug : "");

	// Fetch real price from Convex based on selected service check type
	const pricingData = useQuery(
		api.pricing.getPriceByServiceId,
		effectiveServiceType ? { serviceId: effectiveServiceType } : "skip",
	);

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const canSubmit = () => {
		if (isBiometric) {
			return !!selfieImage && !!(formData.firstName || formData.idNumber);
		}
		if (isAddress) {
			return !!documentData && !!formData.postalAddress;
		}
		if (isKYB) {
			return !!formData.firstName && !!formData.idNumber;
		}
		if (isAML) {
			return !!formData.firstName && !!formData.lastName;
		}
		if (isKRA) {
			return !!formData.idNumber;
		}
		// KYC default
		return (
			!!effectiveServiceType &&
			!!formData.idNumber
		);
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
				selfieImage: selfieImage || undefined,
				documentData: documentData || undefined,
				documentName: documentName || undefined,
			};

			const result = await runVerification({
				companyId: member.companyId as Id<"companies">,
				userId: member.id as Id<"users">,
				serviceType: effectiveServiceType || "enhanced_kyc",
				entityData: payload,
				source: "web_api",
			});

			toast.success("Verification completed successfully!");
			onSubmit({
				...payload,
				jobId: result.jobId,
				resultPayload: result.data,
			});
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Failed to run verification";

			if (
				message.toLowerCase().includes("insufficient balance") ||
				message.toLowerCase().includes("funds")
			) {
				toast.error("Insufficient funds! Please top up to proceed.");
				setShowTopUp(true);
			} else {
				toast.error(message);
			}
		} finally {
			setIsLoading(false);
		}
	};

	const showNames = isKYB || isAML || isBiometric;
	const idLabel = isKRA
		? "KRA PIN"
		: isKYB
			? "Company Registration Number"
			: "ID / Document Number";
	const idPlaceholder = isKRA
		? "Enter KRA PIN (e.g. A012345678X)"
		: isKYB
			? "Enter company registration number"
			: "Enter national ID or passport number";

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-lg font-bold text-gray-900">
					Fill in the Required Info
				</h2>
				<p className="text-sm text-gray-500 mt-1">
					The details are used to perform {action?.label || "verification"} on
					the target entity
				</p>
			</div>

			<div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
				{/* Country Select */}
				<div className="grid gap-2">
					<Label htmlFor="country-select">Select Country *</Label>
					<Select
						value={formData.country}
						onValueChange={(val) => handleChange("country", val || "")}
					>
						<SelectTrigger id="country-select" className="w-full">
							<SelectValue placeholder="Select a country" />
						</SelectTrigger>
						<SelectContent>
							{countries.map((country) => (
								<SelectItem key={country.code} value={country.code}>
									{country.flag} {country.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Service Check Type Dropdown (Only show if category has check types) */}
				{checkTypes.length > 0 && (
					<div className="grid gap-2">
						<Label htmlFor="service-type-select">Choose Service Type *</Label>
						<Select
							value={formData.serviceType}
							onValueChange={(val) => handleChange("serviceType", val || "")}
						>
							<SelectTrigger id="service-type-select" className="w-full">
								<SelectValue
									placeholder={
										categoryData === undefined
											? "Loading..."
											: "Select a service type"
									}
								/>
							</SelectTrigger>
							<SelectContent>
								{checkTypes.map((type) => (
									<SelectItem key={type._id} value={type.slug}>
										{type.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				{/* Price Banner */}
				{effectiveServiceType && (
					<div className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
						<Info size={14} className="text-blue-600 shrink-0" />
						<p className="text-xs font-semibold text-blue-700">
							Service Fee:{" "}
							{pricingData ? `${pricingData.price.toFixed(2)} USD` : "Standard Tier ($10.00 USD)"}
						</p>
					</div>
				)}

				<div className="h-px bg-gray-100 my-2" />

				{/* Dynamic Input Modules */}
				<div className="space-y-4">
					{/* 1. Biometric Camera Capture Mode */}
					{isBiometric && (
						<CameraCapture
							capturedImage={selfieImage}
							onCapture={(dataUrl) => setSelfieImage(dataUrl)}
							onReset={() => setSelfieImage(null)}
						/>
					)}

					{/* 2. Document Upload Mode for Address Verification or Supporting Docs */}
					{isAddress && (
						<DocumentUpload
							label="Proof of Address Document *"
							description="Upload a Utility Bill, Bank Statement, or Tenancy Agreement (PDF, PNG, JPG up to 10MB)"
							documentData={documentData}
							documentName={documentName}
							onUpload={(dataUrl, name) => {
								setDocumentData(dataUrl);
								setDocumentName(name);
							}}
							onRemove={() => {
								setDocumentData(null);
								setDocumentName(null);
							}}
						/>
					)}

					{/* Name Inputs */}
					{showNames && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="firstName">
									{isKYB ? "Company Name" : "First Name"} *
								</Label>
								<Input
									id="firstName"
									value={formData.firstName}
									onChange={(e) => handleChange("firstName", e.target.value)}
									placeholder={
										isKYB ? "Enter full company name" : "Enter first name"
									}
								/>
							</div>
							{!isKYB && (
								<div className="grid gap-2">
									<Label htmlFor="lastName">Last Name {isAML ? "*" : "(Optional)"}</Label>
									<Input
										id="lastName"
										value={formData.lastName}
										onChange={(e) => handleChange("lastName", e.target.value)}
										placeholder="Enter last name"
									/>
								</div>
							)}
						</div>
					)}

					{/* ID / PIN / Registration Number Field */}
					{!isAddress && (
						<div className="grid gap-2">
							<Label htmlFor="idNumber">
								{idLabel} {isBiometric ? "(Optional)" : "*"}
							</Label>
							<Input
								id="idNumber"
								value={formData.idNumber}
								onChange={(e) => handleChange("idNumber", e.target.value)}
								placeholder={idPlaceholder}
							/>
							{!isKYB && !isAML && !isBiometric && (
								<p className="text-[10px] text-gray-400 italic">
									* Personal records will be verified against official national registries
								</p>
							)}
						</div>
					)}

					{/* Address Fields for KYB or Address Verification */}
					{(isKYB || isAddress) && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="postalAddress">
									{isAddress ? "Street / Physical Address *" : "Postal Address *"}
								</Label>
								<Input
									id="postalAddress"
									value={formData.postalAddress}
									onChange={(e) =>
										handleChange("postalAddress", e.target.value)
									}
									placeholder={
										isAddress
											? "e.g. 45 Kimathi Street, Suite 4B"
											: "Enter postal address / P.O. Box"
									}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="postalCode">Postal / Zip Code</Label>
								<Input
									id="postalCode"
									value={formData.postalCode}
									onChange={(e) => handleChange("postalCode", e.target.value)}
									placeholder="e.g. 00100"
								/>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Actions */}
			<div className="flex items-center gap-3">
				<Button onClick={onGoBack} variant="outline" disabled={isLoading}>
					Go Back
				</Button>
				<Button
					onClick={handleSubmit}
					disabled={isLoading || !canSubmit()}
					className="bg-primary hover:bg-[#146c11] text-white min-w-[140px]"
				>
					{isLoading ? (
						<Loader2 className="w-4 h-4 animate-spin mr-2" />
					) : null}
					{isLoading ? "Processing..." : "Submit Details"}
				</Button>
			</div>
		</div>
	);
}
