import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  devIndicators: false,
  compress: true,

  serverExternalPackages: ["sharp", "pdf-parse", "docx", "exceljs", "@distube/ytdl-core", "pdfjs-dist"],

  experimental: {
    instantNavigationDevToolsToggle: true,
  },

  turbopack: {},

  /**
   * Images: allow external avatar URLs (extend as needed).
   */
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  /**
   * Headers for performance and security
   */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
        ],
      },
      {
        // Cache static assets aggressively
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Cache images
        source: "/(.*)\\.(jpg|jpeg|png|webp|avif|svg|ico)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, s-maxage=31536000" },
        ],
      },
    ];
  },

  /**
   * Redirects for SEO — keyword-friendly URLs redirect to actual tool pages
   */
  async redirects() {
    return [
      // PDF tools
      { source: "/compress-pdf", destination: "/tools/pdf/compress", permanent: true },
      { source: "/pdf-summarizer", destination: "/tools/ai-writing/summarize", permanent: true },
      { source: "/pdf-compress", destination: "/tools/pdf/compress", permanent: true },
      { source: "/merge-pdf", destination: "/tools/pdf/merge", permanent: true },
      { source: "/split-pdf", destination: "/tools/pdf/split", permanent: true },

      // Image tools
      { source: "/remove-background", destination: "/tools/image/remove-background", permanent: true },
      { source: "/image-resize", destination: "/tools/image/resize", permanent: true },
      { source: "/background-remover", destination: "/tools/image/remove-background", permanent: true },
      { source: "/image-generator", destination: "/tools/image/image-generator", permanent: true },

      // AI Writing tools
      { source: "/twitter-thread-generator", destination: "/tools/ai-writing/twitter-thread-generator", permanent: true },
      { source: "/linkedin-post-generator", destination: "/tools/ai-writing/linkedin-post-generator", permanent: true },
      { source: "/youtube-script-generator", destination: "/tools/ai-writing/youtube-script-generator", permanent: true },
      { source: "/grammar-checker", destination: "/tools/ai-writing/grammar-check", permanent: true },
      { source: "/paraphrasing-tool", destination: "/tools/ai-writing/paraphrase", permanent: true },

      // Resume
      { source: "/resume-builder", destination: "/tools/resume/builder", permanent: true },
      { source: "/free-resume", destination: "/tools/resume/builder", permanent: true },
      { source: "/premium-resume", destination: "/tools/resume/builder", permanent: true },
    ];
  },
};

export default nextConfig;