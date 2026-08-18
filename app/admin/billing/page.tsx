"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DollarSign, Building2, Loader2, Wallet } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function GlobalBillingAdminPage() {
  const companies = useQuery(api.admin.getAllCompanies);
  const metrics = useQuery(api.admin.getGlobalMetrics);

  if (companies === undefined || metrics === undefined) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#188015]" />
      </div>
    );
  }

  const totalPlatformBalance = companies.reduce((sum, c) => sum + (c.availableBalance || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Global Billing & Treasury
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Overview of all enterprise client wallets, platform revenue, and balance health.
          </p>
        </div>
      </div>

      {/* Top 2 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 text-green-700 rounded-md">
                <DollarSign size={16} />
              </div>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Total Settled Revenue
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-sm">
              All time
            </span>
          </div>
          <div className="pt-1 border-t border-gray-100">
            <div className="text-2xl font-bold text-gray-900 font-mono tracking-tight">
              ${metrics.totalRevenue.toFixed(2)}
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Net revenue generated across all verified transactions
            </p>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-700 rounded-md">
                <Wallet size={16} />
              </div>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Total Client Custody Balance
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-sm">
              Live Balance
            </span>
          </div>
          <div className="pt-1 border-t border-gray-100">
            <div className="text-2xl font-bold text-gray-900 font-mono tracking-tight">
              ${totalPlatformBalance.toFixed(2)}
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Prepaid float stored across {companies.length} organization wallets
            </p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
          Client Organization Wallets
        </h2>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-2xs">
          <Table>
            <TableHeader className="bg-gray-50/80 border-b border-gray-200">
              <TableRow>
                <TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider">Company Name</TableHead>
                <TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider text-right">Available Balance</TableHead>
                <TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider text-right">Verifications Run</TableHead>
                <TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company._id} className="hover:bg-gray-50/60 transition-colors border-b border-gray-100">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="text-xs font-bold text-gray-900">
                          {company.name} {company.isSuperAdmin && <span className="text-purple-700 font-mono text-[10px] ml-1">(Super Admin)</span>}
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono">{company.domain}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-mono font-bold text-xs text-[#188015]">
                      ${company.availableBalance.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-xs font-mono font-bold text-gray-900">
                    {company.verificationCount}
                  </TableCell>
                  <TableCell>
                    {company.availableBalance < 10 && !company.isSuperAdmin ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
                        Low Balance
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-200">
                        Healthy
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              
              {companies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-xs text-gray-500 font-medium">
                    No company wallets found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
