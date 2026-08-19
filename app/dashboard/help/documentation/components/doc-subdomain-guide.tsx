"use client";

import React, { useState } from "react";
import { Globe, Server, Check, Copy, ExternalLink, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DocSubdomainGuide() {
	const [copiedCname, setCopiedCname] = useState(false);
	const [copiedProxy, setCopiedProxy] = useState(false);

	const cnameRecord = "api.evidcheck.com CNAME -> pleasant-sparrow-60.convex.site";

	const nextConfigRewriteSnippet = `// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Proxies requests from your custom API subdomain (v1/*) to the Convex HTTP backend
        source: "/v1/:path*",
        destination: "https://pleasant-sparrow-60.convex.site/v1/:path*",
      },
    ];
  },
};

export default nextConfig;`;

	const handleCopy = (text: string, type: "cname" | "proxy") => {
		navigator.clipboard.writeText(text);
		if (type === "cname") {
			setCopiedCname(true);
			setTimeout(() => setCopiedCname(false), 1500);
		} else {
			setCopiedProxy(true);
			setTimeout(() => setCopiedProxy(false), 1500);
		}
	};

	return (
		<div className="space-y-8">
			{/* Subdomain Overview */}
			<div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 shadow-2xs">
				<div className="flex items-center gap-2">
					<Globe size={18} className="text-[#188015]" />
					<h2 className="text-base font-bold text-gray-900 tracking-tight">
						Custom API Subdomain Setup (<code className="font-mono text-[#188015]">api.evidcheck.com/v1</code>)
					</h2>
				</div>
				<p className="text-xs text-gray-600 leading-relaxed">
					To expose a dedicated, branded API endpoint on your custom subdomain (e.g. <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-900 font-mono font-bold">api.evidcheck.com/v1/verifications</code>), follow the 3-step integration procedure below.
				</p>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
					<div className="p-4 bg-gray-50 border border-gray-200 rounded-md space-y-1.5">
						<span className="text-[10px] font-bold text-[#188015] uppercase tracking-wider font-mono">Step 1</span>
						<h4 className="text-xs font-bold text-gray-900">DNS CNAME Record</h4>
						<p className="text-[11px] text-gray-500">Point your subdomain <code className="text-gray-800 font-mono">api.evidcheck.com</code> to your deployment host.</p>
					</div>

					<div className="p-4 bg-gray-50 border border-gray-200 rounded-md space-y-1.5">
						<span className="text-[10px] font-bold text-[#188015] uppercase tracking-wider font-mono">Step 2</span>
						<h4 className="text-xs font-bold text-gray-900">Next.js Rewrite Proxy</h4>
						<p className="text-[11px] text-gray-500">Proxy incoming <code className="text-gray-800 font-mono">/v1/*</code> routes to the Convex HTTP engine.</p>
					</div>

					<div className="p-4 bg-gray-50 border border-gray-200 rounded-md space-y-1.5">
						<span className="text-[10px] font-bold text-[#188015] uppercase tracking-wider font-mono">Step 3</span>
						<h4 className="text-xs font-bold text-gray-900">TLS/SSL Certificate</h4>
						<p className="text-[11px] text-gray-500">Automatic SSL provisioned via Cloudflare or Vercel Edge Network.</p>
					</div>
				</div>
			</div>

			{/* DNS Config */}
			<div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 shadow-2xs">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-bold text-gray-900 tracking-tight flex items-center gap-2">
						<Server size={16} className="text-gray-500" />
						DNS Configuration (Cloudflare / Route53 / GoDaddy)
					</h3>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => handleCopy(cnameRecord, "cname")}
						className="h-7 text-xs text-[#188015] hover:bg-green-50 font-semibold gap-1"
					>
						{copiedCname ? <Check size={12} /> : <Copy size={12} />}
						<span>{copiedCname ? "Copied" : "Copy CNAME"}</span>
					</Button>
				</div>

				<div className="border border-gray-200 rounded-md overflow-hidden text-xs">
					<table className="w-full text-left border-collapse font-mono text-[11px]">
						<thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold font-sans">
							<tr>
								<th className="p-2.5 border-r border-gray-200">Type</th>
								<th className="p-2.5 border-r border-gray-200">Name / Host</th>
								<th className="p-2.5 border-r border-gray-200">Target / Destination</th>
								<th className="p-2.5">Proxy Status</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td className="p-2.5 font-bold text-blue-700 border-r border-gray-200">CNAME</td>
								<td className="p-2.5 font-bold text-gray-900 border-r border-gray-200">api</td>
								<td className="p-2.5 text-gray-700 border-r border-gray-200">pleasant-sparrow-60.convex.site</td>
								<td className="p-2.5 text-green-700 font-bold font-sans flex items-center gap-1">
									<Check size={12} /> Active / Proxied
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			{/* Reverse Proxy Code */}
			<div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden shadow-md">
				<div className="px-4 py-3 bg-gray-950 border-b border-gray-800 flex items-center justify-between">
					<span className="text-xs font-bold text-gray-300 font-mono">
						next.config.ts Proxy Rewrites
					</span>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => handleCopy(nextConfigRewriteSnippet, "proxy")}
						className="h-7 text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800 px-2.5 rounded-md gap-1"
					>
						{copiedProxy ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
						<span>{copiedProxy ? "Copied" : "Copy Snippet"}</span>
					</Button>
				</div>

				<pre className="p-4 overflow-x-auto custom-scrollbar font-mono text-xs leading-relaxed max-h-[320px] text-gray-200 bg-gray-900">
					<code>{nextConfigRewriteSnippet}</code>
				</pre>
			</div>
		</div>
	);
}
