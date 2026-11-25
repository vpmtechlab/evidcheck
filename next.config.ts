import type { NextConfig } from "next";

// Convex deployment (self-hosted). Client sync API + HTTP actions (REST API).
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? "";
const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? "";
const isDev = process.env.NODE_ENV !== "production";

function wsOrigin(url: string): string {
  return url ? url.replace(/^http/, "ws") : "";
}

// Next.js injects inline bootstrap scripts, so script-src keeps
// 'unsafe-inline' until nonces are wired in; everything else is locked down.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://cdn.tailwindcss.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${convexUrl} ${wsOrigin(convexUrl)} ${convexSiteUrl}`.trim(),
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async rewrites() {
    if (!convexSiteUrl) return [];
    return [
      {
        // Production + sandbox REST API → Convex HTTP router (convex/http.ts).
        // /v1/sandbox/* is covered by the same pattern.
        source: "/v1/:path*",
        destination: `${convexSiteUrl}/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
