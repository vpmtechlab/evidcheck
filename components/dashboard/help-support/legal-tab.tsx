"use client";

import React from "react";
import { Shield, FileCheck } from "lucide-react";

export function LegalTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Legal & Privacy</h2>
        <p className="text-sm text-gray-500">Review our terms of service and privacy usage.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Shield size={20} className="text-gray-600" />
            </div>
            <h3 className="font-bold text-gray-900">Privacy Policy</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            We are committed to protecting your data. Our privacy policy outlines how we collect, use, and safeguard your personal information in compliance with GDPR and other regulations.
          </p>
          <a href="#" className="text-sm font-medium text-secondary hover:underline">
            Read full policy
          </a>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FileCheck size={20} className="text-gray-600" />
            </div>
            <h3 className="font-bold text-gray-900">Terms of Service</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            The terms and conditions governing your use of the EvidCheck platform. Please review these to understand your rights and responsibilities.
          </p>
          <a href="#" className="text-sm font-medium text-secondary hover:underline">
            Read terms of service
          </a>
        </div>
      </div>
    </div>
  );
}
