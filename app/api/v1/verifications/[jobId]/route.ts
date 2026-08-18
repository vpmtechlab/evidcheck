import { NextResponse } from "next/server";
import { fetchAction } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

function extractApiKey(req: Request): string | null {
	const headerKey = req.headers.get("X-API-KEY") || req.headers.get("x-api-key");
	if (headerKey) return headerKey.trim();

	const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
	if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
		return authHeader.substring(7).trim();
	}
	return null;
}

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ jobId: string }> }
) {
	try {
		const apiKey = extractApiKey(req);
		if (!apiKey) {
			return NextResponse.json(
				{
					error: "Unauthorized",
					code: "ERR_UNAUTHORIZED",
					message: "Missing or invalid API key. Pass 'X-API-KEY' header or 'Authorization: Bearer <key>'."
				},
				{ status: 401 }
			);
		}

		const { jobId } = await params;
		if (!jobId) {
			return NextResponse.json(
				{
					error: "Bad Request",
					code: "ERR_INVALID_JOB_ID",
					message: "Missing 'jobId' in route parameter."
				},
				{ status: 400 }
			);
		}

		const result = await fetchAction(api.api_actions.getJobResult, {
			apiKey,
			jobId,
		});

		return NextResponse.json(result, {
			status: result.status || (result.success ? 200 : 404),
		});
	} catch (error: unknown) {
		const err = error as Error;
		console.error("Next.js GET Verification Error:", err);
		return NextResponse.json(
			{
				error: "Internal Server Error",
				code: "ERR_INTERNAL_SERVER_ERROR",
				message: err.message || "An unexpected error occurred retrieving job result."
			},
			{ status: 500 }
		);
	}
}
