"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";

interface TfaVerifyStepProps {
	otpCode: string;
	onOtpChange: (value: string) => void;
	isVerifying: boolean;
	onVerify: () => void;
	onBack: () => void;
}

export function TfaVerifyStep({ otpCode, onOtpChange, isVerifying, onVerify, onBack }: TfaVerifyStepProps) {
	return (
		<div className="space-y-6">
			<div className="text-center space-y-4">
				<p className="text-gray-600">
					Enter the 6-digit code from your app to verify the setup.
				</p>
				<div className="flex justify-center">
					<InputOTP
						id="otp-setup"
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
			</div>
			<div className="space-y-3">
				<Button
					onClick={onVerify}
					disabled={isVerifying || otpCode.length < 6}
					className="w-full bg-secondary hover:bg-gray-800 text-white"
				>
					{isVerifying ? (
						<Loader2 className="animate-spin size-4" />
					) : (
						"Verify & Enable"
					)}
				</Button>
				<Button
					variant="ghost"
					onClick={onBack}
					className="w-full text-gray-500"
				>
					Back to QR Code
				</Button>
			</div>
		</div>
	);
}
