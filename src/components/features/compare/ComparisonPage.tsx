"use client";

import React from "react";
import Link from "next/link";
import { Check, X, ArrowRight, Scale, Shield, Zap, Clock, Star } from "lucide-react";
import { clsx } from "clsx";

type Competitor = "smallpdf" | "ilovepdf" | "quillbot" | "removebg";

interface ComparisonData {
  competitor: Competitor;
  competitorName: string;
  competitorUrl: string;
  description: string;
  categories: {
    name: string;
    features: {
      name: string;
      toolhive: string | boolean;
      competitor: string | boolean;
      winner?: "toolhive" | "competitor";
    }[];
  }[];
  verdicts: {
    category: string;
    winner: "toolhive" | "competitor" | "tie";
    score: string;
  }[];
  pros: {
    toolhive: string[];
    competitor: string[];
  };
  verdict: string;
  cta: {
    toolhive: string;
    competitor: string;
  };
}

const COMPARISONS: Record<Competitor, ComparisonData> = {
  smallpdf: {
    competitor: "smallpdf",
    competitorName: "Smallpdf",
    competitorUrl: "https://smallpdf.com",
    description: "Smallpdf is a popular PDF tool suite with a clean interface. However, it requires signup after limited free uses and adds watermarks to compressed PDFs without a Pro subscription.",
    categories: [
      {
        name: "Pricing & Access",
        features: [
          {
            name: "Free tier available",
            toolhive: true,
            competitor: true,
            winner: "toolhive",
          },
          {
            name: "No signup required",
            toolhive: "Unlimited free use without account",
            competitor: "Signup required after 2 free tasks/day",
            winner: "toolhive",
          },
          {
            name: "No watermarks",
            toolhive: "Always watermark-free",
            competitor: "Watermarks added on free tier",
            winner: "toolhive",
          },
          {
            name: "No usage limits",
            toolhive: "Unlimited uses daily",
            competitor: "Limited to 2 tasks/day on free",
            winner: "toolhive",
          },
        ],
      },
      {
        name: "PDF Tools",
        features: [
          {
            name: "Compress PDF",
            toolhive: "Free, unlimited, no watermark",
            competitor: "Free with watermark, strong compression requires Pro",
            winner: "toolhive",
          },
          {
            name: "Merge PDF",
            toolhive: "Free, unlimited files",
            competitor: "Free, limited merges",
            winner: "toolhive",
          },
          {
            name: "Split PDF",
            toolhive: "Free, unlimited",
            competitor: "Free with limits",
            winner: "toolhive",
          },
          {
            name: "PDF to Word",
            toolhive: "Free conversion",
            competitor: "Requires Pro for full conversion",
            winner: "toolhive",
          },
          {
            name: "PDF to Excel",
            toolhive: "Free with AI table detection",
            competitor: "Requires Pro",
            winner: "toolhive",
          },
          {
            name: "Sign PDF",
            toolhive: "Free digital signatures",
            competitor: "Requires Pro",
            winner: "toolhive",
          },
        ],
      },
      {
        name: "Additional Tools",
        features: [
          {
            name: "Image tools",
            toolhive: "Remove background, resize, compress 50+ tools",
            competitor: "Limited image tools, requires Pro for some",
            winner: "toolhive",
          },
          {
            name: "AI writing tools",
            toolhive: "Grammar, rewrite, summarize, translate - all free",
            competitor: "Not available",
            winner: "toolhive",
          },
          {
            name: "Calculators",
            toolhive: "28 free calculators",
            competitor: "Not available",
            winner: "toolhive",
          },
        ],
      },
      {
        name: "User Experience",
        features: [
          {
            name: "Mobile responsive",
            toolhive: true,
            competitor: true,
          },
          {
            name: "Batch processing",
            toolhive: "Process up to 500 files",
            competitor: "Limited batch on Pro",
          },
          {
            name: "File size limit",
            toolhive: "Up to 2GB uploads",
            competitor: "50MB on free tier",
            winner: "toolhive",
          },
          {
            name: "Processing speed",
            toolhive: "Priority processing included",
            competitor: "Standard speed on free",
            winner: "toolhive",
          },
        ],
      },
      {
        name: "Privacy & Security",
        features: [
          {
            name: "Browser processing",
            toolhive: true,
            competitor: true,
          },
          {
            name: "Auto-delete files",
            toolhive: "Files deleted after processing",
            competitor: "1-hour auto-delete on Pro",
            winner: "toolhive",
          },
          {
            name: "No tracking",
            toolhive: "No account means no data tracking",
            competitor: "Requires account for full features",
            winner: "toolhive",
          },
        ],
      },
    ],
    verdicts: [
      { category: "Pricing & Access", winner: "toolhive", score: "5-0" },
      { category: "PDF Tools", winner: "toolhive", score: "6-0" },
      { category: "Additional Tools", winner: "toolhive", score: "3-0" },
      { category: "User Experience", winner: "toolhive", score: "3-1" },
      { category: "Privacy & Security", winner: "toolhive", score: "3-0" },
    ],
    pros: {
      toolhive: [
        "100% free with no signup",
        "No watermarks ever",
        "Unlimited daily uses",
        "200+ tools beyond PDF",
        "2GB file size limits",
        "No account = no data tracking",
      ],
      competitor: [
        "Established brand recognition",
        "Clean, polished UI",
        "Mobile apps available",
        "ISO 27001 security certified (Pro)",
      ],
    },
    verdict:
      "ToolHive wins decisively on value. While Smallpdf requires signup and Pro subscription for watermark-free output and unlimited use, ToolHive delivers all PDF tools completely free with no account required. The 20:0 score across pricing and core features reflects ToolHive's commitment to truly free tools.",
    cta: {
      toolhive: "Start using ToolHive for free — no signup needed",
      competitor: "Try Smallpdf Pro",
    },
  },
  ilovepdf: {
    competitor: "ilovepdf",
    competitorName: "iLovePDF",
    competitorUrl: "https://www.ilovepdf.com",
    description: "iLovePDF is a well-established PDF toolkit with extensive features. Like other competitors, it gates premium features behind paid subscriptions and has usage limits on its free tier.",
    categories: [
      {
        name: "Pricing & Access",
        features: [
          {
            name: "Free tier available",
            toolhive: true,
            competitor: true,
            winner: "toolhive",
          },
          {
            name: "No signup required",
            toolhive: "Unlimited free use without account",
            competitor: "Signup required for some features",
            winner: "toolhive",
          },
          {
            name: "No watermarks",
            toolhive: "Always watermark-free",
            competitor: "Watermarks on free tier for some tools",
            winner: "toolhive",
          },
          {
            name: "No usage limits",
            toolhive: "Unlimited uses daily",
            competitor: "Limited uses on free tier",
            winner: "toolhive",
          },
        ],
      },
      {
        name: "PDF Tools",
        features: [
          {
            name: "Compress PDF",
            toolhive: "Free, unlimited, no watermark",
            competitor: "Free with compression quality options",
            winner: "toolhive",
          },
          {
            name: "Merge PDF",
            toolhive: "Free, unlimited files",
            competitor: "Free with drag-drop reordering",
            winner: "competitor",
          },
          {
            name: "Split PDF",
            toolhive: "Free, unlimited",
            competitor: "Free with range extraction",
            winner: "competitor",
          },
          {
            name: "PDF to Word",
            toolhive: "Free conversion",
            competitor: "Free conversion available",
          },
          {
            name: "Organize PDF",
            toolhive: "Manual page reordering",
            competitor: "Advanced AI-powered organize features",
            winner: "competitor",
          },
          {
            name: "PDF to JPG",
            toolhive: "Free conversion",
            competitor: "Free conversion with quality control",
            winner: "competitor",
          },
        ],
      },
      {
        name: "Additional Tools",
        features: [
          {
            name: "Image tools",
            toolhive: "50+ image tools including background removal",
            competitor: "Basic image tools only",
            winner: "toolhive",
          },
          {
            name: "AI writing tools",
            toolhive: "Grammar, rewrite, summarize, translate - all free",
            competitor: "Not available",
            winner: "toolhive",
          },
          {
            name: "Calculators",
            toolhive: "28 free calculators",
            competitor: "Not available",
            winner: "toolhive",
          },
        ],
      },
      {
        name: "User Experience",
        features: [
          {
            name: "Mobile responsive",
            toolhive: true,
            competitor: true,
          },
          {
            name: "Batch processing",
            toolhive: "Process up to 500 files",
            competitor: "Batch available on premium",
            winner: "toolhive",
          },
          {
            name: "File size limit",
            toolhive: "Up to 2GB uploads",
            competitor: "Varies by feature, generally lower",
            winner: "toolhive",
          },
          {
            name: "Mobile apps",
            toolhive: "Browser-based, works on all devices",
            competitor: "iOS and Android apps available",
            winner: "competitor",
          },
        ],
      },
    ],
    verdicts: [
      { category: "Pricing & Access", winner: "toolhive", score: "4-0" },
      { category: "PDF Tools", winner: "competitor", score: "2-4" },
      { category: "Additional Tools", winner: "toolhive", score: "3-0" },
      { category: "User Experience", winner: "tie", score: "2-2" },
    ],
    pros: {
      toolhive: [
        "Truly free with no signup",
        "200+ tools vs limited PDF focus",
        "No watermarks on any output",
        "AI writing and image tools included",
        "Larger file size limits (2GB)",
        "More tool categories",
      ],
      competitor: [
        "Longer established brand",
        "Excellent PDF-focused UX",
        "Mobile apps for iOS/Android",
        "Strong AI organize features",
        "Good free tier for PDF basics",
      ],
    },
    verdict:
      "ToolHive excels in breadth and value. While iLovePDF has stronger PDF-specific organization features, ToolHive offers more tools, better pricing (truly free), and a wider variety of categories beyond PDF. Choose iLovePDF for specialized PDF organization; choose ToolHive for comprehensive free tool access.",
    cta: {
      toolhive: "Explore 200+ free tools on ToolHive",
      competitor: "Try iLovePDF for specialized PDF tools",
    },
  },
  quillbot: {
    competitor: "quillbot",
    competitorName: "QuillBot",
    competitorUrl: "https://quillbot.com",
    description: "QuillBot is a popular AI writing tool with paraphrasing, grammar checking, and summarization. However, its best features require a Premium subscription, and the free tier has significant limitations.",
    categories: [
      {
        name: "Pricing & Access",
        features: [
          {
            name: "Free tier available",
            toolhive: true,
            competitor: true,
          },
          {
            name: "No signup required",
            toolhive: "Unlimited free use without account",
            competitor: "Signup required to use at all",
            winner: "toolhive",
          },
          {
            name: "Premium features free",
            toolhive: "All AI writing features are free",
            competitor: "Best modes require Premium",
            winner: "toolhive",
          },
          {
            name: "Usage limits",
            toolhive: "Unlimited uses",
            competitor: "125 words on free paraphrase",
            winner: "toolhive",
          },
        ],
      },
      {
        name: "Writing Tools",
        features: [
          {
            name: "Grammar checker",
            toolhive: "Free, unlimited, instant corrections",
            competitor: "Limited corrections on free",
            winner: "toolhive",
          },
          {
            name: "Paraphrasing",
            toolhive: "Free, unlimited rephrasing",
            competitor: "Limited to 125 words free",
            winner: "toolhive",
          },
          {
            name: "Summarizer",
            toolhive: "Free document summarization",
            competitor: "Summarizer requires Premium",
            winner: "toolhive",
          },
          {
            name: "AI rewriter",
            toolhive: "Free text improvement",
            competitor: "Premium feature",
            winner: "toolhive",
          },
          {
            name: "Translator",
            toolhive: "Free 100+ language translation",
            competitor: "Not available",
            winner: "toolhive",
          },
          {
            name: "Co-writer modes",
            toolhive: "Basic rewrite modes",
            competitor: "8+ advanced modes on Premium",
            winner: "competitor",
          },
        ],
      },
      {
        name: "Additional Features",
        features: [
          {
            name: "PDF tools",
            toolhive: "200+ tools including PDF compression, merge, split",
            competitor: "Not available",
            winner: "toolhive",
          },
          {
            name: "Image tools",
            toolhive: "Background remover, resize, compress",
            competitor: "Not available",
            winner: "toolhive",
          },
          {
            name: "Chrome extension",
            toolhive: "Not available",
            competitor: "Full extension available",
            winner: "competitor",
          },
          {
            name: "Microsoft Office add-in",
            toolhive: "Not available",
            competitor: "Office integration",
            winner: "competitor",
          },
        ],
      },
      {
        name: "Quality & Output",
        features: [
          {
            name: "AI accuracy",
            toolhive: "Powerful AI models for writing",
            competitor: "Specialized writing AI",
          },
          {
            name: "Plagiarism checker",
            toolhive: "Free built-in plagiarism checker",
            competitor: "Premium-only feature",
            winner: "competitor",
          },
          {
            name: "Citation generator",
            toolhive: "Not available",
            competitor: "Built-in citation tools",
            winner: "competitor",
          },
        ],
      },
    ],
    verdicts: [
      { category: "Pricing & Access", winner: "toolhive", score: "4-0" },
      { category: "Writing Tools", winner: "toolhive", score: "5-1" },
      { category: "Additional Features", winner: "toolhive", score: "2-2" },
      { category: "Quality & Output", winner: "competitor", score: "1-2" },
    ],
    pros: {
      toolhive: [
        "All features 100% free",
        "No word count limits",
        "No signup required",
        "200+ tools beyond writing",
        "Includes PDF, image, video tools",
        "Free plagiarism checker",
      ],
      competitor: [
        "Specialized writing AI",
        "8+ paraphrase modes",
        "Chrome extension",
        "Microsoft Office integration",
        "Citation generator",
        "Plagiarism checker (Premium)",
      ],
    },
    verdict:
      "ToolHive dominates on value with completely free access to grammar checking, paraphrasing, summarization, and rewriting. QuillBot excels for users who need specialized writing modes, browser integration, and citation tools — but requires Premium for most useful features. For truly free AI writing, ToolHive is the clear winner.",
    cta: {
      toolhive: "Use free AI writing tools on ToolHive — no limit",
      competitor: "Try QuillBot Premium for advanced writing modes",
    },
  },
  removebg: {
    competitor: "removebg",
    competitorName: "remove.bg",
    competitorUrl: "https://www.remove.bg",
    description: "remove.bg is a dedicated AI background removal tool that delivers high-quality results. However, the free tier only allows 3 free exports per month, and higher resolution downloads require a paid subscription. ToolHive offers a free alternative with more flexibility.",
    categories: [
      {
        name: "Pricing & Access",
        features: [
          {
            name: "Free tier available",
            toolhive: true,
            competitor: true,
          },
          {
            name: "No signup required",
            toolhive: "Use immediately, no account",
            competitor: "Signup required after 3 exports/month",
            winner: "toolhive",
          },
          {
            name: "Credits system",
            toolhive: "No credits — unlimited use",
            competitor: "3 free exports/month, then paid",
            winner: "toolhive",
          },
          {
            name: "Resolution limits",
            toolhive: "Up to 10MB images, full resolution",
            competitor: "Free tier capped at 0.25 megapixels",
            winner: "toolhive",
          },
        ],
      },
      {
        name: "Background Removal",
        features: [
          {
            name: "Standard BG removal",
            toolhive: "Free, unlimited, AI-powered",
            competitor: "Free — 3/month",
            winner: "toolhive",
          },
          {
            name: "Batch processing",
            toolhive: "Process up to 5 images at once",
            competitor: "Batch on paid plans",
            winner: "toolhive",
          },
          {
            name: "Fine hair detail",
            toolhive: "AI handles fine details",
            competitor: "Excellent fine hair detection",
          },
          {
            name: "Product photography",
            toolhive: "Excellent for e-commerce",
            competitor: "Industry-leading quality",
          },
          {
            name: "Transparent download",
            toolhive: "Free PNG download",
            competitor: "Free tier: JPG only, PNG requires paid",
            winner: "toolhive",
          },
          {
            name: "Color correction",
            toolhive: "Background color picker option",
            competitor: "Available on Pro",
            winner: "toolhive",
          },
        ],
      },
      {
        name: "Additional Tools",
        features: [
          {
            name: "Image tools",
            toolhive: "50+ image tools included",
            competitor: "Not available",
            winner: "toolhive",
          },
          {
            name: "PDF tools",
            toolhive: "200+ tools including compress, convert",
            competitor: "Not available",
            winner: "toolhive",
          },
          {
            name: "AI writing tools",
            toolhive: "Grammar, paraphrase, summarize",
            competitor: "Not available",
            winner: "toolhive",
          },
          {
            name: "Calculators",
            toolhive: "28 free calculators",
            competitor: "Not available",
            winner: "toolhive",
          },
        ],
      },
      {
        name: "Quality & Output",
        features: [
          {
            name: "AI accuracy",
            toolhive: "Powerful AI for clean edges",
            competitor: "Industry-leading accuracy",
          },
          {
            name: "Processing speed",
            toolhive: "~5 seconds per image",
            competitor: "~5 seconds per image",
          },
          {
            name: "JPG output",
            toolhive: true,
            competitor: true,
          },
          {
            name: "PNG transparent",
            toolhive: true,
            competitor: "Free tier only 0.25MP",
            winner: "toolhive",
          },
          {
            name: "High-res export",
            toolhive: "Full resolution included",
            competitor: "Pro feature only",
            winner: "toolhive",
          },
        ],
      },
    ],
    verdicts: [
      { category: "Pricing & Access", winner: "toolhive", score: "4-0" },
      { category: "Background Removal", winner: "tie", score: "2-2" },
      { category: "Additional Tools", winner: "toolhive", score: "4-0" },
      { category: "Quality & Output", winner: "competitor", score: "2-3" },
    ],
    pros: {
      toolhive: [
        "Unlimited background removal, always free",
        "No signup, use instantly",
        "Full resolution PNG downloads free",
        "Batch process up to 5 images at once",
        "50+ additional image tools included",
        "200+ tools beyond image editing",
      ],
      competitor: [
        "Industry-leading BG removal quality",
        "Best-in-class fine hair detection",
        "Excellent for product photography",
        "Chrome extension available",
        "API access for developers",
        "Batch processing on paid plans",
      ],
    },
    verdict:
      "ToolHive wins on value with truly unlimited free background removal at full resolution. While remove.bg has industry-leading accuracy for complex images, the 3 free exports per month cap and resolution limits on free tier make ToolHive the better choice for users who need consistent, unlimited access. For one-off occasional use with highest quality, remove.bg excels.",
    cta: {
      toolhive: "Remove backgrounds for free on ToolHive — no limit",
      competitor: "Try remove.bg Pro for premium quality",
    },
  },
};

function FeatureCell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="h-5 w-5 text-emerald-500 mx-auto" />
    ) : (
      <X className="h-5 w-5 text-red-400 mx-auto" />
    );
  }
  return <span className="text-sm text-foreground-muted">{value}</span>;
}

export function ComparisonPage({ competitor }: { competitor: Competitor }) {
  const data = COMPARISONS[competitor];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background border-b border-card-border py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            {/* VS Badge */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-2xl font-black text-white shadow-xl">
                  ToolHive
                </div>
                <div className="absolute -right-6 top-1/2 -translate-y-1/2">
                  <Scale className="h-12 w-12 text-foreground-muted" />
                </div>
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 px-3 py-2 text-sm font-bold text-white shadow-lg">
                  vs
                </div>
              </div>
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-lg font-black text-white shadow-xl">
                {data.competitorName}
              </div>
            </div>

            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-4">
                ToolHive vs {data.competitorName}
                <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Comparison 2026
                </span>
              </h1>
              <p className="text-lg text-foreground-muted max-w-2xl mx-auto lg:mx-0">{data.description}</p>

              {/* Quick verdict badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-6">
                {data.verdicts.map((v) => (
                  <div
                    key={v.category}
                    className={clsx(
                      "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold",
                      v.winner === "toolhive"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : v.winner === "competitor"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                        : "bg-foreground-muted/10 text-foreground-muted border border-foreground-muted/30"
                    )}
                  >
                    <Star className="h-4 w-4" />
                    {v.category}: {v.winner === "toolhive" ? "ToolHive wins" : v.winner === "competitor" ? data.competitorName + " wins" : "Tie"}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Tables */}
      <div className="container mx-auto px-4 py-12 lg:py-16 space-y-16">
        {data.categories.map((category) => (
          <section key={category.name} className="rounded-2xl border border-card-border bg-card overflow-hidden">
            <div className="bg-background-subtle px-6 py-4 border-b border-card-border">
              <h2 className="text-xl font-bold text-foreground">{category.name}</h2>
            </div>
            <div className="divide-y divide-card-border">
              <div className="grid grid-cols-[1fr_200px_200px] gap-4 px-6 py-4 bg-background-subtle/50">
                <div className="font-semibold text-sm text-foreground-subtle">Feature</div>
                <div className="text-center">
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                    <Zap className="h-4 w-4" /> ToolHive
                  </span>
                </div>
                <div className="text-center">
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-cyan-600 dark:text-cyan-400">
                    {data.competitorName}
                  </span>
                </div>
              </div>
              {category.features.map((feature) => (
                <div key={feature.name} className="grid grid-cols-[1fr_200px_200px] gap-4 px-6 py-4 items-center">
                  <div className="text-sm font-medium text-foreground">
                    {feature.name}
                    {feature.winner && (
                      <span className="ml-2 inline-flex items-center">
                        {feature.winner === "toolhive" ? (
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Wins</span>
                        ) : (
                          <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">Wins</span>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="text-center">
                    <FeatureCell value={feature.toolhive} />
                  </div>
                  <div className="text-center">
                    <FeatureCell value={feature.competitor} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Final Verdict */}
      <section className="container mx-auto px-4 pb-16">
        <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-accent/5 p-8 lg:p-12">
          <h2 className="text-3xl font-extrabold text-foreground text-center mb-6">
            Final Verdict
          </h2>
          <p className="text-lg text-foreground-muted text-center max-w-3xl mx-auto mb-8">
            {data.verdict}
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* ToolHive Pros */}
            <div className="rounded-xl border border-emerald-500/20 bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Why ToolHive Wins</h3>
              </div>
              <ul className="space-y-3">
                {data.pros.toolhive.map((pro, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground-muted">{pro}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/"
                className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:opacity-90 transition-opacity"
              >
                {data.cta.toolhive}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Competitor Pros */}
            <div className="rounded-xl border border-cyan-500/20 bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 text-white">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{data.competitorName} Strengths</h3>
              </div>
              <ul className="space-y-3">
                {data.pros.competitor.map((pro, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-cyan-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground-muted">{pro}</span>
                  </li>
                ))}
              </ul>
              <a
                href={data.competitorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-cyan-500 bg-cyan-500/10 px-6 py-3 font-semibold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 transition-colors"
              >
                {data.cta.competitor}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-foreground-subtle">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>No signup required</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>2GB file limits</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>Always watermark-free</span>
            </div>
          </div>
        </div>
      </section>

      {/* Related Comparisons */}
      <section className="bg-background-subtle border-t border-card-border py-12">
        <div className="container mx-auto px-4">
          <h3 className="text-lg font-bold text-foreground text-center mb-6">Compare with other tools</h3>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {competitor !== "smallpdf" && (
              <Link
                href="/compare/toolhive-vs-smallpdf"
                className="rounded-full border border-card-border bg-card px-5 py-2 text-sm font-medium text-foreground hover:border-primary/30 hover:text-primary transition-colors"
              >
                ToolHive vs Smallpdf
              </Link>
            )}
            {competitor !== "ilovepdf" && (
              <Link
                href="/compare/toolhive-vs-ilovepdf"
                className="rounded-full border border-card-border bg-card px-5 py-2 text-sm font-medium text-foreground hover:border-primary/30 hover:text-primary transition-colors"
              >
                ToolHive vs iLovePDF
              </Link>
            )}
            {competitor !== "quillbot" && (
              <Link
                href="/compare/toolhive-vs-quillbot"
                className="rounded-full border border-card-border bg-card px-5 py-2 text-sm font-medium text-foreground hover:border-primary/30 hover:text-primary transition-colors"
              >
                ToolHive vs QuillBot
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}