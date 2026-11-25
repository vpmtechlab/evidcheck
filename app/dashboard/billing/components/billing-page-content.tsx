"use client";

// Route-level billing implementation.

import React from "react";
import { useApp } from "@/components/providers/app-provider";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getSessionToken } from "@/lib/session-token";
import { BillingHeader } from "./billing-header";
import { SpendingTrendsChart } from "./spending-trends-chart";
import { SpendingPowerCard } from "./spending-power-card";
import { TransactionsTable } from "./transactions-table";

export default function BillingPage() {
  const { member, setShowTopUp } = useApp();

  const balance = useQuery(api.balances.getAvailableBalance, 
    member?.companyId ? { sessionToken: getSessionToken() ?? "", companyId: member.companyId as Id<"companies"> } : "skip"
  );

  const transactions = useQuery(api.transactions.list,
    member?.companyId ? { sessionToken: getSessionToken() ?? "", companyId: member.companyId as Id<"companies"> } : "skip"
  );

  const billingAnalytics = useQuery(api.billing.getBillingAnalytics,
    member?.companyId ? { sessionToken: getSessionToken() ?? "", companyId: member.companyId as Id<"companies"> } : "skip"
  );

  return (
    <div className="flex flex-col gap-6 p-2 max-w-[1600px] mx-auto">
      <BillingHeader onTopUp={() => setShowTopUp(true)} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SpendingTrendsChart data={billingAnalytics} />
        </div>
        <SpendingPowerCard balance={balance} />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-gray-900 tracking-tight">Transaction History</h2>
        <TransactionsTable transactions={transactions} />
      </div>
    </div>
  );
}
