import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,

  serverExternalPackages: ["sharp", "pdf-parse", "docx", "exceljs", "@distube/ytdl-core", "pdfjs-dist"],

  experimental: {
    instantNavigationDevToolsToggle: true,
  },

  webpack: (config, { isServer }) => {
    // Handle pdfjs-dist for client-side only
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
      };
    }
    return config;
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
