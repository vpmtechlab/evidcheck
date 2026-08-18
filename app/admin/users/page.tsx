"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { User, ShieldAlert, MoreHorizontal, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function UsersAdminPage() {
  const users = useQuery(api.admin.getAllUsers);

  if (users === undefined) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#188015]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            User Accounts & Roles
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage all registered members across client companies and administrative staff.
          </p>
        </div>
        <div className="text-xs font-mono font-bold text-gray-700 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-md self-start sm:self-auto">
          {users.length} Total Users
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-2xs">
        <Table>
          <TableHeader className="bg-gray-50/80 border-b border-gray-200">
            <TableRow>
              <TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider">User</TableHead>
              <TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider">Organization</TableHead>
              <TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider">Role</TableHead>
              <TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider">Status</TableHead>
              <TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider text-right">Joined</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id} className="hover:bg-gray-50/60 transition-colors border-b border-gray-100">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-[#0e1b42] flex items-center justify-center text-white text-xs font-bold font-mono">
                      {user.firstName[0]}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900">{user.firstName} {user.surname}</div>
                      <div className="text-[11px] text-gray-500 font-mono">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-xs">
                    {user.isSuperAdmin && <ShieldAlert size={14} className="text-purple-600" />}
                    <span className={user.isSuperAdmin ? "font-bold text-purple-700" : "text-gray-700 font-medium"}>
                      {user.companyName}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border
                    ${user.status === "active" ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-700 border-gray-200"}`}
                  >
                    {user.status}
                  </span>
                </TableCell>
                <TableCell className="text-right text-gray-500 font-mono text-[11px]">
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <button className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                    <MoreHorizontal size={15} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
            
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-xs text-gray-500 font-medium">
                  No user accounts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
