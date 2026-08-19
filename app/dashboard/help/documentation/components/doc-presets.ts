import { Building2, UserCheck, FileText, Shield, ListFilter, Wallet, CreditCard, Search } from "lucide-react";

export interface ServicePreset {
	id: string;
	label: string;
	target: string;
	endpoint: string;
	method: "POST" | "GET";
	icon: any;
	description: string;
	payload: Record<string, any>;
	responseSample: Record<string, any>;
}

export const servicePresets: ServicePreset[] = [
	{
		id: "business_registration",
		label: "Business Registration Check",
		target: "BRS Kenya",
		endpoint: "/v1/verifications",
		method: "POST",
		icon: Building2,
		description: "Verify registered companies, sole proprietorships, and directors via BRS Kenya.",
		payload: {
			serviceType: "business_registration",
			entityData: {
				companyNumber: "PVT-2022/94821",
				country: "KE",
			},
		},
		responseSample: {
			success: true,
			status: 201,
			jobId: "job_9482014829",
			message: "Verification completed successfully.",
			data: {
				companyName: "TERVIO ANALYTICS LIMITED",
				registrationNumber: "PVT-2022/94821",
				registrationDate: "2022-04-14",
				status: "ACTIVE / FULLY REGISTERED",
				directors: [
					{ name: "JOHN MWANGI", idNumber: "28491023", role: "DIRECTOR / SHAREHOLDER" },
				],
			},
		},
	},
	{
		id: "national_id",
		label: "Individual Document Verification",
		target: "IPRS Kenya",
		endpoint: "/v1/verifications",
		method: "POST",
		icon: UserCheck,
		description: "Government identity verification for National ID, Alien ID, or Passport via IPRS.",
		payload: {
			serviceType: "national_id",
			entityData: {
				idNumber: "28491023",
				country: "KE",
			},
		},
		responseSample: {
			success: true,
			status: 201,
			jobId: "job_9482014830",
			message: "Verification completed successfully.",
			data: {
				documentType: "National ID",
				idNumber: "28491023",
				fullName: "JOHN MWANGI KIMANI",
				gender: "MALE",
				dateOfBirth: "1994-08-12",
				citizenshipStatus: "CITIZEN",
			},
		},
	},
	{
		id: "kra",
		label: "KRA PIN Checker",
		target: "KRA iTax",
		endpoint: "/v1/verifications",
		method: "POST",
		icon: FileText,
		description: "Tax compliance and PIN status checker for individuals and companies.",
		payload: {
			serviceType: "kra_pin_check",
			entityData: {
				pin: "P051239845X",
				country: "KE",
			},
		},
		responseSample: {
			success: true,
			status: 201,
			jobId: "job_9482014831",
			message: "Official EvidCheck verification successful.",
			data: {
				pin: "P051239845X",
				taxpayerName: "JOHN MWANGI KIMANI",
				taxpayerType: "Individual",
				statusOfPIN: "Active",
				taxObligations: ["Income Tax - Resident Individual"],
			},
		},
	},
	{
		id: "crb_check",
		label: "CRB Credit Check",
		target: "Credit Bureau",
		endpoint: "/v1/verifications",
		method: "POST",
		icon: Shield,
		description: "Credit Reference Bureau listing, score, and default risk report via ID number.",
		payload: {
			serviceType: "crb_check",
			entityData: {
				idNumber: "28491023",
				crbConsent: true,
				country: "KE",
			},
		},
		responseSample: {
			success: true,
			status: 201,
			jobId: "job_9482014832",
			message: "Verification completed successfully.",
			data: {
				idNumber: "28491023",
				fullName: "BRIAN OUMA ODHIAMBO",
				firstName: "BRIAN",
				lastName: "ODHIAMBO",
				creditScore: 735,
				rating: "LOW RISK",
				listingStatus: "CLEAN / UNLISTED",
				openAccountsCount: 2,
				delinquentAmount: 0.0,
			},
		},
	},
	{
		id: "list_jobs",
		label: "List Jobs (Paginated)",
		target: "Jobs API",
		endpoint: "/v1/jobs?page=1&limit=10",
		method: "GET",
		icon: ListFilter,
		description: "Retrieve paginated list of past verification jobs with status filters.",
		payload: {},
		responseSample: {
			success: true,
			status: 200,
			page: 1,
			limit: 10,
			total: 42,
			totalPages: 5,
			jobs: [
				{
					jobId: "job_9482014832",
					serviceType: "crb_check",
					resultStatus: "approved",
					message: "Verification completed successfully.",
					feesCharged: 12.0,
					createdAt: 1724068942000,
				},
			],
		},
	},
	{
		id: "get_balance",
		label: "Query Wallet Balance",
		target: "Billing API",
		endpoint: "/v1/balance",
		method: "GET",
		icon: Wallet,
		description: "Query remaining account balance for API requests.",
		payload: {},
		responseSample: {
			success: true,
			status: 200,
			companyId: "comp_1894210",
			companyName: "VPMTechLab",
			availableBalance: 2925.0,
			currency: "USD",
		},
	},
];
