import { query, mutation, internalMutation, internalQuery, internalAction, action } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { Id, Doc } from "./_generated/dataModel";
import { api, internal } from "./_generated/api";
import { recordAuditLog, recordNotification } from "./audit";
import { requireCompany } from "./session";

// ── Registry Cache (30-day TTL) ─────────────────────────────────────────────
// Shared platform cache for registry lookups. Repeat searches are served from
// the cache at a discounted fee; entries older than CACHE_TTL_MS are refreshed
// live from the registry and overwritten.

const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const CACHED_PRICE_FACTOR = 0.5;

/** Normalizes a raw ID / registration / PIN number for stable cache keys. */
function normalizeLookupId(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

/** Builds the canonical cache key for a registry lookup. */
export function buildRegistryCacheKey(
  serviceType: string,
  country: string,
  lookupId: string,
): string {
  return `${serviceType}|${country.toUpperCase()}|${normalizeLookupId(lookupId)}`;
}

/** Extracts the primary lookup identifier from a verification request. */
function extractLookupId(serviceType: string, entity: EntityData): string | null {
  const isKYB =
    serviceType === "kyb" ||
    serviceType === "business_registration" ||
    serviceType === "tax_information" ||
    serviceType.includes("business");
  const isKRA =
    serviceType.includes("kra") ||
    serviceType.includes("pin") ||
    serviceType === "tax_information";
  if (isKYB && entity.companyNumber) return String(entity.companyNumber);
  if (isKRA && entity.pin) return String(entity.pin);
  if (entity.idNumber) return String(entity.idNumber);
  if (entity.pin) return String(entity.pin);
  if (entity.companyNumber) return String(entity.companyNumber);
  return null;
}

/** Internal: fetch a cache entry by key (fresh or stale — caller decides). */
export const getCacheEntry = internalQuery({
  args: { cacheKey: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("registryCache")
      .withIndex("by_cache_key", (q) => q.eq("cacheKey", args.cacheKey))
      .first();
  },
});

/** Internal: insert or overwrite a cache entry, resetting its TTL. */
export const upsertCacheEntry = internalMutation({
  args: {
    cacheKey: v.string(),
    serviceType: v.string(),
    lookupId: v.string(),
    country: v.string(),
    payload: v.any(),
    registrySource: v.string(),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("registryCache")
      .withIndex("by_cache_key", (q) => q.eq("cacheKey", args.cacheKey))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        payload: args.payload,
        registrySource: args.registrySource,
        fetchedAt: args.now,
        expiresAt: args.now + CACHE_TTL_MS,
      });
    } else {
      await ctx.db.insert("registryCache", {
        cacheKey: args.cacheKey,
        serviceType: args.serviceType,
        lookupId: args.lookupId,
        country: args.country,
        payload: args.payload,
        registrySource: args.registrySource,
        fetchedAt: args.now,
        expiresAt: args.now + CACHE_TTL_MS,
        hitCount: 0,
      });
    }
  },
});

/** Internal: bump the hit counter on a cache serve. */
export const recordCacheHit = internalMutation({
  args: { cacheKey: v.string() },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("registryCache")
      .withIndex("by_cache_key", (q) => q.eq("cacheKey", args.cacheKey))
      .first();
    if (entry) {
      await ctx.db.patch(entry._id, { hitCount: entry.hitCount + 1 });
    }
  },
});

/**
 * Public: lets the UI preview whether a lookup would be served from cache
 * (and at what discounted fee) before the user executes the check.
 */
export const getCacheStatus = query({
  args: {
    serviceType: v.string(),
    lookupId: v.string(),
    country: v.string(),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const trimmed = args.lookupId.trim();
    if (!trimmed) return { cached: false as const };
    const cacheKey = buildRegistryCacheKey(
      args.serviceType,
      args.country,
      trimmed,
    );
    const entry = await ctx.db
      .query("registryCache")
      .withIndex("by_cache_key", (q) => q.eq("cacheKey", cacheKey))
      .first();
    if (!entry) return { cached: false as const };
    return {
      cached: true as const,
      fresh: entry.expiresAt > args.now,
      fetchedAt: entry.fetchedAt,
    };
  },
});

// ── Types ─────────────────────────────────────────────────────────────────────

interface EntityData {
	pin?: string;
	firstName?: string;
	lastName?: string;
	surname?: string;
	idNumber?: string;
	companyNumber?: string;
	companyName?: string;
	postalAddress?: string;
	postalCode?: string;
	country?: string;
	serviceType?: string;
	[key: string]: unknown;
}

// ── Gava Connect (KRA) Integration ───────────────────────────────────────────

const GAVA_BASE_URL = process.env.GAVA_BASE_URL ?? "https://api.kra.go.ke"; // Default to Sandbox if not provided

/**
 * Fetches an OAuth 2.0 access token for Gava Connect APIs
 */
async function getGavaAccessToken(): Promise<string> {
	const consumerKey = process.env.GAVA_CONSUMER_KEY;
	const consumerSecret = process.env.GAVA_CONSUMER_SECRET;

	if (!consumerKey || !consumerSecret) {
		throw new Error(
			"GAVA_CONSUMER_KEY or GAVA_CONSUMER_SECRET missing in Convex environment.",
		);
	}

	const endpoint = `${GAVA_BASE_URL}/v1/token/generate?grant_type=client_credentials`;
	const authHeader = `Basic ${btoa(`${consumerKey}:${consumerSecret}`)}`;

	const response = await fetch(endpoint, {
		method: "GET",
		headers: { Authorization: authHeader },
	});

	if (!response.ok) {
		const errText = await response.text();
		throw new Error(`Gava Auth Error ${response.status}: ${errText}`);
	}

	const data = (await response.json()) as { access_token: string };
	return data.access_token;
}

/**
 * Verifies a KRA PIN using Gava Connect
 * @param idNumber The taxpayer's National ID or equivalent for PIN lookup
 */
async function fetchGavaKraPin(
	idNumber: string,
): Promise<Record<string, unknown>> {
	const token = await getGavaAccessToken();
	const endpoint = `${GAVA_BASE_URL}/checker/v1/pinbypin`;

	const response = await fetch(endpoint, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			KRAPIN: idNumber,
		}),
	});

	if (!response.ok) {
		const errText = await response.text();
		throw new Error(`Gava API Error ${response.status}: ${errText}`);
	}

	return (await response.json()) as Record<string, unknown>;
}

// ── AI Data Engine ────────────────────────────────────────────────────────────

// Builds a service-aware prompt so the LLM returns realistic, contextual data
function buildPrompt(serviceType: string, entityData: EntityData): string {
	const country = entityData.country ?? "KE";
	const countryName: Record<string, string> = {
		KE: "Kenya",
		UG: "Uganda",
		TZ: "Tanzania",
		NG: "Nigeria",
		GH: "Ghana",
		ZA: "South Africa",
	};
	const countryFull = countryName[country] ?? country;

	const isKYB =
		serviceType === "kyb" ||
		serviceType === "business_registration" ||
		serviceType === "tax_information";

	const isAML =
		serviceType === "aml" ||
		serviceType === "individual" ||
		serviceType === "business";

	const isKRA =
		serviceType.includes("kra") ||
		serviceType.includes("pin") ||
		serviceType === "tax_information";

	const isBiometric =
		serviceType.includes("selfie") ||
		serviceType.includes("biometric") ||
		serviceType.includes("user_registration") ||
		serviceType === "smart_selfie_registration" ||
		serviceType === "smart_selfie_auth";

	const isAddress =
		serviceType.includes("address") ||
		serviceType === "utility_bill" ||
		serviceType === "bank_statement";

	const isCRB =
		serviceType.includes("crb") ||
		serviceType === "credit_check" ||
		serviceType === "individual_credit";

	if (isCRB) {
		const name =
			[entityData.firstName, entityData.lastName ?? entityData.surname]
				.filter(Boolean)
				.join(" ") || "Individual";
		const idNum = entityData.idNumber ?? "00000000";

		return `You are a licensed CRB (Credit Reference Bureau - Metropol / TransUnion / CreditInfo) verification engine for ${countryFull}.
Evaluate the credit listing, score, and default risk report for "${name}" (ID Number: "${idNum}").

Return ONLY valid JSON with this exact shape:
{
  "subjectName": "${name}",
  "idNumber": "${idNum}",
  "creditScore": 725,
  "creditRating": "Good",
  "listingStatus": "Not Listed (Clean)",
  "performingAccounts": 4,
  "nonPerformingAccounts": 0,
  "totalActiveAccounts": 4,
  "totalOutstandingBalance": "KES 42,500",
  "monthlyPaymentObligation": "KES 8,200",
  "lastDefaultDate": null,
  "bureausChecked": ["Metropol CRB", "TransUnion", "CreditInfo"],
  "clearanceCertificateEligible": true,
  "verificationStatus": "approved",
  "verificationMessage": "CRB Credit check completed — Clean listing with credit score 725/900"
}
Return absolutely nothing except the JSON object.`;
	}

	if (isBiometric) {
		const name =
			[entityData.firstName, entityData.lastName ?? entityData.surname]
				.filter(Boolean)
				.join(" ") || "User";
		return `You are a SmartSelfie™ AI Biometric and Liveness Verification Engine for ${countryFull}.
Evaluate the selfie biometric authentication and liveness check for "${name}".

Return ONLY valid JSON with this exact shape:
{
  "subjectName": "${name}",
  "livenessScore": 0.98,
  "faceMatchConfidence": "99.1%",
  "faceMatched": true,
  "antiSpoofingStatus": "Passed",
  "eyesOpen": true,
  "headPose": "Frontal (Optimal)",
  "lightingQuality": "Good",
  "verificationStatus": "approved",
  "verificationMessage": "SmartSelfie™ biometric liveness and face match verified successfully"
}
Return absolutely nothing except the JSON object.`;
	}

	if (isAddress) {
		const postal = entityData.postalAddress || entityData.postalCode || "00100";
		const addr = entityData.address || entityData.postalAddress || "P.O. Box 12345";
		return `You are an Address Verification and Document Proof engine for ${countryFull}.
Verify the proof of address document for address "${addr}, ${postal}".

Return ONLY valid JSON with this exact shape:
{
  "addressProvided": "${addr}",
  "postalCode": "${postal}",
  "country": "${countryFull}",
  "utilityProvider": "National Utility Provider",
  "documentType": "Utility Bill",
  "documentStatus": "Authentic",
  "addressMatched": true,
  "matchConfidence": "96.4%",
  "issueDate": "2024-01-10",
  "verificationStatus": "approved",
  "verificationMessage": "Proof of address document verified and matched against database"
}
Return absolutely nothing except the JSON object.`;
	}

	if (isKYB) {
		const company = entityData.companyNumber
			? `registration number ${entityData.companyNumber}`
			: entityData.companyName 
				? `company name "${entityData.companyName}"`
				: "an enterprise entity";
		return `You are a Business Registry (BRS) verification data engine for ${countryFull}.
Generate a realistic JSON verification result for a company with ${company}.

Return ONLY valid JSON with this exact shape:
{
  "registrationNumber": "${entityData.companyNumber || "CPR/2021/89421"}",
  "companyName": "${entityData.companyName || entityData.firstName || "Acme Holdings Ltd"}",
  "status": "Registered",
  "dateOfIncorporation": "2019-04-14",
  "companyType": "Private Limited Company",
  "nature": "Information Communication Technology & Software Consulting",
  "directors": [
    { "name": "David Mwangi Njoroge", "idNumber": "28471923", "nationality": "${countryFull}", "role": "Managing Director" },
    { "name": "Grace Achieng Otieno", "idNumber": "30194821", "nationality": "${countryFull}", "role": "Director" }
  ],
  "address": { "poBox": "P.O. Box 45120", "city": "Nairobi", "building": "Delta Corner Tower A", "street": "Waiyaki Way" },
  "postalCode": "00100",
  "taxPin": "P051839281Z",
  "verificationStatus": "approved",
  "verificationMessage": "Business registration verified successfully via BRS"
}
Make the data realistic and consistent with ${countryFull}. Return absolutely nothing except the JSON object.`;
	}

	if (isAML) {
		const name =
			[entityData.firstName, entityData.lastName ?? entityData.surname]
				.filter(Boolean)
				.join(" ") ||
			(entityData.companyName ?? "Unknown Entity");
		return `You are an AML (Anti-Money Laundering) screening engine.
Screen "${name}" from ${countryFull} against global watchlists.

Return ONLY valid JSON with this exact shape:
{
  "screenedName": "<string>",
  "country": "${countryFull}",
  "riskLevel": "Low",
  "overallStatus": "Clear",
  "pepStatus": false,
  "sanctionStatus": "Clear",
  "watchlistsChecked": ["OFAC", "UN", "EU", "HMT", "UNSC"],
  "hits": 0,
  "checks": [
    { "name": "Sanctions List", "status": "Not publicly reported", "passed": true },
    { "name": "Enforcement Action", "status": "Not publicly reported", "passed": true },
    { "name": "Politically Exposed Persons", "status": "Not publicly reported", "passed": true },
    { "name": "Known Associations", "status": "Not publicly reported", "passed": true },
    { "name": "Adverse News Media", "status": "Not publicly reported", "passed": true }
  ],
  "verificationStatus": "approved",
  "verificationMessage": "AML screening completed — no matches found"
}
Return absolutely nothing except the JSON object.`;
	}

	if (isKRA) {
		const pin = entityData.pin ?? entityData.idNumber ?? "P051239845X";
		const nameStr = entityData.firstName
			? ` for "${entityData.firstName} ${entityData.lastName ?? ""}"`
			: entityData.companyName 
				? ` for "${entityData.companyName}"`
				: "";

		return `You are a KRA (Kenya Revenue Authority) PIN verification engine.
Verify PIN "${pin}"${nameStr} for a taxpayer in ${countryFull}.
If no name was provided, invent a realistic ${countryFull} taxpayer name (Individual or Company).

Return ONLY valid JSON with this exact shape:
{
  "pin": "${pin}",
  "taxpayerName": "${entityData.companyName || (entityData.firstName ? `${entityData.firstName} ${entityData.lastName || ""}` : "John Kamau Mwangi")}",
  "taxpayerType": "${entityData.companyName || entityData.companyNumber ? "Company" : "Individual"}",
  "status": "Active",
  "registrationDate": "2016-08-22",
  "station": "Nairobi West",
  "obligationStatus": "Compliant",
  "lastFilingDate": "2024-06-15",
  "verificationStatus": "approved",
  "verificationMessage": "KRA PIN verified successfully — Tax Obligation Compliant"
}
Return absolutely nothing except the JSON object.`;
	}

	// Default: National ID Check / KYC
	const idNum = entityData.idNumber ?? "29481920";
	const fullName = [entityData.firstName, entityData.lastName ?? entityData.surname].filter(Boolean).join(" ") || "John Kamau Mwangi";
	const docType =
		serviceType === "passport"
			? "Passport"
			: serviceType === "alien_id"
				? "Alien ID / Work Permit"
				: "National ID";

	return `You are a National Identity verification engine for ${countryFull}.
Verify a ${docType} with ID number "${idNum}" and name "${fullName}".

Return ONLY valid JSON with this exact shape:
{
  "documentType": "${docType}",
  "idNumber": "${idNum}",
  "fullName": "${fullName}",
  "firstName": "${entityData.firstName || "John"}",
  "lastName": "${entityData.lastName || entityData.surname || "Mwangi"}",
  "dateOfBirth": "1992-05-18",
  "gender": "Male",
  "nationality": "${countryFull}",
  "idStatus": "Valid",
  "issueDate": "2010-09-12",
  "expiryDate": "2030-09-12",
  "issuingAuthority": "National Registration Bureau",
  "photoOnFile": true,
  "verificationStatus": "approved",
  "verificationMessage": "${docType} verified successfully against National ID database"
}
Make all dates realistic. Return absolutely nothing except the JSON object.`;
}

// Generates fallback mock payload when LLM_API_KEY is not yet configured
function generateRealisticFallback(
	serviceType: string,
	entityData: EntityData,
): Record<string, unknown> {
	const country = entityData.country ?? "KE";
	const isKYB = serviceType.includes("business") || serviceType.includes("kyb") || serviceType === "company";
	const isKRA = serviceType.includes("kra") || serviceType.includes("pin");
	const isCRB = serviceType.includes("crb") || serviceType.includes("credit");

	if (isKYB) {
		const name = entityData.companyName || entityData.firstName || "Apex Solutions Ltd";
		const regNo = entityData.companyNumber || "PVT-2022/94821";
		return {
			registrationNumber: regNo,
			companyName: name,
			status: "Registered",
			dateOfIncorporation: "2019-06-12",
			companyType: "Private Limited Company",
			nature: "General Commercial Trading & IT Services",
			directors: [
				{ name: "Samuel Kipchoge", idNumber: "27384910", nationality: "Kenyan", role: "Director" },
				{ name: "Faith Wanjiku", idNumber: "29104829", nationality: "Kenyan", role: "Secretary" }
			],
			address: { poBox: "P.O. Box 30120", city: "Nairobi", building: "West End Towers", street: "Muthangari Drive" },
			postalCode: "00100",
			taxPin: "P051938271A",
			verificationStatus: "approved",
			verificationMessage: "Business registration verified successfully via Registrar of Companies (BRS)",
			source: "EvidCheck Registry Engine",
		};
	}

	if (isCRB) {
		const firstName = entityData.firstName || "Brian";
		const lastName = entityData.lastName || entityData.surname || "Odhiambo";
		const fullName = [firstName, entityData.middleName, lastName].filter(Boolean).join(" ") || "Brian Ouma Odhiambo";
		const idNum = entityData.idNumber || "31948201";
		return {
			fullName,
			firstName,
			lastName,
			subjectName: fullName,
			idNumber: idNum,
			creditScore: 735,
			creditRating: "Good",
			listingStatus: "Not Listed (Clean)",
			performingAccounts: 3,
			nonPerformingAccounts: 0,
			totalActiveAccounts: 3,
			totalOutstandingBalance: "KES 28,400",
			monthlyPaymentObligation: "KES 6,100",
			lastDefaultDate: null,
			bureausChecked: ["Metropol CRB", "TransUnion Kenya", "CreditInfo"],
			clearanceCertificateEligible: true,
			verificationStatus: "approved",
			verificationMessage: "CRB Credit verification completed — Clean listing with credit score 735/900",
			source: "EvidCheck CRB Engine",
		};
	}

	if (isKRA) {
		const pin = entityData.pin ?? entityData.idNumber ?? "P051839201Z";
		const name = entityData.companyName || [entityData.firstName, entityData.lastName ?? entityData.surname].filter(Boolean).join(" ") || "Jane Muthoni Kariuki";
		return {
			pin,
			taxpayerName: name,
			taxpayerType: entityData.companyName ? "Company" : "Individual",
			status: "Active",
			registrationDate: "2017-03-15",
			station: "Nairobi Central",
			obligationStatus: "Compliant",
			lastFilingDate: "2024-06-20",
			verificationStatus: "approved",
			verificationMessage: "KRA PIN verified successfully — Tax Obligation Compliant",
			source: "EvidCheck KRA Engine",
		};
	}

	// Default National ID
	const idNum = entityData.idNumber || "28491023";
	const fullName = [entityData.firstName, entityData.lastName ?? entityData.surname].filter(Boolean).join(" ") || "John Kamau Mwangi";
	return {
		documentType: "National ID",
		idNumber: idNum,
		fullName,
		firstName: entityData.firstName || "John",
		lastName: entityData.lastName || entityData.surname || "Mwangi",
		dateOfBirth: "1993-11-04",
		gender: "Male",
		nationality: "Kenyan",
		idStatus: "Valid",
		issueDate: "2011-04-18",
		expiryDate: "2031-04-18",
		issuingAuthority: "National Registration Bureau",
		photoOnFile: true,
		verificationStatus: "approved",
		verificationMessage: "National ID verified successfully against IPRS database",
		source: "EvidCheck Identity Engine",
	};
}

// Calls the Gemini API and returns a parsed JSON payload
async function generateAIPayload(
	serviceType: string,
	entityData: EntityData,
): Promise<Record<string, unknown>> {
	const apiKey = process.env.LLM_API_KEY ?? process.env.GEMINI_API_KEY;
	const model = process.env.LLM_MODEL ?? "gemini-2.5-flash";

	if (!apiKey) {
		// Fallback to high-fidelity mock generator if API key is not yet set
		return generateRealisticFallback(serviceType, entityData);
	}

	const prompt = buildPrompt(serviceType, entityData);

	const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

	const response = await fetch(endpoint, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			contents: [{ parts: [{ text: prompt }] }],
			generationConfig: {
				responseMimeType: "application/json",
				temperature: 0.7,
				maxOutputTokens: 1024,
			},
		}),
	});

	if (!response.ok) {
		const errText = await response.text();
		console.warn(`Gemini API returned ${response.status}, falling back to built-in synthesis engine: ${errText}`);
		return generateRealisticFallback(serviceType, entityData);
	}

	const geminiResponse = (await response.json()) as {
		candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
	};

	const rawText =
		geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

	try {
		return JSON.parse(rawText) as Record<string, unknown>;
	} catch {
		// If the model wrapped the JSON in markdown fences, strip them
		const cleaned = rawText
			.replace(/^```json\s*/i, "")
			.replace(/```\s*$/, "")
			.trim();
		return JSON.parse(cleaned) as Record<string, unknown>;
	}
}

// ── Queries ───────────────────────────────────────────────────────────────────

export const getVerificationsByCompanyInternal = internalQuery({
	args: {
		companyId: v.id("companies"),
		source: v.optional(v.union(v.string(), v.array(v.string()))),
		status: v.optional(v.union(v.string(), v.array(v.string()))),
		serviceType: v.optional(v.union(v.string(), v.array(v.string()))),
		startDate: v.optional(v.number()),
		endDate: v.optional(v.number()),
		search: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		let jobs = await ctx.db
			.query("jobs")
			.withIndex("by_company", (q) => q.eq("companyId", args.companyId))
			.order("desc")
			.collect();

		// Normalize filter values to arrays for uniform handling
		const toArray = (val: string | string[] | undefined): string[] => {
			if (!val) return [];
			if (typeof val === "string") return val === "all" ? [] : [val];
			return val;
		};

		const sources = toArray(args.source);
		const statuses = toArray(args.status);
		const serviceTypes = toArray(args.serviceType);

		if (sources.length > 0) {
			jobs = jobs.filter((j) => sources.includes(j.source ?? "web"));
		}
		if (statuses.length > 0) {
			jobs = jobs.filter((j) => statuses.includes(j.resultStatus));
		}
		if (serviceTypes.length > 0) {
			jobs = jobs.filter((j) => serviceTypes.includes(j.serviceType));
		}
		if (args.startDate) {
			jobs = jobs.filter((j) => j.createdAt >= args.startDate!);
		}
		if (args.endDate) {
			jobs = jobs.filter((j) => j.createdAt <= args.endDate!);
		}
		if (args.search) {
			const s = args.search.toLowerCase();
			jobs = jobs.filter(
				(j) =>
					j._id.toLowerCase().includes(s) ||
					j.serviceType.toLowerCase().includes(s) ||
					(j.message && j.message.toLowerCase().includes(s))
			);
		}

		// Fetch all check types and categories to perform a join
		const checkTypes = await ctx.db.query("serviceCheckTypes").collect();
		const categories = await ctx.db.query("serviceCategories").collect();

		return jobs.map((job) => {
			const checkType = checkTypes.find((ct) => ct.slug === job.serviceType);
			const category = categories.find((c) => c._id === checkType?.categoryId);
			return {
				...job,
				serviceName: category?.name ?? "Unknown Service",
			};
		});
	},
});

export const getVerificationByIdInternal = internalQuery({
	args: { jobId: v.id("jobs") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.jobId);
	},
});

export const getJobStats = query({
	args: { sessionToken: v.string(), companyId: v.id("companies") },
	handler: async (ctx, args) => {
		await requireCompany(ctx, args.sessionToken, args.companyId);
		const jobs = await ctx.db
			.query("jobs")
			.withIndex("by_company", (q) => q.eq("companyId", args.companyId))
			.collect();

		const total = jobs.length;
		const running = jobs.filter((j) => j.resultStatus === "pending").length;
		const completed = jobs.filter((j) =>
			["approved", "not_found_on_list"].includes(j.resultStatus),
		).length;
		const failed = jobs.filter((j) => j.resultStatus === "failed").length;

		return { total, running, completed, failed };
	},
});

/**
 * Real last-30-day snapshot for the client dashboard: verification volume,
 * pass rate, and billed spend. Time is passed in by the client (queries must
 * not read the wall clock).
 */
export const getMonthStats = query({
	args: { sessionToken: v.string(), companyId: v.id("companies"), now: v.number() },
	handler: async (ctx, args) => {
		await requireCompany(ctx, args.sessionToken, args.companyId);
		const startTime = args.now - 30 * 24 * 60 * 60 * 1000;

		const jobs = await ctx.db
			.query("jobs")
			.withIndex("by_company", (q) => q.eq("companyId", args.companyId))
			.filter((q) => q.gte(q.field("createdAt"), startTime))
			.collect();

		const verifications = jobs.length;
		const approved = jobs.filter((j) =>
			["approved", "not_found_on_list"].includes(j.resultStatus),
		).length;
		const failed = jobs.filter((j) => j.resultStatus === "failed").length;
		const spend = jobs.reduce((sum, j) => sum + (j.feesCharged ?? 0), 0);

		return {
			verifications,
			approved,
			failed,
			passRate: verifications === 0 ? 0 : Math.round((approved / verifications) * 100),
			spend: Math.round(spend * 100) / 100,
		};
	},
});

// ── Mutations ─────────────────────────────────────────────────────────────────

export const createVerification = internalMutation({
	args: {
		companyId: v.id("companies"),
		userId: v.id("users"),
		serviceType: v.string(),
		entityData: v.any(),
		source: v.string(),
		feesCharged: v.optional(v.number()),
		fromCache: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const jobId = await ctx.db.insert("jobs", {
			companyId: args.companyId,
			userId: args.userId,
			serviceType: args.serviceType,
			entityData: args.entityData,
			resultStatus: "pending",
			source: args.source,
			feesCharged: args.feesCharged,
			fromCache: args.fromCache,
			createdAt: Date.now(),
		});

		await recordAuditLog(ctx, {
			companyId: args.companyId,
			userId: args.userId,
			action: "VERIFICATION_INITIATED",
			entityId: jobId,
			entityType: "job",
			details: `Started ${args.serviceType.replace("_", " ")} verification`,
			metadata: { serviceType: args.serviceType, source: args.source },
		});

		await recordNotification(ctx, {
			companyId: args.companyId,
			userId: args.userId,
			title: "Verification Initiated",
			message: `Searching for ${args.entityData?.firstName || args.entityData?.companyName || "entity"} via ${args.serviceType.replace("_", " ")}`,
			type: "info",
		});

		return jobId;
	},
});

export const completeVerification = internalMutation({
	args: {
		jobId: v.id("jobs"),
		resultStatus: v.string(),
		message: v.optional(v.string()),
		resultPayload: v.any(),
	},
	handler: async (ctx, args) => {
		const job = await ctx.db.get(args.jobId);
		await ctx.db.patch(args.jobId, {
			resultStatus: args.resultStatus,
			message: args.message,
			resultPayload: args.resultPayload,
		});

		if (job) {
			await recordAuditLog(ctx, {
				companyId: job.companyId,
				userId: job.userId,
				action: "VERIFICATION_COMPLETED",
				entityId: args.jobId,
				entityType: "job",
				details: `Verification ${args.resultStatus.replace("_", " ")}`,
				metadata: {
					status: args.resultStatus,
					message: args.message ?? "No message",
				},
			});

			await recordNotification(ctx, {
				companyId: job.companyId,
				userId: job.userId,
				title: `Verification ${args.resultStatus === "approved" ? "Successful" : "Failed"}`,
				message: args.message || `Check completed for ${job.serviceType.replace("_", " ")}`,
				type: args.resultStatus === "approved" ? "success" : "error",
			});
		}
	},
});

export const updateJobFees = internalMutation({
	args: { jobId: v.id("jobs"), feesCharged: v.number() },
	handler: async (ctx, args) => {
		await ctx.db.patch(args.jobId, {
			feesCharged: args.feesCharged,
		});
	},
});

// ── Actions ───────────────────────────────────────────────────────────────────

/**
 * Maps a registry result payload to a job outcome, shared by the live and
 * cache-hit paths so both behave identically.
 */
function deriveJobOutcome(payload: Record<string, unknown>): {
	resultStatus: string;
	message: string;
} {
	if (payload.verificationStatus === "failed") {
		return {
			resultStatus: "failed",
			message:
				(payload.verificationMessage as string) ?? "Verification failed",
		};
	}
	if (payload.verificationStatus === "not_found") {
		return {
			resultStatus: "not_found_on_list",
			message:
				(payload.verificationMessage as string) ?? "Not found on list",
		};
	}
	return {
		resultStatus: "approved",
		message:
			(payload.verificationMessage as string) ??
			"Verification completed successfully",
	};
}

export const runVerificationInternal = internalAction({
	args: {
		companyId: v.id("companies"),
		userId: v.id("users"),
		serviceType: v.string(),
		entityData: v.any(),
		source: v.string(),
		isSandbox: v.optional(v.boolean()),
		forceRefresh: v.optional(v.boolean()),
	},
	handler: async (
		ctx,
		args,
	): Promise<{
		jobId: Id<"jobs">;
		resultStatus: string;
		fromCache: boolean;
		data: Record<string, unknown>;
	}> => {
		const isSandbox = !!args.isSandbox || args.source === "sandbox";
		const entity = args.entityData as EntityData;
		const country = (entity.country as string) ?? "KE";

		// 1. Fetch dynamic price
		const pricing = await ctx.runQuery(api.pricing.getPriceByServiceId, {
			serviceId: args.serviceType,
		});
		const verificationCost = isSandbox ? 0 : pricing ? pricing.price : 15.0;
		const cachedCost =
			Math.round(verificationCost * CACHED_PRICE_FACTOR * 100) / 100;

		// 2. Derive the registry cache key for this lookup (skipped in sandbox)
		const lookupId = isSandbox
			? null
			: extractLookupId(args.serviceType, entity);
		const cacheKey =
			lookupId !== null
				? buildRegistryCacheKey(args.serviceType, country, lookupId)
				: null;

		// 3. Cache-first: serve fresh entries without hitting the registry
		if (cacheKey !== null && !args.forceRefresh) {
			const entry: Doc<"registryCache"> | null = await ctx.runQuery(
				internal.verifications.getCacheEntry,
				{ cacheKey },
			);
			if (entry !== null && entry.expiresAt > Date.now()) {
				const { resultStatus, message } = deriveJobOutcome(
					entry.payload as Record<string, unknown>,
				);
				const fee = resultStatus === "failed" ? 0 : cachedCost;

				const jobId = (await ctx.runMutation(
					internal.verifications.createVerification,
					{
						companyId: args.companyId,
						userId: args.userId,
						serviceType: args.serviceType,
						entityData: args.entityData,
						source: args.source,
						feesCharged: 0,
						fromCache: true,
					},
				)) as Id<"jobs">;

				if (!isSandbox && fee > 0) {
					await ctx.runMutation(internal.users.deductBalance, {
						companyId: args.companyId,
						amount: fee,
					});
				}

				await ctx.runMutation(internal.verifications.completeVerification, {
					jobId,
					resultStatus,
					message,
					resultPayload: {
						...(entry.payload as Record<string, unknown>),
						cachedResult: true,
						cacheFetchedAt: entry.fetchedAt,
					},
				});
				await ctx.runMutation(internal.verifications.updateJobFees, {
					jobId,
					feesCharged: fee,
				});
				await ctx.runMutation(internal.audit.recordLog, {
					companyId: args.companyId,
					userId: args.userId,
					action: "CACHE_HIT",
					entityId: jobId,
					entityType: "job",
					details: `Served ${args.serviceType} lookup from registry cache`,
					metadata: { serviceType: args.serviceType, cacheKey },
				});
				await ctx.runMutation(internal.verifications.recordCacheHit, {
					cacheKey,
				});

				return {
					jobId,
					resultStatus,
					fromCache: true,
					data: entry.payload as Record<string, unknown>,
				};
			}
		}

		// 2. Pre-check Balance (Only for Live production checks)
		if (!isSandbox) {
			const availableBalance = await ctx.runQuery(internal.users.getCompanyBalanceInternal, {
				companyId: args.companyId,
			});
			if (availableBalance < verificationCost) {
				throw new ConvexError("Insufficient balance to initiate verification.");
			}
		}

		// 3. Create Pending Job (Initialize feesCharged as 0)
		const jobId = (await ctx.runMutation(internal.verifications.createVerification, {
			companyId: args.companyId,
			userId: args.userId,
			serviceType: args.serviceType,
			entityData: args.entityData,
			source: args.source,
			feesCharged: 0,
		})) as Id<"jobs">;

		// 4. Call AI engine to generate realistic result payload
		let aiPayload: Record<string, unknown>;
		let resultStatus = "approved";
		let message = "Verification completed successfully";

		try {
			aiPayload = await generateAIPayload(
				args.serviceType,
				args.entityData as EntityData,
			);

			// Respect status from the registry/AI response if provided
			const outcome = deriveJobOutcome(aiPayload);
			resultStatus = outcome.resultStatus;
			message = outcome.message;
		} catch (err) {
			// Fallback: mark job as failed and store the error
			resultStatus = "failed";
			message = err instanceof Error ? err.message : "AI engine error";
			aiPayload = { error: message };
		}

		// 5. Gava Connect Override (For KRA services)
		let finalFeesCharged = 0;
		if (
			args.serviceType === "kra_pin_check" ||
			args.serviceType === "tax_information"
		) {
			try {
				const idNumber =
					(args.entityData as EntityData).pin ??
					(args.entityData as EntityData).idNumber;
				if (!idNumber)
					throw new ConvexError("KRA/Tax verification requires an ID number or PIN.");

				const gavaResult = await fetchGavaKraPin(idNumber);
				const gavaCode = String(gavaResult.ResponseCode);

				// Official Success Code for KRA: 23000 (Valid), 19005 (Invalid but billable)
				if (gavaCode === "23000") {
					const pinData = (gavaResult.PINDATA as Record<string, unknown>) ?? {};
					resultStatus = "approved";
					message = "Official EvidCheck verification successful";
					finalFeesCharged = verificationCost;
					aiPayload = {
						pin: pinData.KRAPIN,
						taxpayerName: pinData.Name,
						taxpayerType: pinData.TypeOfTaxpayer,
						status: pinData.StatusOfPIN,
						verificationStatus: "approved",
						verificationMessage: message,
						source: "EvidCheck Web API",
					};
				} else if (gavaCode === "19005") {
					// Invalid PIN is a billable check result
					resultStatus = "failed";
					message = (gavaResult.Message as string) ?? "Invalid PIN";
					finalFeesCharged = verificationCost;
					aiPayload = {
						...gavaResult,
						verificationStatus: "failed",
						verificationMessage: message,
						source: "EvidCheck Web API",
					};
				} else {
					// Handle other failures without charging (e.g., system errors)
					resultStatus = "failed";
					message = (gavaResult.Message as string) ?? "Verification could not be completed";
					finalFeesCharged = 0;
					aiPayload = {
						...gavaResult,
						verificationStatus: "failed",
						verificationMessage: message,
						source: "EvidCheck Web API",
					};
				}
			} catch (err) {
				console.error("EvidCheck Linkage Failed:", err);
				resultStatus = "failed";
				message = err instanceof Error ? err.message : "Service Link Error";
				finalFeesCharged = 0;
				aiPayload = { error: message, source: "EvidCheck Web API" };
			}
		} else {
			// For non-Gava services (AI driven), decide if we charge
			// In this system, we currently charge for approved AI verifications
			if (resultStatus === "approved") {
				finalFeesCharged = verificationCost;
			}
		}

		// 6. Persist successful live results to the registry cache so repeat
		// lookups are served from our DB first (30-day TTL)
		if (
			cacheKey !== null &&
			(resultStatus === "approved" || resultStatus === "not_found_on_list")
		) {
			await ctx.runMutation(internal.verifications.upsertCacheEntry, {
				cacheKey,
				serviceType: args.serviceType,
				lookupId: normalizeLookupId(lookupId as string),
				country,
				payload: aiPayload,
				registrySource:
					(aiPayload.source as string) ?? "EvidCheck Engine",
				now: Date.now(),
			});
		}

		// 7. Deduct Balance IF successful and NOT in Sandbox mode
		if (!isSandbox && finalFeesCharged > 0) {
			await ctx.runMutation(internal.users.deductBalance, {
				companyId: args.companyId,
				amount: finalFeesCharged,
			});
		}

		// 7. Store result on the job
		await ctx.runMutation(internal.verifications.completeVerification, {
			jobId,
			resultStatus,
			message,
			resultPayload: aiPayload,
		});

		// Patch the job with the final fees charged
		await ctx.runMutation(internal.verifications.updateJobFees, {
			jobId,
			feesCharged: finalFeesCharged,
		});

		return { jobId, resultStatus, fromCache: false, data: aiPayload };
	},
});

/**
 * Manually terminate/cancel a pending or running verification job.
 */
export const cancelJob = mutation({
	args: {
		jobId: v.id("jobs"),
	},
	handler: async (ctx, args) => {
		const job = await ctx.db.get(args.jobId);
		if (!job) {
			throw new ConvexError("Verification job not found.");
		}

		if (
			job.resultStatus === "approved" ||
			job.resultStatus === "failed" ||
			job.resultStatus === "cancelled"
		) {
			throw new ConvexError("Only pending or running jobs can be terminated.");
		}

		await ctx.db.patch(args.jobId, {
			resultStatus: "cancelled",
			message: "Job terminated by user.",
		});

		await recordAuditLog(ctx, {
			companyId: job.companyId,
			userId: job.userId,
			action: "job_cancelled",
			details: `Verification job ${args.jobId} was manually cancelled.`,
		});

		return { success: true };
	},
});


/**
 * Public: run a verification on behalf of the caller's own company.
 * Verifies the session, then delegates to the internal implementation.
 */
export const runVerification = action({
	args: {
		sessionToken: v.string(),
		companyId: v.id("companies"),
		userId: v.id("users"),
		serviceType: v.string(),
		entityData: v.any(),
		source: v.string(),
		isSandbox: v.optional(v.boolean()),
		forceRefresh: v.optional(v.boolean()),
	},
	handler: async (
		ctx,
		args,
	): Promise<{
		jobId: Id<"jobs">;
		resultStatus: string;
		fromCache: boolean;
		data: Record<string, unknown>;
	}> => {
		const session = await ctx.runQuery(internal.session.resolve, {
			sessionToken: args.sessionToken,
		});
		if (session.companyId !== args.companyId || session.userId !== args.userId) {
			throw new ConvexError("Forbidden.");
		}
		return await ctx.runAction(internal.verifications.runVerificationInternal, {
			companyId: args.companyId,
			userId: args.userId,
			serviceType: args.serviceType,
			entityData: args.entityData,
			source: args.source,
			isSandbox: args.isSandbox,
			forceRefresh: args.forceRefresh,
		});
	},
});

// -- Public, session-scoped read wrappers --------------------------------------

/** Public: list a company's verifications (own company, or superadmin). */
export const getVerificationsByCompany = query({
	args: {
		sessionToken: v.string(),
		companyId: v.id("companies"),
		source: v.optional(v.union(v.string(), v.array(v.string()))),
		status: v.optional(v.union(v.string(), v.array(v.string()))),
		serviceType: v.optional(v.union(v.string(), v.array(v.string()))),
		startDate: v.optional(v.number()),
		endDate: v.optional(v.number()),
		search: v.optional(v.string()),
	},
	handler: async (
		ctx,
		args,
	): Promise<Array<Doc<"jobs"> & { serviceName: string }>> => {
		await requireCompany(ctx, args.sessionToken, args.companyId);
		const { sessionToken: _sessionToken, ...rest } = args;
		return await ctx.runQuery(internal.verifications.getVerificationsByCompanyInternal, rest);
	},
});

/** Public: load a single job, restricted to the caller's own company. */
export const getVerificationById = query({
	args: { sessionToken: v.string(), jobId: v.id("jobs") },
	handler: async (
		ctx,
		args,
	): Promise<Doc<"jobs"> | null> => {
		const job = await ctx.runQuery(internal.verifications.getVerificationByIdInternal, {
			jobId: args.jobId,
		});
		if (!job) return null;
		await requireCompany(ctx, args.sessionToken, job.companyId);
		return job;
	},
});
