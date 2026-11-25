import { forwardToConvex, verificationsPath } from "@/lib/convex-rest-proxy";

/** Legacy alias of POST /v1/verifications (see convex/http.ts). */
export async function POST(req: Request) {
	return forwardToConvex(req, verificationsPath(req), await req.text());
}
