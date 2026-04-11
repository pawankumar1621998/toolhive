import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * cacheComponents: enables the `use cache` directive on Server Components.
   * Data fetching is uncached by default; add `use cache` to opt specific
   * components/functions into caching.
   *
   * Also enables React Activity-based navigation state preservation.
   */
  cacheComponents: true,

  experimental: {
    /**
     * Show instant navigation DevTools toggle in dev mode.
     * Lets agents verify client-side nav shells are correct.
     */
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
