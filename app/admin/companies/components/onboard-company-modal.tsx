"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { Building2, CheckCircle2, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { getSessionToken } from "@/lib/session-token";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface OnboardCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface OnboardResult {
  companyName: string;
  adminEmail: string;
  setupPath: string;
}

export function OnboardCompanyModal({ open, onOpenChange }: OnboardCompanyModalProps) {
  const onboardCompany = useMutation(api.admin.onboardCompany);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<OnboardResult | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [domain, setDomain] = useState("");
  const [country, setCountry] = useState("Kenya");
  const [location, setLocation] = useState("Nairobi");
  const [adminFirstName, setAdminFirstName] = useState("");
  const [adminSurname, setAdminSurname] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [initialBalance, setInitialBalance] = useState("0");

  const resetForm = () => {
    setCompanyName("");
    setRegNumber("");
    setDomain("");
    setCountry("Kenya");
    setLocation("Nairobi");
    setAdminFirstName("");
    setAdminSurname("");
    setAdminEmail("");
    setInitialBalance("0");
    setResult(null);
    setCopied(false);
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await onboardCompany({
        sessionToken: getSessionToken() ?? "",
        companyName,
        regNumber,
        domain,
        country,
        location,
        adminFirstName,
        adminSurname,
        adminEmail,
        initialBalance: Number(initialBalance) || 0,
      });
      setResult({
        companyName: res.companyName,
        adminEmail: res.adminEmail,
        setupPath: res.setupPath,
      });
      toast.success(`${res.companyName} onboarded and welcome email queued.`);
    } catch (err) {
      const message =
        err instanceof ConvexError
          ? String(err.data)
          : err instanceof Error
            ? err.message
            : "Failed to onboard organization.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const fullSetupUrl =
    result && typeof window !== "undefined"
      ? `${window.location.origin}${result.setupPath}`
      : result?.setupPath ?? "";

  const handleCopy = () => {
    if (!fullSetupUrl) return;
    navigator.clipboard.writeText(fullSetupUrl);
    setCopied(true);
    toast.success("Onboarding setup link copied");
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
            <Building2 className="w-4 h-4 text-brand" />
            Onboard Client Organization
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Provision a KYB-verified company workspace, initialize balance, and invite its first corporate admin.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4 pt-2">
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 space-y-1">
                <p className="font-bold">{result.companyName} is now active.</p>
                <p>
                  A welcome email with temporary credentials and setup instructions was dispatched to{" "}
                  <span className="font-mono font-semibold">{result.adminEmail}</span>.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Direct Password Setup Link</Label>
              <div className="flex items-center gap-2">
                <Input readOnly value={fullSetupUrl} className="font-mono text-[11px] bg-gray-50" />
                <Button type="button" variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={resetForm}>
                Onboard Another
              </Button>
              <Button type="button" size="sm" onClick={() => handleClose(false)} className="bg-brand hover:bg-brand-dark text-white">
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 pt-1 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="ob-company" className="text-xs">Company Name *</Label>
                <Input id="ob-company" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Limited" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ob-reg" className="text-xs">Reg Number *</Label>
                <Input id="ob-reg" required value={regNumber} onChange={(e) => setRegNumber(e.target.value)} placeholder="PVT-2024/12345" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="ob-domain" className="text-xs">Company Domain *</Label>
                <Input id="ob-domain" required value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="acme.co.ke" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ob-country" className="text-xs">Country *</Label>
                <Input id="ob-country" required value={country} onChange={(e) => setCountry(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ob-location" className="text-xs">Location *</Label>
                <Input id="ob-location" required value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="ob-first" className="text-xs">Admin First Name *</Label>
                <Input id="ob-first" required value={adminFirstName} onChange={(e) => setAdminFirstName(e.target.value)} placeholder="Jane" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ob-last" className="text-xs">Admin Surname *</Label>
                <Input id="ob-last" required value={adminSurname} onChange={(e) => setAdminSurname(e.target.value)} placeholder="Wanjiku" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1">
                <Label htmlFor="ob-email" className="text-xs">Admin Work Email *</Label>
                <Input id="ob-email" type="email" required value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="jane@acme.co.ke" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ob-balance" className="text-xs">Opening Balance</Label>
                <Input id="ob-balance" type="number" min="0" step="0.01" value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button type="button" variant="outline" size="sm" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submitting} className="bg-brand hover:bg-brand-dark text-white gap-1.5">
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Onboard &amp; Send Invite
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
