import React from "react";
import { CheckCircle2, Shield, Lock, Eye, Trash2, KeyRound, Globe2 } from "lucide-react";

export function PrivacyContent() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-gray-700 dark:text-gray-300">
      {/* Commitment Banner */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/40">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed">
            <span className="font-bold text-emerald-950 dark:text-emerald-200">Our Privacy Commitment: </span>
            EvidCheck operates on three sovereign data principles: <strong>Mandatory Prior Consent</strong>, <strong>Zero Persistent Caching</strong> of official citizen records, and <strong>Cryptographic Auditability</strong> under the Kenya Data Protection Act (2019).
          </div>
        </div>
      </div>

      {/* Section 1: Data Controller vs Processor */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-2">
          <KeyRound className="w-5 h-5 text-navy dark:text-sky-400" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            1. Roles Under the Data Protection Act (2019)
          </h2>
        </div>
        <p className="text-sm leading-relaxed">
          Depending on your relationship with EvidCheck, our data handling status is defined as follows:
        </p>
        <div className="grid sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700 space-y-2">
            <span className="font-bold text-gray-900 dark:text-white block text-sm">As a Data Processor:</span>
            <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
              When corporate clients conduct background checks, the hiring entity is the <strong>Data Controller</strong> who determines the purpose. EvidCheck acts as the <strong>Data Processor</strong> executing automated corroboration against authorized registries under the client&apos;s direct instructions and candidate consent.
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700 space-y-2">
            <span className="font-bold text-gray-900 dark:text-white block text-sm">As a Data Controller:</span>
            <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
              EvidCheck acts as a Data Controller only for our direct corporate clients&apos; account management data (administrator names, work emails, billing information, and access credentials).
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Data Categories Handled */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-2">
          <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            2. Categories of Data Processed
          </h2>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-800 text-xs">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
            <thead className="bg-gray-50 dark:bg-slate-900 font-semibold text-gray-900 dark:text-white">
              <tr>
                <th className="px-4 py-3 text-left">Data Category</th>
                <th className="px-4 py-3 text-left">Data Elements</th>
                <th className="px-4 py-3 text-left">Processing Purpose</th>
                <th className="px-4 py-3 text-left">Storage Policy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 bg-white dark:bg-slate-950">
              <tr>
                <td className="px-4 py-3 font-medium">National Identity</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">National ID, Full Name, DOB, Gender, Photo</td>
                <td className="px-4 py-3">Corroboration against IPRS</td>
                <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-medium">Zero-Cached (Purged in-memory)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Credit Bureau (CRB)</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Credit score, Delinquency code, Loan balances</td>
                <td className="px-4 py-3">Financial integrity risk rating</td>
                <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-medium">Point-in-time score snapshot</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Corporate Registration</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">CR12 details, Directorship, KRA Tax Compliance</td>
                <td className="px-4 py-3">KYB vendor & entity due diligence</td>
                <td className="px-4 py-3">Stored encrypted in tenant vault</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Audit Metadata</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Transaction hash, timestamp, user ID, PASS/FAIL</td>
                <td className="px-4 py-3">Regulatory audit compliance</td>
                <td className="px-4 py-3 font-medium">Retained 7 years (Section 42 DPA)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 3: Technical Safeguards */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-2">
          <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            3. Technical & Organizational Safeguards
          </h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-gray-50 dark:bg-slate-800/60 rounded-lg border border-gray-200 dark:border-slate-700">
            <span className="font-bold text-gray-900 dark:text-white">Transit Encryption:</span>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Enforced TLS 1.3 across all client interfaces, internal services, and upstream registry tunnels.
            </p>
          </div>
          <div className="p-3.5 bg-gray-50 dark:bg-slate-800/60 rounded-lg border border-gray-200 dark:border-slate-700">
            <span className="font-bold text-gray-900 dark:text-white">Rest Encryption:</span>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              AES-256 encryption with automated key rotation for tenant configuration and analytical summaries.
            </p>
          </div>
          <div className="p-3.5 bg-gray-50 dark:bg-slate-800/60 rounded-lg border border-gray-200 dark:border-slate-700">
            <span className="font-bold text-gray-900 dark:text-white">HMAC Signatures:</span>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              SHA-256 HMAC cryptographic signatures on REST API calls to prevent man-in-the-middle attacks.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Data Subject Rights */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-2">
          <Trash2 className="w-5 h-5 text-navy dark:text-sky-400" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            4. Data Subject Rights Under Section 26
          </h2>
        </div>
        <p className="text-sm leading-relaxed">
          Every Kenyan citizen whose identity is checked retains full statutory rights under the Data Protection Act (2019):
        </p>
        <ul className="space-y-2 text-xs sm:text-sm">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Right to be Informed:</strong> To receive prior notice and explanation of background checks.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Right of Access:</strong> To request a copy of the corroboration results held in the customer&apos;s audit trail.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Right to Rectification:</strong> To challenge inaccurate records with the primary statutory registry (e.g., IPRS or Metropol CRB).</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Right to Object:</strong> To withhold or withdraw consent for automated profiling.</span>
          </li>
        </ul>
      </section>

      {/* Section 5: Cross-Border Transfers */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-2">
          <Globe2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            5. Cross-Border Data Transfer Restrictions
          </h2>
        </div>
        <p className="text-sm leading-relaxed">
          EvidCheck does not transfer sovereign Kenyan citizen identity records outside the borders of the Republic of Kenya. All registry queries and verification operations are routed through authorized Kenyan sovereign access points in compliance with Section 48 of the Act.
        </p>
      </section>
    </div>
  );
}
