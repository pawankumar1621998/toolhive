import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { HeroSection } from "@/components/features/home/HeroSection";
import { CategoryGrid } from "@/components/features/home/CategoryGrid";
import { FeaturedTools } from "@/components/features/home/FeaturedTools";
import { AIAssistantsSection } from "@/components/features/home/AIAssistantsSection";
import { QuickToolsSection } from "@/components/features/home/QuickToolsSection";
import { StatsSection } from "@/components/features/home/StatsSection";
import { CtaSection } from "@/components/features/home/CtaSection";
import { RecentTools } from "@/components/features/home/RecentTools";
import { SectionSkeleton } from "@/components/ui/Skeletons";

export const metadata: Metadata = {
  title: "ToolHive — 200+ Free AI Tools for PDF, Image, Video & Writing",
  description:
    "Free AI-powered tools for PDF compression, image editing, video downloading, AI writing, calculators and more. No signup needed. Works in your browser — 100% free.",
  keywords: [
    "free AI tools", "PDF tools", "image editor", "video downloader",
    "AI writing", "online calculators", "background remover", "PDF compressor",
    "image converter", "resume builder",
  ],
  openGraph: {
    title: "ToolHive — 200+ Free AI Tools",
    description:
      "PDF, Image, Video, AI Writing & Calculator tools — all free, no account needed. Works in your browser.",
    siteName: "ToolHive",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ToolHive — 200+ Free AI Tools",
    description:
      "PDF, Image, Video, AI Writing & Calculator tools — all free, no account needed.",
  },
  alternates: {
    canonical: "/",
  },
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
const LD_JSON = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ToolHive",
  description: "200+ free AI-powered tools for PDF, image, video, and writing",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://toolhive.vercel.app/search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function HomePage() {
  return (
    <>
      <Script
        id="ld-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(LD_JSON) }}
      />

      {/* Hero is above the fold — no Suspense, render immediately */}
      <HeroSection />

      {/* Category grid is static config — no fetch needed */}
      <CategoryGrid />

      {/* FeaturedTools may fetch — wrap in Suspense for streaming */}
      <Suspense fallback={<SectionSkeleton rows={2} />}>
        <FeaturedTools />
      </Suspense>

      {/* AI Assistants — tools from navbar "More" dropdown */}
      <AIAssistantsSection />

      {/* Quick Tools — utilities from navbar "More" dropdown */}
      <QuickToolsSection />

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
