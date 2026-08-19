import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Production API Endpoint Rewrite to Convex HTTP router
        source: "/v1/:path*",
        destination: "https://pleasant-sparrow-60.convex.site/v1/:path*",
      },
      {
        // Sandbox API Endpoint Rewrite to Convex HTTP router
        source: "/v1/sandbox/:path*",
        destination: "https://pleasant-sparrow-60.convex.site/v1/sandbox/:path*",
      },
    ];
  },
};

export default nextConfig;
