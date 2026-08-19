import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Id, Doc } from "./_generated/dataModel";

/**
 * Main entry point for REST API Verifications.
 */
export const verifyAndRun = action({
	args: {
		apiKey: v.string(),
		serviceType: v.string(),
		entityData: v.record(v.string(), v.any()),
		webhookUrl: v.optional(v.string()),
		isSandbox: v.optional(v.boolean()),
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
		const company = await ctx.runQuery(api.users.verifyApiKey, {
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
		const isSandbox = args.apiKey.startsWith("evid_test_sk_") || !!args.isSandbox;

		// 2. Find owner admin user for company
		const users = await ctx.runQuery(api.users.listUsers, {
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
			const result = await ctx.runAction(api.verifications.runVerification, {
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
export const getJobResult = action({
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
		const company = await ctx.runQuery(api.users.verifyApiKey, {
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
			const job = await ctx.runQuery(api.verifications.getVerificationById, {
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
export const listJobs = action({
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
		const company = await ctx.runQuery(api.users.verifyApiKey, {
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
			api.verifications.getVerificationsByCompany,
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
export const getBalance = action({
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
		const company = await ctx.runQuery(api.users.verifyApiKey, {
			apiKey: args.apiKey,
		});
		if (!company) {
			return {
				success: false,
				status: 401,
				message: "Invalid or inactive API Key.",
			};
		}

		const availableBalance = await ctx.runQuery(api.users.getCompanyBalance, {
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
export const topUpBalance = action({
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
		const company = await ctx.runQuery(api.users.verifyApiKey, {
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
		const users = await ctx.runQuery(api.users.listUsers, {
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
		const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

		// 1. Live Paystack Transaction Initialization
		if (paystackSecret && !isSandbox) {
			try {
				const paystackRes = await ctx.runAction(api.payments.initializeTransaction, {
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
		}

		// 2. Sandbox / Direct Top-Up Mode
		const referenceId = `EV_SANDBOX_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
		await ctx.runMutation(api.balances.addFunds, {
			companyId: company._id,
			userId: owner.id,
			amount: args.amount,
			referenceId,
		});

		const newBalance = await ctx.runQuery(api.users.getCompanyBalance, {
			companyId: company._id,
		});

		return {
			success: true,
			status: 200,
			message: `Sandbox Top-Up successful. Added $${args.amount.toFixed(2)} USD to company wallet.`,
			data: {
				reference: referenceId,
				authorizationUrl: "https://checkout.paystack.com/sandbox-demo-success",
				accessCode: "sandbox_code_demo",
				amount: args.amount,
				currency: args.currency || "USD",
				status: "success",
			},
			instructions: "Sandbox test top-up executed cleanly. Balance updated to $" + newBalance.toFixed(2),
		};
	},
});
