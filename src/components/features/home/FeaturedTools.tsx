"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Users, type LucideIcon, Wrench } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { clsx } from "clsx";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { getFeaturedTools } from "@/config/tools";
import type { Tool } from "@/types";

// ─────────────────────────────────────────────
// Animation variants
// ─────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.42,
      ease: [0.22, 0.61, 0.36, 1] as [number, number, number, number],
    },
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

// ─────────────────────────────────────────────
// Category display maps
// ─────────────────────────────────────────────

const CATEGORY_GRADIENTS: Record<string, string> = {
  pdf: "from-rose-500 to-orange-400",
  image: "from-violet-500 to-purple-400",
  video: "from-blue-500 to-cyan-400",
  "ai-writing": "from-emerald-500 to-teal-400",
  audio: "from-amber-500 to-yellow-400",
  converter: "from-sky-500 to-indigo-400",
  resume: "from-indigo-500 to-purple-600",
  calculator: "from-orange-500 to-amber-400",
};

const CATEGORY_LABELS: Record<string, string> = {
  pdf: "PDF",
  image: "Image",
  video: "Video",
  "ai-writing": "AI Writing",
  audio: "Audio",
  converter: "Converter",
  resume: "Resume",
  calculator: "Calculator",
};

// ─────────────────────────────────────────────
// Desktop ToolCard (full card with description + usage)
// ─────────────────────────────────────────────

interface ToolCardProps {
  tool: Tool;
  shouldReduce: boolean;
}

const ToolCard = React.memo(function ToolCard({ tool, shouldReduce }: ToolCardProps) {
  const Icon = useMemo(() => resolveLucideIcon(tool.icon), [tool.icon]);
  const href = `/tools/${tool.category}/${tool.slug}`;
  const gradient = CATEGORY_GRADIENTS[tool.category] ?? "from-violet-500 to-blue-400";

  return (
    <motion.div variants={shouldReduce ? undefined : cardVariants} className="h-full">
      <Link
        href={href}
        className={clsx(
          "group relative flex flex-col gap-3 rounded-2xl",
          "border border-card-border bg-card p-5",
          "transition-all duration-250",
          "hover:-translate-y-1.5 hover:border-primary/20 hover:shadow-xl",
          "overflow-hidden h-full",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        )}
        aria-label={`${tool.name}: ${tool.shortDescription}`}
      >
        {/* Subtle top gradient accent on hover */}
        <div
          className={clsx(
            "pointer-events-none absolute inset-x-0 top-0 h-20 rounded-t-2xl",
            "opacity-0 group-hover:opacity-100",
            "transition-opacity duration-300",
            `bg-gradient-to-b ${gradient}`
          )}
          aria-hidden="true"
        >
          <div className="absolute inset-0 rounded-t-2xl bg-card opacity-95" />
        </div>

        {/* Content — sits above bg layers */}
        <div className="relative flex flex-col gap-3 h-full">
          {/* Top row: icon + badges */}
          <div className="flex items-start justify-between gap-2">
            {/* Icon */}
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

            {/* Badges */}
            <div className="flex items-center gap-1 flex-wrap justify-end">
              {tool.isNew && <Badge variant="new" size="sm">New</Badge>}
              {tool.isPopular && !tool.isNew && (
                <Badge variant="popular" size="sm">Popular</Badge>
              )}
              {tool.isPremium && <Badge variant="premium" size="sm">Pro</Badge>}
              {!tool.isPremium && (
                <Badge variant="free" size="sm">Free</Badge>
              )}
            </div>
          </div>

          {/* Tool name + description */}
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-200 leading-snug">
              {tool.name}
            </h3>
            <p className="mt-1 text-xs text-foreground-muted line-clamp-2 leading-relaxed">
              {tool.shortDescription}
            </p>
          </div>

          {/* Footer row */}
          <div className="mt-auto flex items-center justify-between pt-2 border-t border-border/60">
            {/* Category badge */}
            <span
              className={clsx(
                "inline-flex items-center rounded-full px-2 py-0.5",
                "text-xs font-medium",
                "bg-background-muted text-foreground-muted border border-border"
              )}
            >
              {CATEGORY_LABELS[tool.category] ?? tool.category}
            </span>

            {/* Usage count */}
            {tool.usageCount !== undefined && (
              <span className="flex items-center gap-1 text-xs text-foreground-subtle">
                <Users className="h-3 w-3" aria-hidden="true" />
                {formatUsage(tool.usageCount)}
              </span>
            )}
          </div>

          {/* "Use Now" button — slides up on hover */}
          <div
            className={clsx(
              "translate-y-2 opacity-0",
              "group-hover:translate-y-0 group-hover:opacity-100",
              "transition-all duration-200"
            )}
          >
            <div
              className={clsx(
                "flex w-full items-center justify-center gap-1.5",
                "rounded-xl py-2",
                `bg-gradient-to-r ${gradient}`,
                "text-xs font-semibold text-white shadow-md"
              )}
            >
              Use Now
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

// ─────────────────────────────────────────────
// Mobile ToolCard — compact horizontal-scroll card
// ─────────────────────────────────────────────

const MobileToolCard = React.memo(function MobileToolCard({ tool }: { tool: Tool }) {
  const Icon = useMemo(() => resolveLucideIcon(tool.icon), [tool.icon]);
  const href = `/tools/${tool.category}/${tool.slug}`;
  const gradient = CATEGORY_GRADIENTS[tool.category] ?? "from-violet-500 to-blue-400";

  return (
    <Link
      href={href}
      className={clsx(
        "snap-start shrink-0 w-44",
        "group relative flex flex-col gap-2.5 rounded-2xl",
        "border border-card-border bg-card p-4",
        "transition-all duration-200 active:scale-[0.97]",
        "hover:border-primary/20 hover:shadow-lg overflow-hidden",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
      aria-label={`${tool.name}: ${tool.shortDescription}`}
    >
      {/* Icon */}
      <div
        className={clsx(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          `bg-gradient-to-br ${gradient}`,
          "shadow-md"
        )}
        aria-hidden="true"
      >
        {/* eslint-disable-next-line react-hooks/static-components */}
        <Icon className="h-5 w-5 text-white" />
      </div>

      {/* Name + description */}
      <div className="flex-1 min-h-0">
        <h3 className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors duration-200 line-clamp-1">
          {tool.name}
        </h3>
        <p className="mt-0.5 text-xs text-foreground-muted line-clamp-2 leading-relaxed">
          {tool.shortDescription}
        </p>
      </div>

      {/* "Use" button — always visible on mobile for touch UX, min-height 44px */}
      <div
        className={clsx(
          "flex w-full items-center justify-center gap-1.5",
          "rounded-xl",
          "min-h-[44px]", // touch target
          `bg-gradient-to-r ${gradient}`,
          "text-xs font-semibold text-white shadow-sm",
          "transition-opacity duration-200"
        )}
      >
        Use Now
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </div>
    </Link>
  );
});

// ─────────────────────────────────────────────
// FeaturedTools
// ─────────────────────────────────────────────

/**
 * FeaturedTools — Client Component
 *
 * Mobile:   horizontal scroll row (TinyWow-style) with compact tool cards
 * Desktop:  4-column grid with full-featured cards
 *
 * Data source: TOOLS registry (static, replace with server fetch in production).
 */
export function FeaturedTools() {
  const shouldReduce = useReducedMotion() ?? false;
  const tools = useMemo(() => getFeaturedTools(12), []);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function onScroll() {
      if (el && el.scrollLeft > 32) setShowScrollHint(false);
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      className="container mx-auto px-4 py-12 lg:py-16"
      aria-labelledby="featured-heading"
    >
      {/* Section header — stacks on mobile, inline on sm+ */}
      <div className="flex flex-col gap-2 mb-6 sm:flex-row sm:items-end sm:justify-between sm:mb-8">
        <div>
          <h2
            id="featured-heading"
            className="text-2xl sm:text-3xl font-bold text-foreground"
          >
            Popular Tools
          </h2>
          <p className="mt-1.5 text-sm text-foreground-muted">
            Our most-used tools, trusted by millions every day
          </p>
        </div>
        {/* "See all" — visible on both mobile and desktop */}
        <Link
          href="/tools"
          className={clsx(
            "self-start sm:self-auto inline-flex items-center gap-1",
            "text-sm font-medium text-primary shrink-0",
            "hover:underline underline-offset-4",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          )}
        >
          See all tools
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      {/* ── Mobile: horizontal scroll row ── */}
      <div className="relative sm:hidden">
        <div
          ref={scrollRef}
          className={clsx(
            "flex overflow-x-auto gap-3 pb-3 -mx-4 px-4",
            "snap-x snap-mandatory",
            "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          )}
          role="list"
          aria-label="Featured tools"
        >
          {tools.map((tool) => (
            <div key={tool.id} role="listitem" className="contents">
              <MobileToolCard tool={tool} />
            </div>
          ))}
          {/* Trailing spacer */}
          <div className="shrink-0 w-4" aria-hidden="true" />
        </div>

        {/* Fade-out edge + scroll hint */}
        {showScrollHint && (
          <div
            className={clsx(
              "pointer-events-none absolute right-0 top-0 bottom-3 w-16",
              "bg-gradient-to-l from-background via-background/80 to-transparent",
              "flex items-center justify-end pr-2"
            )}
            aria-hidden="true"
          >
            <div className="flex items-center gap-0.5 text-foreground-subtle">
              <span className="text-xs font-medium">scroll</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        )}
      </div>

      {/* ── Desktop: 4-column grid (unchanged) ── */}
      <motion.div
        className="hidden sm:grid md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
        role="list"
        aria-label="Featured tools"
        variants={shouldReduce ? undefined : containerVariants}
        initial={shouldReduce ? "visible" : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {tools.map((tool) => (
          <div key={tool.id} role="listitem" className="flex">
            <ToolCard tool={tool} shouldReduce={shouldReduce} />
          </div>
        ))}
      </motion.div>

      {/* Mobile "browse all" button — below the scroll row */}
      <div className="mt-6 flex justify-center sm:hidden">
        <Link
          href="/tools"
          className={clsx(
            "inline-flex items-center gap-2 rounded-xl",
            "border border-border bg-card px-6",
            "min-h-[44px]", // touch-friendly
            "text-sm font-medium text-foreground-muted hover:text-primary hover:border-primary/30",
            "transition-all duration-200"
          )}
        >
          Browse all 200+ tools
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
