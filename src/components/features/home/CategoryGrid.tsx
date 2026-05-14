"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import * as LucideIcons from "lucide-react";
import { type LucideIcon, ArrowRight, Wrench } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { TOOL_CATEGORIES } from "@/config/navigation";

// ─────────────────────────────────────────────
// Animation variants
// ─────────────────────────────────────────────

const EASE_OUT: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: EASE_OUT,
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

// Category gradients for premium glow
const CATEGORY_GLOW: Record<string, string> = {
  pdf:          "hover:shadow-[0_8px_32px_oklch(65%_0.17_50_/_0.2)]",
  image:        "hover:shadow-[0_8px_32px_oklch(55%_0.22_285_/_0.2)]",
  video:        "hover:shadow-[0_8px_32px_oklch(58%_0.2_248_/_0.2)]",
  "ai-writing": "hover:shadow-[0_8px_32px_oklch(72%_0.16_160_/_0.2)]",
  audio:        "hover:shadow-[0_8px_32px_oklch(72%_0.18_70_/_0.2)]",
  converter:    "hover:shadow-[0_8px_32px_oklch(62%_0.18_195_/_0.2)]",
  resume:       "hover:shadow-[0_8px_32px_oklch(55%_0.22_270_/_0.2)]",
  calculator:   "hover:shadow-[0_8px_32px_oklch(65%_0.17_50_/_0.2)]",
  generators:    "hover:shadow-[0_8px_32px_oklch(60%_0.18_195_/_0.2)]",
  "text-writing": "hover:shadow-[0_8px_32px_oklch(70%_0.16_160_/_0.2)]",
  utilities:    "hover:shadow-[0_8px_32px_oklch(55%_0.08_0_/_0.15)]",
  device:       "hover:shadow-[0_8px_32px_oklch(55%_0.08_240_/_0.15)]",
  finance:      "hover:shadow-[0_8px_32px_oklch(70%_0.16_145_/_0.2)]",
  productivity: "hover:shadow-[0_8px_32px_oklch(72%_0.18_70_/_0.2)]",
  code:         "hover:shadow-[0_8px_32px_oklch(55%_0.2_248_/_0.2)]",
  seo:          "hover:shadow-[0_8px_32px_oklch(55%_0.22_285_/_0.2)]",
  education:    "hover:shadow-[0_8px_32px_oklch(55%_0.2_248_/_0.2)]",
  health:       "hover:shadow-[0_8px_32px_oklch(65%_0.18_15_/_0.2)]",
  travel:       "hover:shadow-[0_8px_32px_oklch(62%_0.18_195_/_0.2)]",
  entertainment:"hover:shadow-[0_8px_32px_oklch(55%_0.22_300_/_0.2)]",
};

function getGlow(categoryId: string): string {
  return CATEGORY_GLOW[categoryId] ?? "hover:shadow-[0_8px_32px_oklch(55%_0.22_285_/_0.2)]";
}

// ─────────────────────────────────────────────
// Desktop Category Card — premium glass morphism
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
  id,
}: CategoryCardProps) {
  const Icon = useMemo(() => resolveLucideIcon(iconName), [iconName]);
  const glowClass = getGlow(id);

  return (
    <motion.div variants={shouldReduce ? undefined : cardVariants}>
      <Link
        href={href}
        className={clsx(
          "group relative flex flex-col gap-4 rounded-2xl",
          "border border-border/50 bg-card/70 backdrop-blur-md p-5 sm:p-6",
          "transition-all duration-300",
          "hover:-translate-y-1.5 hover:border-primary/30",
          "hover:shadow-xl hover:shadow-black/10",
          glowClass,
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2"
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
          <div className="absolute inset-0 rounded-2xl bg-card/95 backdrop-blur-md opacity-[0.97]" />
        </div>

        {/* Content */}
        <div className="relative">
          {/* Premium icon with animated glow on hover */}
          <div
            className={clsx(
              "flex h-13 w-13 items-center justify-center rounded-2xl",
              `bg-gradient-to-br ${gradient}`,
              "shadow-lg transition-all duration-300",
              "group-hover:shadow-xl group-hover:scale-110"
            )}
            style={{ width: "3.25rem", height: "3.25rem" }}
            aria-hidden="true"
          >
            {/* eslint-disable-next-line react-hooks/static-components */}
            <Icon className="h-6 w-6 text-white" />
            {/* Glow ring on hover */}
            <div
              className={clsx(
                "absolute inset-0 rounded-2xl opacity-0",
                "group-hover:opacity-100 transition-opacity duration-300",
                `bg-gradient-to-br ${gradient} blur-xl`
              )}
              style={{ transform: "scale(1.3)" }}
              aria-hidden="true"
            />
          </div>

          {/* Text */}
          <div className="mt-4">
            <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors duration-200">
              {label}
            </h3>
            <p className="mt-1.5 text-sm text-foreground-muted line-clamp-2 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between">
            <span
              className={clsx(
                "inline-flex items-center rounded-full px-3 py-1",
                "text-xs font-semibold",
                "bg-gradient-to-br from-violet-500/10 to-purple-500/10",
                "border border-violet-500/20 text-violet-600 dark:text-violet-400"
              )}
            >
              {toolCount} tools
            </span>
            <div className={clsx(
              "flex items-center gap-1.5 text-foreground-subtle",
              "group-hover:text-primary dark:group-hover:text-violet-400 group-hover:translate-x-0.5",
              "transition-all duration-200"
            )}>
              <span className="text-xs font-medium">Explore</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Mobile Category Card — compact icon + name + count
// ─────────────────────────────────────────────

function MobileCategoryCard({
  label,
  iconName,
  gradient,
  toolCount,
  href,
  id,
}: Omit<CategoryCardProps, "description" | "shouldReduce">) {
  const Icon = useMemo(() => resolveLucideIcon(iconName), [iconName]);
  const glowClass = getGlow(id);

  return (
    <Link
      href={href}
      className={clsx(
        "group relative flex flex-col items-center gap-3 rounded-2xl",
        "border border-border/50 bg-card/70 backdrop-blur-sm p-4 w-full",
        "transition-all duration-250 active:scale-[0.97]",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-black/10",
        glowClass,
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2"
      )}
      aria-label={`${label} — ${toolCount} tools`}
    >
      {/* Icon */}
      <div
        className={clsx(
          "flex h-14 w-14 items-center justify-center rounded-2xl",
          `bg-gradient-to-br ${gradient}`,
          "shadow-md transition-all duration-250",
          "group-hover:shadow-lg group-hover:scale-105"
        )}
        aria-hidden="true"
      >
        {/* eslint-disable-next-line react-hooks/static-components */}
        <Icon className="h-7 w-7 text-white" />
      </div>

      {/* Name */}
      <p className="text-sm font-bold text-foreground text-center leading-snug group-hover:text-primary transition-colors duration-200">
        {label}
      </p>

      {/* Tool count badge */}
      <span
        className={clsx(
          "inline-flex items-center rounded-full px-2.5 py-0.5",
          "text-xs font-semibold",
          "bg-gradient-to-br from-violet-500/10 to-purple-500/10",
          "border border-violet-500/20 text-violet-600 dark:text-violet-400"
        )}
      >
        {toolCount}
      </span>
    </Link>
  );
}

// ─────────────────────────────────────────────
// CategoryGrid
// ─────────────────────────────────────────────

export function CategoryGrid() {
  const shouldReduce = useReducedMotion() ?? false;

  return (
    <section
      className="container mx-auto px-4 py-14 lg:py-18"
      aria-labelledby="categories-heading"
    >
      {/* Section header */}
      <div className="flex flex-col gap-2 mb-8 sm:flex-row sm:items-end sm:justify-between sm:mb-10">
        <div>
          <h2
            id="categories-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight"
          >
            Browse by category
          </h2>
          <p className="mt-2 text-sm sm:text-base text-foreground-muted">
            Pick a category to explore all available tools
          </p>
        </div>
        <Link
          href="/tools"
          className={clsx(
            "self-start sm:self-auto inline-flex items-center gap-2",
            "text-sm font-semibold text-violet-600 dark:text-violet-400",
            "hover:text-violet-700 dark:hover:text-violet-300 hover:underline underline-offset-4",
            "transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
          )}
        >
          View all
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {/* ── Mobile: 2-column grid ── */}
      <div className="sm:hidden">
        <div
          className="grid grid-cols-2 gap-3"
          role="list"
          aria-label="Tool categories"
        >
          {TOOL_CATEGORIES.map((cat) => (
            <div key={cat.id} role="listitem">
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
        </div>
      </div>

      {/* ── Desktop: 4-column grid ── */}
      <motion.div
        className="hidden sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4"
        role="list"
        aria-label="Tool categories"
        variants={shouldReduce ? undefined : containerVariants}
        initial={shouldReduce ? "visible" : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
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