import type { Member } from "@/components/providers/app-context";

/**
 * Client-side mirror of the backend permission checks (convex/session.ts).
 * Used only to hide navigation and avoid mounting pages whose queries the
 * backend would reject; the backend remains the source of truth.
 */
export type Permission =
	| "view_users"
	| "manage_users"
	| "run_verifications"
	| "view_history"
	| "view_billing"
	| "manage_billing"
	| "manage_settings";

/** Dashboard routes and the permission each requires (longest prefix wins). */
const ROUTE_PERMISSIONS: Array<[prefix: string, permission: Permission]> = [
	["/dashboard/analytics", "view_history"],
	["/dashboard/verification", "run_verifications"],
	["/dashboard/jobs", "view_history"],
	["/dashboard/audit", "view_history"],
	["/dashboard/reports", "view_history"],
	["/dashboard/users", "view_users"],
	["/dashboard/billing", "view_billing"],
];

/** True when the member holds `permission`. Unknown permission sets defer to the backend. */
export function hasPermission(member: Member | null | undefined, permission: Permission): boolean {
	if (!member) return false;
	if (member.isSuperAdmin) return true;
	if (!Array.isArray(member.permissions)) return true;
	return member.permissions.includes(permission);
}

/** The permission a dashboard path requires, if any. */
export function permissionForPath(pathname: string): Permission | undefined {
	const path = pathname.split("?")[0];
	let match: [string, Permission] | undefined;
	for (const entry of ROUTE_PERMISSIONS) {
		if ((path === entry[0] || path.startsWith(entry[0] + "/")) && (!match || entry[0].length > match[0].length)) {
			match = entry;
		}
	}
	return match?.[1];
}
