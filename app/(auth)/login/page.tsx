"use client";

import React, { useState } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { Zap } from "lucide-react";

export default function LoginPage() {
  const [view, setView] = useState<"login" | "register">("login");

  return (
    <div className="mb-4 max-md:h-fit">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 justify-center">
        <div className="relative w-8 h-8 flex items-center justify-center bg-teal-50 rounded-lg">
          <Zap className="w-5 h-5 text-teal-600" />
        </div>
        <span className="text-xl font-bold text-[#188015]">EvidCheck</span>
      </div>
      <h1 className="text-xl font-bold tracking-tight text-gray-900 text-center mb-1">
        Welcome to EvidCheck
      </h1>
      <p className="text-center text-xs text-gray-500 mb-6">
        Start your experience with EvidCheck by signing in or signing up.
      </p>

      {/* Tab Switcher */}
      <div className="bg-gray-100 p-1 rounded-lg flex items-center mb-6 relative">
        <button
          onClick={() => setView("login")}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 z-10 ${
            view === "login"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setView("register")}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 z-10 ${
            view === "register"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Form Container */}
      <div>
        {view === "login" ? <LoginForm /> : <RegisterForm onSuccess={() => setView("login")} />}
      </div>
    </div>
  );
}
