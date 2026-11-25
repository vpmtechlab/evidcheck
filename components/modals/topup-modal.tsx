import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Wallet } from "lucide-react";

import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useApp } from "@/components/providers/app-provider";
import { Id } from "@/convex/_generated/dataModel";
import { getSessionToken } from "@/lib/session-token";
import { toast } from "sonner";

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TopUpModal({ isOpen, onClose }: TopUpModalProps) {
  const { member } = useApp();
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initializeTransaction = useAction(api.payments.initializeTransaction);

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    if (!member?.id || !member?.companyId) {
      toast.error("User session not found.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 1. Initialize on Backend
      const { authorization_url } = await initializeTransaction({
        sessionToken: getSessionToken() ?? "",
        amount: Number(amount),
        email: member.email || "user@example.com",
        companyId: member.companyId as Id<"companies">,
        userId: member.id as Id<"users">,
        callback_url: window.location.origin + "/dashboard/billing",
      });

      // 2. Redirect to Paystack Checkout Flow
      // This is 100% reliable and avoids Inline JS library conflicts.
      // The actual balance update is handled securely by our backend Webhook.
      if (authorization_url) {
        toast.info("Redirecting to Paystack checkout...");
        window.location.href = authorization_url;
      } else {
        throw new Error("Could not generate checkout URL.");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Could not initialize Paystack.";
      setIsSubmitting(false);
      toast.error(errorMessage);
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Top Up Balance
          </DialogTitle>
          <DialogDescription>
            Add funds to your account balance to pay for background checks and verifications.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleTopUp} className="grid gap-4 py-4">
          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <Input
                  id="amount"
                  type="number"
                  min="5"
                  step="1"
                  className="pl-7"
                  placeholder="50.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[25, 50, 100].map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant="outline"
                  className={amount === preset.toString() ? "border-primary text-primary" : ""}
                  onClick={() => setAmount(preset.toString())}
                  disabled={isSubmitting}
                >
                  ${preset}
                </Button>
              ))}
            </div>
          </div>
          
          <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto gap-2" disabled={isSubmitting}>
              <CreditCard className="w-4 h-4" /> {isSubmitting ? "Processing..." : "Pay Now"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
