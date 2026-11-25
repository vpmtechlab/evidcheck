"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useApp } from "@/components/providers/app-provider";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { getSessionToken, setSessionToken } from "@/lib/session-token";
import { PasswordChecklist } from "./password-checklist";

export function SetupPasswordForm({ token }: { token: string | null }) {
	const router = useRouter();
	const { member, setMember } = useApp();
	const changePassword = useMutation(api.users.changePassword);
	const setupPasswordWithToken = useMutation(api.users.setupPasswordWithToken);

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const hasLength = password.length >= 8;
	const hasUpperCase = /[A-Z]/.test(password);
	const hasLowerCase = /[a-z]/.test(password);
	const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);

	const handleCompleteSetup = async () => {
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
			if (token) {
				const result = await setupPasswordWithToken({ token, newPassword: password });
				localStorage.setItem("userId", result.userId);
				localStorage.setItem("companyId", result.companyId);
				setSessionToken(result.sessionToken);
				setMember(result);
			} else {
				if (!member?.id) throw new Error("User session not found.");
				await changePassword({
					sessionToken: getSessionToken() ?? "",
					userId: member.id as Id<"users">,
					newPassword: password,
				});
				setMember({ ...member, needsPasswordChange: false });
			}

			toast.success("Password updated successfully!");
			router.push("/dashboard");
		} catch (error) {
			toast.error(getErrorMessage(error));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto py-12 px-6">
			<div className="flex items-center gap-2 mb-6 justify-center">
				<div className="relative w-10 h-10 flex items-center justify-center bg-navy rounded-xl">
					<ShieldCheck className="w-6 h-6 text-white" />
				</div>
				<span className="text-2xl font-bold text-navy">EvidCheck</span>
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

			<div className="space-y-6 bg-white p-8 rounded-lg border border-gray-200 shadow-2xs">
				<div className="space-y-2">
					<Label htmlFor="password">New Password</Label>
					<PasswordInput
						id="password"
						value={password}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
						placeholder="Min. 8 characters"
						required
						className="bg-gray-50 border-gray-200 focus:border-brand focus:ring-brand/20 rounded-lg py-3"
					/>

					<PasswordChecklist
						hasLength={hasLength}
						hasUpperCase={hasUpperCase}
						hasLowerCase={hasLowerCase}
						hasSpecialChar={hasSpecialChar}
					/>
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
						className={cn(
							"bg-gray-50 border-gray-200 focus:border-brand focus:ring-brand/20 rounded-lg py-3",
							error && "border-red-500 bg-red-50"
						)}
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
					className="w-full py-6 bg-brand hover:bg-brand-dark text-white font-semibold transition-colors rounded-lg shadow-lg mt-4 disabled:opacity-50"
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
