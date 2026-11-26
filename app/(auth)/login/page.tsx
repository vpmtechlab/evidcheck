"use client";

import React from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { ShieldCheck } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="mb-4 max-md:h-fit">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 justify-center">
        <div className="relative w-8 h-8 flex items-center justify-center bg-navy rounded-lg">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-navy">EvidCheck</span>
      </div>
      <h1 className="text-xl font-bold tracking-tight text-gray-900 text-center mb-1">
        Welcome to EvidCheck
      </h1>
      <p className="text-center text-xs text-gray-500 mb-6">
        Sign in with your organization credentials.
      </p>

      {/* Sign In Form */}
      <LoginForm />

      {/* Enterprise Onboarding Notice */}
      <div className="mt-5 rounded-lg bg-gray-50 border border-gray-200 px-3.5 py-2.5 text-center text-[11px] text-gray-600 leading-relaxed">
        New organization? Companies are onboarded directly by EvidCheck after KYB review.{" "}
        <a
          href="mailto:info@evidcheck.com?subject=EvidCheck%20Company%20Onboarding"
          className="text-brand hover:underline font-semibold"
        >
          Contact onboarding
        </a>
        .
      </div>

      {/* Legal Footer */}
      <p className="text-center text-[11px] text-gray-500 mt-5 leading-relaxed">
        By continuing, you agree to EvidCheck&apos;s{" "}
        <Link href="/terms" className="text-brand hover:underline font-medium">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-brand hover:underline font-medium">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
