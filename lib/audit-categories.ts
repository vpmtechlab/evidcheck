/**
 * Shared audit-log categorization. Used by the audit feed, filters, and CSV
 * export on both the client and admin audit views.
 */

export type AuditCategoryId =
	| "verification"
	| "cache"
	| "team"
	| "security"
	| "billing"
	| "api"
	| "reports"
	| "system";

export interface AuditCategory {
	id: AuditCategoryId;
	label: string;
}

export const AUDIT_CATEGORIES: AuditCategory[] = [
	{ id: "verification", label: "Verifications" },
	{ id: "cache", label: "Cache" },
	{ id: "team", label: "Team & Roles" },
	{ id: "security", label: "Security" },
	{ id: "billing", label: "Billing" },
	{ id: "api", label: "API Keys" },
	{ id: "reports", label: "Reports" },
	{ id: "system", label: "System" },
];

/** Maps a raw audit action (e.g. "VERIFICATION_COMPLETED") to a category. */
export function categorizeAuditAction(action: string): AuditCategoryId {
	const a = (action || "").toUpperCase();
	if (a.startsWith("VERIFICATION_")) return "verification";
	if (a === "CACHE_HIT" || a.includes("CACHE")) return "cache";
	if (
		a.startsWith("USER_") ||
		a.startsWith("COMPANY_") ||
		a.startsWith("ROLE_") ||
		a.includes("INVITE") ||
		a.includes("PERMISSION") ||
		a.includes("TEAM")
	)
		return "team";
	if (
		a.includes("LOGIN") ||
		a.includes("LOGOUT") ||
		a.includes("PASSWORD") ||
		a.includes("2FA") ||
		a.includes("TWO_FACTOR") ||
		a.includes("SESSION")
	)
		return "security";
	if (
		a.includes("FUND") ||
		a.includes("TOP_UP") ||
		a.includes("BALANCE") ||
		a.includes("PAYMENT") ||
		a.includes("TRANSACTION") ||
		a.includes("BILLING")
	)
		return "billing";
	if (a.includes("API_KEY") || (a.startsWith("API_") && !a.includes("KEY")))
		return "api";
	if (a.startsWith("REPORT_")) return "reports";
	return "system";
}

/** Client-side text match across the searchable log fields. */
export function auditLogMatchesSearch(
	log: { action: string; details: string; userName?: string; companyName?: string },
	query: string,
): boolean {
	const q = query.trim().toLowerCase();
	if (!q) return true;
	return (
		log.action.toLowerCase().includes(q) ||
		log.details.toLowerCase().includes(q) ||
		(log.userName ?? "").toLowerCase().includes(q) ||
		(log.companyName ?? "").toLowerCase().includes(q)
	);
}

export interface AuditCsvRow {
	_id: string;
	action: string;
	details: string;
	userName?: string;
	companyName?: string;
	entityType?: string;
	createdAt: number;
}

const csvCell = (value: string | number | undefined): string =>
	`"${String(value ?? "").replace(/"/g, '""')}"`;

/** Builds a CSV string for a set of audit logs (client + admin export). */
export function auditLogsToCsv(logs: AuditCsvRow[]): string {
	const headers = [
		"Event ID",
		"Timestamp",
		"Action",
		"Actor",
		"Company",
		"Entity Type",
		"Details",
	];
	const rows = logs.map((log) =>
		[
			csvCell(log._id),
			csvCell(new Date(log.createdAt).toISOString()),
			csvCell(log.action),
			csvCell(log.userName),
			csvCell(log.companyName),
			csvCell(log.entityType),
			csvCell(log.details),
		].join(","),
	);
	return [headers.join(","), ...rows].join("\n");
}

/** Triggers a CSV download in the browser. */
export function downloadAuditCsv(logs: AuditCsvRow[], filename: string): void {
	const csv = auditLogsToCsv(logs);
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.setAttribute("href", url);
	link.setAttribute("download", filename);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
