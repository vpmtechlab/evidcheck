"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import { useApp } from "@/components/providers/app-context";
import { hasPermission, permissionForPath } from "@/lib/permissions";

/**
 * Renders a "no access" panel instead of a dashboard page the member lacks
 * permission for, so the page's queries (which the backend would reject)
 * never mount.
 */
export function PermissionGate({ children }: { children: React.ReactNode }) {
	const { member } = useApp();
	const pathname = usePathname() ?? "";
	const required = permissionForPath(pathname);

	if (!required || !member || hasPermission(member, required)) {
		return <>{children}</>;
	}

	return (
		<div className="flex flex-col items-center justify-center text-center py-24 gap-3">
			<div className="p-3 rounded-full bg-gray-100 text-gray-500">
				<Lock size={22} />
			</div>
			<h2 className="text-base font-bold text-gray-900">You don&apos;t have access to this page</h2>
			<p className="text-sm text-gray-500 max-w-sm">
				Ask a company admin to grant you the required permission in Team &amp; Roles.
			</p>
			<Link href="/dashboard" className="text-sm font-semibold text-brand hover:underline mt-1">
				Back to dashboard
			</Link>
		</div>
	);
}
