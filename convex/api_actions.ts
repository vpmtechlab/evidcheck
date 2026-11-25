import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id, Doc } from "./_generated/dataModel";

/**
 * Main entry point for REST API Verifications.
 */
export const verifyAndRun = internalAction({
	args: {
		apiKey: v.string(),
		serviceType: v.string(),
		entityData: v.record(v.string(), v.any()),
		webhookUrl: v.optional(v.string()),
	},
	handler: async (
		ctx,
		args,
	): Promise<{
		success: boolean;
		status: number;
		message: string;
		jobId?: Id<"jobs">;
		data?: Record<string, unknown>;
		metadata?: {
			environment?: string;
			feesCharged?: number;
			balanceRemaining?: string;
		};
	}> => {
		// 1. Authenticate API Key
		const company = await ctx.runMutation(internal.users.verifyApiKey, {
			apiKey: args.apiKey,
		});
		if (!company) {
			return {
				success: false,
				status: 401,
				message: "Invalid or inactive API Key.",
			};
		}

		// Determine if Sandbox environment
		// The key alone decides the environment; callers cannot opt into sandbox.
		const isSandbox = args.apiKey.startsWith("evid_test_sk_");

		// 2. Find owner admin user for company
		const users = await ctx.runQuery(internal.users.listUsersInternal, {
			companyId: company._id,
			role: "admin",
		});
		const ownerId = users[0]?.id;

		if (!ownerId) {
			return {
				success: false,
				status: 500,
				message: "No active administrator found for this organization.",
			};
		}

		// 3. Delegate to runVerification
		try {
			const result = await ctx.runAction(internal.verifications.runVerificationInternal, {
				companyId: company._id,
				userId: ownerId,
				serviceType: args.serviceType,
				entityData: args.entityData,
				source: isSandbox ? "sandbox" : "rest_api",
				isSandbox,
			});

			const isSuccess = result.resultStatus === "approved";

			return {
				success: isSuccess,
				status: isSuccess ? 201 : 200,
				jobId: result.jobId,
				data: result.data,
				message: isSuccess
					? "Verification completed successfully."
					: "Verification processed with status: " + result.resultStatus,
				metadata: {
					environment: isSandbox ? "sandbox" : "production",
					feesCharged: isSandbox ? 0 : undefined,
					balanceRemaining: isSandbox ? "Sandbox Mode (Zero Billing)" : "Check dashboard",
				},
			};
		} catch (err: unknown) {
			const error = err as Error;
			return {
				success: false,
				status: error.message.includes("balance") ? 402 : 500,
				message: error.message || "Internal verification error.",
			};
		}
	},
});

/**
 * Retrieve verification job results by Job ID via REST API.
 */
export const getJobResult = internalAction({
	args: {
		apiKey: v.string(),
		jobId: v.string(),
	},
	handler: async (
		ctx,
		args,
	): Promise<{
		success: boolean;
		status: number;
		message: string;
		jobId?: Id<"jobs">;
		serviceType?: string;
		resultStatus?: string;
		data?: Record<string, unknown>;
		feesCharged?: number;
		createdAt?: number;
	}> => {
		const company = await ctx.runMutation(internal.users.verifyApiKey, {
			apiKey: args.apiKey,
		});
		if (!company) {
			return {
				success: false,
				status: 401,
				message: "Invalid or inactive API Key.",
			};
		}

		try {
			const job = await ctx.runQuery(internal.verifications.getVerificationByIdInternal, {
				jobId: args.jobId as Id<"jobs">,
			});

			if (!job || job.companyId !== company._id) {
				return {
					success: false,
					status: 404,
					message: "Verification job not found or does not belong to your organization.",
				};
			}

			return {
				success: true,
				status: 200,
				jobId: job._id,
				serviceType: job.serviceType,
				resultStatus: job.resultStatus,
				message: job.message || "Verification retrieved successfully.",
				data: (job.resultPayload as Record<string, unknown>) || {},
				feesCharged: job.feesCharged,
				createdAt: job.createdAt,
			};
		} catch {
			return {
				success: false,
				status: 404,
				message: "Invalid Job ID format.",
			};
		}
	},
});

/**
 * List Verification Jobs (Paginated) via REST API.
 */
export const listJobs = internalAction({
	args: {
		apiKey: v.string(),
		page: v.optional(v.number()),
		limit: v.optional(v.number()),
		status: v.optional(v.string()),
		serviceType: v.optional(v.string()),
	},
	handler: async (
		ctx,
		args,
	): Promise<{
		success: boolean;
		status: number;
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		jobs: Array<{
			jobId: string;
			serviceType: string;
			resultStatus: string;
			message?: string;
			feesCharged?: number;
			createdAt: number;
		}>;
	}> => {
		const company = await ctx.runMutation(internal.users.verifyApiKey, {
			apiKey: args.apiKey,
		});
		if (!company) {
			return {
				success: false,
				status: 401,
				page: 1,
				limit: 10,
				total: 0,
				totalPages: 0,
				jobs: [],
			};
		}

		const allJobs: Array<Doc<"jobs"> & { serviceName?: string }> = await ctx.runQuery(
			internal.verifications.getVerificationsByCompanyInternal,
			{ companyId: company._id }
		);

		let filtered = allJobs;
		if (args.status) {
			filtered = filtered.filter((j) => j.resultStatus === args.status);
		}
		if (args.serviceType) {
			filtered = filtered.filter((j) => j.serviceType === args.serviceType);
		}

		const page = Math.max(1, args.page || 1);
		const limit = Math.min(50, Math.max(1, args.limit || 10));
		const total = filtered.length;
		const totalPages = Math.ceil(total / limit);

		const startIndex = (page - 1) * limit;
		const pageItems = filtered.slice(startIndex, startIndex + limit);

		return {
			success: true,
			status: 200,
			page,
			limit,
			total,
			totalPages,
			jobs: pageItems.map((j) => ({
				jobId: j._id,
				serviceType: j.serviceType,
				resultStatus: j.resultStatus,
				message: j.message,
				feesCharged: j.feesCharged,
				createdAt: j.createdAt,
			})),
		};
	},
});

/**
 * Retrieve Wallet Balance via REST API.
 */
export const getBalance = internalAction({
	args: {
		apiKey: v.string(),
	},
	handler: async (
		ctx,
		args,
	): Promise<{
		success: boolean;
		status: number;
		companyId?: string;
		companyName?: string;
		availableBalance?: number;
		currency?: string;
		message?: string;
	}> => {
		const company = await ctx.runMutation(internal.users.verifyApiKey, {
			apiKey: args.apiKey,
		});
		if (!company) {
			return {
				success: false,
				status: 401,
				message: "Invalid or inactive API Key.",
			};
		}

		const availableBalance = await ctx.runQuery(internal.users.getCompanyBalanceInternal, {
			companyId: company._id,
		});

		return {
			success: true,
			status: 200,
			companyId: company._id,
			companyName: company.name,
			availableBalance,
			currency: "USD",
		};
	},
});

/**
 * Top Up Wallet Balance via Paystack API Infrastructure.
 * Initiates Paystack checkout or direct sandbox top-up.
 */
export const topUpBalance = internalAction({
	args: {
		apiKey: v.string(),
		amount: v.number(),
		email: v.optional(v.string()),
		currency: v.optional(v.string()),
		callbackUrl: v.optional(v.string()),
	},
	handler: async (
		ctx,
		args,
	): Promise<{
		success: boolean;
		status: number;
		message: string;
		data?: {
			reference?: string;
			authorizationUrl?: string;
			accessCode?: string;
			amount?: number;
			currency?: string;
			status?: string;
		};
		instructions?: string;
	}> => {
		const company = await ctx.runMutation(internal.users.verifyApiKey, {
			apiKey: args.apiKey,
		});
		if (!company) {
			return {
				success: false,
				status: 401,
				message: "Invalid or inactive API Key.",
			};
		}

		if (!args.amount || args.amount <= 0) {
			return {
				success: false,
				status: 400,
				message: "Top up amount must be greater than zero.",
			};
		}

		const isSandbox = args.apiKey.startsWith("evid_test_sk_");

		// Find owner admin user for company
		const users = await ctx.runQuery(internal.users.listUsersInternal, {
			companyId: company._id,
			role: "admin",
		});
		const owner = users[0];
		if (!owner) {
			return {
				success: false,
				status: 500,
				message: "No active administrator user found for this company.",
			};
		}

		const targetEmail = args.email || owner.email || "billing@company.com";

		// Sandbox keys never move real money: the sandbox wallet is unlimited and
		// verifications run against fixtures, so there is nothing to credit.
		if (isSandbox) {
			return {
				success: true,
				status: 200,
				message: "Sandbox top-up simulated. Sandbox verifications are free; no real balance was changed.",
				data: {
					reference: `EV_SANDBOX_${Date.now()}`,
					amount: args.amount,
					currency: args.currency || "USD",
					status: "success",
				},
				instructions: "Sandbox requests are never billed. Use a live key and complete Paystack checkout to fund your real wallet.",
			};
		}

		if (!process.env.PAYSTACK_SECRET_KEY) {
			return {
				success: false,
				status: 503,
				message: "Payments are not configured on this deployment.",
			};
		}

		// Live: initialize a Paystack checkout. The wallet is credited only by the
		// signed Paystack webhook once the charge actually succeeds.
		try {
			const paystackRes = await ctx.runAction(internal.payments.initializeTransactionInternal, {
				amount: args.amount,
				email: targetEmail,
				companyId: company._id,
				userId: owner.id,
				callback_url: args.callbackUrl,
			});

			return {
				success: true,
				status: 200,
				message: "Paystack payment transaction initialized successfully.",
				data: {
					reference: paystackRes.reference,
					authorizationUrl: paystackRes.authorization_url,
					accessCode: paystackRes.access_code,
					amount: args.amount,
					currency: args.currency || "USD",
					status: "pending_payment",
				},
				instructions: "Direct user to 'authorizationUrl' to complete payment. Wallet balance will be credited automatically upon Paystack webhook confirmation.",
			};
		} catch (err: unknown) {
			const error = err as Error;
			return {
				success: false,
				status: 500,
				message: error.message || "Failed to initialize Paystack transaction.",
			};
		}
	},
});
