import React, { createContext } from "react";

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
