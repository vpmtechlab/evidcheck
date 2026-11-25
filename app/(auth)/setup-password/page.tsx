"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useApp } from "@/components/providers/app-provider";
import { SetupPasswordForm } from "./components/setup-password-form";

function SetupPasswordGate() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const { member } = useApp();

	useEffect(() => {
		// Token-based entry needs no session
		if (token) return;
		if (!member && typeof window !== "undefined") {
			if (!localStorage.getItem("userId")) {
				router.push("/login");
			}
		} else if (member && !member.needsPasswordChange) {
			router.push("/dashboard");
		}
	}, [member, router, token]);

	// Only show loading if we don't have a token AND no member
	if (!token && !member) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
				<Loader2 className="w-10 h-10 animate-spin text-brand" />
				<p className="text-gray-500 font-medium">Validating session...</p>
			</div>
		);
	}

	return <SetupPasswordForm token={token} />;
}

export default function SetupPasswordPage() {
	return (
		<Suspense
			fallback={
				<div className="flex flex-col items-center justify-center min-h-screen gap-4">
					<Loader2 className="w-10 h-10 animate-spin text-brand" />
					<p className="text-gray-500 font-medium">Initializing secure environment...</p>
				</div>
			}
		>
			<SetupPasswordGate />
		</Suspense>
	);
}
