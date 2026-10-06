"use client";

import React, { useContext, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppContext } from "@/components/providers/app-provider";
import {
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { clearClientSession } from "@/lib/session-cookie";
import { adminNavGroups, clientNavGroups } from "@/lib/navigation";
import { SideNavGroup } from "./side-nav-group";
import { SideUserFooter } from "./side-user-footer";

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
    clearClientSession();
    setMember(null);
    router.push("/login");
  };

  if (!sideBarOpen && !isMobile) return null;

  return (
    <>
      {isMobile && sideBarOpen && (
        <div
          onClick={() => setSideBarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`
          bg-navy text-white
          ${
            isMobile
              ? `fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
                  sideBarOpen ? "translate-x-0" : "-translate-x-full"
                }`
              : `relative border-r border-navy-line transition-all duration-300 ${
                  collapseSideBar ? "w-16" : "w-64"
                }`
          }
          flex flex-col shrink-0 select-none shadow-md
        `}
      >
        {!isMobile && (
          <button
            onClick={() => setCollapseSideBar(!collapseSideBar)}
            className="absolute -right-3.5 top-3.5 z-50 w-7 h-7 bg-white border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-full shadow-md flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95"
            title={collapseSideBar ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapseSideBar ? (
              <PanelLeftOpen size={14} className="text-brand" />
            ) : (
              <PanelLeftClose size={14} className="text-gray-600" />
            )}
          </button>
        )}

        <div className="h-14 px-4 flex items-center justify-between border-b border-navy-line">
          {!collapseSideBar && (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-brand rounded-md flex items-center justify-center font-bold text-white text-sm shadow-xs">
                E
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-white tracking-tight leading-tight">
                  EvidCheck
                </span>
                <span className="text-[10px] text-brand font-semibold uppercase tracking-wider font-mono">
                  {viewMode === "admin" ? "Super Admin" : "Compliance Portal"}
                </span>
              </div>
            </div>
          )}

          {collapseSideBar && !isMobile && (
            <div className="mx-auto w-7 h-7 bg-brand rounded-md flex items-center justify-center font-bold text-white text-sm shadow-xs">
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

        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-6 sidebar-scrollbar-hidden">
          {navGroups.map((group) => (
            <SideNavGroup
              key={group.title}
              group={group}
              pathname={pathname}
              sidebarCollapsed={collapseSideBar}
              isMobile={isMobile}
              groupCollapsed={!!collapsedGroups[group.title]}
              onToggleGroup={() => toggleGroup(group.title)}
              onNavigate={() => {
                if (isMobile) setSideBarOpen(false);
              }}
            />
          ))}
        </div>

        <SideUserFooter
          firstName={member?.first_name || "Admin"}
          lastName={member?.last_name || "User"}
          email={member?.email || "admin@evidcheck.com"}
          sidebarCollapsed={collapseSideBar}
          onLogout={handleLogout}
        />
      </aside>
    </>
  );
}
