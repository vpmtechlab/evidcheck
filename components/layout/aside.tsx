"use client";

import React, { useContext } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AppContext } from "@/components/providers/app-provider";
import { 
  MdOutlineClose, 
  MdDashboard, 
  MdAnalytics, 
  MdWorkOutline, 
  MdPeopleOutline, 
  MdVerified, 
  MdReceipt, 
  MdSettings, 
  MdHelpOutline,
  MdHistory
} from "react-icons/md";
import { LogOut, PanelRightOpen, PanelLeftOpen } from "lucide-react";
import { clearSessionCookie } from "@/lib/session-cookie";

const clientNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: MdDashboard, exact: true },
  { label: "Analytics", href: "/dashboard/analytics", icon: MdAnalytics },
  { label: "Job List", href: "/dashboard/jobs", icon: MdWorkOutline },
  { label: "User Management", href: "/dashboard/users", icon: MdPeopleOutline },
  { label: "Verification", href: "/dashboard/verification", icon: MdVerified },
  { label: "Billing", href: "/dashboard/billing", icon: MdReceipt },
  { label: "Reports", href: "/dashboard/reports", icon: MdReceipt },
  { label: "Audit Logs", href: "/dashboard/audit", icon: MdHistory },
  { label: "Settings", href: "/dashboard/settings", icon: MdSettings },
];

const adminNavItems = [
  { label: "Overview", href: "/admin", icon: MdDashboard, exact: true },
  { label: "Companies", href: "/admin/companies", icon: MdWorkOutline },
  { label: "Pricing", href: "/admin/pricing", icon: MdSettings },
  { label: "Global Billing", href: "/admin/billing", icon: MdReceipt },
  { label: "Users & Roles", href: "/admin/users", icon: MdPeopleOutline },
  { label: "Reports", href: "/admin/reports", icon: MdAnalytics },
  { label: "Audit Logs", href: "/admin/audit", icon: MdHistory },
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

  const isMobile = device === "sm";
  const navItems = viewMode === "admin" ? adminNavItems : clientNavItems;

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
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setSideBarOpen(false)}
        />
      )}

      <div
        className={`
          flex flex-col bg-secondary text-white transition-all duration-300
          ${
            isMobile
              ? `fixed top-0 left-0 h-full z-50 w-[260px] shadow-2xl ${
                  sideBarOpen ? "translate-x-0" : "-translate-x-full"
                }`
              : `relative h-full rounded-2xl shadow-sm ${
                  collapseSideBar ? "w-[80px]" : "w-[260px]"
                }`
          }
          py-4 px-2
        `}
      >
        <div
          className={`w-full flex items-center mt-0 px-2 ${
            collapseSideBar && !isMobile ? "justify-center" : "justify-between"
          }`}
        >
          <div className="flex items-center">
            <Link href="/dashboard" className="w-full text-white font-bold text-xl flex items-center justify-center">
              {collapseSideBar && !isMobile ? "TC" : "TrustCert"}
            </Link>
          </div>

          {/* Collapse Toggle Button (Desktop only) */}
          {!isMobile && (
            <div
              className={`
                cursor-pointer transition-all duration-300 z-50
                ${
                  collapseSideBar
                    ? "absolute -right-3 top-9 bg-white text-secondary shadow-lg p-2 rounded-full border border-gray-100 hover:bg-gray-50"
                    : "text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10"
                }
              `}
              onClick={() => setCollapseSideBar(!collapseSideBar)}
            >
              {collapseSideBar ? <PanelLeftOpen size={20} /> : <PanelRightOpen size={20} />}
            </div>
          )}

          {isMobile && (
            <MdOutlineClose
              className="cursor-pointer text-3xl text-gray-400 hover:text-red-400 transition-colors ml-auto"
              onClick={() => setSideBarOpen(false)}
            />
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between overflow-y-auto overflow-x-hidden gap-y-3 px-2 mt-4 custom-scrollbar">
          <div>
            <hr className="w-full border-white/10 mb-5" />
            <div id="sidebar-nav" className="flex flex-col gap-1">
              {navItems.map((item) => {
                const active = item.exact 
                  ? pathname === item.href 
                  : pathname.startsWith(item.href);
                const Icon = item.icon;

                if (collapseSideBar && !isMobile) {
                  return (
                    <div
                      key={item.href}
                      className="relative flex items-center justify-center cursor-pointer w-full py-1 group"
                    >
                      <Link
                        href={item.href}
                        className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors ${
                          active ? "bg-primary text-white" : "text-gray-400 hover:bg-white/10"
                        }`}
                        onClick={() => {
                          if (isMobile) setSideBarOpen(false);
                        }}
                      >
                        <Icon size={20} />
                      </Link>
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50">
                        {item.label}
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    id={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => {
                      if (isMobile) setSideBarOpen(false);
                    }}
                    className={`relative flex items-center gap-2 cursor-pointer w-[210px] px-2 py-2 ${
                      active ? "bg-primary rounded-xl" : "hover:bg-white/10 rounded-xl"
                    }`}
                  >
                    <span className="flex items-center justify-center w-9 h-9">
                      <Icon className={active ? "text-white" : "text-gray-400"} size={18} />
                    </span>
                    <span className={`text-sm ${active ? "text-white font-bold" : "text-gray-300"}`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            
            {collapseSideBar && !isMobile ? (
              <div className="relative flex items-center justify-center cursor-pointer w-full py-1 group">
                <Link
                  href="/dashboard/help"
                  className="flex items-center justify-center w-10 h-10 rounded-xl transition-colors text-gray-400 hover:bg-white/10"
                >
                  <MdHelpOutline size={20} />
                </Link>
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50">
                  Help & Support
                </div>
              </div>
            ) : (
                <Link
                  href="/dashboard/help"
                  className="relative flex items-center gap-2 cursor-pointer w-[210px] px-2 py-2 hover:bg-white/10 rounded-xl"
                >
                  <span className="flex items-center justify-center w-9 h-9">
                    <MdHelpOutline className="text-gray-400" size={18} />
                  </span>
                  <span className="text-sm text-gray-300">Help & Support</span>
                </Link>
            )}

            <div className="w-full h-px bg-white/10 mt-4" />

            <div
              className={`flex items-center mt-3 p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group ${
                collapseSideBar && !isMobile ? "justify-center" : "justify-between"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-400 text-white flex items-center justify-center font-bold">
                  {member?.first_name?.[0] || "U"}
                </div>

                {!collapseSideBar && (
                  <div className="flex flex-col">
                    <p className="text-white font-semibold leading-tight text-sm">
                      {member?.first_name || "John"} {member?.last_name || "Doe"}
                    </p>
                    <p className="text-xs text-gray-400 leading-tight">
                      {member?.role || "Compliance Officer"}
                    </p>
                  </div>
                )}
              </div>

              {!collapseSideBar && (
                <div 
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                >
                  <LogOut size={18} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
