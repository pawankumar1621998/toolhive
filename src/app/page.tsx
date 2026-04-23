import type { Metadata } from "next";
import { Suspense } from "react";
import { HeroSection } from "@/components/features/home/HeroSection";
import { CategoryGrid } from "@/components/features/home/CategoryGrid";
import { FeaturedTools } from "@/components/features/home/FeaturedTools";
import { StatsSection } from "@/components/features/home/StatsSection";
import { CtaSection } from "@/components/features/home/CtaSection";
import { RecentTools } from "@/components/features/home/RecentTools";
import { SectionSkeleton } from "@/components/ui/Skeletons";

export const metadata: Metadata = {
  title: "ToolHive — AI-Powered Tools for Everyone",
  description:
    "Free AI-powered tools for PDF, image, video, and writing. No signup required.",
};

/**
 * Homepage — Server Component
 *
 * Section breakdown (top to bottom):
 * 1. HeroSection     — headline, animated search bar, category pills, hero graphic
 * 2. CategoryGrid    — 4–6 category cards with icons and tool counts
 * 3. FeaturedTools   — popular tools grid (cached data)
 * 4. RecentTools     — "Recently used" (client component, reads localStorage)
 * 5. StatsSection    — animated counters: files processed, tools available, users
 * 6. CtaSection      — sign up CTA with gradient background
 */
export default function HomePage() {
  return (
    <>
      {/* Hero is above the fold — no Suspense, render immediately */}
      <HeroSection />

      {/* Category grid is static config — no fetch needed */}
      <CategoryGrid />

      {/* FeaturedTools may fetch — wrap in Suspense for streaming */}
      <Suspense fallback={<SectionSkeleton rows={2} />}>
        <FeaturedTools />
      </Suspense>

      {/* RecentTools is a client component — no server data */}
      <RecentTools />

      {/* Stats may fetch aggregate counts */}
      <Suspense fallback={<SectionSkeleton rows={1} />}>
        <StatsSection />
      </Suspense>

      <CtaSection />
    </>
  );
}
