export interface TourStep {
	target: string;
	title: string;
	content: string;
	position: "top" | "bottom" | "left" | "right";
}

export const TOUR_STEPS: TourStep[] = [
	{
		target: "#nav-dashboard",
		title: "Dashboard Overview",
		content: "Start here to see a high-level summary of your compliance status and recent activity.",
		position: "right",
	},
	{
		target: "#nav-verification",
		title: "4 Core Verification Services",
		content: "Access Business Registration Check, Individual Document Verification (National ID, Alien ID, Passport), KRA PIN Checker, and CRB Check.",
		position: "right",
	},
	{
		target: "#nav-job-list",
		title: "Verification Jobs",
		content: "View, filter, and inspect past verification jobs and JSON audit payloads.",
		position: "right",
	},
	{
		target: "#nav-reports",
		title: "Compliance Reports",
		content: "Generate and export official compliance reports for audits and regulatory requirements.",
		position: "right",
	},
	{
		target: "#nav-user-management",
		title: "Team Access",
		content: "Invite team members and manage organization roles and permissions securely.",
		position: "right",
	},
	{
		target: "#nav-billing",
		title: "Wallet & Credits",
		content: "Top up your wallet balance and view detailed transaction history for all services.",
		position: "right",
	},
	{
		target: "#nav-audit-logs",
		title: "System Audit Logs",
		content: "Track all administrative actions and verification runs for complete transparency.",
		position: "right",
	},
	{
		target: "#nav-settings",
		title: "API Configuration",
		content: "Manage API keys, webhooks, and endpoint parameters for custom integrations.",
		position: "right",
	},
	{
		target: "#header-actions",
		title: "Quick Controls & Search",
		content: "Use Ctrl + K to instantly search services, switch views, or re-run this tour anytime from here.",
		position: "bottom",
	},
];
