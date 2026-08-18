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
  X
} from "lucide-react";
import { clearSessionCookie } from "@/lib/session-cookie";

interface NavGroup {
  title: string;
  items: {
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
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
      { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { label: "Services", href: "/dashboard/verification", icon: CheckSquare },
    ],
  },
  {
    title: "COMPLIANCE & AUDIT",
    items: [
      { label: "Verification Jobs", href: "/dashboard/jobs", icon: History },
      { label: "Audit Logs", href: "/dashboard/audit", icon: History },
      { label: "Compliance Reports", href: "/dashboard/reports", icon: FileSpreadsheet },
    ],
  },
  {
    title: "ORGANIZATION",
    items: [
      { label: "Team & Roles", href: "/dashboard/users", icon: Users },
      { label: "Billing & Balance", href: "/dashboard/billing", icon: CreditCard },
    ],
  },
  {
    title: "DEVELOPER & API",
    items: [
      { label: "API Configuration", href: "/dashboard/settings?tab=api", icon: Code2 },
      { label: "API Documentation", href: "/dashboard/help/documentation", icon: BookOpen },
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
      { label: "System Reports", href: "/admin/reports", icon: FileSpreadsheet },
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

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

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
      {/* Mobile Overlay */}
      {isMobile && sideBarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-xs"
          onClick={() => setSideBarOpen(false)}
        />
      )}

      <aside
        style={{ backgroundColor: "#0e1b42", color: "#ffffff" }}
        className={`
          flex flex-col bg-[#0e1b42] text-white border-r border-[#1e2d5a] transition-all duration-200 select-none
          ${
            isMobile
              ? `fixed top-0 left-0 h-full z-50 w-[270px] shadow-2xl ${
                  sideBarOpen ? "translate-x-0" : "-translate-x-full"
                }`
              : `relative h-full ${
                  collapseSideBar ? "w-[68px]" : "w-[260px]"
                }`
          }
        `}
      >
        {/* Workspace Brand Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
          {!collapseSideBar ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 bg-[#188015] rounded-md flex items-center justify-center text-white font-black text-sm shrink-0 shadow-xs">
                <ShieldCheck size={16} />
              </div>
              <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity">
                <span className="font-bold text-sm tracking-tight text-white truncate max-w-[140px]">
                  {member?.companyName || "EvidCheck"}
                </span>
                <ChevronDown size={14} className="text-gray-400 shrink-0" />
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-7 h-7 bg-[#188015] rounded-md flex items-center justify-center text-white font-black text-sm shadow-xs">
                <ShieldCheck size={16} />
              </div>
            </div>
          )}

          {!isMobile && (
            <button
              onClick={() => setCollapseSideBar(!collapseSideBar)}
              className="text-gray-400 hover:text-white p-1 hover:bg-white/10 rounded-md transition-colors"
              title={collapseSideBar ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapseSideBar ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
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
                    className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold tracking-wider text-slate-400 hover:text-gray-200 cursor-pointer uppercase rounded-md transition-colors"
                  >
                    <span>{group.title}</span>
                    {isGroupCollapsed ? (
                      <ChevronRight size={13} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={13} className="text-gray-500" />
                    )}
                  </div>
                )}

                {/* Items */}
                {(!isGroupCollapsed || collapseSideBar) && (
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const active = item.exact
                        ? pathname === item.href
                        : pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href.split("?")[0]));
                      const Icon = item.icon;

                      if (collapseSideBar && !isMobile) {
                        return (
                          <div
                            key={item.label}
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
                                active ? "text-[#188015]" : "text-slate-400 group-hover:text-white"
                              } shrink-0`}
                            />
                            <span className="truncate leading-tight">{item.label}</span>
                          </div>

                          {item.badge && (
                            <span className="text-[10px] px-2 py-0.5 bg-[#188015]/30 text-green-300 border border-[#188015]/50 rounded-md font-semibold uppercase tracking-wider">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/10 bg-[#0a1433] space-y-2 shrink-0">
          {!collapseSideBar ? (
            <>
              <div className="flex items-center justify-between text-[11px] text-gray-400 px-1 py-0.5">
                <Link href="/dashboard/help/documentation" className="hover:text-white transition-colors">
                  Documentation
                </Link>
                <Link href="/dashboard/help" className="hover:text-white transition-colors">
                  Support
                </Link>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] text-green-400 font-mono">v1.0 Live</span>
                </div>
              </div>

              {/* User Account Strip */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-7 h-7 bg-[#188015] text-white flex items-center justify-center font-bold text-xs rounded-md shrink-0 shadow-xs">
                    {member?.first_name?.[0] || "U"}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs font-semibold text-white truncate">
                      {member?.first_name || "Admin"} {member?.last_name || "User"}
                    </span>
                    <span className="text-[10px] text-gray-400 truncate">
                      {member?.email || "admin@evidcheck.com"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-md transition-colors"
                  title="Log out"
                >
                  <LogOut size={15} />
                </button>
              </div>

              {/* Logo Badge */}
              <div className="pt-1 flex items-center gap-1.5 text-gray-400 text-[11px] font-bold tracking-tight">
                <div className="w-3.5 h-3.5 bg-[#188015] rounded-xs flex items-center justify-center text-[9px] text-white font-black">
                  E
                </div>
                <span>evidcheck</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <div className="w-7 h-7 bg-[#188015] text-white flex items-center justify-center font-bold text-xs rounded-md shadow-xs">
                {member?.first_name?.[0] || "U"}
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-400 p-1 rounded-md"
                title="Log out"
              >
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
