import {
	Building2,
	UserCheck,
	FileText,
	Shield,
	CheckCircle2,
	XCircle,
	Clock,
	StopCircle,
	type LucideIcon,
} from "lucide-react";

export interface AuthorityInfo {
	name: string;
	code: string;
	logo: LucideIcon;
	color: string;
}

export function getAuthorityInfo(serviceType: string): AuthorityInfo {
	if (serviceType.includes("kyb") || serviceType === "business_registration") {
		return {
			name: "Business Registration Service",
			code: "BRS Kenya",
			logo: Building2,
			color: "text-indigo-600 bg-indigo-50 border-indigo-200",
		};
	}
	if (serviceType.includes("kra") || serviceType.includes("pin")) {
		return {
			name: "Kenya Revenue Authority",
			code: "KRA iTax",
			logo: FileText,
			color: "text-orange-600 bg-orange-50 border-orange-200",
		};
	}
	if (serviceType.includes("crb")) {
		return {
			name: "Credit Reference Bureau",
			code: "Metropol / TransUnion",
			logo: Shield,
			color: "text-purple-600 bg-purple-50 border-purple-200",
		};
	}
	return {
		name: "Integrated Population Registration System",
		code: "IPRS Kenya",
		logo: UserCheck,
		color: "text-blue-600 bg-blue-50 border-blue-200",
	};
}

export interface StatusBadge {
	bg: string;
	pillBg: string;
	label: string;
	code: string;
	icon: LucideIcon;
}

export function getStatusBadge(status: string): StatusBadge {
	switch (status) {
		case "approved":
			return {
				bg: "bg-emerald-50 text-emerald-800 border-emerald-300",
				pillBg: "bg-emerald-600",
				label: "Approved",
				code: "Code: 1012 Verified",
				icon: CheckCircle2,
			};
		case "failed":
			return {
				bg: "bg-red-50 text-red-800 border-red-300",
				pillBg: "bg-red-600",
				label: "Failed",
				code: "Code: 4004 Mismatch",
				icon: XCircle,
			};
		case "not_found_on_list":
			return {
				bg: "bg-green-50 text-green-800 border-green-300",
				pillBg: "bg-green-600",
				label: "Not Found on List",
				code: "Code: 2000 Clean",
				icon: CheckCircle2,
			};
		case "cancelled":
			return {
				bg: "bg-gray-100 text-gray-800 border-gray-300",
				pillBg: "bg-gray-600",
				label: "Cancelled",
				code: "Code: 0000 Terminated",
				icon: StopCircle,
			};
		case "pending":
		case "running":
		default:
			return {
				bg: "bg-amber-50 text-amber-800 border-amber-300",
				pillBg: "bg-amber-500",
				label: "Processing",
				code: "Code: 1000 Processing",
				icon: Clock,
			};
	}
}

export function serviceTypeLabel(slug: string): string {
	switch (slug) {
		case "business_registration":
		case "kyb":
			return "Business Registration Check (BRS)";
		case "national_id":
		case "kyc":
			return "Individual Document Verification (IPRS)";
		case "kra":
		case "kra_pin_check":
			return "KRA PIN & Compliance Checker";
		case "crb_check":
			return "CRB Credit Risk Check";
		default:
			return slug?.toUpperCase() || "Verification Check";
	}
}

export function formatKey(key: string): string {
	return key
		.replace(/([A-Z])/g, " $1")
		.replace(/_/g, " ")
		.replace(/^./, (c) => c.toUpperCase())
		.trim();
}
