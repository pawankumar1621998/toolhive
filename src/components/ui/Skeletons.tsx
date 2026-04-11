import React from "react";
import { clsx } from "clsx";

// ─────────────────────────────────────────────
// Base Skeleton atom
// ─────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
}

/**
 * Base skeleton block with shimmer animation.
 * Compose into larger skeletons for specific UI shapes.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={clsx(
        "animate-shimmer rounded-lg bg-background-muted",
        className
      )}
      aria-hidden="true"
    />
  );
}

// ─────────────────────────────────────────────
// ToolCard Skeleton — single card
// ─────────────────────────────────────────────

/**
 * Skeleton for a single ToolCard component.
 * Matches the icon + name + description layout.
 */
export function ToolCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-border bg-card p-5 space-y-3",
        className
      )}
      aria-hidden="true"
    >
      {/* Header row: icon + name/category */}
      <div className="flex items-start gap-3">
        <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2 pt-0.5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        {/* Badge placeholder */}
        <Skeleton className="h-5 w-12 rounded-full shrink-0" />
      </div>
      {/* Description lines */}
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      {/* Footer: usage count + CTA */}
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ToolsGrid Skeleton — fills a responsive grid
// ─────────────────────────────────────────────

interface ToolsGridSkeletonProps {
  /** Number of placeholder cards to render. Defaults to 9. */
  count?: number;
  className?: string;
}

/**
 * Skeleton loader for the main tools grid (e.g. category pages, search results).
 * Renders `count` ToolCardSkeletons in a responsive grid layout.
 */
export function ToolsGridSkeleton({
  count = 9,
  className,
}: ToolsGridSkeletonProps) {
  return (
    <div
      className={clsx(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
        className
      )}
      aria-busy="true"
      aria-label="Loading tools"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ToolCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// SectionSkeleton — titled section with grid
// ─────────────────────────────────────────────

interface SectionSkeletonProps {
  /** Grid rows to render (each row = 4 cards on XL). Defaults to 2. */
  rows?: number;
  className?: string;
}

/**
 * Skeleton for a full page section with a heading, subtitle, and tool grid.
 * Used on the home page while data is loading.
 */
export function SectionSkeleton({ rows = 2, className }: SectionSkeletonProps) {
  const count = rows * 4;
  return (
    <section
      className={clsx("container mx-auto px-4 py-16", className)}
      aria-busy="true"
      aria-label="Loading section"
    >
      {/* Section heading */}
      <div className="mb-8 space-y-3">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <ToolCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// HistoryItem Skeleton
// ─────────────────────────────────────────────

/**
 * Skeleton for a single dashboard history list item.
 */
export function HistoryItemSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "flex items-center gap-4 rounded-xl border border-border bg-card p-4",
        className
      )}
      aria-hidden="true"
    >
      <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-24 rounded-lg shrink-0" />
    </div>
  );
}

// ─────────────────────────────────────────────
// Text Skeleton — inline loading placeholder
// ─────────────────────────────────────────────

/**
 * Inline text-width skeleton. Use as a drop-in where a single word or
 * short phrase would normally appear.
 *
 * @example
 * <TextSkeleton width="w-20" />
 */
export function TextSkeleton({ width = "w-24" }: { width?: string }) {
  return (
    <Skeleton className={clsx("inline-block h-4 rounded", width)} />
  );
}

// ─────────────────────────────────────────────
// CategoryCard Skeleton
// ─────────────────────────────────────────────

/**
 * Skeleton for a CategoryCard on the home page grid.
 */
export function CategoryCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-border bg-card p-6 space-y-4",
        className
      )}
      aria-hidden="true"
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// DashboardStat Skeleton
// ─────────────────────────────────────────────

/**
 * Skeleton for a dashboard stat/metric card.
 */
export function DashboardStatSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-border bg-card p-5 space-y-3",
        className
      )}
      aria-hidden="true"
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-36" />
    </div>
  );
}
