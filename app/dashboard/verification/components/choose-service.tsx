"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { ServiceCard } from "./service-card";
import { FALLBACK_SERVICES } from "./service-seed-data";

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

  // Filter out any legacy AML services
  const filteredFromDb = services.filter((s) => s.slug !== "aml" && s.name !== "AML");

  // Fallback if database seed is pending
  const displayServices = filteredFromDb.length > 0 ? filteredFromDb : FALLBACK_SERVICES;

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
          const meta = serviceMeta[service.slug] || {
            target: "General",
            targetBg: "bg-gray-100 text-gray-700 border-gray-200",
            subtitle: service.description || "Official compliance check",
          };
          return (
            <ServiceCard
              key={service._id}
              service={service as ServiceType}
              meta={meta}
              isSelected={selectedSlug === service.slug}
              onSelect={onSelectService}
            />
          );
        })}
      </motion.div>
    </div>
  );
}
