/**
 * Schema.org JSON-LD utilities for ToolHive
 * Provides validated, type-safe schema generation for all page types
 */

import type { Tool, ToolCategory, ToolCategoryConfig } from "@/types";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

// ─────────────────────────────────────────────
// WebSite Schema
// ─────────────────────────────────────────────

export function createWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ToolHive",
    description: "200+ free AI-powered tools for PDF, image, video, and writing. No signup required.",
    url: "https://toolhive.co.in",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://toolhive.co.in/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "ToolHive",
      url: "https://toolhive.co.in",
      logo: {
        "@type": "ImageObject",
        url: "https://toolhive.co.in/favicon.ico",
      },
    },
  };
}

// ─────────────────────────────────────────────
// SoftwareApplication Schema (Homepage)
// ─────────────────────────────────────────────

export function createSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ToolHive",
    description:
      "200+ free online AI tools including PDF compressor, background remover, AI summarizer, grammar checker, paraphrasing tool, Twitter thread generator, YouTube script generator, and more. No signup required.",
    url: "https://toolhive.co.in",
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "12500",
      bestRating: "5",
      worstRating: "1",
    },
    areaServed: {
      "@type": "Place",
      name: "Worldwide",
    },
    sameAs: [
      "https://twitter.com/toolhive",
      "https://linkedin.com/company/toolhive",
      "https://github.com/toolhive",
    ],
  };
}

// ─────────────────────────────────────────────
// Organization Schema
// ─────────────────────────────────────────────

export function createOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ToolHive",
    url: "https://toolhive.co.in",
    logo: {
      "@type": "ImageObject",
      url: "https://toolhive.co.in/favicon.ico",
    },
    description:
      "ToolHive provides 200+ free AI-powered online tools for PDF, image, video, and writing tasks. No signup required, works instantly in your browser.",
    sameAs: [
      "https://twitter.com/toolhive",
      "https://linkedin.com/company/toolhive",
      "https://github.com/toolhive",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "support@toolhive.app",
    },
  };
}

// ─────────────────────────────────────────────
// WebApplication Schema (Tool Pages)
// ─────────────────────────────────────────────

export function createWebApplicationSchema(tool: Tool) {
  return {
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
}

// ─────────────────────────────────────────────
// BreadcrumbList Schema
// ─────────────────────────────────────────────

export function createBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ─────────────────────────────────────────────
// FAQPage Schema (for tool pages)
// ─────────────────────────────────────────────

export function createFAQSchema(faqItems: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// ─────────────────────────────────────────────
// HowTo Schema (for step-by-step tools)
// ─────────────────────────────────────────────

export interface HowToStep {
  name: string;
  text: string;
}

export function createHowToSchema(tool: Tool, steps: HowToStep[]) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to use ${tool.name}`,
    description: tool.shortDescription,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

// ─────────────────────────────────────────────
// CollectionPage Schema (Category Pages)
// ─────────────────────────────────────────────

export function createCollectionPageSchema(category: ToolCategoryConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.label} — ToolHive`,
    description: category.description,
    url: `https://toolhive.co.in/tools/${category.id}`,
  };
}

// ─────────────────────────────────────────────
// WebPage Schema
// ─────────────────────────────────────────────

export function createWebPageSchema(title: string, description: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description: description,
    url: url,
    isPartOf: {
      "@type": "WebSite",
      name: "ToolHive",
      url: "https://toolhive.co.in",
    },
  };
}

// ─────────────────────────────────────────────
// ResumeBuilder Schema (Special page)
// ─────────────────────────────────────────────

export function createResumeBuilderSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Free Premium Resume Builder",
    description:
      "Build a professional ATS-friendly resume in minutes with our free AI-powered resume builder. Live preview, 3 templates, instant PDF download. No signup required.",
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "8500",
      bestRating: "5",
      worstRating: "1",
    },
  };
}

// ─────────────────────────────────────────────
// Default FAQ items for tool pages
// ─────────────────────────────────────────────

export const DEFAULT_TOOL_FAQ: FAQItem[] = [
  {
    question: "Is this tool completely free?",
    answer:
      "Yes, this tool is 100% free with no account required. You can use it unlimited times without signing up.",
  },
  {
    question: "Are my files stored after processing?",
    answer:
      "No. All uploaded files are automatically deleted from our servers within 1 hour of processing. We never store, sell, or share your data.",
  },
  {
    question: "How secure is my data?",
    answer:
      "All file transfers use TLS 1.3 encryption. Files are processed in isolated sandboxes and immediately discarded. We are GDPR-compliant.",
  },
  {
    question: "Can I use this on mobile?",
    answer:
      "Yes! ToolHive is fully responsive and works on any modern device — phone, tablet, or desktop. All features are touch-friendly.",
  },
  {
    question: "What's the maximum file size?",
    answer:
      "Free users get up to 50 MB per file. For larger files, consider splitting the content or using a file compression tool first.",
  },
];

// ─────────────────────────────────────────────
// Tool-specific FAQ overrides
// ─────────────────────────────────────────────

export const TOOL_FAQ_OVERRIDES: Record<string, FAQItem[]> = {
  "pdf-compress": [
    {
      question: "How much can I compress a PDF?",
      answer:
        "You can reduce PDF file size by up to 90% depending on the content. Text-heavy PDFs compress better than image-heavy ones. Our AI-powered compression maintains optimal quality.",
    },
    {
      question: "Is the compression quality lossless?",
      answer:
        "Our compression is smart — it reduces file size while maintaining the best possible quality. For most use cases, the quality difference is imperceptible.",
    },
    {
      question: "Can I batch compress multiple PDFs?",
      answer:
        "Yes! You can compress up to 20 PDF files at once. Simply drag and drop multiple files, and they'll all be compressed simultaneously.",
    },
  ],
  "image-bg-remove": [
    {
      question: "What image formats are supported?",
      answer:
        "We support JPG, JPEG, PNG, and WebP formats. For best results, use high-resolution images with clear subject boundaries.",
    },
    {
      question: "Can I remove background from multiple images?",
      answer:
        "Yes, you can process up to 5 images at once. Each image will be processed individually and you'll receive transparent PNGs for all of them.",
    },
    {
      question: "Is the background removal accurate for complex images?",
      answer:
        "Our AI-powered background removal works great for product photos, portraits, and most common use cases. For very complex edges, you may see slight improvements with higher quality images.",
    },
  ],
  "ai-summarize": [
    {
      question: "What types of content can I summarize?",
      answer:
        "You can summarize articles, documents, research papers, emails, transcripts, and any text content. Just paste your text and get a concise summary in seconds.",
    },
    {
      question: "Can I summarize PDF files?",
      answer:
        "Yes! You can copy and paste text from PDF files, or use our PDF to Text tool first to extract the content, then summarize it here.",
    },
    {
      question: "How long can the input text be?",
      answer:
        "You can summarize texts up to 50,000 characters. For longer documents, consider splitting them into sections and summarizing each part.",
    },
  ],
  "twitter-thread": [
    {
      question: "What makes a viral Twitter thread?",
      answer:
        "Viral threads typically have a strong hook tweet, clear value proposition, numbered points for easy reading, and an engaging CTA. Our AI generates all these elements automatically.",
    },
    {
      question: "How many tweets are in a thread?",
      answer:
        "Our AI generates threads with 5-10 tweets depending on your topic complexity. You can regenerate or customize the output as needed.",
    },
    {
      question: "Can I choose the tone of my thread?",
      answer:
        "Yes! You can select different tones like professional, casual, educational, or entertaining to match your brand voice.",
    },
  ],
};

// ─────────────────────────────────────────────
// Get FAQ for a specific tool
// ─────────────────────────────────────────────

export function getToolFAQ(toolId: string): FAQItem[] {
  return TOOL_FAQ_OVERRIDES[toolId] || DEFAULT_TOOL_FAQ;
}

// ─────────────────────────────────────────────
// Category labels mapping
// ─────────────────────────────────────────────

export const CATEGORY_LABELS: Record<string, string> = {
  pdf: "PDF Tools",
  image: "Image Tools",
  video: "Video Tools",
  "ai-writing": "AI Writing",
  calculator: "Calculators",
  converter: "Converters",
  generators: "Generators",
  "text-writing": "Text Writing",
  code: "Code Tools",
  health: "Health Tools",
  education: "Education Tools",
  finance: "Finance Tools",
  utilities: "Utilities",
  device: "Device Tools",
  travel: "Travel Tools",
  seo: "SEO Tools",
  productivity: "Productivity Tools",
  entertainment: "Entertainment Tools",
  resume: "Resume Tools",
};