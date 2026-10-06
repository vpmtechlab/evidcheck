"use client";

import { useApp } from "@/components/providers/app-provider";
import {
  Building2,
  UserCheck,
  FileText,
  Shield,
  Plus,
  Wallet,
  UserPlus,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

const SERVICE_LINKS = [
  {
    label: "Business Registration",
    hint: "BRS Kenya",
    href: "/dashboard/verification?service=business_registration",
    icon: Building2,
  },
  {
    label: "National ID Check",
    hint: "IPRS Gateway",
    href: "/dashboard/verification?service=national_id",
    icon: UserCheck,
  },
  {
    label: "KRA PIN Checker",
    hint: "KRA iTax",
    href: "/dashboard/verification?service=kra",
    icon: FileText,
  },
  {
    label: "CRB Check",
    hint: "Metropol / TransUnion",
    href: "/dashboard/verification?service=crb_check",
    icon: Shield,
  },
];

export function QuickActions() {
  const router = useRouter();
  const { setShowTopUp, setShowInviteModal } = useApp();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
          Quick Actions
        </h2>
      </div>

      <button
        onClick={() => router.push("/dashboard/verification")}
        className="w-full h-9 px-3 bg-brand hover:bg-brand-dark text-white text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <Plus size={14} />
        <span>Run Verification</span>
      </button>

      <div className="space-y-1">
        {SERVICE_LINKS.map((service) => {
          const Icon = service.icon;
          return (
            <button
              key={service.label}
              onClick={() => router.push(service.href)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 border border-transparent hover:border-gray-200 hover:bg-gray-50/60 rounded-md transition-colors cursor-pointer group text-left"
            >
              <div className="p-1.5 bg-gray-100 text-gray-600 group-hover:bg-brand group-hover:text-white rounded-md transition-colors">
                <Icon size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 leading-tight">
                  {service.label}
                </p>
                <p className="text-[11px] text-gray-500">{service.hint}</p>
              </div>
              <ChevronRight
                size={14}
                className="text-gray-300 group-hover:text-brand transition-colors shrink-0"
              />
            </button>
          );
        })}
      </div>

      <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2">
        <button
          onClick={() => setShowTopUp(true)}
          className="h-8 px-2 text-xs font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Wallet size={13} />
          <span>Top Up</span>
        </button>
        <button
          onClick={() => setShowInviteModal(true)}
          className="h-8 px-2 text-xs font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <UserPlus size={13} />
          <span>Invite</span>
        </button>
      </div>
    </div>
  );
}
