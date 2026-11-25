import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Download, FileText } from "lucide-react";

export function PrivacyHeader() {
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
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <ShieldCheck className="w-3 h-3" />
                ODPC Registered
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Doc Ref: EVID/SEC/DPP-2026/V1
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Data Privacy & Protection Policy
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 max-w-3xl">
              How EvidCheck Limited collects, processes, verifies, and protects personal data in strict compliance with the Kenya Data Protection Act (2019) and ISO 27001 standards.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <a
              href="/EvidCheck_Data_Privacy_Policy.pdf"
              download
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg dark:bg-slate-800 dark:text-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Privacy Policy PDF
            </a>
            <a
              href="/EvidCheck_Information_Security_Policy.pdf"
              download
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-navy hover:bg-navy/90 rounded-lg shadow-sm transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Security Policy PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
