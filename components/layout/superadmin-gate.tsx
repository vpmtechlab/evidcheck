"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useApp } from "@/components/providers/app-context";

/**
 * Client-side gate for the admin console. The edge middleware only sees an
 * unsigned cookie, so this re-checks the backend-sourced superadmin flag and
 * bounces everyone else to the client dashboard. (Data is still protected
 * server-side by requireSuperAdmin; this keeps the UI honest.)
 */
export function SuperAdminGate({ children }: { children: React.ReactNode }) {
	const { member } = useApp();
	const router = useRouter();
	const isSuperAdmin = member?.isSuperAdmin === true;

	React.useEffect(() => {
		if (member && !isSuperAdmin) router.replace("/dashboard");
	}, [member, isSuperAdmin, router]);

	if (!isSuperAdmin) {
		return (
			<div className="w-screen h-screen flex items-center justify-center bg-white">
				<Loader2 className="w-8 h-8 animate-spin text-brand" />
			</div>
		);
	}
	return <>{children}</>;
}
