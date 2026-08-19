"use client";

import React, { useState, useEffect } from "react";
import { Play, RefreshCw, Check, Loader2, Code2, Server, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAction, useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { servicePresets, ServicePreset } from "./doc-presets";

interface DocPlaygroundProps {
	apiKey: string;
	companyId?: string;
	userId?: string;
}

export function DocPlayground({ apiKey, companyId, userId }: DocPlaygroundProps) {
	const convex = useConvex();
	const [selectedPresetId, setSelectedPresetId] = useState<string>("business_registration");
	const [selectedPreset, setSelectedPreset] = useState<ServicePreset>(servicePresets[0]);
	const [payloadJson, setPayloadJson] = useState<string>(
		JSON.stringify(servicePresets[0].payload, null, 2)
	);
	const [responseOutput, setResponseOutput] = useState<string>(
		JSON.stringify(servicePresets[0].responseSample, null, 2)
	);
	const [isRunning, setIsRunning] = useState(false);

	const runVerification = useAction(api.verifications.runVerification);

	useEffect(() => {
		const found = servicePresets.find((p) => p.id === selectedPresetId) || servicePresets[0];
		setSelectedPreset(found);
		setPayloadJson(JSON.stringify(found.payload, null, 2));
		setResponseOutput(JSON.stringify(found.responseSample, null, 2));
	}, [selectedPresetId]);

	const handleExecuteTest = async () => {
		setIsRunning(true);
		try {
			let parsedPayload: any = {};
			if (selectedPreset.method === "POST" && payloadJson.trim() !== "") {
				try {
					parsedPayload = JSON.parse(payloadJson);
				} catch {
					toast.error("Invalid JSON syntax in request payload");
					setIsRunning(false);
					return;
				}
			}

			if (companyId && userId) {
				if (selectedPresetId === "list_jobs") {
					// GET /v1/jobs endpoint execution
					const allJobs = await convex.query(api.verifications.getVerificationsByCompany, {
						companyId: companyId as any,
					});

					setResponseOutput(
						JSON.stringify(
							{
								success: true,
								status: 200,
								page: 1,
								limit: 10,
								total: allJobs.length,
								totalPages: Math.ceil(allJobs.length / 10) || 1,
								jobs: allJobs.slice(0, 10).map((j) => ({
									jobId: j._id,
									serviceType: j.serviceType,
									resultStatus: j.resultStatus,
									feesCharged: j.feesCharged,
									createdAt: j.createdAt,
								})),
							},
							null,
							2
						)
					);
					toast.success("Jobs list retrieved!");

				} else if (selectedPresetId === "get_balance") {
					// GET /v1/balance endpoint execution
					const balance = await convex.query(api.users.getCompanyBalance, {
						companyId: companyId as any,
					});

					setResponseOutput(
						JSON.stringify(
							{
								success: true,
								status: 200,
								companyId,
								availableBalance: balance,
								currency: "USD",
							},
							null,
							2
						)
					);
					toast.success("Balance queried!");

				} else {
					// Verification endpoints (business_registration, national_id, kra, crb_check)
					const serviceType = parsedPayload.serviceType || selectedPreset.payload.serviceType || selectedPresetId;
					const res = await runVerification({
						companyId: companyId as any,
						userId: userId as any,
						serviceType,
						entityData: parsedPayload.entityData || {},
						source: "sandbox",
						isSandbox: true,
					});

					setResponseOutput(
						JSON.stringify(
							{
								success: true,
								status: 201,
								jobId: res.jobId,
								message: "Sandbox test verification processed successfully. Zero billing deducted.",
								environment: "sandbox",
								data: res.data,
							},
							null,
							2
						)
					);
					toast.success(`Sandbox ${selectedPreset.label} executed!`);
				}
			} else {
				// Fallback simulated execution if companyId/userId missing
				await new Promise((resolve) => setTimeout(resolve, 600));
				setResponseOutput(
					JSON.stringify(
						{
							...selectedPreset.responseSample,
							environment: "sandbox",
							notice: "Sandbox API response preview.",
							timestamp: new Date().toISOString(),
						},
						null,
						2
					)
				);
				toast.success("Sandbox test API request executed!");
			}
		} catch (error: any) {
			console.error(error);
			setResponseOutput(
				JSON.stringify(
					{
						success: false,
						status: 500,
						error: error.message || "Execution error",
					},
					null,
					2
				)
			);
			toast.error("Execution failed");
		} finally {
			setIsRunning(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Preset Selector Banner */}
			<div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3 shadow-2xs">
				<div className="flex items-center justify-between flex-wrap gap-2">
					<h3 className="text-sm font-bold text-gray-900 tracking-tight flex items-center gap-2">
						<FlaskConical size={16} className="text-green-600" />
						Interactive Sandbox API Tester
					</h3>
					<span className="text-[10px] font-mono font-bold bg-green-100 text-green-800 border border-green-300 px-2 py-0.5 rounded-sm">
						SANDBOX - ZERO COST
					</span>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
					{servicePresets.map((preset) => {
						const Icon = preset.icon;
						const isSelected = preset.id === selectedPresetId;
						return (
							<button
								key={preset.id}
								onClick={() => setSelectedPresetId(preset.id)}
								className={`
									p-3 rounded-md border text-left transition-all flex items-start gap-2.5
									${
										isSelected
											? "border-green-500 bg-green-50/40 text-gray-900 shadow-2xs"
											: "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 text-gray-600"
									}
								`}
							>
								<Icon size={16} className={isSelected ? "text-green-600 shrink-0 mt-0.5" : "text-gray-400 shrink-0 mt-0.5"} />
								<div className="min-w-0">
									<p className="text-xs font-bold truncate leading-tight">{preset.label}</p>
									<span className="text-[10px] text-gray-500 font-mono block mt-0.5">{preset.method} {preset.endpoint}</span>
								</div>
							</button>
						);
					})}
				</div>
			</div>

			{/* Dual Editor Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Request Payload Pane */}
				<div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-2xs flex flex-col">
					<div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
						<span className="text-xs font-bold text-gray-700 flex items-center gap-1.5 font-mono uppercase">
							<Code2 size={14} className="text-gray-500" />
							Request {selectedPreset.method} Payload (JSON)
						</span>
						<Button
							size="sm"
							onClick={handleExecuteTest}
							disabled={isRunning}
							className="h-7 text-xs font-bold bg-green-600 hover:bg-green-700 text-white px-3 rounded-md gap-1.5 shadow-2xs"
						>
							{isRunning ? (
								<Loader2 size={13} className="animate-spin" />
							) : (
								<Play size={13} />
							)}
							<span>{isRunning ? "Executing..." : "Send Sandbox Request"}</span>
						</Button>
					</div>

					<div className="p-4 flex-1 bg-[#fafafa]">
						<textarea
							value={payloadJson}
							onChange={(e) => setPayloadJson(e.target.value)}
							disabled={selectedPreset.method === "GET"}
							className="w-full h-[320px] font-mono text-xs text-gray-900 bg-white border border-gray-200 rounded-md p-3 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 leading-relaxed resize-none shadow-2xs disabled:bg-gray-100 disabled:text-gray-400"
							spellCheck={false}
						/>
					</div>
				</div>

				{/* Response Output Pane */}
				<div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-2xs flex flex-col">
					<div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
						<span className="text-xs font-bold text-gray-700 flex items-center gap-1.5 font-mono uppercase">
							<Server size={14} className="text-gray-500" />
							Sandbox Response Payload
						</span>
						<span className="text-[10px] font-mono text-green-700 font-bold bg-green-50 px-2 py-0.5 border border-green-200 rounded-sm">
							HTTP {selectedPreset.responseSample.status || 200} OK
						</span>
					</div>

					<div className="p-4 flex-1 bg-[#fcfdfe] overflow-x-auto custom-scrollbar font-mono text-xs leading-relaxed min-h-[320px]">
						<pre className="text-gray-900">
							<code>{responseOutput}</code>
						</pre>
					</div>
				</div>
			</div>
		</div>
	);
}
