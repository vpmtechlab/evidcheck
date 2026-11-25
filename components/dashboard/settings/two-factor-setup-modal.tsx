"use client";

import { X, ShieldCheck } from "lucide-react";
import { TfaIntroStep } from "./tfa-intro-step";
import { TfaQrStep } from "./tfa-qr-step";
import { TfaVerifyStep } from "./tfa-verify-step";

export type TfaSetupStep = "intro" | "qr" | "verify";

interface TwoFactorSetupModalProps {
	step: TfaSetupStep;
	secret: string | null;
	qrCodeUrl: string;
	otpCode: string;
	copied: boolean;
	isGenerating: boolean;
	isVerifying: boolean;
	onClose: () => void;
	onStart: () => void;
	onScanned: () => void;
	onVerify: () => void;
	onBackToQr: () => void;
	onOtpChange: (value: string) => void;
	onCopy: (text: string) => void;
}

export function TwoFactorSetupModal(props: TwoFactorSetupModalProps) {
	const { step, secret, onClose } = props;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
			<div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
				<div className="p-6 border-b border-gray-100 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-blue-50 rounded-lg text-blue-600">
							<ShieldCheck size={20} />
						</div>
						<h3 className="font-bold text-gray-900">Configure 2FA</h3>
					</div>
					<button
						onClick={onClose}
						className="p-2 hover:bg-gray-100 rounded-full transition-colors"
					>
						<X size={20} className="text-gray-400" />
					</button>
				</div>

				<div className="p-6">
					{step === "intro" && (
						<TfaIntroStep isGenerating={props.isGenerating} onStart={props.onStart} />
					)}
					{step === "qr" && secret && (
						<TfaQrStep
							secret={secret}
							qrCodeUrl={props.qrCodeUrl}
							copied={props.copied}
							onCopy={props.onCopy}
							onScanned={props.onScanned}
						/>
					)}
					{step === "verify" && (
						<TfaVerifyStep
							otpCode={props.otpCode}
							onOtpChange={props.onOtpChange}
							isVerifying={props.isVerifying}
							onVerify={props.onVerify}
							onBack={props.onBackToQr}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
