import React from "react";
import { PrivacyHeader } from "./components/privacy-header";
import { PrivacyContent } from "./components/privacy-content";
import { PrivacyFooter } from "./components/privacy-footer";

export const metadata = {
  title: "Data Privacy & Protection Policy | EvidCheck",
  description: "Comprehensive Data Privacy and Subject Rights Policy aligned with the Kenya Data Protection Act 2019 and ISO 27001.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 font-sans">
      <PrivacyHeader />
      <PrivacyContent />
      <PrivacyFooter />
    </main>
  );
}
