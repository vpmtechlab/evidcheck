"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";

interface VerifyStepProps {
	email: string;
	otpCode: string;
	isLoading: boolean;
	onOtpChange: (value: string) => void;
	onVerify: () => void;
	onResend: () => void;
}

export function VerifyStep({ email, otpCode, isLoading, onOtpChange, onVerify, onResend }: VerifyStepProps) {
	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<div className="text-center space-y-2">
				<div className="p-3 bg-green-50 rounded-full text-green-600 inline-block">
					<ShieldCheck size={32} />
				</div>
				<h3 className="text-lg font-bold text-gray-900">Confirm Your Email</h3>
				<p className="text-sm text-gray-500">We&apos;ve sent a 6-digit code to <span className="font-semibold text-gray-900">{email}</span></p>
			</div>

			<div className="space-y-4 flex flex-col items-center">
				<InputOTP maxLength={6} value={otpCode} onChange={onOtpChange}>
					<InputOTPGroup>
						<InputOTPSlot index={0} />
						<InputOTPSlot index={1} />
						<InputOTPSlot index={2} />
						<InputOTPSlot index={3} />
						<InputOTPSlot index={4} />
						<InputOTPSlot index={5} />
					</InputOTPGroup>
				</InputOTP>
				<Button onClick={onVerify} disabled={isLoading || otpCode.length < 6} variant="secondary" className="w-full mt-2 text-white font-semibold shadow-lg">
					{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Code"}
				</Button>
				<button onClick={onResend} className="text-sm text-brand hover:underline transition-colors mt-2">
					Didn&apos;t receive a code? Resend
				</button>
			</div>
		</div>
	);
}
