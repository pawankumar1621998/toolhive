"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import * as LucideIcons from "lucide-react";
import { type LucideIcon, ArrowRight, ChevronRight, Wrench } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { TOOL_CATEGORIES } from "@/config/navigation";

// ─────────────────────────────────────────────
// Animation variants
// ─────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.22, 0.61, 0.36, 1] as [number, number, number, number],
    },
  },
};

// ─────────────────────────────────────────────
// Lucide icon resolver
// ─────────────────────────────────────────────

function resolveLucideIcon(name: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon | undefined>;
  return icons[name] ?? Wrench;
}

// ─────────────────────────────────────────────
// Desktop Category Card (full card with description)
// ─────────────────────────────────────────────

interface CategoryCardProps {
  id: string;
  label: string;
  description: string;
  iconName: string;
  gradient: string;
  toolCount: number;
  href: string;
  shouldReduce: boolean;
}

function CategoryCard({
  label,
  description,
  iconName,
  gradient,
  toolCount,
  href,
  shouldReduce,
}: CategoryCardProps) {
  const Icon = resolveLucideIcon(iconName);

  return (
    <motion.div variants={shouldReduce ? undefined : cardVariants}>
      <Link
        href={href}
        className={clsx(
          "group relative flex flex-col gap-4 rounded-2xl",
          "border border-card-border bg-card p-5 sm:p-6",
          "transition-all duration-250",
          "hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        )}
        aria-label={`${label} — ${toolCount} tools`}
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
          <div className="absolute inset-0 rounded-2xl bg-card opacity-[0.97]" />
        </div>

        {/* Content — sits above overlay */}
        <div className="relative">
          {/* Icon */}
          <div
            className={clsx(
              "flex h-12 w-12 items-center justify-center rounded-xl",
              `bg-gradient-to-br ${gradient}`,
              "shadow-md transition-all duration-250",
              "group-hover:shadow-lg group-hover:scale-110"
            )}
            aria-hidden="true"
          >
            <Icon className="h-6 w-6 text-white" />
          </div>

          {/* Text */}
          <div className="mt-4">
            <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
              {label}
            </h3>
            <p className="mt-1 text-sm text-foreground-muted line-clamp-2 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between">
            <span
              className={clsx(
                "inline-flex items-center rounded-full px-2 py-0.5",
                "text-xs font-medium",
                "bg-background-muted text-foreground-muted border border-border"
              )}
            >
              {toolCount} tools
            </span>
            <ArrowRight
              className={clsx(
                "h-4 w-4 text-foreground-subtle",
                "group-hover:text-primary group-hover:translate-x-0.5",
                "transition-all duration-200"
              )}
              aria-hidden="true"
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Mobile Category Card (compact: icon + name + count)
// ─────────────────────────────────────────────

function MobileCategoryCard({
  label,
  iconName,
  gradient,
  toolCount,
  href,
}: Omit<CategoryCardProps, "description" | "shouldReduce">) {
  const Icon = resolveLucideIcon(iconName);

  return (
    <Link
      href={href}
      className={clsx(
        "snap-start shrink-0 w-36",
        "group relative flex flex-col items-center gap-2.5 rounded-2xl",
        "border border-card-border bg-card p-4",
        "transition-all duration-200 active:scale-95",
        "hover:border-primary/25 hover:shadow-lg",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
      aria-label={`${label} — ${toolCount} tools`}
    >
      {/* Icon */}
      <div
        className={clsx(
          "flex h-12 w-12 items-center justify-center rounded-xl",
          `bg-gradient-to-br ${gradient}`,
          "shadow-md transition-all duration-200",
          "group-hover:shadow-lg group-hover:scale-105"
        )}
        aria-hidden="true"
      >
        <Icon className="h-6 w-6 text-white" />
      </div>

      {/* Name */}
      <p className="text-sm font-semibold text-foreground text-center leading-snug group-hover:text-primary transition-colors duration-200 line-clamp-1">
        {label}
      </p>

      {/* Tool count */}
      <span
        className={clsx(
          "inline-flex items-center rounded-full px-2 py-0.5",
          "text-xs font-medium",
          "bg-background-muted text-foreground-muted border border-border"
        )}
      >
        {toolCount} tools
      </span>
    </Link>
  );
}

// ─────────────────────────────────────────────
// Scroll hint — shows fade + chevron on right edge
// ─────────────────────────────────────────────

function ScrollHint({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div
      className={clsx(
        "pointer-events-none absolute right-0 top-0 bottom-3 w-16",
        "bg-gradient-to-l from-background via-background/80 to-transparent",
        "flex items-center justify-end pr-2",
        "transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0"
      )}
      aria-hidden="true"
    >
      <div className="flex items-center gap-0.5 text-foreground-subtle">
        <span className="text-xs font-medium">scroll</span>
        <ChevronRight className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CategoryGrid
// ─────────────────────────────────────────────

/**
 * CategoryGrid — Client Component (Framer Motion scroll animations)
 *
 * Mobile:  horizontal scrollable row (TinyWow-style) with compact icon+name+count cards
 * Desktop: 6-column grid with full description cards
 */
export function CategoryGrid() {
  const shouldReduce = useReducedMotion() ?? false;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);

  // Hide the scroll hint once the user has scrolled a bit
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
      aria-labelledby="categories-heading"
    >
      {/* Section header — stacks on mobile, inline on sm+ */}
      <div className="flex flex-col gap-2 mb-6 sm:flex-row sm:items-end sm:justify-between sm:mb-8">
        <div>
          <h2
            id="categories-heading"
            className="text-2xl sm:text-3xl font-bold text-foreground"
          >
            Browse by category
          </h2>
          <p className="mt-1.5 text-sm text-foreground-muted">
            Pick a category to explore all available tools
          </p>
        </div>
        {/* "View all" visible on both mobile and desktop */}
        <Link
          href="/tools"
          className={clsx(
            "self-start sm:self-auto inline-flex items-center gap-1",
            "text-sm font-medium text-primary",
            "hover:underline underline-offset-4",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          )}
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      {/* ── Mobile: horizontal scroll row ── */}
      {/*
       * hide scrollbar cross-browser:
       *   [&::-webkit-scrollbar]:hidden  → Chrome/Safari
       *   [-ms-overflow-style:none]       → IE/Edge
       *   [scrollbar-width:none]          → Firefox
       */}
      <div className="relative sm:hidden">
        <div
          ref={scrollRef}
          className={clsx(
            "flex overflow-x-auto gap-3 pb-3 -mx-4 px-4",
            "snap-x snap-mandatory",
            "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          )}
          role="list"
          aria-label="Tool categories"
        >
          {TOOL_CATEGORIES.map((cat) => (
            <div key={cat.id} role="listitem" className="contents">
              <MobileCategoryCard
                id={cat.id}
                label={cat.label}
                iconName={cat.iconName}
                gradient={cat.gradient}
                toolCount={cat.toolCount}
                href={cat.href}
              />
            </div>
          ))}
          {/* Trailing spacer so last card doesn't abut the edge */}
          <div className="shrink-0 w-4" aria-hidden="true" />
        </div>

        {/* Fade + "scroll →" hint */}
        <ScrollHint visible={showScrollHint} />
      </div>

      {/* ── Desktop: 6-column grid (unchanged) ── */}
      <motion.div
        className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4"
        role="list"
        aria-label="Tool categories"
        variants={shouldReduce ? undefined : containerVariants}
        initial={shouldReduce ? "visible" : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        {TOOL_CATEGORIES.map((cat) => (
          <div key={cat.id} role="listitem">
            <CategoryCard {...cat} shouldReduce={shouldReduce} />
          </div>
        ))}
      </motion.div>
    </section>
  );
}
