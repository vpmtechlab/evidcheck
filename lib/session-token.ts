/**
 * Client-side session token storage.
 *
 * The opaque session token is the *only* thing that proves identity to the
 * backend. It lives in localStorage (and is mirrored into the cookie for the
 * edge middleware). Never log it or send it anywhere but Convex.
 */

export const SESSION_TOKEN_KEY = "sessionToken";

export function getSessionToken(): string | null {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(SESSION_TOKEN_KEY);
}

export function setSessionToken(token: string): void {
	if (typeof window === "undefined") return;
	localStorage.setItem(SESSION_TOKEN_KEY, token);
}

export function clearSessionToken(): void {
	if (typeof window === "undefined") return;
	localStorage.removeItem(SESSION_TOKEN_KEY);
}
