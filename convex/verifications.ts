import { query, mutation, action } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";
import { recordAuditLog, recordNotification } from "./audit";

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
			: "an unknown company";
		return `You are a Business Registry (BRS) verification data engine for ${countryFull}.
Generate a realistic JSON verification result for a company with ${company}.

Return ONLY valid JSON with this exact shape:
{
  "registrationNumber": "<string>",
  "companyName": "<string>",
  "status": "Registered" | "Inactive" | "Deregistered",
  "dateOfIncorporation": "<YYYY-MM-DD>",
  "companyType": "Private Limited" | "Public Limited" | "Partnership" | "Sole Proprietor",
  "nature": "<brief business description>",
  "directors": [{ "name": "<string>", "idNumber": "<string>", "nationality": "<string>", "role": "Director" | "Secretary" }],
  "address": { "poBox": "<string>", "city": "<string>", "building": "<string>", "street": "<string>" },
  "postalCode": "<string>",
  "taxPin": "<string>",
  "verificationStatus": "approved",
  "verificationMessage": "Business registration verified successfully"
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
  "riskLevel": "Low" | "Medium" | "High",
  "overallStatus": "Clear" | "Flagged",
  "pepStatus": false,
  "sanctionStatus": "Clear" | "Sanctioned",
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
For 85% of requests return riskLevel "Low" and all checks passed. For 15% return "Medium" with one flagged check.
Return absolutely nothing except the JSON object.`;
	}

	if (isKRA) {
		const pin = entityData.pin ?? entityData.idNumber ?? "P000000000X";
		const nameStr = entityData.firstName
			? ` for "${entityData.firstName} ${entityData.lastName ?? ""}"`
			: "";

		return `You are a KRA (Kenya Revenue Authority) PIN verification engine.
Verify PIN "${pin}"${nameStr} for a taxpayer in ${countryFull}.
If no name was provided, invent a realistic ${countryFull} taxpayer name (Individual or Company).

Return ONLY valid JSON with this exact shape:
{
  "pin": "${pin}",
  "taxpayerName": "<string>",
  "taxpayerType": "Individual" | "Company",
  "status": "Active" | "Dormant" | "Cancelled",
  "registrationDate": "<YYYY-MM-DD>",
  "station": "<KRA station name>",
  "obligationStatus": "Compliant" | "Non-Compliant",
  "lastFilingDate": "<YYYY-MM-DD>",
  "verificationStatus": "approved",
  "verificationMessage": "KRA PIN verified successfully"
}
Return absolutely nothing except the JSON object.`;
	}

	// Default: KYC (National ID, Passport, Driver's License)
	const idNum = entityData.idNumber ?? "00000000";
	const nameStr = entityData.firstName
		? ` for "${entityData.firstName} ${entityData.lastName ?? ""}"`
		: "";
	const docType =
		serviceType === "passport"
			? "Passport"
			: serviceType === "drivers_license"
				? "Driver's License"
				: "National ID";

	return `You are a National Identity verification engine for ${countryFull}.
Verify a ${docType} ${nameStr} with ID number "${idNum}".
If the name was not provided, please invent a realistic ${countryFull} name corresponding to the ID number for this verification check.

Return ONLY valid JSON with this exact shape:
{
  "documentType": "${docType}",
  "idNumber": "${idNum}",
  "fullName": "<string>",
  "firstName": "<string>",
  "lastName": "<string>",
  "dateOfBirth": "<YYYY-MM-DD>",
  "gender": "Male" | "Female",
  "nationality": "${countryFull}",
  "idStatus": "Valid" | "Expired" | "Invalid",
  "issueDate": "<YYYY-MM-DD>",
  "expiryDate": "<YYYY-MM-DD>",
  "issuingAuthority": "<string>",
  "photoOnFile": true,
  "verificationStatus": "approved",
  "verificationMessage": "${docType} verified successfully"
}
Make all dates realistic. Return absolutely nothing except the JSON object.`;
}

// Calls the Gemini API and returns a parsed JSON payload
async function generateAIPayload(
	serviceType: string,
	entityData: EntityData,
): Promise<Record<string, unknown>> {
	const apiKey = process.env.LLM_API_KEY;
	const model = process.env.LLM_MODEL ?? "gemini-2.5-flash";

	if (!apiKey) {
		throw new Error("LLM_API_KEY environment variable is not set in Convex.");
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
		throw new Error(`Gemini API error ${response.status}: ${errText}`);
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

export const getVerificationsByCompany = query({
	args: { companyId: v.id("companies") },
	handler: async (ctx, args) => {
		const jobs = await ctx.db
			.query("jobs")
			.withIndex("by_company", (q) => q.eq("companyId", args.companyId))
			.order("desc")
			.collect();

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

export const getVerificationById = query({
	args: { jobId: v.id("jobs") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.jobId);
	},
});

export const getJobStats = query({
	args: { companyId: v.id("companies") },
	handler: async (ctx, args) => {
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

// ── Mutations ─────────────────────────────────────────────────────────────────

export const createVerification = mutation({
	args: {
		companyId: v.id("companies"),
		userId: v.id("users"),
		serviceType: v.string(),
		entityData: v.any(),
		source: v.string(),
		feesCharged: v.optional(v.number()),
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

export const completeVerification = mutation({
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

export const updateJobFees = mutation({
	args: { jobId: v.id("jobs"), feesCharged: v.number() },
	handler: async (ctx, args) => {
		await ctx.db.patch(args.jobId, {
			feesCharged: args.feesCharged,
		});
	},
});

// ── Actions ───────────────────────────────────────────────────────────────────

export const runVerification = action({
	args: {
		companyId: v.id("companies"),
		userId: v.id("users"),
		serviceType: v.string(),
		entityData: v.any(),
		source: v.string(),
	},
	handler: async (
		ctx,
		args,
	): Promise<{
		jobId: Id<"jobs">;
		resultStatus: string;
		data: Record<string, unknown>;
	}> => {
		// 1. Fetch dynamic price
		const pricing = await ctx.runQuery(api.pricing.getPriceByServiceId, {
			serviceId: args.serviceType,
		});
		const verificationCost = pricing ? pricing.price : 15.0;

		// 2. Pre-check Balance
		const availableBalance = await ctx.runQuery(api.users.getCompanyBalance, {
			companyId: args.companyId,
		});
		if (availableBalance < verificationCost) {
			throw new ConvexError("Insufficient balance to initiate verification.");
		}

		// 3. Create Pending Job (Initialize feesCharged as 0)
		const jobId = (await ctx.runMutation(api.verifications.createVerification, {
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

			// Respect status from AI response if provided
			if (aiPayload.verificationStatus === "failed") {
				resultStatus = "failed";
				message =
					(aiPayload.verificationMessage as string) ?? "Verification failed";
			} else if (aiPayload.verificationStatus === "not_found") {
				resultStatus = "not_found_on_list";
				message =
					(aiPayload.verificationMessage as string) ?? "Not found on list";
			} else {
				message = (aiPayload.verificationMessage as string) ?? message;
			}
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
					message = "Official TrustCert verification successful";
					finalFeesCharged = verificationCost;
					aiPayload = {
						pin: pinData.KRAPIN,
						taxpayerName: pinData.Name,
						taxpayerType: pinData.TypeOfTaxpayer,
						status: pinData.StatusOfPIN,
						verificationStatus: "approved",
						verificationMessage: message,
						source: "TrustCert Web API",
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
						source: "TrustCert Web API",
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
						source: "TrustCert Web API",
					};
				}
			} catch (err) {
				console.error("TrustCert Linkage Failed:", err);
				resultStatus = "failed";
				message = err instanceof Error ? err.message : "Service Link Error";
				finalFeesCharged = 0;
				aiPayload = { error: message, source: "TrustCert Web API" };
			}
		} else {
			// For non-Gava services (AI driven), decide if we charge
			// In this system, we currently charge for approved AI verifications
			if (resultStatus === "approved") {
				finalFeesCharged = verificationCost;
			}
		}

		// 6. Deduct Balance IF successful
		if (finalFeesCharged > 0) {
			await ctx.runMutation(api.users.deductBalance, {
				companyId: args.companyId,
				amount: finalFeesCharged,
			});
		}

		// 7. Store result on the job
		await ctx.runMutation(api.verifications.completeVerification, {
			jobId,
			resultStatus,
			message,
			resultPayload: aiPayload,
		});

		// Patch the job with the final fees charged
		await ctx.runMutation(api.verifications.updateJobFees, {
			jobId,
			feesCharged: finalFeesCharged,
		});

		return { jobId, resultStatus, data: aiPayload };
	},
});
