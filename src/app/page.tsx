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
import {
  createWebSiteSchema,
  createSoftwareApplicationSchema,
  createOrganizationSchema,
} from "@/lib/schema-utils";

export const metadata: Metadata = {
  title: "ToolHive — 200+ Free AI Tools for PDF, Image, Video & Writing",
  description:
    "Free AI-powered tools for PDF compression, image editing, video downloading, AI writing, calculators and more. No signup needed. Works in your browser — 100% free. Compress PDF online free no limit, remove background from image free no watermark, grammar checker free no signup, paraphrasing tool free no signup.",
  keywords: [
    "free AI tools",
    "PDF tools",
    "compress PDF online free no limit",
    "compress PDF online free no signup",
    "image editor",
    "remove background from image free no watermark",
    "resize image free",
    "compress image online",
    "video downloader",
    "AI writing",
    "grammar checker free no signup",
    "paraphrasing tool free no signup",
    "twitter thread generator AI free",
    "linkedin post generator AI free",
    "youtube script generator AI free",
    "online calculators",
    "resume builder free",
    "premium resume builder no signup",
    "background remover free no watermark",
    "image generator free",
    "free image generation",
    "online tools no signup",
  ],
  openGraph: {
    title: "ToolHive — 200+ Free AI Tools",
    description:
      "PDF, Image, Video, AI Writing & Calculator tools — all free, no account needed. Works in your browser.",
    siteName: "ToolHive",
    type: "website",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ToolHive - 200+ Free AI Tools" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ToolHive — 200+ Free AI Tools",
    description:
      "PDF, Image, Video, AI Writing & Calculator tools — all free, no account needed.",
  },
  alternates: {
    canonical: "https://toolhive.co.in",
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

// JSON-LD schemas for homepage
const websiteSchema = createWebSiteSchema();
const softwareSchema = createSoftwareApplicationSchema();
const organizationSchema = createOrganizationSchema();

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is ToolHive?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ToolHive is a free online platform offering 200+ AI-powered tools for PDF, image, video, and writing tasks. Founded in 2025, all tools are completely free with no signup required. Users can compress PDFs, remove image backgrounds, generate Twitter threads, check grammar, and more — all instantly in the browser.",
      },
    },
    {
      "@type": "Question",
      name: "How to compress PDF online free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "To compress PDF online free: 1) Go to toolhive.co.in/tools/pdf/compress, 2) Drag and drop your PDF file or click to upload, 3) Wait ~3 seconds for AI-powered compression, 4) Download your compressed PDF instantly. No signup, no watermarks, reduce file size by up to 90%.",
      },
    },
    {
      "@type": "Question",
      name: "How to remove background from image free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "To remove background from image free: 1) Visit toolhive.co.in/tools/image/remove-background, 2) Upload your image (JPG, PNG, WebP up to 10MB), 3) AI automatically removes background in ~5 seconds, 4) Download transparent PNG. No signup, no watermarks, completely free.",
      },
    },
    {
      "@type": "Question",
      name: "Is ToolHive free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, ToolHive is 100% free forever. All 200+ tools work without signup, no usage limits, no watermarks. Built and maintained by Pawan Kumar from Haryana, India.",
      },
    },
    {
      "@type": "Question",
      name: "Is my data safe on ToolHive?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Your data is safe on ToolHive. Files are processed in-memory with TLS 1.3 encryption, never stored on servers, and auto-deleted within 1 hour. We never sell or share your data. Fully GDPR-compliant.",
      },
    },
    {
      "@type": "Question",
      name: "How does free AI image generation work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ToolHive's AI image generator at toolhive.co.in/text-to-image uses NVIDIA FLUX to create stunning images from text descriptions. Simply enter any text prompt — 'a sunset over mountains in anime style' — and get AI-generated images in seconds. Supports photorealistic, anime, oil painting, cinematic, and many more styles. 100% free, no signup needed.",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      {/* WebSite Schema with SearchAction for Google */}
      <Script
        id="ld-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      {/* SoftwareApplication Schema with aggregateRating (4.8 stars, 12500+ reviews) */}
      <Script
        id="ld-software"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      {/* Organization Schema for brand identity */}
      <Script
        id="ld-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      {/* FAQPage Schema for AI Overviews and Featured Snippets */}
      <Script
        id="ld-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
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