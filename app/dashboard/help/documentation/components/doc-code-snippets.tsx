"use client";

import React, { useState } from "react";
import { Terminal, Code2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { servicePresets, ServicePreset } from "./doc-presets";
import { buildSnippet } from "./snippet-templates";

const languages = [
  { id: "curl", name: "cURL", icon: Terminal },
  { id: "node", name: "Node.js", icon: Code2 },
  { id: "python", name: "Python", icon: Code2 },
  { id: "go", name: "GoLang", icon: Code2 },
  { id: "php", name: "PHP", icon: Code2 },
];

interface DocCodeSnippetsProps {
  selectedPreset?: ServicePreset;
  apiKey: string;
}

export function DocCodeSnippets({
  selectedPreset: propPreset,
  apiKey,
}: DocCodeSnippetsProps) {
  const [activeLang, setActiveLang] = useState("curl");
  const [selectedPresetId, setSelectedPresetId] = useState(
    propPreset?.id || servicePresets[0].id,
  );
  const [copiedCode, setCopiedCode] = useState(false);

  const preset =
    servicePresets.find((p) => p.id === selectedPresetId) || servicePresets[0];
  const codeSnippet = buildSnippet(activeLang, {
    fullUrl: `https://api.evidcheck.com${preset.endpoint}`,
    method: preset.method,
    payload: preset.payload,
    apiKey: apiKey || "evid_live_sk_YOUR_KEY_HERE",
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1500);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden shadow-md">
      <div className="px-4 py-3 bg-gray-950 border-b border-gray-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Select
            value={selectedPresetId}
            onValueChange={(value) =>
              setSelectedPresetId(value ?? servicePresets[0].id)
            }
          >
            <SelectTrigger
              size="sm"
              className="w-auto min-w-52 border-gray-700 bg-gray-900 text-xs font-mono text-gray-200 hover:bg-gray-800 focus-visible:border-brand focus-visible:ring-brand/30"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-gray-700 bg-gray-900 text-gray-200 w-full ">
              {servicePresets.map((p) => (
                <SelectItem
                  key={p.id}
                  value={p.id}
                  className="font-mono text-xs text-white"
                >
                  {p.method} {p.endpoint} ({p.label})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
            {languages.map((lang) => {
              const Icon = lang.icon;
              const isActive = activeLang === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => setActiveLang(lang.id)}
                  className={`
                    px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-colors whitespace-nowrap
                    ${isActive ? "bg-brand text-white shadow-xs" : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/60"}
                  `}
                >
                  <Icon size={12} />
                  <span>{lang.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800 px-2.5 rounded-md gap-1"
        >
          {copiedCode ? (
            <Check size={13} className="text-green-400" />
          ) : (
            <Copy size={13} />
          )}
          <span>{copiedCode ? "Copied" : "Copy Code"}</span>
        </Button>
      </div>

      <pre className="p-4 overflow-x-auto custom-scrollbar font-mono text-xs leading-relaxed max-h-[320px] text-gray-200 bg-gray-900">
        <code>{codeSnippet}</code>
      </pre>
    </div>
  );
}
