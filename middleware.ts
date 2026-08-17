import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Don't intercept static assets, APIs, or internal Next.js files
	if (
		pathname.startsWith("/_next") ||
		pathname.startsWith("/api") ||
		pathname.startsWith("/assets") ||
		pathname.includes(".")
	) {
		return NextResponse.next();
	}

	const sessionCookie = request.cookies.get("auth_session")?.value;

	let session: {
		userId?: string;
		companyId?: string;
		role?: string;
		email?: string;
		isSuperAdmin?: boolean;
	} | null = null;

	if (sessionCookie) {
		try {
			session = JSON.parse(decodeURIComponent(sessionCookie));
		} catch {
			session = null;
		}
	}

	const isAuthenticated = !!session?.userId;
	const isSuperAdmin =
		session?.isSuperAdmin ||
		session?.email?.endsWith("@vpmtechlab.com") ||
		session?.role === "superadmin";

	// 1. Root redirect
	if (pathname === "/") {
		if (isAuthenticated) {
			return NextResponse.redirect(
				new URL(isSuperAdmin ? "/admin" : "/dashboard", request.url),
			);
		}
		return NextResponse.redirect(new URL("/login", request.url));
	}

	// 2. Unauthenticated access to protected routes
	if (!isAuthenticated && (pathname.startsWith("/dashboard") || pathname.startsWith("/admin"))) {
		const loginUrl = new URL("/login", request.url);
		return NextResponse.redirect(loginUrl);
	}

	// 3. Authenticated non-admin trying to access /admin
	if (isAuthenticated && pathname.startsWith("/admin") && !isSuperAdmin) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	// 4. Authenticated user visiting /login
	if (isAuthenticated && pathname === "/login") {
		return NextResponse.redirect(
			new URL(isSuperAdmin ? "/admin" : "/dashboard", request.url),
		);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/",
		"/login",
		"/dashboard/:path*",
		"/admin/:path*",
	],
};
