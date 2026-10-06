"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useDevice } from "@/hooks/use-device";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import TopUpModal from "@/components/modals/topup-modal";
import InviteUserModal from "@/components/modals/invite-user-modal";
import { getSessionCookie, setSessionCookie, isSessionExpired, createSessionExpiry, clearClientSession, STORAGE_KEYS } from "@/lib/session-cookie";
import { getSessionToken } from "@/lib/session-token";
import { AppContext, type Member, type BreadcrumbItem } from "./app-context";

export { AppContext, useApp } from "./app-context";
export type { Member, BreadcrumbItem, AppContextType } from "./app-context";

export function AppProvider({ children }: { children: React.ReactNode }) {
	const device = useDevice();
	const pathname = usePathname();
	const router = useRouter();
	const [member, setMember] = useState<Member | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [sideBarOpen, setSideBarOpen] = useState(true);
	const [collapseSideBar, setCollapseSideBar] = useState(false);
	const [loading, setLoading] = useState(false);
	const [showTopUp, setShowTopUp] = useState(false);
	const [showInviteModal, setShowInviteModal] = useState(false);
	const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbItem[]>([]);

	const viewMode = pathname?.startsWith("/admin") ? "admin" : "dashboard";

	React.useEffect(() => {
		setSideBarOpen(device !== "sm");
	}, [device]);

	// Browser-only session values load after mount so the server and the first
	// client render agree (prevents hydration mismatches, e.g. React #418).
	const [clientSessionToken, setClientSessionToken] = useState<string | null>(null);
	const [sessionExpiresAt, setSessionExpiresAt] = useState<number>(NaN);

	React.useEffect(() => {
		const cookie = getSessionCookie();
		setClientSessionToken(getSessionToken());
		setSessionExpiresAt(
			cookie?.expiresAt ??
				Number(localStorage.getItem(STORAGE_KEYS.expiresAt) ?? NaN),
		);
	}, []);

	const hydratedUser = useQuery(
		api.session.getSessionUser,
		clientSessionToken ? { sessionToken: clientSessionToken } : "skip",
	);

	// Use either the manually set member (from login) or the hydrated user (from persistence)
	const currentMember = member || (hydratedUser as Member | null);

	React.useEffect(() => {
		if (typeof window !== "undefined") {
			const session = getSessionCookie();

			// A dead session can never resurrect: wipe every trace of it
			if (session && isSessionExpired(session)) {
				clearClientSession();
				setMember(null);
				return;
			}

			const storedUserId = localStorage.getItem(STORAGE_KEYS.userId);
			const storedCompanyId = localStorage.getItem(STORAGE_KEYS.companyId);
			const storedExpiresAt = Number(
				localStorage.getItem(STORAGE_KEYS.expiresAt) ?? NaN,
			);

			if (storedUserId && !session) {
				if (Number.isFinite(storedExpiresAt) && storedExpiresAt <= Date.now()) {
					clearClientSession();
					setMember(null);
					return;
				}
				const expiresAt = Number.isFinite(storedExpiresAt)
					? storedExpiresAt
					: createSessionExpiry();
				setSessionCookie({
					userId: storedUserId,
					companyId: storedCompanyId || "",
					role: (currentMember?.role as string) || "admin",
					email: (currentMember?.email as string) || "",
					isSuperAdmin: (currentMember?.email as string)?.endsWith("@vpmtechlab.com"),
					expiresAt,
				});
				localStorage.setItem(STORAGE_KEYS.expiresAt, String(expiresAt));
			} else if (!storedUserId && session?.userId) {
				localStorage.setItem(STORAGE_KEYS.userId, session.userId);
				if (session.companyId) {
					localStorage.setItem(STORAGE_KEYS.companyId, session.companyId);
				}
				if (session.expiresAt) {
					localStorage.setItem(STORAGE_KEYS.expiresAt, String(session.expiresAt));
				}
			}
		}
	}, [currentMember]);

	// Session expiry watcher: automatically signs the user out and returns
	// them to the login page the moment their session expires.
	React.useEffect(() => {
		if (!sessionExpiresAt || !Number.isFinite(sessionExpiresAt)) return;
		if (pathname === "/login" || pathname === "/setup-password") return;
		const logout = () => {
			clearClientSession();
			setMember(null);
			toast.error("Your session has expired. Please sign in again.");
			router.push("/login");
		};
		const remaining = sessionExpiresAt - Date.now();
		if (remaining <= 0) {
			logout();
			return;
		}
		const timer = setTimeout(logout, remaining);
		return () => clearTimeout(timer);
	}, [sessionExpiresAt, pathname, router]);

	return (
		<AppContext.Provider
			value={{
				device,
				member: currentMember,
				setMember,
				token,
				setToken,
				sideBarOpen,
				setSideBarOpen,
				collapseSideBar,
				setCollapseSideBar,
				loading,
				setLoading,
				breadcrumbItems,
				setBreadcrumbItems,
				showTopUp,
				setShowTopUp,
				showInviteModal,
				setShowInviteModal,
				viewMode,
			}}
		>
			{children}
			{showTopUp && (
				<TopUpModal isOpen={showTopUp} onClose={() => setShowTopUp(false)} />
			)}
			{showInviteModal && (
				<InviteUserModal
					isOpen={showInviteModal}
					onClose={() => setShowInviteModal(false)}
				/>
			)}
		</AppContext.Provider>
	);
}
