"use client";

import React from "react";
import { BookOpen, ShieldCheck, Terminal, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocHeaderProps {
  activeTab: "docs" | "playground" | "subdomain";
  setActiveTab: (tab: "docs" | "playground" | "subdomain") => void;
}

export function DocHeader({ activeTab, setActiveTab }: DocHeaderProps) {
  return (
    <div className="p-6 md:p-8 bg-navy text-white border-b-2 border-brand rounded-lg shadow-xs space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-md shrink-0 shadow-xs bg-brand text-white">
            <BookOpen size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                API Documentation & Reference
              </h1>
              <span className="bg-brand/30 text-green-300 border border-brand/50 px-2 py-0.5 text-[10px] font-bold rounded-md font-mono">
                v1.0 REST
              </span>
            </div>
            <p className="text-gray-300 text-xs mt-1">
              RESTful endpoints for real-time KYB, National ID, KRA PIN, and CRB
              verification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === "docs" ? "secondary" : "default"}
            size="sm"
            onClick={() => setActiveTab("docs")}
            className={`text-xs font-semibold h-8 rounded-md px-3 border transition-colors flex items-center gap-1.5 text-white ${activeTab === "docs" ? "bg-white/20 border-white" : "border-white/30"}`}
          >
            <Terminal size={14} />
            Documentation
          </Button>
          <Button
            variant={activeTab === "playground" ? "secondary" : "default"}
            size="sm"
            onClick={() => setActiveTab("playground")}
            className={`text-xs font-semibold h-8 rounded-md px-3 border transition-colors flex items-center gap-1.5 text-white ${activeTab === "playground" ? "bg-white/20 border-white" : "border-white/30"}`}
          >
            <Play size={14} />
            Interactive Tester
          </Button>
        </div>
      </div>

      <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-300 font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Production API Active
          </span>
          <span>•</span>
          <span>
            Base URL:{" "}
            <code className="text-green-300 bg-white/10 px-1.5 py-0.5 rounded">
              https://api.evidcheck.com/v1
            </code>
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-300 text-[11px]">
          <ShieldCheck size={14} className="text-green-400" />
          <span>TLS 1.3 Encrypted • 256-bit AES</span>
        </div>
      </div>
    </div>
  );
}
