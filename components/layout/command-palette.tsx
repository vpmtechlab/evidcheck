"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, UserCheck, FileText, Shield } from "lucide-react";
import { PaletteServiceItem } from "./palette-service-item";
import { PaletteFooter } from "./palette-footer";

export interface ServiceOption {
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
    description: "Verify business & company registration status via BRS Kenya",
    icon: Building2,
    href: "/dashboard/verification?service=business_registration",
    category: "Businesses & Companies",
  },
  {
    id: "national_id",
    label: "Individual Document Verification",
    description: "Verify individuals via National ID, Alien ID, or Passport (IPRS)",
    icon: UserCheck,
    href: "/dashboard/verification?service=national_id",
    category: "Individuals",
  },
  {
    id: "kra",
    label: "KRA PIN Checker",
    description: "Verify KRA iTax status, taxpayer type & tax compliance (TCC)",
    icon: FileText,
    href: "/dashboard/verification?service=kra",
    category: "Businesses & Individuals",
  },
  {
    id: "crb_check",
    label: "CRB Check",
    description: "Credit bureau score & listing history via ID number (Metropol / TransUnion)",
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

  // Reset selection when the query changes (handled in the input onChange)
  const handleQueryChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(0);
  };

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

  // Focus the input on mount (the palette remounts every time it opens)
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

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
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Palette Container */}
      <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[12vh] sm:pt-[15vh]">
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
              onChange={(e) => handleQueryChange(e.target.value)}
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
                {filtered.map((service, index) => (
                  <PaletteServiceItem
                    key={service.id}
                    service={service}
                    isSelected={index === selectedIndex}
                    onSelect={handleSelect}
                    onHover={() => setSelectedIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <PaletteFooter />
        </div>
      </div>
    </>
  );
}
