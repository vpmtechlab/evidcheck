"use client";

import React, { useState } from "react";
import { useAction, useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { getSessionToken } from "@/lib/session-token";
import { servicePresets, ServicePreset } from "./doc-presets";
import { PresetSelector } from "./preset-selector";
import { RequestPane } from "./request-pane";
import { ResponsePane } from "./response-pane";

interface DocPlaygroundProps {
	apiKey: string;
	companyId?: string;
	userId?: string;
}

export function DocPlayground({ companyId, userId }: DocPlaygroundProps) {
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

	const handlePresetSelect = (id: string) => {
		const found = servicePresets.find((p) => p.id === id) || servicePresets[0];
		setSelectedPresetId(id);
		setSelectedPreset(found);
		setPayloadJson(JSON.stringify(found.payload, null, 2));
		setResponseOutput(JSON.stringify(found.responseSample, null, 2));
	};

	const handleExecuteTest = async () => {
		setIsRunning(true);
		try {
			let parsedPayload: Record<string, unknown> = {};
			if (selectedPreset.method === "POST" && payloadJson.trim() !== "") {
				try {
					parsedPayload = JSON.parse(payloadJson) as Record<string, unknown>;
				} catch {
					toast.error("Invalid JSON syntax in request payload");
					setIsRunning(false);
					return;
				}
			}

			if (companyId && userId) {
				if (selectedPresetId === "list_jobs") {
					const allJobs = await convex.query(api.verifications.getVerificationsByCompany, {
						sessionToken: getSessionToken() ?? "",
						companyId: companyId as Id<"companies">,
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
					const balance = await convex.query(api.users.getCompanyBalance, {
						sessionToken: getSessionToken() ?? "",
						companyId: companyId as Id<"companies">,
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
					const serviceType =
						(parsedPayload.serviceType as string) ||
						(selectedPreset.payload as { serviceType?: string }).serviceType ||
						selectedPresetId;
					const res = await runVerification({
						sessionToken: getSessionToken() ?? "",
						companyId: companyId as Id<"companies">,
						userId: userId as Id<"users">,
						serviceType,
						entityData: (parsedPayload.entityData as Record<string, unknown>) || {},
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
		} catch (error: unknown) {
			console.error(error);
			setResponseOutput(
				JSON.stringify(
					{
						success: false,
						status: 500,
						error: getErrorMessage(error),
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
			<PresetSelector
				presets={servicePresets}
				selectedId={selectedPresetId}
				onSelect={handlePresetSelect}
			/>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<RequestPane
					method={selectedPreset.method}
					payloadJson={payloadJson}
					isRunning={isRunning}
					onPayloadChange={setPayloadJson}
					onExecute={handleExecuteTest}
				/>
				<ResponsePane
					status={selectedPreset.responseSample.status || 200}
					output={responseOutput}
				/>
			</div>
		</div>
	);
}
