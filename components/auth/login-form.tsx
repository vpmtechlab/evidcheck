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
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { 
	InputOTP, 
	InputOTPGroup, 
	InputOTPSlot 
} from "@/components/ui/input-otp";
import { getErrorMessage } from "@/lib/utils";
import { setSessionCookie } from "@/lib/session-cookie";

interface LoginResponse {
	userId: string;
	companyId: string;
	role: string;
	email: string;
	first_name: string;
	last_name: string;
	needsPasswordChange: boolean;
	has_completed_tour: boolean;
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

			// If we reach here, 2FA was not required
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
		// Set cookie for Next.js edge middleware
		setSessionCookie({
			userId: result.userId,
			companyId: result.companyId,
			role: result.role,
			email: result.email,
			isSuperAdmin: result.email.includes("@vpmtechlab.com") || result.role === "superadmin",
		});

		// Local auth state persistence
		localStorage.setItem("userId", result.userId);
		localStorage.setItem("companyId", result.companyId);
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

		// Clear form state
		setEmail("");
		setPassword("");
		setOtpCode("");

		// Redirect logic
		if (result.needsPasswordChange) {
			router.push("/setup-password");
			return;
		}

		// Role-based/Domain-based routing
		if (result.email.includes("@vpmtechlab.com")) {
			router.push("/admin");
		} else {
			router.push("/dashboard");
		}
	};

	if (step === "2fa") {
		return (
			<div className="w-full space-y-6">
				<div className="flex flex-col items-center text-center space-y-2">
					<div className="p-3 bg-[#023e4a]/10 rounded-full text-[#023e4a]">
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
							onChange={(value) => setOtpCode(value)}
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
						onClick={handleVerify2FA}
						variant="secondary"
						size="lg"
						disabled={isLoading || otpCode.length < 6}
						className="w-full py-3 transition-colors text-white font-semibold shadow-lg text-sm"
					>
						{isLoading ? "Verifying..." : "Verify & Sign In"}
					</Button>

					<button
						onClick={() => setStep("login")}
						className="flex items-center justify-center gap-2 text-sm text-[#023e4a] hover:underline w-full mt-2"
					>
						<ArrowLeft size={14} /> Back to Sign In
					</button>
				</div>
			</div>
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
						className="bg-gray-50 border-gray-200 focus:border-[#023e4a] focus:ring-[#023e4a]/20 rounded-lg py-2"
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
						className="bg-gray-50 border-gray-200 focus:border-[#023e4a] focus:ring-[#023e4a]/20 rounded-lg py-2"
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
