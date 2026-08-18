/**
 * Client & Server Session Cookie Management for Next.js Middleware Route Protection
 */

export interface SessionData {
	userId: string;
	companyId: string;
	role: string;
	email: string;
	isSuperAdmin?: boolean;
}

export const AUTH_COOKIE_NAME = "auth_session";

/**
 * Sets the session cookie in browser
 */
export function setSessionCookie(session: SessionData, maxAgeDays = 7) {
	if (typeof document === "undefined") return;

	const json = JSON.stringify(session);
	const encoded = encodeURIComponent(json);
	const maxAge = maxAgeDays * 24 * 60 * 60;
	
	// Secure cookie settings
	document.cookie = `${AUTH_COOKIE_NAME}=${encoded}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/**
 * Reads and parses the session cookie in browser
 */
export function getSessionCookie(): SessionData | null {
	if (typeof document === "undefined") return null;

	const match = document.cookie
		.split("; ")
		.find((row) => row.startsWith(`${AUTH_COOKIE_NAME}=`));

	if (!match) return null;

	try {
		const raw = match.split("=")[1];
		return JSON.parse(decodeURIComponent(raw)) as SessionData;
	} catch {
		return null;
	}
}

/**
 * Clears the session cookie on logout
 */
export function clearSessionCookie() {
	if (typeof document === "undefined") return;
	document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}
