"use client";

import React, { useContext, useState } from "react";
import { AppContext } from "@/components/providers/app-provider";
import { IoMenu } from "react-icons/io5";
import { usePathname, useRouter } from "next/navigation";
import { CreditCard, Video, Search } from "lucide-react";
import { CommandPalette } from "./command-palette";
import { Button } from "@/components/ui/button";
import { NotificationDropdown } from "./notification-dropdown";
import { AccountMenu } from "./account-menu";
import { clearClientSession } from "@/lib/session-cookie";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getSessionToken } from "@/lib/session-token";

export function Topbar() {
	const { sideBarOpen, setSideBarOpen, device, member, setMember, viewMode, setShowTopUp } =
		useContext(AppContext);
	const pathname = usePathname();
	const router = useRouter();
	const [commandOpen, setCommandOpen] = useState(false);
	const [isMac] = useState(
		() => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent),
	);

	const balance = useQuery(
		api.balances.get,
		member?.companyId ? { sessionToken: getSessionToken() ?? "", companyId: member.companyId as Id<"companies"> } : "skip"
	);

	// Admins can switch between Admin and Client views
	const canSwitchView =
		member?.role === "admin" && (member?.email?.endsWith("@vpmtechlab.com") ?? false);

	const toggleViewMode = () => {
		if (viewMode === "admin") {
			router.push("/dashboard");
		} else {
			router.push("/admin");
		}
	};

	const handleLogout = () => {
		clearClientSession();
		setMember(null);
		router.push("/login");
	};

	// Generate dynamic breadcrumb
	const pathSegments = pathname.split("/").filter((p) => p);

	return (
		<header className="w-full bg-white h-14 px-4 md:px-6 flex justify-between items-center border-b border-gray-200 shrink-0">
			{/* Left Section: Menu and Breadcrumb */}
			<div className="flex items-center gap-3">
				{(!sideBarOpen || device === "sm") && (
					<button
						onClick={() => setSideBarOpen(true)}
						className="p-1.5 text-gray-700 hover:bg-gray-100 transition-colors"
					>
						<IoMenu size={20} />
					</button>
				)}

				<nav className="flex items-center gap-2 text-xs text-gray-500 font-medium">
					<span className="font-semibold text-gray-900 tracking-tight">EvidCheck</span>
					<span>/</span>
					{pathSegments.map((segment, index) => {
						const isLast = index === pathSegments.length - 1;
						return (
							<React.Fragment key={segment}>
								<span className={isLast ? "text-gray-900 font-bold capitalize" : "capitalize text-gray-500"}>
									{segment.replace("-", " ")}
								</span>
								{!isLast && <span>/</span>}
							</React.Fragment>
						);
					})}
				</nav>

				{/* Command Palette Trigger */}
				<button
					onClick={() => setCommandOpen(true)}
					className="hidden sm:flex items-center gap-2 h-8 px-3 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-500 hover:bg-gray-100 hover:border-gray-300 transition-colors cursor-pointer shadow-2xs ml-2"
				>
					<Search size={13} className="text-gray-400" />
					<span className="text-gray-400">Search services...</span>
					<kbd className="ml-1 flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold text-gray-400 bg-white border border-gray-200 rounded-[4px]">
						{isMac ? "⌘K" : "Ctrl K"}
					</kbd>
				</button>
			</div>

			{/* Right Section: Balance, Tour & Avatar */}
			<div id="header-actions" className="flex items-center gap-3">
				{balance !== undefined && (
					<button
						type="button"
						onClick={() => setShowTopUp(true)}
						className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs font-medium cursor-pointer hover:bg-gray-100 transition-colors shadow-2xs"
					>
						<CreditCard size={13} className="text-gray-500" />
						<span className="text-gray-500">Balance:</span>
						<span className="font-bold text-gray-900 font-mono">
							${(balance?.availableBalance ?? 0).toFixed(2)}
						</span>
						<span className="text-[10px] text-brand font-bold hover:underline ml-1">
							+ Add
						</span>
					</button>
				)}

				<Button
					variant="outline"
					size="sm"
					onClick={() => window.startAppTour?.()}
					className="hidden md:flex items-center gap-1.5 h-8 px-2.5 border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-md shadow-2xs"
				>
					<Video size={13} className="text-yellow-600" />
					<span>Tour</span>
				</Button>

				<NotificationDropdown />

				<AccountMenu
					member={member}
					viewMode={viewMode}
					canSwitchView={canSwitchView}
					onToggleViewMode={toggleViewMode}
					onLogout={handleLogout}
				/>
			</div>

			{/* Command Palette (remounts on open to reset its state) */}
			<CommandPalette key={String(commandOpen)} open={commandOpen} onOpenChange={setCommandOpen} />
		</header>
	);
}
