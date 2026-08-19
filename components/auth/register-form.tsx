"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, ArrowRight, ArrowLeft, Mail, ShieldCheck, Lock } from "lucide-react";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { getErrorMessage } from "@/lib/utils";

export function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
	const router = useRouter();
	
	// Mutations & Actions
	const startRegistration = useMutation(api.users.startRegistration);
	const verifyOTP = useMutation(api.users.verifyOTP);
	const completeRegistration = useMutation(api.users.completeRegistration);
	const sendOTPEmail = useAction(api.emails.sendOTPEmail);

	const [step, setStep] = useState(1);
	const [isLoading, setIsLoading] = useState(false);

	// Step 1: Company Info
	const [companyName, setCompanyName] = useState("");
	const [regNumber, setRegNumber] = useState("");
	const [country, setCountry] = useState("");
	const [location, setLocation] = useState("");
	const [domain, setDomain] = useState("");

	// Step 2: Admin Profile
	const [firstName, setFirstName] = useState("");
	const [surname, setSurname] = useState("");
	const [email, setEmail] = useState("");

	// Step 3: OTP
	const [otpCode, setOtpCode] = useState("");

	// Step 4: Security
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [agreeTerms, setAgreeTerms] = useState<boolean | string>(false);

	// Password strength helpers
	const hasLength = password.length >= 8;
	const hasUpperCase = /[A-Z]/.test(password);
	const hasLowerCase = /[a-z]/.test(password);
	const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);

	// Step 1 -> Step 2
	const handleNextToAdmin = (e: React.FormEvent) => {
		e.preventDefault();
		if (companyName && regNumber && country && location && domain) {
			setStep(2);
		} else {
			toast.error("Please fill in all company details.");
		}
	};

	// Step 2 -> Step 3 (Trigger OTP)
	const handleTriggerOTP = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!firstName || !surname || !email) {
			toast.error("Please provide your name and work email.");
			return;
		}

		// Check for personal email
		const personalDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "live.com", "msn.com", "icloud.com", "me.com", "aol.com", "mail.com", "protonmail.com", "zoho.com", "yandex.com"];
		const domain = email.split("@")[1]?.toLowerCase();
		if (personalDomains.includes(domain)) {
			toast.error("Please use a work email address. Personal emails (e.g. Gmail, Yahoo) are not permitted.");
			return;
		}

		setIsLoading(true);
		try {
			// 1. Create verification record & generate code
			const result = await startRegistration({
				companyName,
				regNumber,
				country,
				location,
				domain,
				firstName,
				surname,
				email,
			});

			if (result.success) {
				// 2. Send email via action
				await sendOTPEmail({
					email,
					firstName,
					otpCode: result.otpCode,
				});
				
				toast.success("Verification code sent to your email!");
				setStep(3);
			}
		} catch (error) {
			toast.error(getErrorMessage(error));
		} finally {
			setIsLoading(false);
		}
	};

	// Step 3 -> Step 4 (Verify OTP)
	const handleVerifyOTP = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!otpCode || otpCode.length < 6) {
			toast.error("Please enter the 6-digit code.");
			return;
		}

		setIsLoading(true);
		try {
			await verifyOTP({ email, code: otpCode });
			toast.success("Email verified successfully!");
			setStep(4);
		} catch (error) {
			toast.error(getErrorMessage(error));
		} finally {
			setIsLoading(false);
		}
	};

	// Final Submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!password || !confirmPassword || !agreeTerms) {
			toast.error("Please set your password and agree to the terms.");
			return;
		}

		if (password !== confirmPassword) {
			toast.error("Passwords do not match.");
			return;
		}

		if (!hasLength || !hasUpperCase || !hasLowerCase || !hasSpecialChar) {
			toast.error("Password does not meet security requirements.");
			return;
		}

		setIsLoading(true);
		try {
			await completeRegistration({
				email,
				code: otpCode,
				password,
			});

			toast.success("Account created successfully! Welcome to EvidCheck.");
			
			// Clear state
			resetForm();

			if (onSuccess) {
				onSuccess();
			} else {
				router.push("/login");
			}
		} catch (error) {
			toast.error(getErrorMessage(error));
		} finally {
			setIsLoading(false);
		}
	};

	const resetForm = () => {
		setCompanyName(""); setRegNumber(""); setCountry(""); setLocation(""); setDomain("");
		setFirstName(""); setSurname(""); setEmail(""); setOtpCode("");
		setPassword(""); setConfirmPassword(""); setAgreeTerms(false);
		setStep(1);
	};

	return (
		<div className="w-full">
			{/* Progress Indicator */}
			<div className="flex items-center justify-between mb-8 px-2 relative">
				<div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gray-100 -z-10 -translate-y-1/2 rounded" />
				<div className="flex flex-col items-center">
					<div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 1 ? "bg-[#023e4a] text-white" : "bg-gray-100 text-gray-400"}`}>1</div>
					<span className="text-[10px] text-center mt-2 font-medium text-gray-600">Company</span>
				</div>
				<div className="flex flex-col items-center">
					<div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 2 ? "bg-[#023e4a] text-white" : "bg-gray-100 text-gray-400"}`}>2</div>
					<span className="text-[10px] text-center mt-2 font-medium text-gray-600">Profile</span>
				</div>
				<div className="flex flex-col items-center">
					<div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 3 ? "bg-[#023e4a] text-white" : "bg-gray-100 text-gray-400"}`}>3</div>
					<span className="text-[10px] text-center mt-2 font-medium text-gray-600">Verify</span>
				</div>
				<div className="flex flex-col items-center">
					<div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 4 ? "bg-[#023e4a] text-white" : "bg-gray-100 text-gray-400"}`}>4</div>
					<span className="text-[10px] text-center mt-2 font-medium text-gray-600">Security</span>
				</div>
			</div>

			{/* Step 1: Company Info */}
			{step === 1 && (
				<div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="companyName">Company Name</Label>
							<Input
								id="companyName"
								value={companyName}
								onChange={(e) => setCompanyName(e.target.value)}
								placeholder="Acme Corporation Ltd"
								className="bg-gray-50 border-gray-200"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="regNumber">Registration Number</Label>
							<Input
								id="regNumber"
								value={regNumber}
								onChange={(e) => setRegNumber(e.target.value)}
								placeholder="BN-1234567"
								className="bg-gray-50 border-gray-200"
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="country">Country</Label>
								<Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Kenya" className="bg-gray-50 border-gray-200" />
							</div>
							<div className="space-y-2">
								<Label htmlFor="location">City / Location</Label>
								<Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Nairobi" className="bg-gray-50 border-gray-200" />
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="domain">Company Domain</Label>
							<Input id="domain" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="acme.com" className="bg-gray-50 border-gray-200" />
						</div>
					</div>
					<Button onClick={handleNextToAdmin} variant="secondary" className="w-full mt-6 text-white font-semibold shadow-lg gap-2">
						Continue to Profile <ArrowRight size={16} />
					</Button>
				</div>
			)}

			{/* Step 2: Admin Profile */}
			{step === 2 && (
				<div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
					<button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-2">
						<ArrowLeft size={14} /> Back to Company
					</button>
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="firstName">First Name</Label>
								<Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" className="bg-gray-50 border-gray-200" />
							</div>
							<div className="space-y-2">
								<Label htmlFor="surname">Surname</Label>
								<Input id="surname" value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="Doe" className="bg-gray-50 border-gray-200" />
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Work Email</Label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
								<Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@company.com" className="bg-gray-50 border-gray-200 pl-9" />
							</div>
						</div>
					</div>
					<Button onClick={handleTriggerOTP} disabled={isLoading} variant="secondary" className="w-full mt-6 text-white font-semibold shadow-lg gap-2">
						{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Verification Code"}
					</Button>
				</div>
			)}

			{/* Step 3: OTP Verification */}
			{step === 3 && (
				<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
					<div className="text-center space-y-2">
						<div className="p-3 bg-teal-50 rounded-full text-teal-600 inline-block">
							<ShieldCheck size={32} />
						</div>
						<h3 className="text-lg font-bold text-gray-900">Confirm Your Email</h3>
						<p className="text-sm text-gray-500">We&apos;ve sent a 6-digit code to <span className="font-semibold text-gray-900">{email}</span></p>
					</div>

					<div className="space-y-4 flex flex-col items-center">
						<InputOTP maxLength={6} value={otpCode} onChange={(val) => setOtpCode(val)}>
							<InputOTPGroup>
								<InputOTPSlot index={0} />
								<InputOTPSlot index={1} />
								<InputOTPSlot index={2} />
								<InputOTPSlot index={3} />
								<InputOTPSlot index={4} />
								<InputOTPSlot index={5} />
							</InputOTPGroup>
						</InputOTP>
						<Button onClick={handleVerifyOTP} disabled={isLoading || otpCode.length < 6} variant="secondary" className="w-full mt-2 text-white font-semibold shadow-lg">
							{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Code"}
						</Button>
						<button onClick={handleTriggerOTP} className="text-sm text-[#023e4a] hover:underline transition-colors mt-2">
							Didn&apos;t receive a code? Resend
						</button>
					</div>
				</div>
			)}

			{/* Step 4: Security (Password) */}
			{step === 4 && (
				<form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
					<div className="text-center space-y-2 mb-4">
						<div className="p-3 bg-teal-50 rounded-full text-teal-600 inline-block">
							<Lock size={32} />
						</div>
						<h3 className="text-lg font-bold text-gray-900">Secure Your Account</h3>
					</div>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="password">Create Password</Label>
							<PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className="bg-gray-50 border-gray-200" />
							{password.length > 0 && (
								<div className="flex flex-col gap-1 mt-1 text-[10px]">
									<span className={hasLength ? "text-green-600 font-medium" : "text-gray-400"}>{hasLength ? "✓" : "○"} 8+ Characters</span>
									<span className={hasUpperCase && hasLowerCase ? "text-green-600 font-medium" : "text-gray-400"}>{hasUpperCase && hasLowerCase ? "✓" : "○"} Case Mix</span>
									<span className={hasSpecialChar ? "text-green-600 font-medium" : "text-gray-400"}>{hasSpecialChar ? "✓" : "○"} Special Char</span>
								</div>
							)}
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirmPassword">Confirm Password</Label>
							<PasswordInput id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" className="bg-gray-50 border-gray-200" />
						</div>
						<div className="flex items-center space-x-2 pt-2">
							<Checkbox id="terms" checked={!!agreeTerms} onCheckedChange={setAgreeTerms} />
							<Label htmlFor="terms" className="text-gray-600 text-[10px] font-normal leading-none">
								I agree to the <a href="#" className="text-[#023e4a] hover:underline">Terms & Privacy Policy</a>
							</Label>
						</div>
					</div>
					<Button type="submit" disabled={!agreeTerms || isLoading} variant="secondary" className="w-full mt-6 text-white font-semibold shadow-lg gap-2">
						{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete Registration"}
					</Button>
				</form>
			)}
		</div>
	);
}
