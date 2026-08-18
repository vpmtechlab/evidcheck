"use client";

import React, { createContext, useState } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useDevice } from "@/hooks/use-device";
import TopUpModal from "@/components/modals/topup-modal";
import InviteUserModal from "@/components/modals/invite-user-modal";
import { getSessionCookie, setSessionCookie } from "@/lib/session-cookie";

export interface BreadcrumbItem {
	title: string;
	link?: string;
}

export interface Member {
	id?: string;
	first_name?: string;
	last_name?: string;
	email?: string;
	role?: string;
	companyId?: string;
	companyName?: string;
	profile_image_url?: string;
	[key: string]: unknown;
}

export interface AppContextType {
	device: string;
	member: Member | null;
	setMember: React.Dispatch<React.SetStateAction<Member | null>>;
	token: string | null;
	setToken: React.Dispatch<React.SetStateAction<string | null>>;
	sideBarOpen: boolean;
	setSideBarOpen: React.Dispatch<React.SetStateAction<boolean>>;
	collapseSideBar: boolean;
	setCollapseSideBar: React.Dispatch<React.SetStateAction<boolean>>;
	loading: boolean;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	breadcrumbItems: BreadcrumbItem[];
	setBreadcrumbItems: React.Dispatch<React.SetStateAction<BreadcrumbItem[]>>;
	showTopUp: boolean;
	setShowTopUp: React.Dispatch<React.SetStateAction<boolean>>;
	showInviteModal: boolean;
	setShowInviteModal: React.Dispatch<React.SetStateAction<boolean>>;
	viewMode: "dashboard" | "admin";
}

export const AppContext = createContext<AppContextType>({} as AppContextType);

export const useApp = () => React.useContext(AppContext);

export function AppProvider({ children }: { children: React.ReactNode }) {
	const device = useDevice();
	const pathname = usePathname();
	const [member, setMember] = useState<Member | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [sideBarOpen, setSideBarOpen] = useState(true);
	const [collapseSideBar, setCollapseSideBar] = useState(false);
	const [loading, setLoading] = useState(false);
	const [showTopUp, setShowTopUp] = useState(false);
	const [showInviteModal, setShowInviteModal] = useState(false);
	const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbItem[]>([]);

	const viewMode = pathname?.startsWith("/admin") ? "admin" : "dashboard";

	const persistedUserId =
		typeof window !== "undefined" ? localStorage.getItem("userId") : null;
	const hydratedUser = useQuery(
		api.users.getUserById,
		persistedUserId ? { userId: persistedUserId as Id<"users"> } : "skip",
	);

	// Use either the manually set member (from login) or the hydrated user (from persistence)
	const currentMember = member || (hydratedUser as Member | null);

	React.useEffect(() => {
		if (typeof window !== "undefined") {
			const storedUserId = localStorage.getItem("userId");
			const storedCompanyId = localStorage.getItem("companyId");
			const session = getSessionCookie();

			if (storedUserId && !session) {
				setSessionCookie({
					userId: storedUserId,
					companyId: storedCompanyId || "",
					role: (currentMember?.role as string) || "admin",
					email: (currentMember?.email as string) || "",
					isSuperAdmin: (currentMember?.email as string)?.endsWith("@vpmtechlab.com"),
				});
			} else if (!storedUserId && session?.userId) {
				localStorage.setItem("userId", session.userId);
				if (session.companyId) {
					localStorage.setItem("companyId", session.companyId);
				}
			}
		}
	}, [currentMember]);

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
