"use client";

import React, { useContext, useState } from "react";
import { AppContext } from "@/components/providers/app-provider";
import { IoChevronDown, IoMenu } from "react-icons/io5";
import { HiOutlineLogout } from "react-icons/hi";
import { usePathname, useRouter } from "next/navigation";
import { User, Shield } from "lucide-react";
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

export function Topbar() {
	const { sideBarOpen, setSideBarOpen, device, member, setMember, viewMode } =
		useContext(AppContext);
	const pathname = usePathname();
	const router = useRouter();
	const [popoverOpen, setPopoverOpen] = useState(false);

	// Admins can switch between Admin and Client views
	const canSwitchView =
		member?.role === "admin" && member?.email?.endsWith("@vpmtechlab.com");

	const toggleViewMode = () => {
		const nextMode = viewMode === "admin" ? "dashboard" : "admin";

		// Close the popover immediately for a seamless feel
		setPopoverOpen(false);

		// Changing the URL automatically updates the viewMode via AppProvider
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
		<div className="w-full bg-white py-4 px-6 flex justify-between items-center rounded-2xl shadow-sm">
			{/* Left Section: Menu and Breadcrumb */}
			<div className="flex items-center gap-4">
				{device === "sm" && (
					<div
						onClick={() => setSideBarOpen(true)}
						className="cursor-pointer text-2xl text-gray-700"
					>
						<IoMenu />
					</div>
				)}
				{device !== "sm" && !sideBarOpen && (
					<div
						onClick={() => setSideBarOpen(true)}
						className="cursor-pointer text-2xl text-gray-700"
					>
						<IoMenu />
					</div>
				)}
				<div className="flex gap-2 max-md:flex-col text-sm text-gray-500 font-medium capitalize">
					{pathSegments.map((segment, index) => (
						<span key={segment} className="flex items-center gap-2">
							<span
								className={
									index === pathSegments.length - 1 ? "text-primary" : ""
								}
							>
								{segment.replace("-", " ")}
							</span>
							{index < pathSegments.length - 1 && <span>/</span>}
						</span>
					))}
				</div>
			</div>

			{/* Right Section: Avatar */}
			<div id="header-actions" className="flex items-center gap-4">
				<Button
					variant="outline"
					size="sm"
					onClick={() => window.startAppTour?.()}
					className="hidden md:flex items-center gap-2 rounded-xl border-gray-200 text-gray-600 hover:text-[#023e4a] hover:bg-teal-50/50"
				>
					<Shield size={14} className="text-teal-600" />
					<span>Take Tour</span>
				</Button>

				<NotificationDropdown />

				<Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
					<PopoverTrigger className="flex items-center gap-[3px] cursor-pointer hover:bg-slate-50 p-1 rounded-md transition-colors outline-none">
						<Avatar className="h-8 w-8">
							<AvatarImage src={member?.profile_image_url || ""} />
							<AvatarFallback className="bg-slate-200 text-slate-600 font-bold">
								{member?.first_name?.[0] || <User size={16} />}
							</AvatarFallback>
						</Avatar>
						<IoChevronDown className="text-lg text-gray-500" />
					</PopoverTrigger>
					<PopoverContent className="w-56 p-2" align="end">
						<div className="flex flex-col space-y-1 mb-2 px-2 pb-2 border-b border-gray-100">
							<p className="text-sm font-medium text-gray-900 leading-none">
								{member?.first_name || "John"} {member?.last_name || "Doe"}
							</p>
							<p className="text-xs text-gray-500 leading-none mt-1">
								{member?.email || "john.doe@trustcert.com"}
							</p>
						</div>

						<div className="flex flex-col gap-1">
							<Link
								href="/dashboard/settings"
								className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-100 rounded-md text-gray-700 transition-colors text-sm"
							>
								<User className="h-4 w-4" />
								<span>Profile</span>
							</Link>

							{canSwitchView && (
								<div
									className="flex items-center gap-2 cursor-pointer p-2 hover:bg-blue-50 text-blue-600 rounded-md transition-colors text-sm mt-1"
									onClick={toggleViewMode}
								>
									<Shield className="h-4 w-4" />
									<span className="font-medium">
										{viewMode === "admin"
											? "Switch to Client View"
											: "Switch to Admin View"}
									</span>
								</div>
							)}

							<div
								className="flex items-center gap-2 cursor-pointer p-2 hover:bg-red-50 text-red-600 rounded-md transition-colors mt-1 text-sm"
								onClick={handleLogout}
							>
								<HiOutlineLogout className="text-lg" />
								<span className="font-medium">Log Out</span>
							</div>
						</div>
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
}
