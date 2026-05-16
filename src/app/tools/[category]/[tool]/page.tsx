import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Script from "next/script";
import { ToolHero } from "@/components/features/tool/ToolHero";
import { ToolWorkspace } from "@/components/features/tool/ToolWorkspace";
import { ThumbnailCreator } from "@/components/features/tool/ThumbnailCreator";
import { ResumeToolWorkspace } from "@/components/features/resume/ResumeToolWorkspace";
import { AIWritingWorkspace } from "@/components/features/ai-writing/AIWritingWorkspace";
import { QRCodeGenerator } from "@/components/features/image/QRCodeGenerator";
import { MemeGeneratorUI } from "@/components/features/image/MemeGeneratorUI";
import { ConverterTextWorkspace } from "@/components/features/converter/ConverterTextWorkspace";
import { CalcWorkspace } from "@/components/features/calculator/CalcWorkspace";
import { ImageToolWorkspace } from "@/components/features/image/ImageToolWorkspace";
import { PDFToolWorkspace } from "@/components/features/pdf-editor/PDFToolWorkspace";
import { TranslatePdfWorkspace } from "@/components/features/tool/TranslatePdfWorkspace";
import GeneratorWorkspace from "@/components/features/generators/GeneratorWorkspace";
import TextWritingWorkspace from "@/components/features/text-writing/TextWritingWorkspace";
import CodeWorkspace from "@/components/features/code/CodeWorkspace";
import HealthWorkspace from "@/components/features/health/HealthWorkspace";
import EducationWorkspace from "@/components/features/education/EducationWorkspace";
import FinanceWorkspace from "@/components/features/finance/FinanceWorkspace";
import UtilitiesWorkspace from "@/components/features/utilities/UtilitiesWorkspace";
import DeviceWorkspace from "@/components/features/device/DeviceWorkspace";
import TravelWorkspace from "@/components/features/travel/TravelWorkspace";
import SEOWorkspace from "@/components/features/seo/SEOWorkspace";
import ProductivityWorkspace from "@/components/features/productivity/ProductivityWorkspace";
import EntertainmentWorkspace from "@/components/features/entertainment/EntertainmentWorkspace";
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

  // Build canonical URL with correct production domain
  const canonicalUrl = `https://toolhive-red.vercel.app/tools/${category}/${toolSlug}`;

  // Build keyword-rich title for SEO (TinyWow-style: descriptive + brand)
  const keywordTitleMap: Record<string, string> = {
    "compress": "Compress PDF Online Free — No Signup, No Limit, No Watermark",
    "merge": "Merge PDF Files Online Free — Combine Multiple PDFs Instantly",
    "split": "Split PDF Online Free — Separate PDF Pages Instantly",
    "rotate": "Rotate PDF Online Free — Fix PDF Orientation Instantly",
    "sign": "Sign PDF Online Free — Add Digital Signature, No Signup",
    "watermark": "Add Watermark to PDF Free — Text & Image Watermark",
    "page-numbers": "Add Page Numbers to PDF Free — Number PDF Pages Instantly",
    "pdf-to-word": "Convert PDF to Word Online Free — No Signup Required",
    "pdf-to-excel": "Convert PDF to Excel Free — Extract Tables Instantly",
    "pdf-to-jpg": "Convert PDF to JPG Free — PDF to Image Online",
    "remove-background": "Remove Image Background Free — AI Powered, No Watermark",
    "resize": "Resize Image Free Online — No Signup, No Watermark",
    "img-compress": "Compress Image Free Online — Reduce Size Without Quality Loss",
    "convert": "Convert Image Format Free — JPG PNG WebP GIF Online",
    "summarize": "AI Summarizer Free — Summarize Text Articles Documents Instantly",
    "grammar-check": "Free Grammar Checker Online — No Signup, No Limit",
    "rewrite": "AI Rewriter Free — Paraphrase Text Improve Clarity Instantly",
    "translate": "AI Translator Free — Translate 100+ Languages Online",
  };

  const titleSuffix = keywordTitleMap[toolSlug] || `${tool.name} — Free Online Tool | ToolHive`;
  const seoTitle = toolSlug in keywordTitleMap
    ? `${keywordTitleMap[toolSlug]} | ToolHive`
    : `${tool.name} — Free Online Tool | ToolHive`;

  return {
    title: seoTitle,
    description: tool.description,
    keywords: [
      tool.name,
      ...tool.tags,
      "free online tool",
      "ToolHive",
      "no signup",
      "free",
      "no watermark",
    ],
    openGraph: {
      title: `${tool.name} — ToolHive`,
      description: tool.shortDescription || tool.description.substring(0, 160),
      type: "website",
      url: canonicalUrl,
      siteName: "ToolHive",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${tool.name} — Free Online Tool by ToolHive`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.name} — ToolHive`,
      description: tool.shortDescription || tool.description.substring(0, 160),
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

// ─────────────────────────────────────────────
// Page structured data (JSON-LD)
// ─────────────────────────────────────────────

function ToolJsonLd({ tool, url }: { tool: NonNullable<ReturnType<typeof getToolBySlug>>; url: string }) {
  const categoryName = TOOL_CATEGORIES.find((c) => c.id === tool.category)?.label || tool.category;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://toolhive-red.vercel.app",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryName,
        item: `https://toolhive-red.vercel.app/tools/${tool.category}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tool.name,
        item: url,
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How to use ${tool.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${tool.name} is completely free to use. Simply upload your file or enter your text, configure any settings if available, and click process. Your result will be ready instantly with no signup required.`,
        },
      },
      {
        "@type": "Question",
        name: `Is ${tool.name} free?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, 100% free with no signup required. No limits on usage, no watermarks on output.",
        },
      },
      {
        "@type": "Question",
        name: `Is my data safe?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. All files are encrypted with TLS 1.3 and automatically deleted after 1 hour. We never store, share, or use your files for AI training.",
        },
      },
      {
        "@type": "Question",
        name: `What file formats are supported?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: tool.acceptedFileTypes?.length
            ? `Supported formats: ${tool.acceptedFileTypes.join(", ").toUpperCase()}. Max file size: ${tool.maxFileSizeMB ? `${tool.maxFileSizeMB}MB` : "varies"} per file.`
            : "Works with any text input. No file upload required.",
        },
      },
    ],
  };

  // HowTo schema for step-by-step instructions (TinyWow-style)
  const toolCategorySteps: Record<string, string[]> = {
    pdf: [
      "Upload your PDF file by dragging and dropping or clicking the upload area",
      "Arrange pages if needed using drag-and-drop reordering",
      "Click the process button to apply changes",
      "Download your processed PDF file instantly — no signup required",
    ],
    image: [
      "Upload your image by dragging and dropping or clicking to select files",
      "Adjust settings if needed (size, format, quality)",
      "Click the process button to apply changes",
      "Download your processed image instantly — no signup required",
    ],
    default: [
      "Enter your text, URL, or upload your file",
      "Configure any optional settings as needed",
      "Click the process button to generate results",
      "Download or copy your result instantly — no signup required",
    ],
  };

  const steps = toolCategorySteps[tool.category] || toolCategorySteps.default;

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to use ${tool.name} — Free Online Tool`,
    description: tool.shortDescription || tool.description.substring(0, 200),
    step: steps.map((text, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text: text,
    })),
  };

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    description: tool.description,
    url: url,
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: tool.usageCount ? {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: String(Math.min(tool.usageCount, 999999)),
      bestRating: "5",
      worstRating: "1",
    } : undefined,
  };

  return (
    <>
      <Script
        id="ld-tool-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Script
        id="ld-tool-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Script
        id="ld-tool-howto"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <Script
        id="ld-tool"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />
    </>
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

  const canonicalUrl = `https://toolhive-red.vercel.app/tools/${category}/${toolSlug}`;

  return (
    <>
      <ToolJsonLd tool={tool} url={canonicalUrl} />

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
            <div className={tool.slug === "builder" ? "py-6 sm:py-8 w-full" : "py-8 sm:py-10 max-w-5xl"}>
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

          ) : tool.category === "generators" ? (
            <div className="py-8 sm:py-10 max-w-4xl">
              <GeneratorWorkspace tool={tool} />
              <ToolInfoPanel tool={tool} />
              <Suspense fallback={<SectionSkeleton rows={1} />}>
                <RelatedTools category={tool.category} currentToolId={tool.id} />
              </Suspense>
            </div>

          ) : tool.category === "text-writing" ? (
            <div className="py-8 sm:py-10 max-w-4xl">
              <TextWritingWorkspace tool={tool} />
              <ToolInfoPanel tool={tool} />
              <Suspense fallback={<SectionSkeleton rows={1} />}>
                <RelatedTools category={tool.category} currentToolId={tool.id} />
              </Suspense>
            </div>

          ) : tool.category === "code" ? (
            <div className="py-8 sm:py-10 max-w-5xl">
              <CodeWorkspace tool={tool} />
              <ToolInfoPanel tool={tool} />
              <Suspense fallback={<SectionSkeleton rows={1} />}>
                <RelatedTools category={tool.category} currentToolId={tool.id} />
              </Suspense>
            </div>

          ) : tool.category === "health" ? (
            <div className="py-8 sm:py-10 max-w-4xl">
              <HealthWorkspace tool={tool} />
              <ToolInfoPanel tool={tool} />
              <Suspense fallback={<SectionSkeleton rows={1} />}>
                <RelatedTools category={tool.category} currentToolId={tool.id} />
              </Suspense>
            </div>

          ) : tool.category === "education" ? (
            <div className="py-8 sm:py-10 max-w-5xl">
              <EducationWorkspace tool={tool} />
              <ToolInfoPanel tool={tool} />
              <Suspense fallback={<SectionSkeleton rows={1} />}>
                <RelatedTools category={tool.category} currentToolId={tool.id} />
              </Suspense>
            </div>

          ) : tool.category === "finance" ? (
            <div className="py-8 sm:py-10 max-w-4xl">
              <FinanceWorkspace tool={tool} />
              <ToolInfoPanel tool={tool} />
              <Suspense fallback={<SectionSkeleton rows={1} />}>
                <RelatedTools category={tool.category} currentToolId={tool.id} />
              </Suspense>
            </div>

          ) : tool.category === "utilities" ? (
            <div className="py-8 sm:py-10 max-w-4xl">
              <UtilitiesWorkspace tool={tool} />
              <ToolInfoPanel tool={tool} />
              <Suspense fallback={<SectionSkeleton rows={1} />}>
                <RelatedTools category={tool.category} currentToolId={tool.id} />
              </Suspense>
            </div>

          ) : tool.category === "device" ? (
            <div className="py-8 sm:py-10 max-w-4xl">
              <DeviceWorkspace tool={tool} />
              <ToolInfoPanel tool={tool} />
              <Suspense fallback={<SectionSkeleton rows={1} />}>
                <RelatedTools category={tool.category} currentToolId={tool.id} />
              </Suspense>
            </div>

          ) : tool.category === "travel" ? (
            <div className="py-8 sm:py-10 max-w-4xl">
              <TravelWorkspace tool={tool} />
              <ToolInfoPanel tool={tool} />
              <Suspense fallback={<SectionSkeleton rows={1} />}>
                <RelatedTools category={tool.category} currentToolId={tool.id} />
              </Suspense>
            </div>

          ) : tool.category === "seo" ? (
            <div className="py-8 sm:py-10 max-w-5xl">
              <SEOWorkspace tool={tool} />
              <ToolInfoPanel tool={tool} />
              <Suspense fallback={<SectionSkeleton rows={1} />}>
                <RelatedTools category={tool.category} currentToolId={tool.id} />
              </Suspense>
            </div>

          ) : tool.category === "productivity" ? (
            <div className="py-8 sm:py-10 max-w-5xl">
              <ProductivityWorkspace tool={tool} />
              <ToolInfoPanel tool={tool} />
              <Suspense fallback={<SectionSkeleton rows={1} />}>
                <RelatedTools category={tool.category} currentToolId={tool.id} />
              </Suspense>
            </div>

          ) : tool.category === "entertainment" ? (
            <div className="py-8 sm:py-10 max-w-5xl">
              <EntertainmentWorkspace tool={tool} />
              <ToolInfoPanel tool={tool} />
              <Suspense fallback={<SectionSkeleton rows={1} />}>
                <RelatedTools category={tool.category} currentToolId={tool.id} />
              </Suspense>
            </div>

          ) : tool.category === "pdf" ? (
            <div className="py-6 sm:py-8 max-w-2xl">
              <PDFToolWorkspace tool={tool} />
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