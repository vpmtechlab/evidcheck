"use client";

// Route-level billing implementation.

import React, { useState } from "react";
import { Plus, ArrowUpRight, ArrowDownLeft, Search, ChevronLeft, ChevronRight, Wallet } from "lucide-react";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { format } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function BillingPage() {
  const { member, setShowTopUp } = useApp();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const balance = useQuery(api.balances.getAvailableBalance, 
    member?.companyId ? { companyId: member.companyId as Id<"companies"> } : "skip"
  );

  const transactions = useQuery(api.transactions.list,
    member?.companyId ? { companyId: member.companyId as Id<"companies"> } : "skip"
  );

  const billingAnalytics = useQuery(api.billing.getBillingAnalytics,
    member?.companyId ? { companyId: member.companyId as Id<"companies"> } : "skip"
  );

  const handleTopUp = () => {
    setShowTopUp(true);
  };

  const filteredData = (transactions || []).filter((row) =>
    row._id.toString().slice(-8).toUpperCase().includes(searchTerm.toUpperCase())
  );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );



  return (
    <div className="flex flex-col gap-8 p-2 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Billing & FinOps</h1>
          <p className="text-gray-500 text-sm mt-1.5 flex items-center gap-2">
            <Wallet size={14} className="text-primary" />
            Manage your organization&apos;s credits, spending trends, and transaction history.
          </p>
        </div>
        
        <Button
          onClick={handleTopUp}
          className="bg-primary hover:bg-[#146c11] text-white px-8 shadow-md rounded-xl h-11 font-bold"
        >
          <Plus size={18} className="mr-1" />
          Top Up Balance
        </Button>
      </div>

      {/* Analytics Chart & Spending Power */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Trends Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Spending Trends</h3>
              <p className="text-xs text-gray-500">Daily verification costs over the last 30 days</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" /> 
                <span>Spent</span>
              </div>
              <div className="flex items-center gap-1.5 ml-3">
                <div className="w-2.5 h-2.5 rounded-full border border-[#023e4a] border-dashed" /> 
                <span>Top-ups</span>
              </div>
            </div>
          </div>
          
          <div className="h-[240px] w-full">
            {!billingAnalytics ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl">
                 <div className="animate-pulse flex flex-col items-center gap-2">
                   <div className="h-4 w-32 bg-gray-200 rounded" />
                   <div className="h-2 w-24 bg-gray-100 rounded" />
                 </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={billingAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1C7D18" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#1C7D18" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }} 
                    dy={10}
                    interval={billingAnalytics?.length ? Math.floor(billingAnalytics.length / 6) : 0}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="spent" 
                    stroke="#1C7D18" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorSpent)" 
                    animationDuration={1500}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="toppedUp" 
                    stroke="#023e4a" 
                    strokeWidth={1.5}
                    fill="transparent"
                    strokeDasharray="5 5"
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Spending Power Sidebar */}
        <div className="bg-[#023e4a] p-6 rounded-3xl text-white shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-500" />
          
          <div className="relative z-10">
            <h3 className="font-bold text-lg flex items-center gap-2">
               Spending Power
            </h3>
            <p className="text-xs text-white/50 mt-1 leading-relaxed">Provisional capacity based on your current liquid balance.</p>
          </div>
          
          <div className="relative z-10 space-y-5 py-8">
            <div className="flex justify-between items-end border-b border-white/10 pb-3">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Avail. Checks</span>
              <span className="text-3xl font-bold tracking-tighter">
                {(balance ? Math.floor(balance / 15) : 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-end border-b border-white/10 pb-3">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Standard Rate</span>
              <div className="text-right">
                <span className="text-sm font-bold">$15.00</span>
                <p className="text-[8px] text-white/30">PER VERIFICATION</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
             <div className="flex items-center gap-2 mb-2">
                <div className="p-1 bg-primary/20 rounded text-primary">
                   <Plus size={12} />
                </div>
                <p className="text-[10px] uppercase font-bold text-primary tracking-widest">Growth Tip</p>
             </div>
             <p className="text-[11px] text-white/70 leading-relaxed">
                Deposit <span className="text-white font-bold">$500+</span> to unlock custom corporate tiers and bulk verification discounts.
             </p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-gray-900">Transaction History</h2>
        
        <div className="bg-white border text-sm border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search Transaction ID"
                className="pl-9 bg-gray-50 border-gray-200"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions === undefined ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                      Loading transactions...
                    </TableCell>
                  </TableRow>
                ) : currentData.length > 0 ? (
                  currentData.map((row) => (
                    <TableRow key={row._id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium">
                        {row._id.toString().slice(-12).toUpperCase()}
                      </TableCell>
                      <TableCell>{format(row.createdAt, "MMM dd, yyyy")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {row.type === "top_up" ? (
                            <ArrowDownLeft size={14} className="text-green-500" />
                          ) : (
                            <ArrowUpRight size={14} className="text-red-500" />
                          )}
                          <span className="capitalize">{row.type.replace("_", " ")}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-medium ${
                            row.type === "top_up" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {row.type === "top_up" ? "+" : "-"}${row.amount.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            row.status === "success"
                              ? "bg-green-100 text-green-700"
                              : row.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Details */}
          <div className="p-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
            <div>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 px-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2 font-medium text-gray-700">
                Page {currentPage} of {Math.max(1, totalPages)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || totalPages === 0}
                className="h-8 px-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
