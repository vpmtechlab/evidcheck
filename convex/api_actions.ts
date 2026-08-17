import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

/**
 * Main entry point for REST API Verifications.
 * This action:
 * 1. Validates the API Key
 * 2. Checks company balance
 * 3. Deducts fees
 * 4. Initiates a verification job
 */
export const verifyAndRun = action({
	args: {
		apiKey: v.string(),
		serviceType: v.string(), // e.g. "BRS"
		entityData: v.record(v.string(), v.any()), // JSON Payload
		webhookUrl: v.optional(v.string()), // Optional callback
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

		// 2. Find an admin user to attribute the job to (API jobs need an owner)
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

		// 3. Delegate to the core runVerification action
		// This handles balance checks, pricing, AI engine calls, and data storage in one go.
		try {
			const result = await ctx.runAction(api.verifications.runVerification, {
				companyId: company._id,
				userId: ownerId,
				serviceType: args.serviceType,
				entityData: args.entityData,
				source: "rest_api",
			});

			const isSuccess = result.resultStatus === "approved";

			return {
				success: isSuccess,
				status: isSuccess ? 201 : 200, // Still 200 even if results are 'failed' or 'not_found'
				jobId: result.jobId,
				data: result.data,
				message: isSuccess
					? "Verification completed successfully."
					: "Verification processed with status: " + result.resultStatus,
				metadata: {
					balanceRemaining: "Check dashboard for details",
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

		// 2. Fetch the verification job
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

