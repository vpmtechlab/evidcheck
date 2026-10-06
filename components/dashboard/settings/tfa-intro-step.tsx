"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TfaIntroStepProps {
	isGenerating: boolean;
	onStart: () => void;
}

const STEPS = [
	"Install an authenticator app (Google Authenticator, Authy, etc.)",
	"Scan the QR code we'll provide",
	"Enter the verification code to finish setup",
];

export function TfaIntroStep({ isGenerating, onStart }: TfaIntroStepProps) {
	return (
		<div className="space-y-6">
			<div className="text-center">
				<p className="text-gray-600 mb-6">
					Protect your account with a second security step.
					We&apos;ll use an authenticator app to generate a
					temporary code.
				</p>
				<div className="space-y-3 text-left">
					{STEPS.map((text, i) => (
						<div key={i} className="flex gap-3 text-sm">
							<div className="size-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold">
								{i + 1}
							</div>
							<p className="text-gray-700">{text}</p>
						</div>
					))}
				</div>
			</div>
			<Button
				onClick={onStart}
				disabled={isGenerating}
				className="w-full bg-secondary hover:bg-gray-800 text-white"
			>
				{isGenerating ? (
					<Loader2 className="animate-spin size-4" />
				) : (
					"Get Started"
				)}
			</Button>
		</div>
	);
}
