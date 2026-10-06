import { format } from "date-fns";
import type { Doc } from "@/convex/_generated/dataModel";

export type ReportableVerification = Doc<"jobs"> & {
	serviceName?: string;
};

export interface ReportFilterConfig {
	startDate?: string;
	endDate?: string;
	status?: string;
	reportType?: string;
	allTime?: boolean;
}

/** Human subject line for a verification job (person or company). */
export function verificationSubject(
	entityData: Record<string, unknown> | undefined,
): string {
	const e = (entityData ?? {}) as Record<string, unknown>;
	const first = e.firstName as string | undefined;
	if (first) return `${first} ${(e.lastName as string) ?? ""}`.trim();
	return (e.companyName as string) ?? "N/A";
}

/** Primary lookup identifier (ID / reg number / PIN) for a job. */
export function verificationLookupId(
	entityData: Record<string, unknown> | undefined,
): string {
	const e = (entityData ?? {}) as Record<string, unknown>;
	return (
		(e.idNumber as string) ??
		(e.companyNumber as string) ??
		(e.pin as string) ??
		"N/A"
	);
}

/** Applies a stored report config to a job list. */
export function filterVerificationsForReport(
	jobs: ReportableVerification[],
	config?: ReportFilterConfig,
): ReportableVerification[] {
	if (!config || config.allTime) return jobs;
	const { startDate, endDate, status } = config;
	return jobs.filter((v) => {
		if (startDate && v.createdAt < new Date(startDate).getTime()) return false;
		if (endDate && v.createdAt > new Date(endDate).getTime() + 86400000)
			return false;
		if (status && status !== "all" && v.resultStatus !== status) return false;
		return true;
	});
}

export interface CsvRow {
	[key: string]: string | number | boolean | null | undefined;
}

/** Full-fidelity CSV rows for a compliance export. */
export function toComplianceCsvRows(jobs: ReportableVerification[]): CsvRow[] {
	return jobs.map((v) => ({
		Date: format(v.createdAt, "yyyy-MM-dd HH:mm"),
		Service: v.serviceName || v.serviceType,
		Status: v.resultStatus.toUpperCase(),
		Subject: verificationSubject(v.entityData as Record<string, unknown>),
		"Reference ID": v._id.slice(-8).toUpperCase(),
		"Lookup ID": verificationLookupId(v.entityData as Record<string, unknown>),
		"Fee (USD)": v.feesCharged ?? 0,
		Source: v.source,
		Message: v.message || "Processed",
	}));
}

/** Compact rows for PDF tables. */
export function toCompliancePdfRows(jobs: ReportableVerification[]): {
	headers: string[];
	rows: (string | number)[][];
} {
	return {
		headers: ["Date", "Service", "Status", "Subject", "Ref ID", "Fee"],
		rows: jobs.map((v) => [
			format(v.createdAt, "MM/dd/yyyy"),
			v.serviceName || v.serviceType,
			v.resultStatus.toUpperCase(),
			verificationSubject(v.entityData as Record<string, unknown>),
			v._id.slice(-6).toUpperCase(),
			v.feesCharged ? `$${v.feesCharged.toFixed(2)}` : "$0.00",
		]),
	};
}
