"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot
} from "@/components/ui/input-otp";

interface TwoFactorViewProps {
	otpCode: string;
	isLoading: boolean;
	onOtpChange: (value: string) => void;
	onVerify: () => void;
	onBack: () => void;
}

export function TwoFactorView({ otpCode, isLoading, onOtpChange, onVerify, onBack }: TwoFactorViewProps) {
	return (
		<div className="w-full space-y-6">
			<div className="flex flex-col items-center text-center space-y-2">
				<div className="p-3 bg-brand/10 rounded-full text-brand">
					<ShieldCheck size={32} />
				</div>
				<h2 className="text-xl font-bold text-gray-900">Two-Factor Authentication</h2>
				<p className="text-sm text-gray-500 max-w-[280px]">
					Enter the 6-digit verification code from your authenticator app to continue.
				</p>
			</div>

			<div className="space-y-4">
				<div className="space-y-2 flex flex-col items-center">
					<Label htmlFor="otp" className="mb-2">Verification Code</Label>
					<InputOTP
						id="otp"
						maxLength={6}
						value={otpCode}
						onChange={onOtpChange}
						containerClassName="justify-center"
					>
						<InputOTPGroup>
							<InputOTPSlot index={0} />
							<InputOTPSlot index={1} />
							<InputOTPSlot index={2} />
							<InputOTPSlot index={3} />
							<InputOTPSlot index={4} />
							<InputOTPSlot index={5} />
						</InputOTPGroup>
					</InputOTP>
				</div>

				<Button
					onClick={onVerify}
					variant="secondary"
					size="lg"
					disabled={isLoading || otpCode.length < 6}
					className="w-full py-3 transition-colors text-white font-semibold shadow-lg text-sm"
				>
					{isLoading ? "Verifying..." : "Verify & Sign In"}
				</Button>

				<button
					onClick={onBack}
					className="flex items-center justify-center gap-2 text-sm text-brand hover:underline w-full mt-2"
				>
					<ArrowLeft size={14} /> Back to Sign In
				</button>
			</div>
		</div>
	);
}
