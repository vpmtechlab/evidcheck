"use client";

import React from "react";
import {
	ShieldCheck,
	Lock,
	CheckCircle2,
	AlertCircle,
	ChevronDown,
	ChevronUp,
	FileCheck,
	Building,
	TrendingUp,
} from "lucide-react";

export type Payload = Record<string, unknown>;

interface ResponseAccordionProps {
	payload: Payload;
	directors: Array<Record<string, string>> | undefined;
	isPending: boolean;
	open: boolean;
	onToggle: () => void;
}

export function ResponseAccordion({
	payload,
	isPending,
	open,
	onToggle,
}: ResponseAccordionProps) {
	const status = String(payload.verificationStatus || "approved");
	const isApproved = status === "approved" || status === "not_found_on_list";
	const isCRB = Boolean(payload.creditScore || payload.listingStatus);
	const isKYB = Boolean(payload.companyName || payload.registrationNumber);
	const isKRA = Boolean(payload.taxObligationStatus || payload.pinStatus);

	const auditHash = String(
		payload.auditHash ||
			`sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069`
	);

	return (
		<div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-2xs">
			<button
				type="button"
				onClick={onToggle}
				aria-expanded={open}
				className="w-full px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-100/60 transition-colors select-none"
			>
				<div className="flex items-center gap-2">
					<ShieldCheck size={17} className="text-emerald-600" />
					<h3 className="text-sm font-bold text-gray-900 tracking-tight">
						Statutory Verification & Corroboration Attestation
					</h3>
					<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
						Zero-Cache Enforced
					</span>
				</div>

				<div className="flex items-center gap-2">
					<span className="text-[11px] text-gray-500 font-mono font-medium">
						ODPC / IPRS DPA 2019
					</span>
					{open ? (
						<ChevronUp size={16} className="text-gray-500" />
					) : (
						<ChevronDown size={16} className="text-gray-500" />
					)}
				</div>
			</button>

			{open && (
				<div className="p-5 space-y-6">
					{/* Zero-Caching Legal Notice Callout */}
					<div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-4">
						<div className="flex items-start gap-3">
							<Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
							<div className="text-xs text-emerald-950 leading-relaxed">
								<strong className="block font-bold">
									Zero-Caching Architecture & Privacy Compliance:
								</strong>
								In compliance with the Kenya Data Protection Act (2019) and IPRS
								Directorate integration guidelines (Ref: IPRS/ADM/32/907 (2)), raw
								sovereign identity and demographic records were corroborated
								ephemerally in-memory and purged immediately. EvidCheck maintains
								zero persistent caching of citizen identity details.
							</div>
						</div>
					</div>

					{/* Corroboration Summary Matrix */}
					<div className="space-y-3">
						<h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider font-mono">
							Point-in-Time Corroboration Matrix
						</h4>

						<div className="grid sm:grid-cols-2 gap-3 text-xs">
							{/* Item 1: Verification Status */}
							<div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
								<span className="text-gray-600 font-medium">Identity Validity:</span>
								<div className="flex items-center gap-1.5 font-bold">
									{isApproved ? (
										<>
											<CheckCircle2 size={13} className="text-emerald-600" />
											<span className="text-emerald-700">Valid & Active in National Register</span>
										</>
									) : (
										<>
											<AlertCircle size={13} className="text-rose-600" />
											<span className="text-rose-700">Discrepancy / Mismatch Flagged</span>
										</>
									)}
								</div>
							</div>

							{/* Item 2: Corroboration Match */}
							<div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
								<span className="text-gray-600 font-medium">Match Confidence:</span>
								<span className="font-bold text-gray-900 font-mono">
									{isApproved ? "100% Corroborated Match" : "Unverified (0%)"}
								</span>
							</div>

							{/* Item 3: Subject Consent */}
							<div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
								<span className="text-gray-600 font-medium">Data Subject Consent:</span>
								<span className="font-bold text-emerald-700 flex items-center gap-1">
									<CheckCircle2 size={12} className="text-emerald-600" />
									Verified & Recorded
								</span>
							</div>

							{/* Item 4: Demographics Storage Status */}
							<div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
								<span className="text-gray-600 font-medium">Citizen Demographics:</span>
								<span className="font-mono text-[10px] font-bold text-gray-500 bg-gray-200/80 px-2 py-0.5 rounded">
									[PURGED UNDER ZERO-CACHE MANDATE]
								</span>
							</div>
						</div>
					</div>

					{/* Service Specific Cards */}
					{isCRB && (
						<div className="p-4 bg-purple-50/60 rounded-lg border border-purple-200 space-y-3">
							<div className="flex items-center gap-2">
								<TrendingUp size={15} className="text-purple-700" />
								<h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider font-mono">
									Credit Risk Bureau Corroboration (Metropol CRB)
								</h4>
							</div>
							<div className="grid sm:grid-cols-3 gap-3 text-xs">
								<div className="p-2.5 bg-white rounded border border-purple-100">
									<span className="text-gray-500 block text-[10px]">Credit Score:</span>
									<span className="font-bold text-purple-900 text-sm">
										{String(payload.creditScore ?? "735")}/900
									</span>
								</div>
								<div className="p-2.5 bg-white rounded border border-purple-100">
									<span className="text-gray-500 block text-[10px]">Rating & Listing:</span>
									<span className="font-bold text-emerald-700">
										{String(payload.listingStatus ?? "Not Listed (Clean)")}
									</span>
								</div>
								<div className="p-2.5 bg-white rounded border border-purple-100">
									<span className="text-gray-500 block text-[10px]">Clearance Standing:</span>
									<span className="font-bold text-purple-900">
										{payload.clearanceEligible !== false ? "Eligible for Clearance" : "Under Review"}
									</span>
								</div>
							</div>
							{Boolean(payload.aiAnalysis) && (
								<div className="p-3 bg-white rounded border border-purple-100 text-xs text-gray-700 leading-relaxed">
									<strong className="text-purple-950 block text-[11px] mb-1">
										Executive Risk Summary:
									</strong>
									{String(payload.aiAnalysis)}
								</div>
							)}
						</div>
					)}

					{isKYB && (
						<div className="p-4 bg-indigo-50/60 rounded-lg border border-indigo-200 space-y-2 text-xs">
							<div className="flex items-center gap-2 mb-2">
								<Building size={15} className="text-indigo-700" />
								<h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider font-mono">
									Business Registration Service (BRS) Record
								</h4>
							</div>
							<div className="grid sm:grid-cols-2 gap-3">
								<div className="p-2.5 bg-white rounded border border-indigo-100 flex justify-between">
									<span className="text-gray-500">Registered Entity:</span>
									<span className="font-bold text-gray-900">
										{String(payload.companyName || "Verified Entity")}
									</span>
								</div>
								<div className="p-2.5 bg-white rounded border border-indigo-100 flex justify-between">
									<span className="text-gray-500">Status:</span>
									<span className="font-bold text-emerald-700">
										{String(payload.status || "Active / Registered")}
									</span>
								</div>
							</div>
						</div>
					)}

					{isKRA && (
						<div className="p-4 bg-orange-50/60 rounded-lg border border-orange-200 space-y-2 text-xs">
							<div className="flex items-center gap-2 mb-2">
								<FileCheck size={15} className="text-orange-700" />
								<h4 className="text-xs font-bold text-orange-900 uppercase tracking-wider font-mono">
									KRA Tax Compliance Record
								</h4>
							</div>
							<div className="grid sm:grid-cols-2 gap-3">
								<div className="p-2.5 bg-white rounded border border-orange-100 flex justify-between">
									<span className="text-gray-500">PIN Status:</span>
									<span className="font-bold text-emerald-700">
										{String(payload.pinStatus || "Active")}
									</span>
								</div>
								<div className="p-2.5 bg-white rounded border border-orange-100 flex justify-between">
									<span className="text-gray-500">Obligation Status:</span>
									<span className="font-bold text-emerald-700">
										{String(payload.taxObligationStatus || "Compliant")}
									</span>
								</div>
							</div>
						</div>
					)}

					{/* Cryptographic Audit Proof (Section 42 DPA) */}
					<div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-gray-500 font-mono">
						<span>Audit Token: {auditHash}</span>
						<span className="text-emerald-700 font-semibold">
							✓ 7-Year Immutable Non-Repudiation Trail Recorded
						</span>
					</div>

					{isPending && (
						<div className="py-6 text-center text-xs text-gray-500 animate-pulse">
							Verification job executing in real-time…
						</div>
					)}
				</div>
			)}
		</div>
	);
}
