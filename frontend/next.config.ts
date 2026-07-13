import type { NextConfig } from "next";

// Backend origin the dev/prod server proxies to. Server-only (never exposed to
// the browser): the client always calls same-origin `/api/*`, which Next
// rewrites to the NestJS backend. This keeps auth cookies first-party
// (SameSite=Lax works everywhere) and removes the need for CORS.
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
