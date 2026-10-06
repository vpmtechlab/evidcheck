import {
	LayoutDashboard,
	BarChart3,
	CheckSquare,
	Building2,
	History,
	FileSpreadsheet,
	Users,
	CreditCard,
	Code2,
	BookOpen,
	Settings,
	type LucideIcon,
} from "lucide-react";

export interface NavItem {
	id?: string;
	label: string;
	href: string;
	icon: LucideIcon;
	exact?: boolean;
	badge?: string;
}

export interface NavGroup {
	title: string;
	items: NavItem[];
}

export const clientNavGroups: NavGroup[] = [
	{
		title: "MAIN",
		items: [
			{ id: "nav-dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
			{ id: "nav-analytics", label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
			{ id: "nav-verification", label: "Services", href: "/dashboard/verification", icon: CheckSquare },
		],
	},
	{
		title: "COMPLIANCE & AUDIT",
		items: [
			{ id: "nav-job-list", label: "Verification Jobs", href: "/dashboard/jobs", icon: History },
			{ id: "nav-audit-logs", label: "Audit Logs", href: "/dashboard/audit", icon: History },
			{ id: "nav-reports", label: "Compliance Reports", href: "/dashboard/reports", icon: FileSpreadsheet },
		],
	},
	{
		title: "ORGANIZATION",
		items: [
			{ id: "nav-user-management", label: "Team & Roles", href: "/dashboard/users", icon: Users },
			{ id: "nav-billing", label: "Billing & Balance", href: "/dashboard/billing", icon: CreditCard },
		],
	},
	{
		title: "DEVELOPER & API",
		items: [
			{ id: "nav-settings", label: "API Configuration", href: "/dashboard/settings?tab=api", icon: Code2 },
			{ label: "API Documentation", href: "/dashboard/help/documentation", icon: BookOpen },
		],
	},
];

export const adminNavGroups: NavGroup[] = [
	{
		title: "ADMINISTRATION",
		items: [
			{ label: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
			{ label: "Companies", href: "/admin/companies", icon: Building2 },
			{ label: "Service Pricing", href: "/admin/pricing", icon: Settings },
			{ label: "Global Billing", href: "/admin/billing", icon: CreditCard },
			{ label: "Users & Roles", href: "/admin/users", icon: Users },
			{ label: "System Reports", href: "/admin/reports", icon: FileSpreadsheet },
			{ label: "Global Audit Logs", href: "/admin/audit", icon: History },
		],
	},
];

/** Matches the sidebar's active-link semantics (exact or prefix on the path part). */
export function isNavItemActive(item: NavItem, pathname: string): boolean {
	if (item.exact) return pathname === item.href;
	return (
		pathname === item.href ||
		(item.href !== "/dashboard" && pathname.startsWith(item.href.split("?")[0]))
	);
}
