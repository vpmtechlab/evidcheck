import React, { useContext } from "react";
import { CheckCircle, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppContext } from "@/components/providers/app-provider";
import { Id } from "@/convex/_generated/dataModel";
import { getSessionToken } from "@/lib/session-token";

export function BillingSettings() {
  const { member } = useContext(AppContext);
  const companyId = member?.companyId as Id<"companies">;
  
  const balanceDoc = useQuery(api.balances.get, companyId ? { sessionToken: getSessionToken() ?? "", companyId } : "skip");
  const transactions = useQuery(api.transactions.list, companyId ? { sessionToken: getSessionToken() ?? "", companyId } : "skip");

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Billing & Wallet</h2>
        <p className="text-sm text-gray-500">Manage your available balance and recent transactions.</p>
      </div>

      {/* Wallet Balance */}
      <div className="bg-linear-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold">Standard Account</h3>
              <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/30">
                Active
              </span>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Your current available balance for compliance verifications.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1.5 text-white font-bold text-xl">
                {balanceDoc ? formatCurrency(balanceDoc.availableBalance) : <Loader2 className="animate-spin size-4" />}
              </span>
            </div>
          </div>
          <div className="w-full md:w-auto">
            <Link href="/dashboard/billing">
              <Button variant="outline" className="text-gray-900 w-full md:w-auto hover:bg-gray-100">
                Top Up Balance
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Recent Transactions</h3>
          <Link
            href="/dashboard/billing"
            className="text-sm text-secondary hover:text-gray-900 font-medium flex items-center gap-1"
          >
            History <ExternalLink size={14} />
          </Link>
        </div>
        
        {!transactions ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-gray-300" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-500 flex flex-col items-center gap-2">
            <AlertCircle size={24} className="text-gray-300" />
            <p>No transactions found.</p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            {transactions.slice(0, 5).map((tx) => (
              <div
                key={tx._id}
                className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full shrink-0 ${tx.status === "success" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                    <CheckCircle size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900 capitalize">{tx.type.replace("_", " ")}</p>
                    <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium text-sm ${tx.type === "top_up" ? "text-green-600" : "text-gray-900"}`}>
                    {tx.type === "top_up" ? "+" : "-"}{formatCurrency(tx.amount)}
                  </p>
                  <span className="text-xs text-gray-500 capitalize">{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
