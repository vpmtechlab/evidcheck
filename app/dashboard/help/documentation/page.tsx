"use client";

import React, { useState, useContext } from "react";
import {
	Terminal,
	Code2,
	Key,
	Copy,
	Check,
	ArrowRight,
	Play,
	Layers,
	ShieldCheck,
	Building2,
	UserCheck,
	FileText,
	Shield,
	AlertCircle,
	ExternalLink,
	Globe,
	Server,
	RefreshCw,
	Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppContext } from "@/components/providers/app-provider";
import { Id } from "@/convex/_generated/dataModel";

const languages = [
	{ id: "curl", name: "cURL", icon: Terminal },
	{ id: "node", name: "Node.js", icon: Code2 },
	{ id: "python", name: "Python", icon: Code2 },
	{ id: "go", name: "GoLang", icon: Code2 },
	{ id: "php", name: "PHP", icon: Code2 },
];

const servicePresets = [
	{
		id: "business_registration",
		label: "1. Business Registration Check",
		icon: Building2,
		target: "Businesses & Companies",
		payload: {
			serviceType: "business_registration",
			entityData: {
				companyName: "Apex Technologies Ltd",
				companyNumber: "PVT-2022/94821",
				country: "KE"
			}
		},
		responseSample: {
			success: true,
			status: 201,
			jobId: "j5784910284910283",
			message: "Verification completed successfully.",
			data: {
				registrationNumber: "PVT-2022/94821",
				companyName: "Apex Technologies Ltd",
				status: "Registered",
				dateOfIncorporation: "2019-06-12",
				companyType: "Private Limited Company",
				nature: "General Commercial Trading & IT Services",
				directors: [
					{ name: "Samuel Kipchoge", idNumber: "27384910", nationality: "Kenyan", role: "Director" },
					{ name: "Faith Wanjiku", idNumber: "29104829", nationality: "Kenyan", role: "Secretary" }
				],
				address: { poBox: "P.O. Box 30120", city: "Nairobi", building: "West End Towers", street: "Muthangari Drive" },
				taxPin: "P051938271A",
				verificationStatus: "approved",
				verificationMessage: "Business registration verified successfully via Registrar of Companies (BRS)",
				source: "TrustCert Registry Engine"
			}
		}
	},
	{
		id: "national_id",
		label: "2. National ID Check",
		icon: UserCheck,
		target: "Individuals",
		payload: {
			serviceType: "national_id",
			entityData: {
				idNumber: "28491023",
				firstName: "John",
				lastName: "Mwangi",
				country: "KE"
			}
		},
		responseSample: {
			success: true,
			status: 201,
			jobId: "j5784910284910284",
			message: "Verification completed successfully.",
			data: {
				documentType: "National ID",
				idNumber: "28491023",
				fullName: "John Kamau Mwangi",
				firstName: "John",
				lastName: "Mwangi",
				dateOfBirth: "1993-11-04",
				gender: "Male",
				nationality: "Kenyan",
				idStatus: "Valid",
				issueDate: "2011-04-18",
				expiryDate: "2031-04-18",
				issuingAuthority: "National Registration Bureau",
				photoOnFile: true,
				verificationStatus: "approved",
				verificationMessage: "National ID verified successfully against IPRS database",
				source: "TrustCert Identity Engine"
			}
		}
	},
	{
		id: "kra_pin_check",
		label: "3. KRA PIN Checker",
		icon: FileText,
		target: "Businesses & Individuals",
		payload: {
			serviceType: "kra_pin_check",
			entityData: {
				pin: "P051839201Z",
				taxpayerType: "Company",
				companyName: "Apex Technologies Ltd",
				country: "KE"
			}
		},
		responseSample: {
			success: true,
			status: 201,
			jobId: "j5784910284910285",
			message: "Verification completed successfully.",
			data: {
				pin: "P051839201Z",
				taxpayerName: "Apex Technologies Ltd",
				taxpayerType: "Company",
				status: "Active",
				registrationDate: "2017-03-15",
				station: "Nairobi Central",
				obligationStatus: "Compliant",
				lastFilingDate: "2024-06-20",
				verificationStatus: "approved",
				verificationMessage: "KRA PIN verified successfully — Tax Obligation Compliant",
				source: "TrustCert KRA Engine"
			}
		}
	},
	{
		id: "crb_check",
		label: "4. CRB Credit Check",
		icon: Shield,
		target: "Individuals",
		payload: {
			serviceType: "crb_check",
			entityData: {
				idNumber: "31948201",
				firstName: "Brian",
				lastName: "Odhiambo",
				phone: "+254712345678",
				crbConsent: true,
				country: "KE"
			}
		},
		responseSample: {
			success: true,
			status: 201,
			jobId: "j5784910284910286",
			message: "Verification completed successfully.",
			data: {
				subjectName: "Brian Ouma Odhiambo",
				idNumber: "31948201",
				creditScore: 735,
				creditRating: "Good",
				listingStatus: "Not Listed (Clean)",
				performingAccounts: 3,
				nonPerformingAccounts: 0,
				totalActiveAccounts: 3,
				totalOutstandingBalance: "KES 28,400",
				monthlyPaymentObligation: "KES 6,100",
				lastDefaultDate: null,
				bureausChecked: ["Metropol CRB", "TransUnion Kenya", "CreditInfo"],
				clearanceCertificateEligible: true,
				verificationStatus: "approved",
				verificationMessage: "CRB Credit verification completed — Clean listing with credit score 735/900",
				source: "TrustCert CRB Engine"
			}
		}
	}
];

export default function DocumentationPage() {
	const { member } = useContext(AppContext);
	const apiKeys = useQuery(
		api.apiKeys.list,
		member?.companyId ? { companyId: member.companyId as Id<"companies"> } : "skip"
	);

	const activeApiKey = apiKeys?.[0]?.keyHash || "your_api_key_here";

	const [activeLang, setActiveLang] = useState("curl");
	const [activePreset, setActivePreset] = useState(servicePresets[0]);
	const [activeTab, setActiveTab] = useState<"docs" | "playground" | "subdomain">("docs");

	// Playground State
	const [playgroundPayload, setPlaygroundPayload] = useState<string>(
		JSON.stringify(servicePresets[0].payload, null, 2)
	);
	const [playgroundResponse, setPlaygroundResponse] = useState<string | null>(null);
	const [playgroundStatus, setPlaygroundStatus] = useState<number | null>(null);
	const [playgroundTime, setPlaygroundTime] = useState<number | null>(null);
	const [isTesting, setIsTesting] = useState(false);

	const handlePresetChange = (preset: typeof servicePresets[0]) => {
		setActivePreset(preset);
		setPlaygroundPayload(JSON.stringify(preset.payload, null, 2));
		setPlaygroundResponse(null);
		setPlaygroundStatus(null);
		setPlaygroundTime(null);
	};

	const handleRunPlaygroundTest = async () => {
		setIsTesting(true);
		setPlaygroundResponse(null);
		setPlaygroundStatus(null);

		const startTime = performance.now();

		try {
			const parsed = JSON.parse(playgroundPayload);

			const response = await fetch("/api/v1/verifications", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-KEY": activeApiKey,
				},
				body: JSON.stringify(parsed),
			});

			const duration = Math.round(performance.now() - startTime);
			setPlaygroundTime(duration);
			setPlaygroundStatus(response.status);

			const data = await response.json();
			setPlaygroundResponse(JSON.stringify(data, null, 2));

			if (response.ok) {
				toast.success(`Verification completed (${response.status} in ${duration}ms)`);
			} else {
				toast.error(`API returned error (${response.status})`);
			}
		} catch (err: unknown) {
			const duration = Math.round(performance.now() - startTime);
			setPlaygroundTime(duration);
			setPlaygroundStatus(500);
			const error = err as Error;
			setPlaygroundResponse(JSON.stringify({ error: "Client Error", message: error.message }, null, 2));
			toast.error("Failed to execute request.");
		} finally {
			setIsTesting(false);
		}
	};

	const generateSnippet = (lang: string, payload: Record<string, unknown>) => {
		const jsonString = JSON.stringify(payload, null, 2);
		const jsonOneLine = JSON.stringify(payload);

		switch (lang) {
			case "curl":
				return `curl -X POST https://api.evidcheck.com/v1/verifications \\
  -H "X-API-KEY: ${activeApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '${jsonString}'`;

			case "node":
				return `import axios from 'axios';

const runVerification = async () => {
  try {
    const response = await axios.post('https://api.evidcheck.com/v1/verifications', ${jsonString}, {
      headers: {
        'X-API-KEY': '${activeApiKey}',
        'Content-Type': 'application/json'
      }
    });

    console.log('Verification Result:', response.data);
  } catch (error) {
    console.error('Verification Error:', error.response?.data || error.message);
  }
};

runVerification();`;

			case "python":
				return `import requests
import json

url = "https://api.evidcheck.com/v1/verifications"
headers = {
    "X-API-KEY": "${activeApiKey}",
    "Content-Type": "application/json"
}

payload = ${jsonString}

response = requests.post(url, headers=headers, json=payload)
data = response.json()

print(f"Status: {response.status_code}")
print(json.dumps(data, indent=2))`;

			case "go":
				return `package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
)

func main() {
    url := "https://api.evidcheck.com/v1/verifications"
    payload := []byte(\`${jsonOneLine}\`)

    req, err := http.NewRequest("POST", url, bytes.NewBuffer(payload))
    if err != nil {
        panic(err)
    }

    req.Header.Set("X-API-KEY", "${activeApiKey}")
    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := io.ReadAll(resp.Body)
    fmt.Println(string(body))
}`;

			case "php":
				return `<?php

$url = "https://api.evidcheck.com/v1/verifications";
$apiKey = "${activeApiKey}";

$data = ${jsonString.replace(/"([^"]+)":/g, "'$1' =>")};

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "X-API-KEY: " . $apiKey,
    "Content-Type: application/json"
]);

$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>`;

			default:
				return "";
		}
	};

	const handleCopy = (text: string) => {
		navigator.clipboard.writeText(text);
		toast.success("Copied to clipboard");
	};

	return (
		<div className="space-y-6 max-w-[1400px] mx-auto text-gray-900">
			{/* Top Header Banner */}
			<div 
				style={{ backgroundColor: "#0e1b42", color: "#ffffff" }}
				className="p-6 border-b-2 border-[#188015] rounded-lg shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
			>
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<div 
							style={{ backgroundColor: "#188015", color: "#ffffff" }}
							className="p-2 rounded-md"
						>
							<Code2 size={20} />
						</div>
						<h1 className="text-xl font-bold text-white tracking-tight">
							EvidCheck REST API v1.0
						</h1>
						<span 
							style={{ backgroundColor: "rgba(24, 128, 21, 0.25)", color: "#86efac", borderColor: "rgba(24, 128, 21, 0.5)" }}
							className="text-[10px] font-mono px-2 py-0.5 border rounded-md"
						>
							PROD READY
						</span>
					</div>
					<p className="text-xs text-gray-300">
						Automate official Business Registrations, National ID Checks, KRA PINs, and CRB Reports in minutes.
					</p>
				</div>

				<div className="flex items-center gap-2">
					<Button
						variant="default"
						size="sm"
						onClick={() => setActiveTab("docs")}
						style={activeTab === "docs" ? { backgroundColor: "rgba(255, 255, 255, 0.2)", borderColor: "#ffffff", color: "#ffffff" } : { borderColor: "rgba(255, 255, 255, 0.3)", color: "#ffffff" }}
						className="h-8 px-3 text-xs font-semibold rounded-md hover:bg-white/10"
					>
						Documentation
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setActiveTab("playground")}
						style={activeTab === "playground" ? { backgroundColor: "rgba(255, 255, 255, 0.2)", borderColor: "#ffffff", color: "#ffffff" } : { borderColor: "rgba(255, 255, 255, 0.3)", color: "#ffffff" }}
						className="h-8 px-3 text-xs font-semibold rounded-md hover:bg-white/10"
					>
						<Play size={12} className="mr-1.5 text-green-400" />
						Interactive Tester
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setActiveTab("subdomain")}
						style={activeTab === "subdomain" ? { backgroundColor: "rgba(255, 255, 255, 0.2)", borderColor: "#ffffff", color: "#ffffff" } : { borderColor: "rgba(255, 255, 255, 0.3)", color: "#ffffff" }}
						className="h-8 px-3 text-xs font-semibold rounded-md hover:bg-white/10"
					>
						<Globe size={12} className="mr-1.5 text-blue-300" />
						Subdomain Guide
					</Button>
				</div>
			</div>

			{/* Authentication Card */}
			<div className="bg-white border border-gray-300 rounded-lg p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-amber-50 text-amber-800 border border-amber-300 rounded-md shrink-0">
						<Key size={18} />
					</div>
					<div>
						<h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
							Authentication
						</h3>
						<p className="text-xs text-gray-700 mt-0.5">
							Pass your API Key via header: <code className="font-mono text-gray-900 bg-gray-100 px-1.5 py-0.5 border border-gray-300 rounded-sm font-semibold">X-API-KEY: key_xxx</code> or <code className="font-mono text-gray-900 bg-gray-100 px-1.5 py-0.5 border border-gray-300 rounded-sm font-semibold">Authorization: Bearer key_xxx</code>
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2 w-full sm:w-auto">
					<div className="flex-1 sm:w-64 bg-gray-100 border border-gray-300 rounded-md px-2.5 py-1 text-xs font-mono font-semibold text-gray-900 truncate">
						{activeApiKey}
					</div>
					<Button
						size="sm"
						variant="outline"
						onClick={() => handleCopy(activeApiKey)}
						className="h-8 px-2.5 rounded-md border-gray-300 text-xs text-gray-800 hover:bg-gray-100"
					>
						<Copy size={13} />
					</Button>
				</div>
			</div>

			{/* TAB 1: FULL DOCUMENTATION */}
			{activeTab === "docs" && (
				<div className="space-y-6">
					{/* Service Presets Bar */}
					<div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
						{servicePresets.map((preset) => {
							const Icon = preset.icon;
							const isSelected = activePreset.id === preset.id;
							return (
								<button
									key={preset.id}
									onClick={() => handlePresetChange(preset)}
									style={isSelected ? { backgroundColor: "#0e1b42", color: "#ffffff", borderColor: "#0e1b42" } : { backgroundColor: "#ffffff", color: "#1f2937", borderColor: "#d1d5db" }}
									className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all border rounded-md shadow-2xs hover:border-gray-500"
								>
									<Icon size={15} className={isSelected ? "text-[#188015]" : "text-gray-600"} />
									<span>{preset.label}</span>
									<span 
										style={isSelected ? { backgroundColor: "rgba(255, 255, 255, 0.2)", color: "#ffffff" } : { backgroundColor: "#f3f4f6", color: "#374151" }}
										className="text-[10px] px-1.5 py-0.2 rounded-sm font-mono font-semibold"
									>
										{preset.target}
									</span>
								</button>
							);
						})}
					</div>

					{/* 2-Column Docs Body */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Left Column: Endpoint Details & Parameters */}
						<div className="space-y-5">
							{/* Endpoint Header Card */}
							<div className="bg-white border border-gray-300 rounded-lg p-5 shadow-2xs space-y-3">
								<div className="flex items-center gap-2">
									<span 
										style={{ backgroundColor: "#188015", color: "#ffffff" }}
										className="px-2 py-0.5 font-bold font-mono text-xs rounded-sm"
									>
										POST
									</span>
									<span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 border border-gray-200 rounded-sm">
										/v1/verifications
									</span>
								</div>
								<h2 className="text-sm font-bold text-gray-900">
									Execute {activePreset.label}
								</h2>
								<p className="text-xs text-gray-700 leading-relaxed">
									Initiates a synchronous verification job against official registries. Deducts the corresponding service balance upon successful validation.
								</p>
							</div>

							{/* Request Schema Table */}
							<div className="bg-white border border-gray-300 rounded-lg p-5 shadow-2xs space-y-3">
								<h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
									Request Payload Schema
								</h3>
								<div className="border border-gray-300 rounded-md overflow-hidden text-xs">
									<div className="grid grid-cols-3 p-2.5 bg-gray-100 font-bold text-gray-900 border-b border-gray-300">
										<span>Field</span>
										<span>Type</span>
										<span>Description</span>
									</div>
									<div className="grid grid-cols-3 p-2.5 border-b border-gray-200 font-mono">
										<span className="font-bold text-gray-900">serviceType</span>
										<span className="text-blue-700 font-semibold">string</span>
										<span className="font-sans text-gray-800 font-medium">Must be <code className="bg-gray-100 px-1 rounded-xs font-bold text-gray-900">{activePreset.id}</code></span>
									</div>
									<div className="grid grid-cols-3 p-2.5 border-b border-gray-200 font-mono">
										<span className="font-bold text-gray-900">entityData</span>
										<span className="text-purple-700 font-semibold">object</span>
										<span className="font-sans text-gray-800">Specific parameters for {activePreset.label}</span>
									</div>
									<div className="grid grid-cols-3 p-2.5 font-mono">
										<span className="text-gray-600">webhookUrl</span>
										<span className="text-gray-600">string (optional)</span>
										<span className="font-sans text-gray-800">HTTP endpoint to receive completion callback</span>
									</div>
								</div>
							</div>

							{/* Status Codes Table */}
							<div className="bg-white border border-gray-300 rounded-lg p-5 shadow-2xs space-y-3">
								<h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
									Response Codes & Error Handling
								</h3>
								<div className="border border-gray-300 rounded-md overflow-hidden text-xs">
									<div className="grid grid-cols-3 p-2.5 bg-gray-100 font-bold text-gray-900 border-b border-gray-300">
										<span>Code</span>
										<span>Status</span>
										<span>Description</span>
									</div>
									<div className="grid grid-cols-3 p-2.5 border-b border-gray-200 font-mono">
										<span className="text-green-700 font-bold">200 / 201</span>
										<span className="font-sans font-semibold text-gray-900">OK / Created</span>
										<span className="font-sans text-gray-800">Verification successfully processed</span>
									</div>
									<div className="grid grid-cols-3 p-2.5 border-b border-gray-200 font-mono">
										<span className="text-amber-700 font-bold">400</span>
										<span className="font-sans font-semibold text-gray-900">Bad Request</span>
										<span className="font-sans text-gray-800">Malformed JSON or missing parameters</span>
									</div>
									<div className="grid grid-cols-3 p-2.5 border-b border-gray-200 font-mono">
										<span className="text-red-700 font-bold">401</span>
										<span className="font-sans font-semibold text-gray-900">Unauthorized</span>
										<span className="font-sans text-gray-800">Invalid or inactive API key</span>
									</div>
									<div className="grid grid-cols-3 p-2.5 border-b border-gray-200 font-mono">
										<span className="text-red-700 font-bold">402</span>
										<span className="font-sans font-semibold text-gray-900">Payment Required</span>
										<span className="font-sans text-gray-800">Insufficient account balance</span>
									</div>
									<div className="grid grid-cols-3 p-2.5 font-mono">
										<span className="text-gray-800 font-bold">500</span>
										<span className="font-sans font-semibold text-gray-900">Internal Error</span>
										<span className="font-sans text-gray-800">Registry gateway timeout or error</span>
									</div>
								</div>
							</div>
						</div>

						{/* Right Column: Code Snippet & Response Example */}
						<div className="space-y-5">
							{/* Code Snippet Box */}
							<div 
								style={{ backgroundColor: "#0b1329", color: "#86efac" }}
								className="border border-gray-800 rounded-lg overflow-hidden shadow-md"
							>
								{/* Language Selector Bar */}
								<div 
									style={{ backgroundColor: "#060b17", borderBottom: "1px solid #1f293d" }}
									className="flex items-center justify-between px-3 py-2"
								>
									<div className="flex items-center gap-1">
										{languages.map((lang) => (
											<button
												key={lang.id}
												onClick={() => setActiveLang(lang.id)}
												style={activeLang === lang.id ? { backgroundColor: "#188015", color: "#ffffff" } : { color: "#9ca3af" }}
												className="px-2.5 py-1 text-xs font-mono font-semibold rounded-md transition-colors hover:text-white"
											>
												{lang.name}
											</button>
										))}
									</div>

									<button
										onClick={() => handleCopy(generateSnippet(activeLang, activePreset.payload))}
										className="text-gray-400 hover:text-white p-1 hover:bg-white/10 rounded-md transition-colors"
										title="Copy snippet"
									>
										<Copy size={14} />
									</button>
								</div>

								{/* Code Box */}
								<div 
									style={{ backgroundColor: "#0b1329", color: "#86efac" }}
									className="p-4 overflow-x-auto custom-scrollbar font-mono text-xs leading-relaxed max-h-[300px]"
								>
									<pre>{generateSnippet(activeLang, activePreset.payload)}</pre>
								</div>
							</div>

							{/* Response Example Box */}
							<div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-2xs space-y-2">
								<div className="flex items-center justify-between px-4 py-2.5 bg-gray-100 border-b border-gray-300">
									<div className="flex items-center gap-2">
										<span className="text-xs font-bold text-gray-900">
											Sample 200 OK Response
										</span>
										<span 
											style={{ backgroundColor: "#188015", color: "#ffffff" }}
											className="text-[10px] px-1.5 py-0.2 font-mono font-bold rounded-sm"
										>
											application/json
										</span>
									</div>
									<button
										onClick={() => handleCopy(JSON.stringify(activePreset.responseSample, null, 2))}
										className="text-gray-600 hover:text-gray-900 p-1 text-xs flex items-center gap-1 font-semibold rounded-md"
									>
										<Copy size={13} />
										<span>Copy</span>
									</button>
								</div>

								<div className="p-4 overflow-x-auto custom-scrollbar font-mono text-xs text-gray-900 leading-relaxed bg-[#fafafa] max-h-[320px]">
									<pre>{JSON.stringify(activePreset.responseSample, null, 2)}</pre>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* TAB 2: INTERACTIVE PLAYGROUND / TESTER */}
			{activeTab === "playground" && (
				<div className="space-y-6">
					<div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
						<div>
							<h2 className="text-sm font-bold text-gray-900">
								Live API Endpoint Tester
							</h2>
							<p className="text-xs text-gray-500">
								Send live verification calls directly to <code className="font-mono font-bold text-gray-800">/api/v1/verifications</code>
							</p>
						</div>

						<div className="flex items-center gap-2">
							{servicePresets.map((p) => (
								<button
									key={p.id}
									onClick={() => handlePresetChange(p)}
									className={`
										px-2.5 py-1 text-xs font-bold border rounded-md transition-colors
										${
											activePreset.id === p.id
												? "bg-[#188015] text-white border-[#188015]"
												: "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100"
										}
									`}
								>
									{p.label.split(". ")[1]}
								</button>
							))}
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Left: Request Editor */}
						<div className="bg-white border border-gray-200 rounded-lg shadow-2xs flex flex-col overflow-hidden">
							<div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
								<span className="text-xs font-bold text-gray-900 font-mono">
									REQUEST BODY (JSON)
								</span>
								<span className="text-[11px] text-gray-500 font-mono">
									POST /api/v1/verifications
								</span>
							</div>

							<div className="p-3 flex-1 flex flex-col">
								<textarea
									value={playgroundPayload}
									onChange={(e) => setPlaygroundPayload(e.target.value)}
									rows={14}
									className="w-full flex-1 font-mono text-xs p-3 border border-gray-300 bg-[#fafafa] text-gray-900 focus:outline-none focus:border-[#188015] rounded-md resize-none leading-relaxed"
								/>
							</div>

							<div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
								<span className="text-[11px] text-gray-500 font-mono">
									Auth: Header X-API-KEY
								</span>
								<Button
									onClick={handleRunPlaygroundTest}
									disabled={isTesting}
									className="bg-[#188015] hover:bg-[#136610] text-white text-xs font-bold h-8 px-4 rounded-md flex items-center gap-2 shadow-xs"
								>
									{isTesting ? (
										<>
											<Loader2 size={13} className="animate-spin" />
											<span>Executing Call...</span>
										</>
									) : (
										<>
											<Play size={13} />
											<span>Send Test Request</span>
										</>
									)}
								</Button>
							</div>
						</div>

						{/* Right: Live Response Viewer */}
						<div className="bg-white border border-gray-200 rounded-lg shadow-2xs flex flex-col overflow-hidden">
							<div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
								<span className="text-xs font-bold text-gray-900 font-mono">
									LIVE RESPONSE
								</span>

								{playgroundStatus !== null && (
									<div className="flex items-center gap-2">
										<span
											className={`text-[10px] font-mono font-bold px-1.5 py-0.2 border rounded-sm ${
												playgroundStatus < 300
													? "bg-green-100 text-green-800 border-green-300"
													: "bg-red-100 text-red-800 border-red-300"
											}`}
										>
											HTTP {playgroundStatus}
										</span>
										{playgroundTime !== null && (
											<span className="text-[10px] text-gray-500 font-mono">
												{playgroundTime}ms
											</span>
										)}
									</div>
								)}
							</div>

							<div className="p-4 flex-1 bg-[#fcfdfe] overflow-x-auto custom-scrollbar font-mono text-xs leading-relaxed min-h-[320px]">
								{playgroundResponse ? (
									<pre className="text-gray-900">{playgroundResponse}</pre>
								) : (
									<div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-16 space-y-2">
										<Server size={32} className="text-gray-300" />
										<p className="text-xs">
											Click &quot;Send Test Request&quot; to execute this call against the API engine.
										</p>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* TAB 3: SUBDOMAIN SETUP GUIDE (api.evidcheck.com/v1) */}
			{activeTab === "subdomain" && (
				<div className="space-y-6 max-w-4xl">
					<div className="bg-white border border-gray-200 rounded-lg p-6 shadow-2xs space-y-4">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
								<Globe size={22} />
							</div>
							<div>
								<h2 className="text-base font-bold text-gray-900">
									Custom API Subdomain Setup (<code className="font-mono text-blue-700">api.evidcheck.com/v1</code>)
								</h2>
								<p className="text-xs text-gray-500 mt-0.5">
									Step-by-step instructions to point your custom subdomain to your verification infrastructure.
								</p>
							</div>
						</div>

						<div className="space-y-4 pt-4 border-t border-gray-100 text-xs text-gray-700 leading-relaxed">
							{/* Step 1 */}
							<div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50 space-y-2">
								<h3 className="font-bold text-gray-900 flex items-center gap-2">
									<span className="w-5 h-5 bg-[#0e1b42] text-white rounded-md flex items-center justify-center text-[10px] font-bold">1</span>
									<span>DNS Record Configuration (Cloudflare / Route53 / GoDaddy)</span>
								</h3>
								<p className="text-gray-600">
									Create a <strong className="text-gray-900">CNAME</strong> record on your DNS provider for the <code className="font-mono bg-white px-1.5 py-0.5 border border-gray-200 rounded-sm">api</code> subdomain:
								</p>
								<div className="bg-[#0b1329] text-green-300 p-3 font-mono text-xs rounded-md">
									<div>Type: &nbsp; &nbsp;<strong>CNAME</strong></div>
									<div>Host: &nbsp; &nbsp;<strong>api</strong> (or api.evidcheck.com)</div>
									<div>Target: &nbsp;<strong>cname.vercel-dns.com</strong> (or your custom server hostname)</div>
									<div>TTL: &nbsp; &nbsp; <strong>Auto / 300s</strong></div>
								</div>
							</div>

							{/* Step 2 */}
							<div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50 space-y-2">
								<h3 className="font-bold text-gray-900 flex items-center gap-2">
									<span className="w-5 h-5 bg-[#0e1b42] text-white rounded-md flex items-center justify-center text-[10px] font-bold">2</span>
									<span>Next.js Subdomain Rewriting</span>
								</h3>
								<p className="text-gray-600">
									Our project already has subdomain proxying configured in <code className="font-mono bg-white px-1.5 py-0.5 border border-gray-200 rounded-sm">next.config.ts</code> and <code className="font-mono bg-white px-1.5 py-0.5 border border-gray-200 rounded-sm">middleware.ts</code>. Requests to <code className="font-mono bg-white px-1.5 py-0.5 border border-gray-200 rounded-sm">api.evidcheck.com/v1/:path*</code> automatically map to our fast edge verification handlers:
								</p>
								<div className="bg-[#0b1329] text-green-300 p-3 font-mono text-xs rounded-md">
									<pre>{`// next.config.ts
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/v1/:path*",
        destination: "/api/v1/:path*",
      },
    ];
  },
};`}</pre>
								</div>
							</div>

							{/* Step 3 */}
							<div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50 space-y-2">
								<h3 className="font-bold text-gray-900 flex items-center gap-2">
									<span className="w-5 h-5 bg-[#0e1b42] text-white rounded-md flex items-center justify-center text-[10px] font-bold">3</span>
									<span>Convex Direct Custom Domain (Optional Alternative)</span>
								</h3>
								<p className="text-gray-600">
									If you want the API to go directly to the Convex edge server without passing through Next.js, attach a custom domain directly in Convex:
								</p>
								<div className="bg-[#0b1329] text-green-300 p-3 font-mono text-xs rounded-md">
									npx convex custom-domain add api.evidcheck.com
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
