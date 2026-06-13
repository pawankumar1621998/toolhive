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
  const canonicalUrl = `https://toolhive.co.in/tools/${category}/${toolSlug}`;

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
    "morse-code": "Morse Code Translator Free — Encode Decode Text Online",
    "body-fat": "Body Fat Calculator Free — Indian Body Fat Calculator Online",
    "speech-to-text": "Speech to Text Converter Free — Transcribe Audio Online",
    "twitter-thread": "Twitter Thread Generator Free — AI Write Viral Threads",
    "linkedin-post": "LinkedIn Post Generator Free — AI Write Engaging Posts",
    "youtube-script": "YouTube Script Generator Free — AI Write Video Scripts",
    "paraphrase": "Paraphrasing Tool Free — Rewrite Text Without Plagiarism",
    "ocr": "PDF OCR Free — Extract Text from Scanned PDF Online",
    "cover-letter": "Cover Letter Generator Free — AI Write Professional Cover Letters",
    "ats-checker": "ATS Checker Free — Check Resume Score & Pass Screening",
    "note-maker": "AI Notes Generator Free — Create Notes from Any Text",
    "gst": "GST Calculator Free — Calculate GST Amount Online India",
    "trip-distance": "Trip Distance Calculator Free — Calculate Travel Distance Online",
    "smart-resume": "Smart Resume Builder Free — Create ATS-Friendly Resume Online",
    "random-color": "Random Color Generator Free — Generate Random Colors HEX RGB",
    "random-name-generator": "Random Name Generator Free — Pick Random Names Online",
    "trace-route": "Traceroute Online Free — Trace Network Route Instantly",
    "remove-duplicates": "Remove Duplicates Online Free — Delete Duplicate Lines Instantly",
    "salary": "Salary Calculator India Free — Calculate Take Home Pay Online",
    // Next-level keywords from GSC (position < 50, close to page 1)
    "pdf-to-image": "PDF to Image Converter Free — Convert PDF to JPG PNG Online",
    "convert-pdf-to-image": "Convert PDF to Image Free — PDF to Picture Online",
    "pdf-to-img": "PDF to IMG Converter Free — Extract Images from PDF",
    "convert-speech-to-text": "Convert Speech to Text Free — Audio to Text Online",
    "speechtexter": "SpeechTexter Online Free — Speech to Text Converter",
    "online-speech-to-text": "Online Speech to Text Free — AI Transcribe Instantly",
    "notes-maker": "Notes Maker Free Online — AI Note Generator",
    "generate-random-color": "Generate Random Color Free — Color Picker Tool",
    "generate-random-colors": "Generate Random Colors Free — Hex RGB Color Generator",
    "cover-letter-writer": "Cover Letter Writer Free — AI Professional Writer",
    "free-cover-letter-generator": "Free Cover Letter Generator — No Signup Required",
    "free-cover-letter-builder": "Free Cover Letter Builder — PDF Letter Maker",
    "hinglish-transcribe": "Hinglish Transcriber Free — Hindi English Speech to Text",
    "traceroute": "Traceroute Tool Free — Trace Network Path",
    "tracert": "Tracert Tool Free — Network Route Tracer",
    "online-traceroute": "Online Traceroute Free — Web Network Tracer",
    "online-body-fat-calculator": "Online Body Fat Calculator Free — Accurate %",
    "timezone-converter": "Timezone Converter Free — World Time Online",
    "convert-timezone": "Convert Timezone Free — Time Zone Calculator",
    "ai-legal-document": "AI Legal Document Analyzer Free — Contract Review",
    "legal-document-analysis": "Legal Document Analysis Free — AI Tool",
    "spin-wheel": "Spin Wheel Free — Random Picker Wheel",
    "free-spin-wheel": "Free Spin Wheel — Random Name Picker",
    "random-wheel": "Random Wheel Picker Free — Spin the Wheel",
    "travel-distance": "Travel Distance Calculator Free — Distance Between Places",
  };

  // Keyword-rich meta descriptions for better CTR
  const metaDescriptionMap: Record<string, string> = {
    "body-fat": "Calculate your body fat percentage instantly with our free Indian body fat calculator. Uses US Navy method. No signup required.",
    "cover-letter": "Generate professional cover letters in 2 minutes with AI. Free cover letter generator with 50+ templates. Create PDF cover letter now.",
    "note-maker": "Create smart notes from any text with AI. Free note maker tool. Convert articles, documents to organized notes instantly.",
    "random-color": "Generate random colors in HEX, RGB, HSL formats. Free color generator for designers. Copy codes with one click.",
    "trace-route": "Trace any website's network route instantly. Free online traceroute tool. See IP path and hops in real-time.",
    "pdf-to-image": "Convert PDF to JPG PNG images free online. No signup, no watermark. Extract images from PDF instantly.",
    "salary": "Calculate your take-home salary in India. Free salary calculator with tax deductions. Know your in-hand pay.",
    "trip-distance": "Calculate travel distance between two places. Free trip distance calculator for road trips in India.",
    "ats-checker": "Check if your resume passes ATS. Free resume score checker. Get suggestions to pass applicant tracking systems.",
    "speech-to-text": "Transcribe audio to text free online. Speech to text converter supports 50+ languages. No signup required.",
  };

  const titleSuffix = keywordTitleMap[toolSlug] || `${tool.name} — Free Online Tool | ToolHive`;
  const seoTitle = toolSlug in keywordTitleMap
    ? keywordTitleMap[toolSlug]
    : `${tool.name} — Free Online Tool`;

  return {
    title: seoTitle,
    description: metaDescriptionMap[toolSlug] || tool.description,
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
        item: "https://toolhive.co.in",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryName,
        item: `https://toolhive.co.in/tools/${tool.category}`,
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
      {
        "@type": "Question",
        name: `Does ${tool.name} leave watermarks?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "No watermarks ever. Your output is 100% clean and ready to use without any ToolHive branding.",
        },
      },
      {
        "@type": "Question",
        name: `Can I use ${tool.name} on mobile?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, works perfectly on mobile phones and tablets. No app download required — just open in your browser.",
        },
      },
    ],
  };

  // HowTo schema for step-by-step instructions (TinyWow-style)
  const toolCategorySteps: Record<string, string[]> = {
    pdf: [
      "Upload your PDF file by dragging and dropping or clicking the upload area",
      "Configure your preferred settings (compression level, output quality, page range)",
      "Click the process button to apply changes to your PDF",
      "Download your processed PDF file instantly — no signup required",
    ],
    image: [
      "Upload your image by dragging and dropping or clicking to select files",
      "Choose your preferred settings (output format, quality level, dimensions)",
      "Click the process button to apply changes to your image",
      "Download your processed image file instantly — no signup required",
    ],
    calculator: [
      "Enter your input values in the calculator fields provided",
      "Select your preferred units and measurement options if applicable",
      "Click calculate or press enter to get your results instantly",
      "Copy or download your results — no signup required",
    ],
    converter: [
      "Enter your text, URL, or content to convert",
      "Select your preferred output format and settings",
      "Click the convert button to process your request instantly",
      "Copy or download your converted result — no signup required",
    ],
    default: [
      "Enter your text, URL, or upload your file to get started",
      "Configure any optional settings as needed for your task",
      "Click the process or generate button to create your output",
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

  const canonicalUrl = `https://toolhive.co.in/tools/${category}/${toolSlug}`;

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