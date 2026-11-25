import { NextResponse } from "next/server";

/**
 * Forwards a REST API request to the Convex HTTP router (convex/http.ts),
 * which owns API-key auth, environment checks and billing. The Next.js
 * routes under app/api/v1 are thin aliases so there is one auth boundary.
 */
export async function forwardToConvex(req: Request, path: string, body?: string): Promise<Response> {
	const base = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
	if (!base) {
		return NextResponse.json(
			{ error: "Service Unavailable", message: "API backend is not configured." },
			{ status: 503 },
		);
	}

	const headers = new Headers({ "Content-Type": "application/json" });
	for (const name of ["x-api-key", "authorization"]) {
		const value = req.headers.get(name);
		if (value) headers.set(name, value);
	}

	try {
		const res = await fetch(new URL(path, base), {
			method: req.method,
			headers,
			body,
			cache: "no-store",
		});
		return new Response(await res.text(), {
			status: res.status,
			headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
		});
	} catch (error) {
		console.error("REST proxy error:", error);
		return NextResponse.json(
			{ error: "Bad Gateway", message: "Could not reach the verification backend." },
			{ status: 502 },
		);
	}
}

/** Test keys go to the sandbox endpoint, everything else to production. */
export function verificationsPath(req: Request): string {
	const key =
		req.headers.get("x-api-key") ??
		req.headers.get("authorization")?.replace(/^bearer\s+/i, "") ??
		"";
	return key.trim().startsWith("evid_test_sk_") ? "/v1/sandbox/verifications" : "/v1/verifications";
}
