"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { getSessionToken } from "@/lib/session-token";
import { Button } from "@/components/ui/button";
import { CompaniesTable } from "./components/companies-table";
import { OnboardCompanyModal } from "./components/onboard-company-modal";

export default function CompaniesAdminPage() {
  const router = useRouter();
  const [onboardOpen, setOnboardOpen] = useState(false);
  const companies = useQuery(api.admin.getAllCompanies, { sessionToken: getSessionToken() ?? "" });

  if (companies === undefined) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Organizations &amp; Tenants
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Onboard KYB-verified client organizations and manage platform tenants.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="text-xs font-mono font-bold text-gray-700 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-md">
            {companies.length} Total Organizations
          </span>
          <Button
            onClick={() => setOnboardOpen(true)}
            size="sm"
            className="bg-brand hover:bg-brand-dark text-white text-xs font-semibold gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Onboard Company
          </Button>
        </div>
      </div>

      <CompaniesTable
        companies={companies}
        onViewDetails={(id) => router.push(`/admin/companies/${id}`)}
      />

      <OnboardCompanyModal open={onboardOpen} onOpenChange={setOnboardOpen} />
    </div>
  );
}
