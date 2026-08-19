"use client";

import React, { useState, useContext } from "react";
import { toast } from "sonner";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppContext } from "@/components/providers/app-provider";
import { Id } from "@/convex/_generated/dataModel";

import { DocHeader } from "./components/doc-header";
import { DocOverview } from "./components/doc-overview";
import { DocCodeSnippets } from "./components/doc-code-snippets";
import { DocPlayground } from "./components/doc-playground";
import { DocSubdomainGuide } from "./components/doc-subdomain-guide";
import { servicePresets } from "./components/doc-presets";

export default function DocumentationPage() {
	const [activeTab, setActiveTab] = useState<"docs" | "playground" | "subdomain">("docs");
	const [copiedKey, setCopiedKey] = useState(false);

	const { member } = useContext(AppContext);
	const apiKeys = useQuery(
		api.apiKeys.list,
		member?.companyId ? { companyId: member.companyId as Id<"companies"> } : "skip"
	);

	const activeApiKey = apiKeys?.[0]?.keyHash
		? `evid_live_sk_${apiKeys[0].keyHash.slice(0, 16)}`
		: "evid_live_sk_8942104829104821";

	const handleCopyKey = () => {
		navigator.clipboard.writeText(activeApiKey);
		setCopiedKey(true);
		toast.success("API Key copied to clipboard!");
		setTimeout(() => setCopiedKey(false), 2000);
	};

	return (
		<div className="flex flex-col gap-8 max-w-6xl mx-auto pb-12">
			{/* Modular Header */}
			<DocHeader activeTab={activeTab} setActiveTab={setActiveTab} />

			{/* Tab 1: Standard API Documentation */}
			{activeTab === "docs" && (
				<div className="space-y-8 animate-in fade-in duration-200">
					<DocOverview
						apiKey={activeApiKey}
						copiedKey={copiedKey}
						onCopyKey={handleCopyKey}
					/>
					<div>
						<h3 className="text-sm font-bold text-gray-900 mb-3 tracking-tight">
							Sample Code Implementations
						</h3>
						<DocCodeSnippets
							selectedPreset={servicePresets[0]}
							apiKey={activeApiKey}
						/>
					</div>
				</div>
			)}

			{/* Tab 2: Interactive API Tester / Playground */}
			{activeTab === "playground" && (
				<div className="animate-in fade-in duration-200">
					<DocPlayground
						apiKey={activeApiKey}
						companyId={member?.companyId}
						userId={member?.id}
					/>
				</div>
			)}

			{/* Tab 3: Custom Subdomain Setup Guide */}
			{activeTab === "subdomain" && (
				<div className="animate-in fade-in duration-200">
					<DocSubdomainGuide />
				</div>
			)}
		</div>
	);
}
