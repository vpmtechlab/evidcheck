"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { ServiceType, ServiceAction } from "./choose-service";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ShieldCheck } from "lucide-react";
import { useApp } from "@/components/providers/app-provider";
import { Id } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";
import { VerificationFeeBox } from "./fee-box";
import { QueryContextFields } from "./query-context-fields";
import { KybFields } from "./kyb-fields";
import { NationalIdFields } from "./national-id-fields";
import { KraFields } from "./kra-fields";
import { CrbFields } from "./crb-fields";
import { SubmitBar } from "./submit-bar";
import { getSessionToken } from "@/lib/session-token";

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

	const categoryData = useQuery(api.services.getBySlug, { slug: service.slug });
	const checkTypes = categoryData?.checkTypes ?? service.checkTypes ?? [];

	const isKYB = service.slug === "business_registration" || service.slug === "kyb";
	const isNationalID = service.slug === "national_id" || service.slug === "kyc";
	const isKRA = service.slug === "kra" || service.slug.includes("pin");
	const isCRB = service.slug === "crb_check" || service.slug.includes("crb");

	const effectiveServiceType = formData.serviceType || checkTypes[0]?.slug || service.slug;

	useEffect(() => {
		if (checkTypes.length > 0 && !formData.serviceType) {
			setFormData((prev) => ({ ...prev, serviceType: checkTypes[0].slug }));
		}
	}, [checkTypes, formData.serviceType]);

	const pricingData = useQuery(
		api.pricing.getPriceByServiceId,
		effectiveServiceType ? { serviceId: effectiveServiceType } : "skip",
	);

	const priceAmount = pricingData?.price ?? (isKYB ? 15.0 : isNationalID ? 5.0 : isKRA ? 10.0 : 12.0);
	const cachedFeeAmount = Math.round(priceAmount * 0.5 * 100) / 100;

	const lookupKeyForCache = isKYB
		? formData.companyNumber
		: isKRA
			? formData.pin
			: formData.idNumber;
	const [cacheNow] = useState(() => Date.now());
	const cacheStatus = useQuery(
		api.verifications.getCacheStatus,
		lookupKeyForCache.trim() !== ""
			? {
					serviceType: effectiveServiceType,
					lookupId: lookupKeyForCache,
					country: formData.country,
					now: cacheNow,
				}
			: "skip",
	);

	const handleChange = (field: string, value: string | boolean) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const canSubmit = () => {
		if (isKYB) return formData.companyNumber.trim().length >= 3;
		if (isNationalID) return formData.idNumber.trim().length >= 4;
		if (isKRA) return formData.pin.trim().length >= 5;
		if (isCRB) return formData.idNumber.trim().length >= 4 && formData.crbConsent;
		return !!formData.idNumber || !!formData.companyNumber;
	};

	const handleSubmit = async () => {
		if (!member?.companyId || !member?.id) {
			toast.error("User session not found. Please log in again.");
			return;
		}
		setIsLoading(true);
		try {
			const payload = { ...formData, serviceType: effectiveServiceType, country: formData.country };
			const result = await runVerification({
				sessionToken: getSessionToken() ?? "",
				companyId: member.companyId as Id<"companies">,
				userId: member.id as Id<"users">,
				serviceType: effectiveServiceType,
				entityData: payload,
				source: "web_api",
			});
			toast.success("Verification completed successfully!");
			onSubmit({ ...payload, jobId: result.jobId, resultPayload: result.data, resultStatus: result.resultStatus });
		} catch (error: unknown) {
			const err = error as Error;
			console.error("Verification execution error:", err);
			if (err.message.includes("Insufficient balance")) {
				toast.error("Insufficient balance. Please top up your account.", {
					action: { label: "Top Up", onClick: () => setShowTopUp(true) },
				});
			} else {
				toast.error(err.message || "Failed to complete verification.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const isCachedPrice = cacheStatus?.cached === true && cacheStatus.fresh && canSubmit();
	const activeFee = isCachedPrice ? cachedFeeAmount : priceAmount;

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className="space-y-6 max-w-3xl"
		>
			<div className="flex items-start justify-between pb-3 border-b border-gray-200">
				<div>
					<h2 className="text-base font-bold text-gray-900 tracking-tight">
						Enter Verification Query
					</h2>
					<p className="text-xs text-gray-500 mt-0.5">
						Service: <span className="font-semibold text-gray-800">{service.name}</span> • Action: <span className="font-semibold text-gray-800">{action.label}</span>
					</p>				</div>

				<VerificationFeeBox
					isCachedPrice={isCachedPrice}
					activeFee={activeFee}
					cachedFetchedAt={cacheStatus?.cached === true ? cacheStatus.fetchedAt : undefined}
				/>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6 space-y-5 shadow-2xs">
				<QueryContextFields
					checkTypes={checkTypes}
					serviceType={formData.serviceType}
					country={formData.country}
					isNationalID={isNationalID}
					onChange={handleChange}
				/>

				{isKYB && <KybFields companyNumber={formData.companyNumber} onChange={handleChange} />}
				{isNationalID && <NationalIdFields serviceType={formData.serviceType} idNumber={formData.idNumber} onChange={handleChange} />}
				{isKRA && <KraFields pin={formData.pin} taxpayerType={formData.taxpayerType} onChange={handleChange} />}
				{isCRB && <CrbFields idNumber={formData.idNumber} crbConsent={formData.crbConsent} onChange={handleChange} />}

				<div className="flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-md text-[11px] text-gray-600 font-mono">
					<ShieldCheck size={14} className="text-brand shrink-0" />
					<span>Encrypted query executed directly against government & regulatory registry nodes.</span>
				</div>
			</div>

			<SubmitBar
				isLoading={isLoading}
				canSubmit={canSubmit()}
				activeFee={activeFee}
				onBack={onGoBack}
				onSubmit={handleSubmit}
			/>
		</motion.div>
	);
}
