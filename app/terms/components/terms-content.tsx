import React from "react";
import { CheckCircle2, AlertTriangle, ShieldCheck, Shield, Lock, Database, Scale, Building2 } from "lucide-react";

export function TermsContent() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-gray-700 dark:text-gray-300">
      {/* Notice Banner */}
      <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-5 dark:border-sky-900/60 dark:bg-sky-950/40">
        <div className="flex gap-3">
          <ShieldCheck className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed">
            <span className="font-bold text-sky-900 dark:text-sky-200">Regulatory Standing: </span>
            EvidCheck Limited (Registration No: PVT-OD16ZV23) is a registered Data Controller and Data Processor under the Kenya Data Protection Act (2019). By using our APIs, web portal, or console, you represent that your organization is a legally constituted entity executing checks strictly for authorized, consent-backed purposes.
          </div>
        </div>
      </div>

      {/* Section 1: Eligibility & KYB */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-2">
          <Building2 className="w-5 h-5 text-navy dark:text-sky-400" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            1. Eligibility, KYB Onboarding & Work Email Rule
          </h2>
        </div>
        <p className="text-sm leading-relaxed">
          Access to the EvidCheck platform is exclusively limited to verified corporations, registered business names, educational institutions, financial entities, and state corporations. Individual consumer accounts and personal lookups are strictly prohibited.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-gray-50 dark:bg-slate-800/60 rounded-lg border border-gray-200 dark:border-slate-700">
            <span className="font-bold text-gray-900 dark:text-white">Corporate Identity Corroboration:</span>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Customers must complete KYB onboarding, submitting valid business registration credentials (CR12, Certificate of Incorporation, and Company KRA PIN) prior to production API provisioning.
            </p>
          </div>
          <div className="p-3.5 bg-gray-50 dark:bg-slate-800/60 rounded-lg border border-gray-200 dark:border-slate-700">
            <span className="font-bold text-gray-900 dark:text-white">Work Email Enforcement:</span>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Accounts must be provisioned with authorized corporate domain emails. Free consumer domains (e.g., Gmail, Yahoo) are blocked from accessing production verification endpoints.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Prior Consent Mandate */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-2">
          <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            2. Mandatory Candidate Prior Consent & Legal Warranties
          </h2>
        </div>
        <p className="text-sm leading-relaxed">
          In strict compliance with Part IV of the Data Protection Act (2019), Customer covenants, warrants, and guarantees that:
        </p>
        <ul className="space-y-2.5 text-xs sm:text-sm">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Informed Consent:</strong> Every candidate query submitted has received prior, explicit, written, and informed consent from the data subject authorizing the specific check (National ID, Academic, Credit Bureau, or Tax Compliance).</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Fair Processing Notice:</strong> Customer has provided the data subject with fair processing details informing them of the statutory registries queried and the objective of the screening.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Audit Retention:</strong> Customer shall retain signed candidate consent artifacts for at least five (5) years and present them upon regulatory audit by the ODPC or EvidCheck compliance officers.</span>
          </li>
        </ul>

        <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/60 dark:bg-amber-950/40">
          <div className="flex gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200">
              <strong>Strict Indemnity for Consent Breach:</strong> Customer agrees to fully indemnify and hold harmless EvidCheck Limited against any statutory penalties, fines, or civil claims resulting from inquiries executed without legitimate candidate consent.
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Zero-Caching Architecture */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-2">
          <Database className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            3. Zero-Caching Architecture & Data Processing Rules
          </h2>
        </div>
        <p className="text-sm leading-relaxed">
          EvidCheck acts as an authorized Data Processor executing point-in-time automated corroborations. Under our sovereign security guidelines agreed with the Ministry of Interior (IPRS):
        </p>
        <div className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700 space-y-2 text-xs sm:text-sm">
          <p>
            <strong>Stateless Processing:</strong> Raw citizen identity records (names, facial photographs, dates of birth) returned by sovereign registries are evaluated ephemerally in-memory for match corroboration and immediately purged.
          </p>
          <p>
            <strong>No Mirror Databases:</strong> EvidCheck does not construct, cache, or maintain any local replica of national population registers.
          </p>
          <p>
            <strong>Immutable Audit Logging:</strong> Only non-PII cryptographic transaction hashes, UTC timestamps, user session tokens, and match result indicators (PASS/FAIL) are persisted for statutory 7-year audit compliance.
          </p>
        </div>
      </section>

      {/* Section 4: Prohibited Uses & Anti-Brokerage */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-2">
          <Scale className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            4. Strictly Prohibited Uses & Anti-Data-Brokerage
          </h2>
        </div>
        <p className="text-sm leading-relaxed">
          Users shall not, under any circumstances:
        </p>
        <ul className="space-y-2 text-xs sm:text-sm">
          <li className="flex items-start gap-2">
            <span className="text-rose-500 font-bold shrink-0">✕</span>
            <span>Resell, sublicense, broker, or publicly expose raw verification outputs or API endpoints.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-rose-500 font-bold shrink-0">✕</span>
            <span>Conduct surveillance, stalking, debt-collector harassment, or unauthorized vetting on individuals.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-rose-500 font-bold shrink-0">✕</span>
            <span>Build public directory services or reverse-lookup search engines based on EvidCheck data.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-rose-500 font-bold shrink-0">✕</span>
            <span>Attempt to bypass rate limits, probe infrastructure, or reverse engineer cryptographic API signatures.</span>
          </li>
        </ul>
      </section>

      {/* Section 5: Disclaimers & Governance */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-2">
          <Shield className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            5. Disclaimers, Service Levels & Dispute Resolution
          </h2>
        </div>
        <p className="text-sm leading-relaxed">
          <strong>Decision Autonomy:</strong> EvidCheck generates objective analytical corroboration scores. The decision to hire, onboard, extend credit, or terminate a commercial engagement rests exclusively with the Customer.
        </p>
        <p className="text-sm leading-relaxed">
          <strong>Governing Law:</strong> These Terms and any accompanying Master Services Agreement shall be governed by and construed in accordance with the Laws of the Republic of Kenya. Any unresolved dispute shall be referred to arbitration under the Nairobi Centre for International Arbitration (NCIA) Rules.
        </p>
      </section>
    </div>
  );
}
