import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export function TermsFooter() {
  return (
    <div className="border-t border-gray-200 bg-gray-50 dark:bg-slate-900/60 dark:border-slate-800 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              EvidCheck Legal & Compliance Directorate
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              For enterprise Master Services Agreement (MSA) countersigning or custom SLA agreements.
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-300">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-navy dark:text-sky-400" />
                legal@evidcheck.com
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-navy dark:text-sky-400" />
                +254 795 968 681
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-navy dark:text-sky-400" />
                Nairobi, Kenya
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/privacy"
              className="text-xs font-semibold text-brand hover:underline"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-300 dark:text-slate-700">•</span>
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand/90 rounded-lg shadow-sm transition-colors"
            >
              Sign In to EvidCheck
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
