import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,

  serverExternalPackages: ["sharp", "pdf-parse", "docx", "exceljs"],

  experimental: {
    instantNavigationDevToolsToggle: true,
  },

  /**
   * Images: allow external avatar URLs (extend as needed).
   */
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
