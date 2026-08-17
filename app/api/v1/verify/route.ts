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

export async function POST(req: Request) {
	try {
		const apiKey = extractApiKey(req);
		if (!apiKey) {
			return NextResponse.json(
				{ error: "Unauthorized", message: "Missing or invalid API key. Pass 'X-API-KEY' header or 'Authorization: Bearer <key>'." },
				{ status: 401 },
			);
		}

		const body = await req.json();
		const {
			serviceType,
			type,
			service_type,
			entityData,
			data,
			entity_data,
			webhookUrl,
			webhook_url,
		} = body;

		const targetServiceType = serviceType || type || service_type || "national_id";
		const targetEntityData = entityData || data || entity_data || {};

		// Execute unified Convex verification action
		const result = await fetchAction(api.api_actions.verifyAndRun, {
			apiKey,
			serviceType: targetServiceType,
			entityData: targetEntityData,
			webhookUrl: webhookUrl || webhook_url,
		});

		return NextResponse.json(result, {
			status: result.status || (result.success ? 201 : 400),
		});
	} catch (error: unknown) {
		const err = error as Error;
		console.error("Next.js Verification API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error", message: err.message || "An unexpected error occurred." },
			{ status: 500 },
		);
	}
}
