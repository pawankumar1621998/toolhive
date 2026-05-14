"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle, Search, ArrowRight, FileText, Pen, Image } from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";

type Category = "pdf" | "ai-writing" | "image";

interface FAQItem {
  question: string;
  answer: string;
  keywords?: string[];
}

interface CategoryFAQ {
  title: string;
  description: string;
  icon: React.ReactNode;
  faqs: FAQItem[];
  relatedTools: { name: string; href: string }[];
  featuredSnippet?: string;
}

const FAQ_DATA: Record<Category, CategoryFAQ> = {
  pdf: {
    title: "PDF Tools FAQ",
    description: "Everything you need to know about free PDF tools: compression, merging, splitting, converting, and security. No signup, no watermarks, unlimited use.",
    icon: <FileText className="h-6 w-6" />,
    relatedTools: [
      { name: "Compress PDF", href: "/tools/pdf/compress" },
      { name: "Merge PDF", href: "/tools/pdf/merge" },
      { name: "Split PDF", href: "/tools/pdf/split" },
      { name: "PDF to Word", href: "/tools/pdf/pdf-to-word" },
      { name: "Sign PDF", href: "/tools/pdf/sign" },
    ],
    featuredSnippet: `Yes, ToolHive's PDF compressor is completely free with no signup required. You can compress unlimited PDFs with no watermarks, no file size limits beyond 2GB per file, and no daily usage caps. Unlike other tools that limit free usage or add watermarks, ToolHive offers full-featured PDF compression at no cost.`,
    faqs: [
      {
        question: "Is the PDF compressor truly free with no signup?",
        answer: "Yes, ToolHive's PDF compressor is 100% free with no signup required. You can compress unlimited PDFs with no watermarks, no file size limits (up to 2GB per file), and no daily usage caps. Unlike competitors that limit free use or require accounts, ToolHive offers complete free access.",
        keywords: ["compress PDF online free no signup", "free PDF compressor no limit"],
      },
      {
        question: "Will compressed PDFs have watermarks?",
        answer: "No, ToolHive never adds watermarks to compressed PDFs. Your output files are 100% clean and professional. Some competitors add watermarks to free-tier compressions, but ToolHive delivers watermark-free results every time.",
        keywords: ["compress PDF no watermark", "PDF compressor watermark free"],
      },
      {
        question: "How much can I compress a PDF?",
        answer: "ToolHive can reduce PDF file sizes by up to 90% using intelligent compression that preserves quality. The actual reduction depends on your PDF's content — documents with many images typically see the highest compression ratios, while text-heavy documents may compress less dramatically.",
        keywords: ["compress PDF reduce size percentage", "PDF compression ratio"],
      },
      {
        question: "Is my PDF data secure?",
        answer: "Yes, security is a top priority. All file processing happens in your browser — files are never uploaded to servers unnecessarily. When processing does occur server-side, files are automatically deleted immediately after processing. No data is stored, tracked, or shared.",
        keywords: ["PDF security privacy", "are PDF tools safe"],
      },
      {
        question: "What's the maximum PDF file size?",
        answer: "ToolHive allows PDFs up to 2GB in size, which is significantly higher than most competitors (typically 50-100MB). This makes ToolHive ideal for compressing large business documents, reports, and presentations.",
        keywords: ["PDF file size limit", "compress large PDF"],
      },
      {
        question: "Can I compress multiple PDFs at once?",
        answer: "Yes, ToolHive supports batch compression of up to 20 PDF files simultaneously. This saves time when you need to compress multiple documents. The processing happens in parallel for faster results.",
        keywords: ["batch compress PDF", "compress multiple PDFs at once"],
      },
      {
        question: "Does compression affect PDF quality?",
        answer: "No, ToolHive uses smart compression that preserves text clarity and image quality. You won't notice any difference in readability or visual quality after compression. The algorithm removes redundant data without compromising the document's integrity.",
        keywords: ["PDF compression quality loss", "compress PDF without losing quality"],
      },
      {
        question: "Do I need to install anything?",
        answer: "No, all ToolHive PDF tools work entirely in your browser. There's nothing to install, no plugins needed, and no software to update. Just open the tool, upload your PDF, and get results instantly on any device.",
        keywords: ["online PDF compressor no software", "browser based PDF tools"],
      },
    ],
  },
  "ai-writing": {
    title: "AI Writing Tools FAQ",
    description: "Questions about free AI writing tools: grammar checker, paraphrasing, summarization, and translation. All tools are free, no signup required, no usage limits.",
    icon: <Pen className="h-6 w-6" />,
    relatedTools: [
      { name: "Grammar Checker", href: "/tools/ai-writing/grammar-check" },
      { name: "AI Rewriter", href: "/tools/ai-writing/rewrite" },
      { name: "AI Summarizer", href: "/tools/ai-writing/summarize" },
      { name: "AI Translator", href: "/tools/ai-writing/translate" },
    ],
    featuredSnippet: `Yes, ToolHive's grammar checker is completely free with no signup required. Unlike competitors that limit free checks or require premium subscriptions, ToolHive offers unlimited grammar checking, instant corrections, and detailed explanations for every fix — all at no cost.`,
    faqs: [
      {
        question: "Is the grammar checker really free with no signup?",
        answer: "Yes, ToolHive's grammar checker is 100% free with no signup required. You get unlimited grammar checks, instant corrections, and detailed explanations for every fix. Unlike competitors like Grammarly that require premium for full features, ToolHive delivers complete grammar checking for free.",
        keywords: ["grammar checker free no signup", "free grammar checker unlimited"],
      },
      {
        question: "How does the paraphrasing tool work?",
        answer: "ToolHive's AI rewriter takes your text and rephrases it to improve clarity, change tone, or avoid repetition. Simply paste your text, choose your preferred mode (professional, casual, formal, or creative), and get instant rewrites. All completely free with no word limits.",
        keywords: ["paraphrasing tool free no signup", "free text rephraser"],
      },
      {
        question: "Can I summarize long documents for free?",
        answer: "Yes, ToolHive's AI summarizer is completely free. Paste any text or article up to 50,000 characters, and get instant bullet-point or paragraph summaries. No signup, no word limits, no watermarks on output.",
        keywords: ["AI PDF summarizer free no signup", "free document summarizer"],
      },
      {
        question: "What languages does the translator support?",
        answer: "ToolHive's AI translator supports 100+ languages including English, Spanish, French, German, Chinese, Japanese, Arabic, Hindi, Portuguese, Russian, and many more. Simply select your source and target language for instant, context-aware translation.",
        keywords: ["free translator 100 languages", "AI translation free"],
      },
      {
        question: "Is there a word or character limit?",
        answer: "No, ToolHive AI writing tools have no hard limits. You can process as much text as you need. For very long documents (50,000+ characters), processing may take slightly longer, but you'll always get complete results.",
        keywords: ["no word limit AI writing", "unlimited grammar checker"],
      },
      {
        question: "Can I use these tools for academic or professional writing?",
        answer: "Absolutely. ToolHive's grammar checker and AI writing tools are perfect for academic papers, business emails, professional documents, and any formal writing. The tool provides detailed explanations so you understand why each correction is recommended.",
        keywords: ["academic writing tools free", "professional grammar checker"],
      },
      {
        question: "How accurate is the grammar checking?",
        answer: "ToolHive uses advanced AI models trained on millions of texts for highly accurate grammar, spelling, and punctuation detection. It catches common errors, contextual mistakes, and style issues that basic spell-checkers miss. While no tool is perfect, ToolHive provides detailed explanations so you can verify each suggestion.",
        keywords: ["accurate grammar checker AI", "best free grammar checker"],
      },
    ],
  },
  image: {
    title: "Image Tools FAQ",
    description: "Free image tools: background removal, compression, resizing, and format conversion. No signup, no watermarks, instant results.",
    icon: <Image className="h-6 w-6" />,
    relatedTools: [
      { name: "Remove Background", href: "/tools/image/remove-background" },
      { name: "Compress Image", href: "/tools/image/img-compress" },
      { name: "Resize Image", href: "/tools/image/resize" },
      { name: "Convert Image", href: "/tools/image/convert" },
    ],
    featuredSnippet: `Yes, ToolHive's background remover is completely free with no signup required. Remove backgrounds from product photos, portraits, and any image instantly. Get transparent PNG output with no watermarks, no quality loss, and no limits on usage.`,
    faqs: [
      {
        question: "Is background removal truly free with no watermark?",
        answer: "Yes, ToolHive's AI background remover is 100% free with no signup required. Remove backgrounds from any image and download the result with no watermarks. Works perfectly for product photos, portraits, e-commerce images, and creative projects.",
        keywords: ["remove background from image free no watermark", "background remover free no signup"],
      },
      {
        question: "What image formats are supported?",
        answer: "ToolHive supports all major image formats including JPG, JPEG, PNG, WebP, GIF, BMP, and TIFF. You can upload in any format and download in your preferred format after processing.",
        keywords: ["image format support", "convert image formats free"],
      },
      {
        question: "What's the maximum image file size?",
        answer: "ToolHive accepts images up to 25MB per file, with batch processing of up to 30 images at once. For larger files, consider compressing first or using the resize tool to reduce dimensions.",
        keywords: ["image file size limit", "compress large images free"],
      },
      {
        question: "Will image quality be preserved?",
        answer: "Yes, ToolHive uses smart compression and processing that preserves visual quality. Images maintain their sharpness and detail after compression or resizing. You'll see no visible quality loss in most cases.",
        keywords: ["image compression quality", "resize without quality loss"],
      },
      {
        question: "Can I batch process multiple images?",
        answer: "Yes, ToolHive supports batch processing of up to 30 images simultaneously. This is perfect for e-commerce sellers who need to remove backgrounds or compress multiple product photos at once.",
        keywords: ["batch image processing free", "bulk image compression"],
      },
    ],
  },
};

function FAQItemComponent({ item, index }: { item: FAQItem; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border border-card-border bg-card overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left hover:bg-background-subtle transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-foreground pr-4">{item.question}</span>
        <ChevronDown
          className={clsx(
            "h-5 w-5 text-foreground-muted shrink-0 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 text-foreground-muted leading-relaxed border-t border-card-border pt-4">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQPage({ category }: { category: Category }) {
  const data = FAQ_DATA[category];
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFAQs = data.faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.keywords?.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background border-b border-card-border py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
              {data.icon}
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
              {data.title}
            </h1>
            <p className="text-lg text-foreground-muted">{data.description}</p>

            {/* Search */}
            <div className="relative w-full max-w-md mt-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-subtle" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="w-full h-12 rounded-xl border border-card-border bg-card pl-12 pr-4 text-foreground placeholder:text-foreground-subtle focus:border-primary/50 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid lg:grid-cols-[1fr_300px] gap-10">
          {/* FAQs */}
          <div>
            {filteredFAQs.length > 0 ? (
              <div className="space-y-3">
                {filteredFAQs.map((faq, i) => (
                  <FAQItemComponent key={i} item={faq} index={i} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-card-border bg-card">
                <HelpCircle className="h-10 w-10 text-foreground-subtle mb-4" />
                <p className="font-medium text-foreground">No matching questions found.</p>
                <p className="text-sm text-foreground-subtle mt-1">Try a different search term.</p>
              </div>
            )}

            {/* Featured Snippet Box */}
            {data.featuredSnippet && !searchQuery && (
              <div className="mt-10 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white text-xs font-bold">S</span>
                  </div>
                  <span className="text-sm font-semibold text-primary">Featured Answer</span>
                </div>
                <p className="text-foreground leading-relaxed">{data.featuredSnippet}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Related Tools */}
            <div className="rounded-2xl border border-card-border bg-card p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Try These Tools</h3>
              <div className="space-y-2">
                {data.relatedTools.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="flex items-center justify-between p-3 rounded-lg bg-background-subtle hover:bg-primary/5 hover:text-primary transition-colors group"
                  >
                    <span className="text-sm font-medium">{tool.name}</span>
                    <ArrowRight className="h-4 w-4 text-foreground-muted group-hover:text-primary transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Still have questions */}
            <div className="rounded-2xl border border-card-border bg-gradient-to-br from-primary/10 to-accent/5 p-6">
              <HelpCircle className="h-8 w-8 text-primary mb-3" />
              <h3 className="text-lg font-bold text-foreground mb-2">Still have questions?</h3>
              <p className="text-sm text-foreground-muted mb-4">
                Contact us and we'll get back to you within 24 hours.
              </p>
              <Link
                href="/contact"
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Contact Support
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Other FAQ Categories */}
            <div className="rounded-2xl border border-card-border bg-card p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Other FAQs</h3>
              <div className="space-y-2">
                {(["pdf", "ai-writing", "image"] as Category[])
                  .filter((c) => c !== category)
                  .map((c) => (
                    <Link
                      key={c}
                      href={`/guides/${c === "ai-writing" ? "ai-writing" : c === "image" ? "image-tools-faq" : "pdf-tools"}-faq`}
                      className="flex items-center gap-3 p-3 rounded-lg bg-background-subtle hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      <span className="text-foreground-muted">{FAQ_DATA[c].icon}</span>
                      <span className="text-sm font-medium">{FAQ_DATA[c].title}</span>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}