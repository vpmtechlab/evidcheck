"use client";

import React from "react";
import { Book, FileText, Code, ExternalLink } from "lucide-react";
import Link from "next/link";

export function DocumentationTab() {
  const docs = [
    {
      title: "Getting Started Guide",
      description: "Learn the basics of setting up your account and verifying your first entity.",
      icon: Book,
      color: "bg-blue-50 text-blue-600",
      href: "/dashboard/help/getting-started",
    },
    {
      title: "API Reference",
      description: "Detailed documentation for integrating our verification API into your application.",
      icon: Code,
      color: "bg-[#023e4a] text-white",
      href: "/dashboard/help/documentation",
    },
    {
      title: "Verification Standards",
      description: "Understand the compliance standards and document requirements for different regions.",
      icon: FileText,
      color: "bg-orange-50 text-orange-600",
      href: "/dashboard/help/standards",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Documentation Center</h2>
        <p className="text-sm text-gray-500">Guides and resources to help you integrate EvidCheck into your workflow.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {docs.map((doc, index) => {
          const Icon = doc.icon;
          return (
            <Link
              key={index}
              href={doc.href}
              className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full hover:border-[#023e4a]/20"
            >
              <div
                className={`w-10 h-10 ${doc.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm`}
              >
                <Icon size={20} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                {doc.title}
                <ExternalLink
                  size={14}
                  className="text-gray-300 group-hover:text-[#023e4a] opacity-0 group-hover:opacity-100 transition-all font-bold"
                />
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">{doc.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
