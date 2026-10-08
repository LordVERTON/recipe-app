import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const localSupabase = process.env.NODE_ENV === "development"
  && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/.test(supabaseUrl);

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["172.20.10.3", "192.168.1.5"],
  // The browser uses the Next.js origin, including when opened from a phone.
  // Only local development can expose this proxy; Cloud URLs stay direct.
  env: {
    NEXT_PUBLIC_SUPABASE_LOCAL_PROXY: localSupabase ? "true" : "false",
  },
  async rewrites() {
    return localSupabase ? [{
      source: "/__supabase/:path*",
      destination: `${supabaseUrl.replace(/\/$/, "")}/:path*`,
    }] : [];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Prevent Turbopack from inferring the wrong workspace root
  // (duplicate lockfiles / parent folders).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
