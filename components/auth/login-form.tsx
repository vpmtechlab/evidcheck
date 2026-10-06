"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useApp, Member } from "@/components/providers/app-provider";
import { Id } from "@/convex/_generated/dataModel";
import { getErrorMessage } from "@/lib/utils";
import { setSessionCookie, createSessionExpiry, STORAGE_KEYS } from "@/lib/session-cookie";
import { setSessionToken } from "@/lib/session-token";
import { TwoFactorView } from "./two-factor-view";

interface LoginResponse {
	userId: string;
	companyId: string;
	role: string;
	email: string;
	first_name: string;
	last_name: string;
	needsPasswordChange: boolean;
	has_completed_tour: boolean;
	sessionToken: string;
	sessionExpiresAt: number;
}

export function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [otpCode, setOtpCode] = useState("");
	const [step, setStep] = useState<"login" | "2fa">("login");
	const [tempUserId, setTempUserId] = useState<Id<"users"> | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const router = useRouter();
	const login = useMutation(api.users.login);
	const verify2FA = useMutation(api.auth.verify2FACode);
	const { setMember } = useApp();

	const handleSubmit = async () => {
		if (!email || !password) {
			toast.warning("Email and Password are required!");
			return;
		}

		setIsLoading(true);
		try {
			const result = await login({
				email,
				password,
				userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "Server",
				location: "Web Access" // Placeholder for now
			});

			if ("twoFactorRequired" in result && result.twoFactorRequired) {
				setTempUserId(result.userId as Id<"users">);
				setStep("2fa");
				toast.info("Two-Factor Authentication Required");
				return;
			}

			completeLogin(result as LoginResponse);
		} catch (error) {
			toast.error(getErrorMessage(error));
		} finally {
			setIsLoading(false);
		}
	};

	const handleVerify2FA = async () => {
		if (!otpCode || otpCode.length < 6 || !tempUserId) {
			toast.warning("Please enter a valid 6-digit code.");
			return;
		}

		setIsLoading(true);
		try {
			const result = await verify2FA({
				userId: tempUserId,
				code: otpCode,
			});
			completeLogin(result as LoginResponse);
		} catch (error) {
			toast.error(getErrorMessage(error));
		} finally {
			setIsLoading(false);
		}
	};

	const completeLogin = (result: LoginResponse) => {
		const expiresAt = result.sessionExpiresAt ?? createSessionExpiry();
		setSessionCookie({
			userId: result.userId,
			companyId: result.companyId,
			role: result.role,
			email: result.email,
			isSuperAdmin: result.email.includes("@vpmtechlab.com") || result.role === "superadmin",
			expiresAt,
		});

		localStorage.setItem("userId", result.userId);
		localStorage.setItem("companyId", result.companyId);
		localStorage.setItem(STORAGE_KEYS.expiresAt, String(expiresAt));
		setSessionToken(result.sessionToken);
		const memberInfo: Member = {
			id: result.userId,
			first_name: result.first_name,
			last_name: result.last_name,
			email: result.email,
			role: result.role,
			companyId: result.companyId,
			needsPasswordChange: result.needsPasswordChange,
			has_completed_tour: result.has_completed_tour,
		};
		setMember(memberInfo);

		toast.success("Login Successful!");

		setEmail("");
		setPassword("");
		setOtpCode("");

		if (result.needsPasswordChange) {
			router.push("/setup-password");
			return;
		}

		if (result.email.includes("@vpmtechlab.com")) {
			router.push("/admin");
		} else {
			router.push("/dashboard");
		}
	};

	if (step === "2fa") {
		return (
			<TwoFactorView
				otpCode={otpCode}
				isLoading={isLoading}
				onOtpChange={setOtpCode}
				onVerify={handleVerify2FA}
				onBack={() => setStep("login")}
			/>
		);
	}

	return (
		<div className="w-full space-y-4">
			<div className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="email">Email Address</Label>
					<Input
						id="email"
						type="email"
						placeholder="Enter your email address"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						className="bg-gray-50 border-gray-200 focus:border-brand focus:ring-brand/20 rounded-lg py-2"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="password">Password</Label>
					<PasswordInput
						id="password"
						placeholder="Enter your password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						className="bg-gray-50 border-gray-200 focus:border-brand focus:ring-brand/20 rounded-lg py-2"
					/>
				</div>
			</div>

			<Button
				onClick={handleSubmit}
				variant="secondary"
				size="lg"
				disabled={isLoading}
				className="w-full mt-6 py-3 transition-colors text-white font-semibold shadow-lg text-sm gap-2"
			>
				{isLoading ? "Signing In..." : "Sign In"}
			</Button>
		</div>
	);
}
