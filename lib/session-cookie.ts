/**
 * Client & Server Session Cookie Management for Next.js Middleware Route Protection
 */

export interface SessionData {
	userId: string;
	companyId: string;
	role: string;
	email: string;
	isSuperAdmin?: boolean;
	/** Absolute expiry as a Unix timestamp (ms). Sessions without one are treated as valid (legacy). */
	expiresAt?: number;
}

export const AUTH_COOKIE_NAME = "auth_session";

/** Local storage keys backing session persistence across reloads. */
export const STORAGE_KEYS = {
	userId: "userId",
	companyId: "companyId",
	expiresAt: "sessionExpiresAt",
} as const;

/** Absolute session lifetime. 7 days, matching the cookie max-age. */
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

/** Returns the expiry timestamp for a brand-new session. */
export function createSessionExpiry(now: number = Date.now()): number {
	return now + SESSION_DURATION_MS;
}

/** True when the session carries an expiry that has passed. */
export function isSessionExpired(
	session: { expiresAt?: number } | null | undefined,
	now: number = Date.now(),
): boolean {
	if (!session) return true;
	if (session.expiresAt == null) return false;
	return session.expiresAt <= now;
}

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

/**
 * Clears every client-side session trace: cookie + persisted identifiers.
 * Call on logout and on detected expiry.
 */
export function clearClientSession() {
	clearSessionCookie();
	if (typeof window === "undefined") return;
	localStorage.removeItem(STORAGE_KEYS.userId);
	localStorage.removeItem(STORAGE_KEYS.companyId);
	localStorage.removeItem(STORAGE_KEYS.expiresAt);
	localStorage.removeItem("sessionToken");
}
