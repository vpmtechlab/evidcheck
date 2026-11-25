"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { isNavItemActive, type NavGroup } from "@/lib/navigation";

interface SideNavGroupProps {
	group: NavGroup;
	pathname: string;
	sidebarCollapsed: boolean;
	isMobile: boolean;
	groupCollapsed: boolean;
	onToggleGroup: () => void;
	onNavigate: () => void;
}

export function SideNavGroup({
	group,
	pathname,
	sidebarCollapsed,
	isMobile,
	groupCollapsed,
	onToggleGroup,
	onNavigate,
}: SideNavGroupProps) {
	return (
		<div className="space-y-1.5">
			{!sidebarCollapsed && (
				<button
					type="button"
					onClick={onToggleGroup}
					aria-expanded={!groupCollapsed}
					className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold tracking-wider text-slate-400 hover:text-gray-200 cursor-pointer uppercase rounded-md transition-colors select-none"
				>
					<span>{group.title}</span>
					<motion.div
						animate={{ rotate: groupCollapsed ? 0 : 180 }}
						transition={{ duration: 0.2 }}
					>
						<ChevronDown size={13} className="text-gray-400" />
					</motion.div>
				</button>
			)}

			<AnimatePresence initial={false}>
				{(!groupCollapsed || sidebarCollapsed) && (
					<motion.div
						key={`${group.title}-content`}
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.2, ease: "easeInOut" }}
						className="space-y-1 overflow-hidden"
					>
						{group.items.map((item) => {
							const active = isNavItemActive(item, pathname);
							const Icon = item.icon;

							if (sidebarCollapsed && !isMobile) {
								return (
									<div
										key={item.label}
										id={item.id}
										className="relative flex items-center justify-center py-1 group"
									>
										<Link
											href={item.href}
											className={`flex items-center justify-center w-10 h-10 rounded-md transition-colors ${
												active
													? "bg-brand text-white shadow-xs"
													: "text-gray-300 hover:text-white hover:bg-white/10"
											}`}
										>
											<Icon size={19} />
										</Link>
										<div className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-gray-700 rounded-md shadow-lg">
											{item.label}
										</div>
									</div>
								);
							}

							return (
								<Link
									key={item.label}
									id={item.id}
									href={item.href}
									onClick={onNavigate}
									className={`
										group flex items-center justify-between px-3 py-2 text-[13.5px] font-medium rounded-md transition-all
										${
											active
												? "bg-white/15 text-white font-semibold shadow-2xs"
												: "text-slate-300 hover:text-white hover:bg-white/10"
										}
									`}
								>
									<div className="flex items-center gap-3">
										<Icon
											size={18}
											className={`${
												active
													? "text-brand"
													: "text-slate-400 group-hover:text-white"
											} shrink-0`}
										/>
										<span className="truncate leading-tight">
											{item.label}
										</span>
									</div>

									{item.badge && (
										<span className="text-[10px] px-2 py-0.5 bg-brand/30 text-green-300 border border-brand/50 rounded-md font-semibold uppercase tracking-wider">
											{item.badge}
										</span>
									)}
								</Link>
							);
						})}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
