"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, UserCheck, FileText, Shield, ArrowRight } from "lucide-react";

interface ServiceOption {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  category: string;
}

const services: ServiceOption[] = [
  {
    id: "business_registration",
    label: "Business Registration Check",
    description: "Verify business & company registration via BRS Kenya",
    icon: Building2,
    href: "/dashboard/verification?service=business_registration",
    category: "Businesses & Companies",
  },
  {
    id: "national_id",
    label: "National ID Check",
    description: "Verify individuals via IPRS Government ID",
    icon: UserCheck,
    href: "/dashboard/verification?service=national_id",
    category: "Individuals",
  },
  {
    id: "kra",
    label: "KRA PIN Checker",
    description: "Verify KRA iTax status, taxpayer type & compliance",
    icon: FileText,
    href: "/dashboard/verification?service=kra",
    category: "Businesses & Companies",
  },
  {
    id: "crb_check",
    label: "CRB Check",
    description: "Credit bureau check via Metropol / TransUnion",
    icon: Shield,
    href: "/dashboard/verification?service=crb_check",
    category: "Individuals",
  },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = services.filter((s) => {
    const q = query.toLowerCase();
    return (
      s.label.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    );
  });

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSelect = useCallback(
    (service: ServiceOption) => {
      onOpenChange(false);
      router.push(service.href);
    },
    [router, onOpenChange]
  );

  // Keyboard navigation inside the palette
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      handleSelect(filtered[selectedIndex]);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Palette Container */}
      <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[15vh]">
        <div
          className="w-full max-w-[520px] mx-4 bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-200">
            <Search size={18} className="text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Search verification services..."
              className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
              autoComplete="off"
              spellCheck={false}
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold text-gray-400 bg-gray-100 border border-gray-200 rounded-[4px]">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[320px] overflow-y-auto sidebar-scrollbar-hidden">
            {filtered.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-sm font-semibold text-gray-500">No services match &ldquo;{query}&rdquo;</p>
                <p className="text-xs text-gray-400 mt-1">Try searching for &ldquo;KRA&rdquo;, &ldquo;ID&rdquo;, or &ldquo;CRB&rdquo;</p>
              </div>
            ) : (
              <div className="py-2 px-2">
                <p className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Verification Services
                </p>
                {filtered.map((service, index) => {
                  const Icon = service.icon;
                  const isSelected = index === selectedIndex;

                  return (
                    <button
                      key={service.id}
                      onClick={() => handleSelect(service)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors
                        ${isSelected ? "bg-green-50 ring-1 ring-[#188015]/20" : "hover:bg-gray-50"}
                      `}
                    >
                      <div
                        className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? "bg-[#188015] text-white" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isSelected ? "text-[#188015]" : "text-gray-900"}`}>
                          {service.label}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{service.description}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:block">
                          {service.category}
                        </span>
                        <ArrowRight
                          size={14}
                          className={`transition-colors ${isSelected ? "text-[#188015]" : "text-gray-300"}`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between">
            <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded-[3px] text-[10px] font-bold">↑</kbd>
                <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded-[3px] text-[10px] font-bold">↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded-[3px] text-[10px] font-bold">↵</kbd>
                select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded-[3px] text-[10px] font-bold">esc</kbd>
                close
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
              <div className="w-3 h-3 bg-[#188015] rounded-xs flex items-center justify-center text-[8px] text-white font-black">E</div>
              EvidCheck
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
