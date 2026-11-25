import type { ServiceType } from "./choose-service";

/** Shown when the services table hasn't been seeded yet. */
export const FALLBACK_SERVICES: ServiceType[] = [
	{
		_id: "seed_1",
		name: "Business Registration Check",
		slug: "business_registration",
		icon: "Building2",
		color: "bg-indigo-100 text-indigo-700",
		description: "Verify registered businesses, sole proprietorships, and limited companies via BRS Kenya.",
		actions: [
			{ _id: "a1", label: "Business / Company Registration Check", slug: "business_search", enabled: true },
		],
		checkTypes: [
			{ _id: "ct1", label: "LIMITED COMPANY / BUSINESS REGISTRATION", slug: "business_registration" },
		],
	},
	{
		_id: "seed_2",
		name: "Individual Document Verification",
		slug: "national_id",
		icon: "UserCheck",
		color: "bg-blue-100 text-blue-700",
		description: "Government identity validation for individuals (National ID, Alien ID, Passport) via IPRS.",
		actions: [
			{ _id: "a2", label: "Identity Document Verification", slug: "national_id_verify", enabled: true },
		],
		checkTypes: [
			{ _id: "ct2", label: "NATIONAL ID (CITIZEN)", slug: "national_id" },
			{ _id: "ct3", label: "ALIEN ID / WORK PERMIT", slug: "alien_id" },
			{ _id: "ct4", label: "PASSPORT NUMBER", slug: "passport" },
		],
	},
	{
		_id: "seed_3",
		name: "KRA PIN Checker",
		slug: "kra",
		icon: "FileText",
		color: "bg-orange-100 text-orange-700",
		description: "Tax compliance and PIN validity checker for businesses, companies, and individuals.",
		actions: [
			{ _id: "a3", label: "PIN Status & Registration Check", slug: "pin_verification", enabled: true },
		],
		checkTypes: [
			{ _id: "ct5", label: "KRA PIN CHECK (INDIVIDUAL)", slug: "kra_pin_check" },
			{ _id: "ct6", label: "KRA PIN CHECK (COMPANY / CORPORATE)", slug: "kra_pin_corporate" },
		],
	},
	{
		_id: "seed_4",
		name: "CRB Check",
		slug: "crb_check",
		icon: "Shield",
		color: "bg-purple-100 text-purple-700",
		description: "Credit Reference Bureau listing, score, and default risk report for individuals via ID number.",
		actions: [
			{ _id: "a4", label: "Credit Score & Listing Status", slug: "crb_score_check", enabled: true },
		],
		checkTypes: [
			{ _id: "ct7", label: "INDIVIDUAL CREDIT REPORT", slug: "crb_check" },
		],
	},
];
