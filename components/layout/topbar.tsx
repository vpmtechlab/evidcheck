"use client";

import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "@/components/providers/app-provider";
import { IoChevronDown, IoMenu } from "react-icons/io5";
import { usePathname, useRouter } from "next/navigation";
import { User, Shield, CreditCard, Sparkles, RefreshCw, Search } from "lucide-react";
import { CommandPalette } from "./command-palette";
import { Button } from "@/components/ui/button";
import { NotificationDropdown } from "./notification-dropdown";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { clearSessionCookie } from "@/lib/session-cookie";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function Topbar() {
	const { sideBarOpen, setSideBarOpen, device, member, setMember, viewMode, setShowTopUp } =
		useContext(AppContext);
	const pathname = usePathname();
	const router = useRouter();
	const [popoverOpen, setPopoverOpen] = useState(false);
	const [commandOpen, setCommandOpen] = useState(false);
	const [isMac, setIsMac] = useState(false);

	useEffect(() => {
		setIsMac(typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent));
	}, []);

	const balance = useQuery(
		api.balances.get,
		member?.companyId ? { companyId: member.companyId as Id<"companies"> } : "skip"
	);

	// Admins can switch between Admin and Client views
	const canSwitchView =
		member?.role === "admin" && member?.email?.endsWith("@vpmtechlab.com");

	const toggleViewMode = () => {
		const nextMode = viewMode === "admin" ? "dashboard" : "admin";
		setPopoverOpen(false);
		if (nextMode === "admin") {
			router.push("/admin");
		} else {
			router.push("/dashboard");
		}
	};

	const handleLogout = () => {
		clearSessionCookie();
		localStorage.removeItem("userId");
		localStorage.removeItem("companyId");
		setMember(null);
		router.push("/login");
	};

	// Generate dynamic breadcrumb
	const pathSegments = pathname.split("/").filter((p) => p);

	return (
		<header className="w-full bg-white h-14 px-4 md:px-6 flex justify-between items-center border-b border-gray-200 shrink-0">
			{/* Left Section: Menu and Breadcrumb */}
			<div className="flex items-center gap-3">
				{device === "sm" && (
					<button
						onClick={() => setSideBarOpen(true)}
						className="p-1.5 text-gray-700 hover:bg-gray-100 transition-colors"
					>
						<IoMenu size={20} />
					</button>
				)}
				{!sideBarOpen && device !== "sm" && (
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
				{/* Balance Chip */}
				{balance !== undefined && (
					<div 
						onClick={() => setShowTopUp(true)}
						className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs font-medium cursor-pointer hover:bg-gray-100 transition-colors shadow-2xs"
					>
						<CreditCard size={13} className="text-gray-500" />
						<span className="text-gray-500">Balance:</span>
						<span className="font-bold text-gray-900 font-mono">
							${(balance?.availableBalance ?? 0).toFixed(2)}
						</span>
						<span className="text-[10px] text-[#188015] font-bold hover:underline ml-1">
							+ Add
						</span>
					</div>
				)}

				<Button
					variant="outline"
					size="sm"
					onClick={() => window.startAppTour?.()}
					className="hidden md:flex items-center gap-1.5 h-8 px-2.5 border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-md shadow-2xs"
				>
					<Sparkles size={13} className="text-yellow-600" />
					<span>Tour</span>
				</Button>

				<NotificationDropdown />

				<Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
					<PopoverTrigger className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-100 p-1 rounded-md transition-colors outline-none">
						<Avatar className="h-7 w-7 rounded-md">
							<AvatarImage src={member?.profile_image_url || ""} />
							<AvatarFallback className="bg-[#0e1b42] text-white font-bold text-xs rounded-md">
								{member?.first_name?.[0] || <User size={14} />}
							</AvatarFallback>
						</Avatar>
						<IoChevronDown className="text-sm text-gray-500" />
					</PopoverTrigger>
					<PopoverContent className="w-56 p-1 rounded-md border border-gray-200 shadow-md bg-white" align="end">
						<div className="flex flex-col space-y-0.5 p-2.5 bg-gray-50 border-b border-gray-100 rounded-t-md">
							<p className="text-xs font-bold text-gray-900 leading-tight">
								{member?.first_name || "Admin"} {member?.last_name || "User"}
							</p>
							<p className="text-[11px] text-gray-500 font-mono truncate">
								{member?.email || "admin@evidcheck.com"}
							</p>
						</div>

						<div className="p-1 space-y-0.5 text-xs">
							<Link
								href="/dashboard/settings"
								className="flex items-center gap-2 px-2.5 py-1.5 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
							>
								<User className="h-3.5 w-3.5 text-gray-500" />
								<span>Account Settings</span>
							</Link>

							{canSwitchView && (
								<div
									className="flex items-center gap-2 px-2.5 py-1.5 text-blue-600 hover:bg-blue-50 cursor-pointer font-medium rounded-md transition-colors"
									onClick={toggleViewMode}
								>
									<Shield className="h-3.5 w-3.5 text-blue-600" />
									<span>
										{viewMode === "admin"
											? "Switch to Client View"
											: "Switch to Admin View"}
									</span>
								</div>
							)}

							<div
								className="flex items-center gap-2 px-2.5 py-1.5 text-red-600 hover:bg-red-50 cursor-pointer rounded-md transition-colors"
								onClick={handleLogout}
							>
								<span className="h-3.5 w-3.5 flex items-center justify-center font-bold text-xs">⎋</span>
								<span>Sign out</span>
							</div>
						</div>
					</PopoverContent>
				</Popover>
			</div>

			{/* Command Palette */}
			<CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
		</header>
	);
}
