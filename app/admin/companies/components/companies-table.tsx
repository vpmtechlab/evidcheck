"use client";

import React from "react";
import { Building2, User, ShieldAlert, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface AdminCompanyRow {
  _id: string;
  name: string;
  domain: string;
  status: string;
  isSuperAdmin?: boolean;
  userCount: number;
  verificationCount: number;
  availableBalance: number;
  createdAt: number;
}

interface CompaniesTableProps {
  companies: AdminCompanyRow[];
  onViewDetails: (companyId: string) => void;
}

export function CompaniesTable({ companies, onViewDetails }: CompaniesTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-2xs">
      <Table>
        <TableHeader className="bg-gray-50/80 border-b border-gray-200">
          <TableRow>
            <TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider">Company Name</TableHead>
            <TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider">Status</TableHead>
            <TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider text-right">Users</TableHead>
            <TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider text-right">Verifications</TableHead>
            <TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider text-right">Wallet Balance</TableHead>
            <TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider text-right">Joined</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company._id} className="hover:bg-gray-50/60 transition-colors border-b border-gray-100">
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-xs ${
                      company.isSuperAdmin ? "bg-navy" : "bg-blue-600"
                    }`}
                  >
                    {company.isSuperAdmin ? <ShieldAlert size={15} /> : <Building2 size={15} />}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-gray-900">{company.name}</div>
                    <div className="text-[11px] text-gray-500 font-mono">{company.domain}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${
                    company.status === "active"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-gray-100 text-gray-700 border-gray-200"
                  }`}
                >
                  {company.status}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1 text-xs font-mono text-gray-700 font-medium">
                  <User size={13} className="text-gray-400" /> {company.userCount}
                </div>
              </TableCell>
              <TableCell className="text-right text-xs font-mono font-bold text-gray-900">
                {company.verificationCount}
              </TableCell>
              <TableCell className="text-right font-mono font-bold text-xs text-brand">
                ${company.availableBalance.toFixed(2)}
              </TableCell>
              <TableCell className="text-right text-gray-500 font-mono text-[11px]">
                {new Date(company.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <button
                  onClick={() => onViewDetails(company._id)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors border border-gray-200 hover:border-gray-300"
                >
                  <Eye size={13} /> View
                </button>
              </TableCell>
            </TableRow>
          ))}

          {companies.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12 text-xs text-gray-500 font-medium">
                No organizations onboarded yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
