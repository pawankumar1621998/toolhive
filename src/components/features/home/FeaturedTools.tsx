"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Flame, Users, type LucideIcon, Wrench, Zap } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import { TOOLS } from "@/config/tools";
import type { Tool } from "@/types";

// ─────────────────────────────────────────────
// Animation variants
// ─────────────────────────────────────────────

const EASE_OUT: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.45, ease: EASE_OUT },
  },
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatUsage(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(0)}K`;
  return String(count);
}

function resolveLucideIcon(name: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon | undefined>;
  return icons[name] ?? Wrench;
}

// Category gradient map
const CATEGORY_GRADIENTS: Record<string, string> = {
  pdf:          "from-rose-500 to-orange-400",
  image:        "from-violet-600 to-purple-500",
  "ai-writing": "from-emerald-500 to-teal-400",
  audio:        "from-amber-500 to-yellow-400",
  converter:    "from-sky-500 to-indigo-400",
  resume:       "from-indigo-500 to-purple-600",
  calculator:   "from-orange-500 to-amber-400",
  generators:   "from-cyan-500 to-blue-400",
  "text-writing": "from-teal-500 to-green-400",
  utilities:    "from-gray-600 to-slate-500",
  device:       "from-slate-600 to-zinc-500",
  finance:      "from-green-600 to-emerald-500",
  productivity: "from-amber-500 to-yellow-400",
  code:         "from-blue-600 to-indigo-500",
  seo:          "from-violet-600 to-purple-500",
  education:    "from-indigo-600 to-blue-500",
  health:       "from-red-500 to-pink-500",
  travel:       "from-sky-500 to-cyan-400",
  entertainment:"from-fuchsia-500 to-pink-400",
};

const CATEGORY_LABELS: Record<string, string> = {
  pdf:          "PDF",
  image:        "Image",
  video:        "Video",
  "ai-writing": "AI Writing",
  audio:        "Audio",
  converter:    "Converter",
  resume:       "Resume",
  calculator:   "Calculator",
  generators:   "Generator",
  "text-writing": "Text",
  utilities:    "Utility",
  device:       "Device",
  finance:      "Finance",
  productivity: "Productivity",
  code:         "Code",
  seo:          "SEO",
  education:    "Education",
  health:       "Health",
  travel:       "Travel",
  entertainment:"Fun",
};

// ─────────────────────────────────────────────
// Trending tools
// ─────────────────────────────────────────────

const TRENDING_TOOLS = [...TOOLS]
  .filter((t) => t.usageCount !== undefined)
  .sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0))
  .slice(0, 10);

// ─────────────────────────────────────────────
// Premium ToolCard — desktop
// ─────────────────────────────────────────────

interface ToolCardProps { tool: Tool; shouldReduce: boolean; }

const ToolCard = React.memo(function ToolCard({ tool, shouldReduce }: ToolCardProps) {
  const Icon = useMemo(() => resolveLucideIcon(tool.icon), [tool.icon]);
  const href = `/tools/${tool.category}/${tool.slug}`;
  const gradient = CATEGORY_GRADIENTS[tool.category] ?? "from-violet-500 to-purple-400";

  return (
    <motion.div variants={shouldReduce ? undefined : cardVariants} className="h-full">
      <Link
        href={href}
        className={clsx(
          "group relative flex flex-col gap-3 rounded-2xl overflow-hidden",
          "border border-border/50 bg-card/80 backdrop-blur-md p-5",
          "transition-all duration-300",
          "hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-xl hover:shadow-black/10",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2",
          "h-full"
        )}
        aria-label={`${tool.name}: ${tool.shortDescription}`}
      >
        {/* Hover gradient overlay */}
        <div
          className={clsx(
            "pointer-events-none absolute inset-0 rounded-2xl",
            "opacity-0 group-hover:opacity-100",
            "transition-opacity duration-300",
            `bg-gradient-to-br ${gradient}`
          )}
          aria-hidden="true"
        >
          <div className="absolute inset-0 rounded-2xl bg-card/95 backdrop-blur-md opacity-[0.97]" />
        </div>

        {/* Top gradient accent bar */}
        <div
          className={clsx(
            "absolute top-0 left-0 right-0 h-1 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            `bg-gradient-to-r ${gradient}`
          )}
          aria-hidden="true"
        />

        <div className="relative flex flex-col gap-3 h-full">
          {/* Top row: icon + badges */}
          <div className="flex items-start justify-between gap-2">
            <div
              className={clsx(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                `bg-gradient-to-br ${gradient}`,
                "shadow-md transition-all duration-250",
                "group-hover:shadow-lg group-hover:scale-110"
              )}
              aria-hidden="true"
            >
              {/* eslint-disable-next-line react-hooks/static-components */}
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {tool.isNew && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 text-violet-600 dark:text-violet-400">
                  New
                </span>
              )}
              {tool.isPopular && !tool.isNew && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 text-orange-600 dark:text-orange-400">
                  Hot
                </span>
              )}
              {tool.isPremium && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-400">
                  Pro
                </span>
              )}
              {!tool.isPremium && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                  Free
                </span>
              )}
            </div>
          </div>

          {/* Tool name + description */}
          <div className="flex-1 min-h-0">
            <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors duration-200 leading-snug">
              {tool.name}
            </h3>
            <p className="mt-1 text-xs text-foreground-muted line-clamp-2 leading-relaxed">
              {tool.shortDescription}
            </p>
          </div>

          {/* Footer row */}
          <div className="mt-auto flex items-center justify-between pt-2 border-t border-border/40">
            <span className={clsx(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
              "bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20",
              "text-violet-600 dark:text-violet-400"
            )}>
              {CATEGORY_LABELS[tool.category] ?? tool.category}
            </span>
            {tool.usageCount !== undefined && (
              <span className="flex items-center gap-1 text-xs text-foreground-muted font-medium">
                <Users className="h-3 w-3" aria-hidden="true" />
                {formatUsage(tool.usageCount)}
              </span>
            )}
          </div>

          {/* "Use Now" hover button */}
          <div className="translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200">
            <div className={clsx(
              "flex w-full items-center justify-center gap-1.5 rounded-xl py-2",
              `bg-gradient-to-r ${gradient}`,
              "text-xs font-bold text-white shadow-md"
            )}>
              Use Now <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

// ─────────────────────────────────────────────
// Mobile ToolCard
// ─────────────────────────────────────────────

const MobileToolCard = React.memo(function MobileToolCard({ tool }: { tool: Tool }) {
  const Icon = useMemo(() => resolveLucideIcon(tool.icon), [tool.icon]);
  const href = `/tools/${tool.category}/${tool.slug}`;
  const gradient = CATEGORY_GRADIENTS[tool.category] ?? "from-violet-500 to-purple-400";

  return (
    <Link
      href={href}
      className={clsx(
        "group relative flex flex-col gap-2.5 rounded-2xl w-full",
        "border border-border/50 bg-card/80 backdrop-blur-sm p-3.5",
        "transition-all duration-200 active:scale-[0.97]",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-black/10",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2"
      )}
      aria-label={`${tool.name}: ${tool.shortDescription}`}
    >
      {/* Hover gradient overlay */}
      <div
        className={clsx(
          "pointer-events-none absolute inset-0 rounded-2xl",
          "opacity-0 group-hover:opacity-100",
          "transition-opacity duration-200",
          `bg-gradient-to-br ${gradient}`
        )}
        aria-hidden="true"
      >
        <div className="absolute inset-0 rounded-2xl bg-card/95 backdrop-blur-md" />
      </div>

      {/* Top gradient bar */}
      <div
        className={clsx(
          "absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          `bg-gradient-to-r ${gradient}`
        )}
        aria-hidden="true"
      />

      {/* Icon + badge */}
      <div className="flex items-start justify-between gap-1">
        <div
          className={clsx(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            `bg-gradient-to-br ${gradient}`, "shadow-sm"
          )}
          aria-hidden="true"
        >
          {/* eslint-disable-next-line react-hooks/static-components */}
          <Icon className="h-5 w-5 text-white" />
        </div>
        {tool.isNew ? (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 text-violet-600 dark:text-violet-400">
            New
          </span>
        ) : tool.isPopular ? (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 text-orange-600 dark:text-orange-400">
            Hot
          </span>
        ) : !tool.isPremium ? (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
            Free
          </span>
        ) : null}
      </div>

      {/* Name + description */}
      <div className="flex-1 min-h-0">
        <h3 className="text-xs font-bold text-foreground leading-snug group-hover:text-primary transition-colors duration-200 line-clamp-1">
          {tool.name}
        </h3>
        <p className="mt-0.5 text-[11px] text-foreground-muted line-clamp-2 leading-relaxed">
          {tool.shortDescription}
        </p>
      </div>

      {/* Usage count + Use Now */}
      <div className="flex items-center justify-between gap-1 mt-0.5">
        {tool.usageCount !== undefined && (
          <span className="flex items-center gap-0.5 text-[10px] text-foreground-subtle font-medium">
            <Users className="h-2.5 w-2.5" aria-hidden="true" />
            {formatUsage(tool.usageCount)}
          </span>
        )}
        <div className={clsx(
          "ml-auto flex items-center gap-1 rounded-lg px-2.5 py-1",
          `bg-gradient-to-r ${gradient}`,
          "text-[10px] font-bold text-white shadow-sm"
        )}>
          Use <ArrowRight className="h-2.5 w-2.5" aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
});

// ─────────────────────────────────────────────
// Trending pill
// ─────────────────────────────────────────────

function TrendingPill({ tool }: { tool: Tool }) {
  const Icon = useMemo(() => resolveLucideIcon(tool.icon), [tool.icon]);
  const href = `/tools/${tool.category}/${tool.slug}`;
  const gradient = CATEGORY_GRADIENTS[tool.category] ?? "from-violet-500 to-purple-400";

  return (
    <Link
      href={href}
      className={clsx(
        "group shrink-0 flex items-center gap-2.5 rounded-2xl",
        "border border-border/50 bg-card/80 backdrop-blur-sm px-3.5 py-2.5",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-black/5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
      )}
    >
      <div className={clsx(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
        `bg-gradient-to-br ${gradient}`, "shadow-sm"
      )}>
        {/* eslint-disable-next-line react-hooks/static-components */}
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-none truncate max-w-[110px]">
          {tool.name}
        </p>
        {tool.usageCount !== undefined && (
          <p className="mt-0.5 text-[10px] text-foreground-muted leading-none">
            {formatUsage(tool.usageCount)} uses
          </p>
        )}
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────
// Category tabs
// ─────────────────────────────────────────────

const TABS = [
  { id: "",           label: "🔥 All"         },
  { id: "pdf",        label: "PDF"            },
  { id: "image",      label: "Image"          },
  { id: "ai-writing", label: "AI Writing"     },
  { id: "calculator", label: "Calculator"     },
  { id: "converter",  label: "Converter"       },
  { id: "audio",      label: "Audio"           },
  { id: "resume",     label: "Resume"          },
] as const;

// ─────────────────────────────────────────────
// FeaturedTools
// ─────────────────────────────────────────────

export function FeaturedTools() {
  const shouldReduce = useReducedMotion() ?? false;
  const [activeTab, setActiveTab] = useState("");

  const tools = useMemo(() => {
    if (!activeTab) {
      return [...TOOLS]
        .filter((t) => t.usageCount !== undefined)
        .sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0))
        .slice(0, 16);
    }
    return TOOLS
      .filter((t) => t.category === activeTab)
      .sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0))
      .slice(0, 16);
  }, [activeTab]);

  return (
    <section className="container mx-auto px-4 py-12 lg:py-16" aria-labelledby="featured-heading">

      {/* ── Trending strip ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/20">
            <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" aria-hidden="true" />
          </div>
          <span className="text-sm font-bold text-foreground">Trending Right Now</span>
          <span className="text-xs text-foreground-subtle">— most-used tools today</span>
        </div>
        <div
          className={clsx(
            "flex items-center gap-2.5 overflow-x-auto pb-1",
            "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          )}
          aria-label="Trending tools"
        >
          {TRENDING_TOOLS.map((tool) => (
            <TrendingPill key={tool.id} tool={tool} />
          ))}
        </div>
      </div>

      {/* ── Section header ── */}
      <div className="flex flex-col gap-2 mb-6 sm:flex-row sm:items-end sm:justify-between sm:mb-8">
        <div>
          <h2 id="featured-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            Popular Tools
          </h2>
          <p className="mt-2 text-sm sm:text-base text-foreground-muted">
            Our most-used tools, trusted by millions every day
          </p>
        </div>
        <Link
          href="/tools"
          className={clsx(
            "self-start sm:self-auto inline-flex items-center gap-2",
            "text-sm font-semibold text-violet-600 dark:text-violet-400",
            "hover:underline underline-offset-4",
            "transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
          )}
        >
          See all tools <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {/* ── Category tabs ── */}
      <div
        className={clsx(
          "flex items-center gap-2 mb-6 overflow-x-auto pb-1",
          "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        )}
        role="tablist"
        aria-label="Filter tools by category"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50",
              activeTab === tab.id
                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/20"
                : "border border-border/50 bg-card/70 backdrop-blur-sm text-foreground-muted hover:border-violet-500/40 hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Mobile: 2-column grid ── */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`mobile-${activeTab}`}
          className="sm:hidden grid grid-cols-2 gap-3"
          role="list"
          aria-label="Featured tools"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {tools.map((tool) => (
            <div key={tool.id} role="listitem">
              <MobileToolCard tool={tool} />
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* ── Desktop: 4-column grid ── */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`desktop-${activeTab}`}
          className="hidden sm:grid md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
          role="list"
          aria-label="Featured tools"
          variants={shouldReduce ? undefined : containerVariants}
          initial={shouldReduce ? "visible" : "hidden"}
          animate="visible"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {tools.map((tool) => (
            <div key={tool.id} role="listitem" className="flex">
              <ToolCard tool={tool} shouldReduce={shouldReduce} />
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* ── Browse all CTA ── */}
      <div className="mt-8 flex justify-center">
        <Link
          href="/tools"
          className={clsx(
            "inline-flex items-center gap-2.5 rounded-2xl px-8 py-3.5",
            "border-2 border-border/50 bg-card/80 backdrop-blur-sm",
            "text-sm font-semibold text-foreground-muted",
            "hover:border-violet-500/40 hover:bg-card hover:text-violet-600 dark:hover:text-violet-400 hover:shadow-lg hover:shadow-violet-500/10",
            "transition-all duration-250",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
          )}
        >
          <Zap className="h-4 w-4" aria-hidden="true" />
          Browse all 200+ tools
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}