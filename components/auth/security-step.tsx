"use client";

import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface PasswordStrength {
	hasLength: boolean;
	hasCaseMix: boolean;
	hasSpecialChar: boolean;
}

interface SecurityStepProps {
	password: string;
	confirmPassword: string;
	agreeTerms: boolean;
	strength: PasswordStrength;
	isLoading: boolean;
	onPasswordChange: (value: string) => void;
	onConfirmChange: (value: string) => void;
	onAgreeChange: (value: boolean) => void;
	onSubmit: () => void;
}

export function SecurityStep({
	password,
	confirmPassword,
	agreeTerms,
	strength,
	isLoading,
	onPasswordChange,
	onConfirmChange,
	onAgreeChange,
	onSubmit,
}: SecurityStepProps) {
	const rules = [
		{ ok: strength.hasLength, label: "8+ Characters" },
		{ ok: strength.hasCaseMix, label: "Case Mix" },
		{ ok: strength.hasSpecialChar, label: "Special Char" },
	];

	return (
		<div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
			<div className="text-center space-y-2 mb-4">
				<div className="p-3 bg-green-50 rounded-full text-green-600 inline-block">
					<Lock size={32} />
				</div>
				<h3 className="text-lg font-bold text-gray-900">Secure Your Account</h3>
			</div>
			<div className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="password">Create Password</Label>
					<PasswordInput id="password" value={password} onChange={(e) => onPasswordChange(e.target.value)} placeholder="At least 8 characters" className="bg-gray-50 border-gray-200" />
					{password.length > 0 && (
						<div className="flex flex-col gap-1 mt-1 text-[10px]">
							{rules.map((rule) => (
								<span key={rule.label} className={cn(rule.ok ? "text-green-600 font-medium" : "text-gray-400")}>
									{rule.ok ? "✓" : "○"} {rule.label}
								</span>
							))}
						</div>
					)}
				</div>
				<div className="space-y-2">
					<Label htmlFor="confirmPassword">Confirm Password</Label>
					<PasswordInput id="confirmPassword" value={confirmPassword} onChange={(e) => onConfirmChange(e.target.value)} placeholder="Repeat password" className="bg-gray-50 border-gray-200" />
				</div>
				<div className="flex items-center space-x-2 pt-2">
					<Checkbox id="terms" checked={agreeTerms} onCheckedChange={(v) => onAgreeChange(v === true)} />
					<Label htmlFor="terms" className="text-gray-600 text-[10px] font-normal leading-none">
						I agree to the <a href="#" className="text-brand hover:underline">Terms & Privacy Policy</a>
					</Label>
				</div>
			</div>
			<Button onClick={onSubmit} disabled={!agreeTerms || isLoading} variant="secondary" className="w-full mt-6 text-white font-semibold shadow-lg gap-2">
				{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete Registration"}
			</Button>
		</div>
	);
}
