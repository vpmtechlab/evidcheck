"use client";

import React from "react";
import { Check, Building2, UserCheck, FileText, Shield, ArrowRight } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getIcon } from "@/lib/icon-registry";
import { motion } from "framer-motion";

export type ServiceAction = {
  _id: string;
  label: string;
  slug: string;
  enabled: boolean;
};

export type ServiceCheckType = {
  _id: string;
  label: string;
  slug: string;
};

export type ServiceCategory = {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description?: string;
  actions: ServiceAction[];
  checkTypes: ServiceCheckType[];
};

export type ServiceType = ServiceCategory;

interface ChooseServiceProps {
  onSelectService: (service: ServiceType) => void;
  selectedSlug?: string | null;
}

// Meta definitions for the 4 core services
const serviceMeta: Record<string, { target: string; targetBg: string; subtitle: string }> = {
  business_registration: {
    target: "Businesses & Companies",
    targetBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    subtitle: "Verify company registration, incorporation status & CR12 details via BRS Kenya",
  },
  national_id: {
    target: "Individuals",
    targetBg: "bg-blue-50 text-blue-700 border-blue-200",
    subtitle: "Government identity validation (National ID, Alien ID, Passport) via IPRS Database",
  },
  kra: {
    target: "Businesses & Individuals",
    targetBg: "bg-orange-50 text-orange-700 border-orange-200",
    subtitle: "Tax compliance certificate (TCC) & PIN validity check via KRA iTax",
  },
  crb_check: {
    target: "Individuals",
    targetBg: "bg-purple-50 text-purple-700 border-purple-200",
    subtitle: "Credit bureau listing, score & default risk report via ID Number (Metropol / TransUnion)",
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function ChooseService({ onSelectService, selectedSlug }: ChooseServiceProps) {
  const services = useQuery(api.services.list);

  if (services === undefined) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 bg-gray-100/70 rounded-lg animate-pulse border border-gray-200" />
        ))}
      </div>
    );
  }

  // Fallback if database seed is pending
  const displayServices = services.length > 0 ? services : [
    {
      _id: "seed_1",
      name: "Business Registration Check",
      slug: "business_registration",
      icon: "Building2",
      color: "bg-indigo-100 text-indigo-700",
      description: "Verify registered businesses, sole proprietorships, and limited companies via BRS Kenya.",
      actions: [
        { _id: "a1", label: "Business / Company Registration Check", slug: "business_search", enabled: true },
      ],
      checkTypes: [
        { _id: "ct1", label: "LIMITED COMPANY / BUSINESS REGISTRATION", slug: "business_registration" },
      ],
    },
    {
      _id: "seed_2",
      name: "ID Check",
      slug: "national_id",
      icon: "UserCheck",
      color: "bg-blue-100 text-blue-700",
      description: "Government identity validation for individuals (National ID, Alien ID, Passport) via IPRS.",
      actions: [
        { _id: "a2", label: "Identity Document Verification", slug: "national_id_verify", enabled: true },
      ],
      checkTypes: [
        { _id: "ct2", label: "NATIONAL ID (CITIZEN)", slug: "national_id" },
        { _id: "ct3", label: "ALIEN ID / WORK PERMIT", slug: "alien_id" },
        { _id: "ct4", label: "PASSPORT NUMBER", slug: "passport" },
      ],
    },
    {
      _id: "seed_3",
      name: "KRA PIN Checker",
      slug: "kra",
      icon: "FileText",
      color: "bg-orange-100 text-orange-700",
      description: "Tax compliance and PIN validity checker for businesses, companies, and individuals.",
      actions: [
        { _id: "a3", label: "PIN Status & Registration Check", slug: "pin_verification", enabled: true },
      ],
      checkTypes: [
        { _id: "ct5", label: "KRA PIN CHECK (INDIVIDUAL)", slug: "kra_pin_check" },
        { _id: "ct6", label: "KRA PIN CHECK (COMPANY / CORPORATE)", slug: "kra_pin_corporate" },
      ],
    },
    {
      _id: "seed_4",
      name: "CRB Check",
      slug: "crb_check",
      icon: "Shield",
      color: "bg-purple-100 text-purple-700",
      description: "Credit Reference Bureau listing, score, and default risk report for individuals via ID number.",
      actions: [
        { _id: "a4", label: "Credit Score & Listing Status", slug: "crb_score_check", enabled: true },
      ],
      checkTypes: [
        { _id: "ct7", label: "INDIVIDUAL CREDIT REPORT", slug: "crb_check" },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-gray-900 tracking-tight">
          Select Verification Service
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Select one of the 4 core verification channels to proceed
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {displayServices.map((service) => {
          const IconComponent = getIcon(service.icon);
          const meta = serviceMeta[service.slug] || {
            target: "General",
            targetBg: "bg-gray-100 text-gray-700 border-gray-200",
            subtitle: service.description || "Official compliance check",
          };
          const isSelected = selectedSlug === service.slug;

          return (
            <motion.div
              key={service._id}
              variants={cardVariants}
              whileHover={{ y: -2, scale: 1.005 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelectService(service as ServiceType)}
              className={`
                p-5 bg-white border rounded-lg transition-all cursor-pointer group relative flex flex-col justify-between select-none
                ${
                  isSelected
                    ? "border-[#188015] ring-2 ring-[#188015]/20 shadow-sm bg-green-50/10"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-xs"
                }
              `}
            >
              <div className="space-y-3">
                {/* Header Row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 ${service.color} rounded-md shrink-0 shadow-2xs`}>
                      <IconComponent size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#188015] transition-colors leading-tight">
                        {service.name}
                      </h3>
                      <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 border rounded-md ${meta.targetBg}`}>
                        {meta.target}
                      </span>
                    </div>
                  </div>

                  <ArrowRight
                    size={16}
                    className="text-gray-400 group-hover:text-[#188015] group-hover:translate-x-1 transition-all mt-1"
                  />
                </div>

                {/* Subtitle / Description */}
                <p className="text-xs text-gray-600 leading-relaxed">
                  {meta.subtitle}
                </p>
              </div>

              {/* Actions preview tags */}
              <div className="pt-3 mt-3 border-t border-gray-100 flex flex-wrap gap-1.5">
                {service.actions.slice(0, 2).map((action) => (
                  <span
                    key={action._id}
                    className="inline-flex items-center gap-1 text-[10px] text-gray-500 font-mono bg-gray-50 px-2 py-0.5 border border-gray-200 rounded-sm"
                  >
                    <Check size={10} className="text-[#188015]" />
                    {action.label}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
