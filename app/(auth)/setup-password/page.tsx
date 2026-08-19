"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useApp } from "@/components/providers/app-provider";
import { getErrorMessage } from "@/lib/utils";

function SetupPasswordForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	
	const { member, setMember } = useApp();
	const changePassword = useMutation(api.users.changePassword);
	const setupPasswordWithToken = useMutation(api.users.setupPasswordWithToken);

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	// Validation flags (same as register-form)
	const hasLength = password.length >= 8;
	const hasUpperCase = /[A-Z]/.test(password);
	const hasLowerCase = /[a-z]/.test(password);
	const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(
		password,
	);

	useEffect(() => {
		// If there's a token, we don't need a session to start
		if (token) return;

		// If no member or doesn't need password change, redirect
		if (!member && typeof window !== "undefined") {
			const persistedUserId = localStorage.getItem("userId");
			if (!persistedUserId) {
				router.push("/login");
			}
		} else if (member && !member.needsPasswordChange) {
			router.push("/dashboard");
		}
	}, [member, router, token]);

	const handleCompleteSetup = async () => {
		console.log("Complete Setup Clicked", {
			hasMember: !!member,
			memberId: member?.id,
			hasToken: !!token,
			passwordMatch: password === confirmPassword,
		});
		setError("");

		if (!hasLength || !hasUpperCase || !hasLowerCase || !hasSpecialChar) {
			toast.error("Please meet all password requirements.");
			return;
		}

		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			toast.error("Passwords do not match.");
			return;
		}

		setIsLoading(true);
		try {
			let result;
			if (token) {
				// Token-based setup (first time entry from email)
				result = await setupPasswordWithToken({
					token,
					newPassword: password,
				});
				
				// Persist the session locally
				localStorage.setItem("userId", result.userId);
				localStorage.setItem("companyId", result.companyId);
				setMember(result);
			} else {
				// Session-based setup (already logged in with temp password)
				if (!member?.id) throw new Error("User session not found.");
				
				await changePassword({
					userId: member.id as Id<"users">,
					newPassword: password,
				});
				
				// Update local state
				setMember({ ...member, needsPasswordChange: false });
			}

			toast.success("Password updated successfully!");

			// Redirect to dashboard
			router.push("/dashboard");
		} catch (error) {
			toast.error(getErrorMessage(error));
		} finally {
			setIsLoading(false);
		}
	};

	// Only show loading if we don't have a token AND no member
	if (!token && !member) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
				<Loader2 className="w-10 h-10 animate-spin text-[#023e4a]" />
				<p className="text-gray-500 font-medium">Validating session...</p>
			</div>
		);
	}

	return (
		<div className="max-w-md mx-auto py-12 px-6">
			<div className="flex items-center gap-2 mb-6 justify-center">
				<div className="relative w-10 h-10 flex items-center justify-center bg-teal-50 rounded-xl">
					<ShieldCheck className="w-6 h-6 text-teal-600" />
				</div>
				<span className="text-2xl font-bold text-[#188015]">EvidCheck</span>
			</div>

			<div className="text-center mb-8">
				<h1 className="text-2xl font-bold text-gray-900 mb-2">
					Secure Your Account
				</h1>
				<p className="text-sm text-gray-500">
					This is your first login. For security reasons, please create a new
					permanent password.
				</p>
			</div>

			<div className="space-y-6 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
				<div className="space-y-2">
					<Label htmlFor="password">New Password</Label>
					<PasswordInput
						id="password"
						value={password}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
						placeholder="Min. 8 characters"
						required
						className="bg-gray-50 border-gray-200 focus:border-[#023e4a] focus:ring-[#023e4a]/20 rounded-lg py-3"
					/>

					<div className="grid grid-cols-2 gap-2 mt-3 text-[11px]">
						<div
							className={`flex items-center gap-1.5 ${hasLength ? "text-green-600 font-medium" : "text-gray-400"}`}
						>
							<div
								className={`w-1.5 h-1.5 rounded-full ${hasLength ? "bg-green-600" : "bg-gray-300"}`}
							/>
							8+ characters
						</div>
						<div
							className={`flex items-center gap-1.5 ${hasUpperCase ? "text-green-600 font-medium" : "text-gray-400"}`}
						>
							<div
								className={`w-1.5 h-1.5 rounded-full ${hasUpperCase ? "bg-green-600" : "bg-gray-300"}`}
							/>
							Uppercase letter
						</div>
						<div
							className={`flex items-center gap-1.5 ${hasLowerCase ? "text-green-600 font-medium" : "text-gray-400"}`}
						>
							<div
								className={`w-1.5 h-1.5 rounded-full ${hasLowerCase ? "bg-green-600" : "bg-gray-300"}`}
							/>
							Lowercase letter
						</div>
						<div
							className={`flex items-center gap-1.5 ${hasSpecialChar ? "text-green-600 font-medium" : "text-gray-400"}`}
						>
							<div
								className={`w-1.5 h-1.5 rounded-full ${hasSpecialChar ? "bg-green-600" : "bg-gray-300"}`}
							/>
							Special character
						</div>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="confirmPassword">Confirm Password</Label>
					<PasswordInput
						id="confirmPassword"
						value={confirmPassword}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							setConfirmPassword(e.target.value);
							if (error) setError("");
						}}
						placeholder="Repeat your password"
						required
						className={`bg-gray-50 border-gray-200 focus:border-[#023e4a] focus:ring-[#023e4a]/20 rounded-lg py-3 ${error ? "border-red-500 bg-red-50" : ""}`}
					/>
					{error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
					{!error && confirmPassword && password !== confirmPassword && (
						<p className="text-xs text-orange-600 font-medium">
							Passwords do not match yet.
						</p>
					)}
				</div>

				<Button
					type="button"
					onClick={handleCompleteSetup}
					disabled={isLoading}
					className="w-full py-6 bg-[#023e4a] hover:bg-[#034e5d] text-white font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] rounded-xl shadow-lg hover:shadow-xl mt-4"
				>
					{isLoading ? (
						<>
							<Loader2 className="w-4 h-4 animate-spin mr-2" />
							Saving Password...
						</>
					) : (
						"Complete Setup"
					)}
				</Button>
			</div>
		</div>
	);
}

export default function SetupPasswordPage() {
	return (
		<Suspense 
			fallback={
				<div className="flex flex-col items-center justify-center min-h-screen gap-4">
					<Loader2 className="w-10 h-10 animate-spin text-[#023e4a]" />
					<p className="text-gray-500 font-medium">Initializing secure environment...</p>
				</div>
			}
		>
			<SetupPasswordForm />
		</Suspense>
	);
}
