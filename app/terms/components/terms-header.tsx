import React from "react";
import Link from "next/link";
import { Shield, FileText, ArrowLeft, Download } from "lucide-react";

export function TermsHeader() {
  return (
    <div className="border-b border-gray-200 bg-white dark:bg-slate-900 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/login"
              className="inline-flex items-center text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Back to Sign In
            </Link>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Shield className="w-3 h-3" />
                DPA 2019 Compliant
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Doc Ref: EVID/LEGAL/TOS-2026/V1
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Platform Terms of Service & Master Services Agreement
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 max-w-3xl">
              Legally binding terms governing enterprise identity verification, KYC/KYB corroboration, and automated background screening services provided by EvidCheck Limited.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <a
              href="/EvidCheck_Platform_Terms_of_Service.pdf"
              download
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg dark:bg-slate-800 dark:text-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Terms PDF
            </a>
            <a
              href="/EvidCheck_Master_Services_Agreement.pdf"
              download
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-navy hover:bg-navy/90 rounded-lg shadow-sm transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Enterprise MSA PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
