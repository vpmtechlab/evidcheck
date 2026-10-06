"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { isWorkEmail } from "@/lib/work-email";
import { RegisterProgress } from "./register-progress";
import { CompanyStep, type CompanyInfo } from "./company-step";
import { ProfileStep, type ProfileInfo } from "./profile-step";
import { VerifyStep } from "./verify-step";
import { SecurityStep } from "./security-step";

export function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
	const router = useRouter();

	const startRegistration = useMutation(api.users.startRegistration);
	const verifyOTP = useMutation(api.users.verifyOTP);
	const completeRegistration = useMutation(api.users.completeRegistration);
	const sendOTPEmail = useAction(api.emails.sendOTPEmail);

	const [step, setStep] = useState(1);
	const [isLoading, setIsLoading] = useState(false);

	const [company, setCompany] = useState<CompanyInfo>({ companyName: "", regNumber: "", country: "", location: "", domain: "" });
	const [profile, setProfile] = useState<ProfileInfo>({ firstName: "", surname: "", email: "" });
	const [otpCode, setOtpCode] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [agreeTerms, setAgreeTerms] = useState(false);

	const strength = {
		hasLength: password.length >= 8,
		hasCaseMix: /[A-Z]/.test(password) && /[a-z]/.test(password),
		hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password),
	};

	const resetForm = () => {
		setCompany({ companyName: "", regNumber: "", country: "", location: "", domain: "" });
		setProfile({ firstName: "", surname: "", email: "" });
		setOtpCode("");
		setPassword("");
		setConfirmPassword("");
		setAgreeTerms(false);
		setStep(1);
	};

	const handleNextToAdmin = () => {
		const { companyName, regNumber, country, location, domain } = company;
		if (companyName && regNumber && country && location && domain) {
			setStep(2);
		} else {
			toast.error("Please fill in all company details.");
		}
	};

	const handleTriggerOTP = async () => {
		const { firstName, surname, email } = profile;
		if (!firstName || !surname || !email) {
			toast.error("Please provide your name and work email.");
			return;
		}
		if (!isWorkEmail(email)) {
			toast.error("Please use a work email address. Personal emails (e.g. Gmail, Yahoo) are not permitted.");
			return;
		}
		setIsLoading(true);
		try {
			const result = await startRegistration({ ...company, ...profile });
			if (result.success) {
				await sendOTPEmail({ email, firstName, otpCode: result.otpCode });
				toast.success("Verification code sent to your email!");
				setStep(3);
			}
		} catch (error) {
			toast.error(getErrorMessage(error));
		} finally {
			setIsLoading(false);
		}
	};

	const handleVerifyOTP = async () => {
		if (!otpCode || otpCode.length < 6) {
			toast.error("Please enter the 6-digit code.");
			return;
		}
		setIsLoading(true);
		try {
			await verifyOTP({ email: profile.email, code: otpCode });
			toast.success("Email verified successfully!");
			setStep(4);
		} catch (error) {
			toast.error(getErrorMessage(error));
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmit = async () => {
		if (!password || !confirmPassword || !agreeTerms) {
			toast.error("Please set your password and agree to the terms.");
			return;
		}
		if (password !== confirmPassword) {
			toast.error("Passwords do not match.");
			return;
		}
		if (!strength.hasLength || !strength.hasCaseMix || !strength.hasSpecialChar) {
			toast.error("Password does not meet security requirements.");
			return;
		}
		setIsLoading(true);
		try {
			await completeRegistration({ email: profile.email, code: otpCode, password });
			toast.success("Account created successfully! Welcome to EvidCheck.");
			resetForm();
			if (onSuccess) onSuccess();
			else router.push("/login");
		} catch (error) {
			toast.error(getErrorMessage(error));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="w-full">
			<RegisterProgress step={step} />

			{step === 1 && (
				<CompanyStep
					values={company}
					onChange={(field, value) => setCompany((prev) => ({ ...prev, [field]: value }))}
					onNext={handleNextToAdmin}
				/>
			)}

			{step === 2 && (
				<ProfileStep
					values={profile}
					isLoading={isLoading}
					onChange={(field, value) => setProfile((prev) => ({ ...prev, [field]: value }))}
					onBack={() => setStep(1)}
					onSubmit={handleTriggerOTP}
				/>
			)}

			{step === 3 && (
				<VerifyStep
					email={profile.email}
					otpCode={otpCode}
					isLoading={isLoading}
					onOtpChange={setOtpCode}
					onVerify={handleVerifyOTP}
					onResend={handleTriggerOTP}
				/>
			)}

			{step === 4 && (
				<SecurityStep
					password={password}
					confirmPassword={confirmPassword}
					agreeTerms={agreeTerms}
					strength={strength}
					isLoading={isLoading}
					onPasswordChange={setPassword}
					onConfirmChange={setConfirmPassword}
					onAgreeChange={setAgreeTerms}
					onSubmit={handleSubmit}
				/>
			)}
		</div>
	);
}
