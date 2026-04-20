import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ToolHero } from "@/components/features/tool/ToolHero";
import { ToolWorkspace } from "@/components/features/tool/ToolWorkspace";
import { ThumbnailCreator } from "@/components/features/tool/ThumbnailCreator";
import { ResumeToolWorkspace } from "@/components/features/resume/ResumeToolWorkspace";
import { AIWritingWorkspace } from "@/components/features/ai-writing/AIWritingWorkspace";
import { QRCodeGenerator } from "@/components/features/image/QRCodeGenerator";
import { MemeGeneratorUI } from "@/components/features/image/MemeGeneratorUI";
import { VideoDownloader } from "@/components/features/video/VideoDownloader";
import { ConverterTextWorkspace } from "@/components/features/converter/ConverterTextWorkspace";
import { CalcWorkspace } from "@/components/features/calculator/CalcWorkspace";
import { ImageToolWorkspace } from "@/components/features/image/ImageToolWorkspace";
import { TranslatePdfWorkspace } from "@/components/features/tool/TranslatePdfWorkspace";
import { RelatedTools } from "@/components/features/tool/RelatedTools";
import { ToolInfoPanel } from "@/components/features/tool/ToolInfoPanel";
import { ToolPageSidebar } from "@/components/features/tool/ToolPageSidebar";
import { SectionSkeleton } from "@/components/ui/Skeletons";
import { getToolBySlug, TOOL_CATEGORIES, TOOLS } from "@/config/tools";

// ─────────────────────────────────────────────
// Static params — pre-render all known tool pages
// ─────────────────────────────────────────────

export function generateStaticParams() {
  return TOOLS.map((tool) => ({
    category: tool.category,
    tool: tool.slug,
  }));
}

// ─────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; tool: string }>;
}): Promise<Metadata> {
  const { tool: toolSlug, category } = await params;
  const tool = getToolBySlug(toolSlug, category);
  if (!tool) return {};

  const categoryConfig = TOOL_CATEGORIES.find((c) => c.id === category);

  return {
    title: `${tool.name} — Free Online Tool | ToolHive`,
    description: tool.description,
    keywords: [tool.name, ...tool.tags, "free online tool", "ToolHive"],
    openGraph: {
      title: `${tool.name} — ToolHive`,
      description: tool.shortDescription,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${tool.name} — ToolHive`,
      description: tool.shortDescription,
    },
    alternates: {
      canonical: `/tools/${category}/${toolSlug}`,
    },
  };
}

// ─────────────────────────────────────────────
// Page structured data (JSON-LD)
// ─────────────────────────────────────────────

function ToolJsonLd({ tool }: { tool: NonNullable<ReturnType<typeof getToolBySlug>> }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    description: tool.description,
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

/**
 * Individual Tool Page
 *
 * Layout (top to bottom):
 *   1. ToolHero        — breadcrumb, icon, name, badges, quick stats
 *   2. ToolWorkspace   — drag-and-drop upload, file list, process button,
 *                        results panel (all interactive, client component)
 *   3. ToolInfoPanel   — how-it-works steps, supported formats, FAQ, security note
 *   4. RelatedTools    — "More tools you might like" (cached server component)
 *
 * Server/client boundary:
 * - ToolHero, ToolInfoPanel, RelatedTools are Server Components
 * - ToolWorkspace is a Client Component (reads/writes Zustand toolStore)
 *
 * Streaming: RelatedTools is wrapped in <Suspense> so it can stream in
 * independently without blocking the rest of the page.
 */
export default async function ToolPage({
  params,
}: {
  params: Promise<{ category: string; tool: string }>;
}) {
  const { tool: toolSlug, category } = await params;
  const tool = getToolBySlug(toolSlug, category);
  if (!tool) notFound();

  return (
    <>
      <ToolJsonLd tool={tool} />

      <div className="min-h-screen bg-background flex">
        {/* ── Left sidebar — desktop only (lg+) ───────────── */}
        <aside className="hidden lg:block w-60 shrink-0" aria-label="Category navigation">
          <div className="sticky top-0 h-screen overflow-y-auto border-r border-border bg-card">
            <ToolPageSidebar currentCategory={tool.category} currentSlug={tool.slug} />
          </div>
        </aside>

        {/* ── Main content column ──────────────────────────── */}
        <main className="flex-1 min-w-0 px-6 py-6">
          {/* Mobile category nav — visible below lg only */}
          <div className="lg:hidden pb-3">
            <ToolPageSidebar currentCategory={tool.category} currentSlug={tool.slug} />
          </div>

          {/* Hero banner */}
          <ToolHero tool={tool} />

          {/* Route to the right workspace based on tool type */}
          {tool.slug === "thumbnail-creator" ? (
            <ThumbnailCreator />
          ) : tool.category === "resume" ? (
            <div className="py-8 sm:py-10 max-w-5xl">
              <ResumeToolWorkspace tool={tool} />
              <ToolInfoPanel tool={tool} />
              <Suspense fallback={<SectionSkeleton rows={1} />}>
                <RelatedTools category={tool.category} currentToolId={tool.id} />
              </Suspense>
            </div>
          ) : tool.category === "ai-writing" ? (
            <div className="py-8 sm:py-10 max-w-5xl">
              <AIWritingWorkspace tool={tool} />
              <ToolInfoPanel tool={tool} />
              <Suspense fallback={<SectionSkeleton rows={1} />}>
                <RelatedTools category={tool.category} currentToolId={tool.id} />
              </Suspense>
            </div>
          ) : tool.slug === "qr-code" ? (
            <div className="py-8 sm:py-10 max-w-5xl">
              <QRCodeGenerator tool={tool} />
              <ToolInfoPanel tool={tool} />
              <Suspense fallback={<SectionSkeleton rows={1} />}>
                <RelatedTools category={tool.category} currentToolId={tool.id} />
              </Suspense>
            </div>
          ) : tool.slug === "meme" ? (
            <div className="py-8 sm:py-10 max-w-5xl">
              <MemeGeneratorUI tool={tool} />
              <ToolInfoPanel tool={tool} />
              <Suspense fallback={<SectionSkeleton rows={1} />}>
                <RelatedTools category={tool.category} currentToolId={tool.id} />
              </Suspense>
            </div>
          ) : tool.slug === "downloader" ? (
            <div className="py-8 sm:py-10 max-w-4xl">
              <VideoDownloader tool={tool} />
              <ToolInfoPanel tool={tool} />
              <Suspense fallback={<SectionSkeleton rows={1} />}>
                <RelatedTools category={tool.category} currentToolId={tool.id} />
              </Suspense>
            </div>
          ) : tool.category === "converter" ? (
            <div className="py-8 sm:py-10 max-w-5xl">
              <ConverterTextWorkspace tool={tool} />
              <ToolInfoPanel tool={tool} />
              <Suspense fallback={<SectionSkeleton rows={1} />}>
                <RelatedTools category={tool.category} currentToolId={tool.id} />
              </Suspense>
            </div>
          ) : tool.category === "calculator" ? (
            <div className="py-8 sm:py-10 max-w-4xl">
              <CalcWorkspace tool={tool} />
              <ToolInfoPanel tool={tool} />
              <Suspense fallback={<SectionSkeleton rows={1} />}>
                <RelatedTools category={tool.category} currentToolId={tool.id} />
              </Suspense>
            </div>
          ) : tool.slug === "translate-pdf" ? (
            <div className="py-6 sm:py-8 max-w-3xl">
              <TranslatePdfWorkspace />
              <ToolInfoPanel tool={tool} />
              <Suspense fallback={<SectionSkeleton rows={1} />}>
                <RelatedTools category={tool.category} currentToolId={tool.id} />
              </Suspense>
            </div>

          ) : tool.category === "image" ? (
            <div className="py-6 sm:py-8 max-w-2xl">
              <ImageToolWorkspace tool={tool} />
              <ToolInfoPanel tool={tool} />
              <Suspense fallback={<SectionSkeleton rows={1} />}>
                <RelatedTools category={tool.category} currentToolId={tool.id} />
              </Suspense>
            </div>

          ) : (
            <div className="py-8 sm:py-10 max-w-4xl">
              <ToolWorkspace tool={tool} />
              <ToolInfoPanel tool={tool} />
              <Suspense fallback={<SectionSkeleton rows={1} />}>
                <RelatedTools category={tool.category} currentToolId={tool.id} />
              </Suspense>
            </div>
          )}
        </main>

      </div>
    </>
  );
}
