import React from "react";
import { TermsHeader } from "./components/terms-header";
import { TermsContent } from "./components/terms-content";
import { TermsFooter } from "./components/terms-footer";

export const metadata = {
  title: "Platform Terms of Service & Master Services Agreement | EvidCheck",
  description: "Enterprise Terms of Service, Prior Consent Mandates, and Master Services Agreement governing EvidCheck verification platform.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 font-sans">
      <TermsHeader />
      <TermsContent />
      <TermsFooter />
    </main>
  );
}
