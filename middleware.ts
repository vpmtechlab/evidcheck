import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, isSessionExpired } from "@/lib/session-cookie";

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Don't intercept static assets, APIs, or internal Next.js files
	if (
		pathname.startsWith("/_next") ||
		pathname.startsWith("/api") ||
		pathname.startsWith("/v1") ||
		pathname.startsWith("/assets") ||
		pathname.includes(".")
	) {
		return NextResponse.next();
	}

	const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;

	let session: {
		userId?: string;
		companyId?: string;
		role?: string;
		email?: string;
		isSuperAdmin?: boolean;
		expiresAt?: number;
	} | null = null;

	if (sessionCookie) {
		try {
			session = JSON.parse(decodeURIComponent(sessionCookie));
		} catch {
			session = null;
		}
	}

	const isAuthenticated = !!session?.userId;
	const isExpired = isSessionExpired(session);
	const isSuperAdmin =
		session?.isSuperAdmin ||
		session?.email?.endsWith("@vpmtechlab.com") ||
		session?.role === "superadmin";

	// 0. Expired sessions are dead on every front: wipe the cookie and force
	// a fresh sign-in (legacy sessions without an expiry are left alone).
	if (session?.userId && isExpired) {
		if (pathname === "/login") {
			const res = NextResponse.next();
			res.cookies.set(AUTH_COOKIE_NAME, "", { path: "/", maxAge: 0 });
			return res;
		}
		const loginUrl = new URL("/login", request.url);
		const res = NextResponse.redirect(loginUrl);
		res.cookies.set(AUTH_COOKIE_NAME, "", { path: "/", maxAge: 0 });
		return res;
	}

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
