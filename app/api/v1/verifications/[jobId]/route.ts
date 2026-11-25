import { forwardToConvex } from "@/lib/convex-rest-proxy";

/** Alias of GET /v1/verifications/:jobId (see convex/http.ts). */
export async function GET(
	req: Request,
	{ params }: { params: Promise<{ jobId: string }> },
) {
	const { jobId } = await params;
	return forwardToConvex(req, `/v1/verifications/${encodeURIComponent(jobId)}`);
}
