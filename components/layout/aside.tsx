"use client";

import React, { useContext, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AppContext } from "@/components/providers/app-provider";
import {
  LayoutDashboard,
  BarChart3,
  CheckSquare,
  Building2,
  Shield,
  History,
  FileSpreadsheet,
  Users,
  CreditCard,
  Code2,
  BookOpen,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  X,
} from "lucide-react";
import { clearSessionCookie } from "@/lib/session-cookie";
import { motion, AnimatePresence } from "framer-motion";

interface NavGroup {
  title: string;
  items: {
    id?: string;
    label: string;
    href: string;
    icon: React.ElementType;
    exact?: boolean;
    badge?: string;
  }[];
}

const clientNavGroups: NavGroup[] = [
  {
    title: "MAIN",
    items: [
      {
        id: "nav-dashboard",
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        id: "nav-analytics",
        label: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
      },
      {
        id: "nav-verification",
        label: "Services",
        href: "/dashboard/verification",
        icon: CheckSquare,
      },
    ],
  },
  {
    title: "COMPLIANCE & AUDIT",
    items: [
      {
        id: "nav-job-list",
        label: "Verification Jobs",
        href: "/dashboard/jobs",
        icon: History,
      },
      {
        id: "nav-audit-logs",
        label: "Audit Logs",
        href: "/dashboard/audit",
        icon: History,
      },
      {
        id: "nav-reports",
        label: "Compliance Reports",
        href: "/dashboard/reports",
        icon: FileSpreadsheet,
      },
    ],
  },
  {
    title: "ORGANIZATION",
    items: [
      {
        id: "nav-user-management",
        label: "Team & Roles",
        href: "/dashboard/users",
        icon: Users,
      },
      {
        id: "nav-billing",
        label: "Billing & Balance",
        href: "/dashboard/billing",
        icon: CreditCard,
      },
    ],
  },
  {
    title: "DEVELOPER & API",
    items: [
      {
        id: "nav-settings",
        label: "API Configuration",
        href: "/dashboard/settings?tab=api",
        icon: Code2,
      },
      {
        label: "API Documentation",
        href: "/dashboard/help/documentation",
        icon: BookOpen,
      },
    ],
  },
];

const adminNavGroups: NavGroup[] = [
  {
    title: "ADMINISTRATION",
    items: [
      { label: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
      { label: "Companies", href: "/admin/companies", icon: Building2 },
      { label: "Service Pricing", href: "/admin/pricing", icon: Settings },
      { label: "Global Billing", href: "/admin/billing", icon: CreditCard },
      { label: "Users & Roles", href: "/admin/users", icon: Users },
      {
        label: "System Reports",
        href: "/admin/reports",
        icon: FileSpreadsheet,
      },
      { label: "Global Audit Logs", href: "/admin/audit", icon: History },
    ],
  },
];

export function Aside() {
  const {
    device,
    sideBarOpen,
    setSideBarOpen,
    collapseSideBar,
    setCollapseSideBar,
    member,
    setMember,
    viewMode,
  } = useContext(AppContext);
  const pathname = usePathname();
  const router = useRouter();

  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});

  const toggleGroup = (title: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const isMobile = device === "sm";
  const navGroups = viewMode === "admin" ? adminNavGroups : clientNavGroups;

  const handleLogout = () => {
    clearSessionCookie();
    localStorage.removeItem("userId");
    localStorage.removeItem("companyId");
    setMember(null);
    router.push("/login");
  };

  if (!sideBarOpen && !isMobile) return null;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && sideBarOpen && (
        <div
          onClick={() => setSideBarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        style={{ backgroundColor: "#0e1b42", color: "#ffffff" }}
        className={`
          ${
            isMobile
              ? `fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
                  sideBarOpen ? "translate-x-0" : "-translate-x-full"
                }`
              : `relative border-r border-[#1e2d5a] transition-all duration-300 ${
                  collapseSideBar ? "w-16" : "w-64"
                }`
          }
          flex flex-col shrink-0 select-none shadow-md
        `}
      >
        {/* Floating Border Collapse Button for Desktop (sitting right at sidebar/topbar border) */}
        {!isMobile && (
          <button
            onClick={() => setCollapseSideBar(!collapseSideBar)}
            className="absolute -right-3.5 top-3.5 z-50 w-7 h-7 bg-white border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-full shadow-md flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95"
            title={collapseSideBar ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapseSideBar ? (
              <PanelLeftOpen size={14} className="text-[#188015]" />
            ) : (
              <PanelLeftClose size={14} className="text-gray-600" />
            )}
          </button>
        )}

        {/* Sidebar Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-[#1e2d5a]">
          {!collapseSideBar && (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-[#188015] rounded-md flex items-center justify-center font-bold text-white text-sm shadow-xs">
                E
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-white tracking-tight leading-tight">
                  EvidCheck
                </span>
                <span className="text-[10px] text-[#188015] font-semibold uppercase tracking-wider font-mono">
                  {viewMode === "admin" ? "Super Admin" : "Compliance Portal"}
                </span>
              </div>
            </div>
          )}

          {collapseSideBar && !isMobile && (
            <div className="mx-auto w-7 h-7 bg-[#188015] rounded-md flex items-center justify-center font-bold text-white text-sm shadow-xs">
              E
            </div>
          )}

          {isMobile && (
            <button
              onClick={() => setSideBarOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded-md"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Scrollable Navigation Groups */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-6 sidebar-scrollbar-hidden">
          {navGroups.map((group) => {
            const isGroupCollapsed = !!collapsedGroups[group.title];

            return (
              <div key={group.title} className="space-y-1.5">
                {/* Group Title Header */}
                {!collapseSideBar && (
                  <div
                    onClick={() => toggleGroup(group.title)}
                    className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold tracking-wider text-slate-400 hover:text-gray-200 cursor-pointer uppercase rounded-md transition-colors select-none"
                  >
                    <span>{group.title}</span>
                    <motion.div
                      animate={{ rotate: isGroupCollapsed ? 0 : 180 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={13} className="text-gray-400" />
                    </motion.div>
                  </div>
                )}

                {/* Items Accordion with Smooth Framer Motion Transition */}
                <AnimatePresence initial={false}>
                  {(!isGroupCollapsed || collapseSideBar) && (
                    <motion.div
                      key={`${group.title}-content`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="space-y-1 overflow-hidden"
                    >
                      {group.items.map((item) => {
                        const active = item.exact
                          ? pathname === item.href
                          : pathname === item.href ||
                            (item.href !== "/dashboard" &&
                              pathname.startsWith(item.href.split("?")[0]));
                        const Icon = item.icon;

                        if (collapseSideBar && !isMobile) {
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
                                    ? "bg-[#188015] text-white shadow-xs"
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
                            onClick={() => {
                              if (isMobile) setSideBarOpen(false);
                            }}
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
                                    ? "text-[#188015]"
                                    : "text-slate-400 group-hover:text-white"
                                } shrink-0`}
                              />
                              <span className="truncate leading-tight">
                                {item.label}
                              </span>
                            </div>

                            {item.badge && (
                              <span className="text-[10px] px-2 py-0.5 bg-[#188015]/30 text-green-300 border border-[#188015]/50 rounded-md font-semibold uppercase tracking-wider">
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
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#1e2d5a]">
          {!collapseSideBar ? (
            <div className="flex items-center justify-between p-2 bg-white/5 border border-white/10 rounded-md">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 bg-[#188015] text-white rounded-md flex items-center justify-center font-bold text-xs shrink-0">
                  {member?.first_name?.[0] || "A"}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate leading-tight">
                    {member?.first_name || "Admin"}{" "}
                    {member?.last_name || "User"}
                  </span>
                  <span className="text-[10px] text-gray-400 truncate font-mono">
                    {member?.email || "admin@evidcheck.com"}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-400 p-1 rounded-md transition-colors shrink-0"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={handleLogout}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-md transition-colors"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
