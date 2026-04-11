"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowRight,
  Sparkles,
  FileText,
  Image,
  Video,
  Pen,
  Music,
  ArrowRightLeft,
  X,
  TrendingUp,
  Users,
  Zap,
  ShieldOff,
} from "lucide-react";
import { clsx } from "clsx";
import { motion, useReducedMotion, AnimatePresence, type Variants } from "framer-motion";
import { TOOL_CATEGORIES } from "@/config/navigation";

// ─────────────────────────────────────────────
// Icon map for category pills
// ─────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  FileText,
  Image,
  Video,
  Pen,
  Music,
  ArrowRightLeft,
};

// ─────────────────────────────────────────────
// Floating badge data — decorative tool callouts
// ─────────────────────────────────────────────

const FLOATING_BADGES = [
  { label: "Background Removed", sub: "AI-powered", icon: "✨", x: "left-4 top-1/4", delay: 0 },
  { label: "PDF Compressed", sub: "87% smaller", icon: "📄", x: "right-6 top-1/3", delay: 0.3 },
  { label: "Video Trimmed", sub: "Exported in 3s", icon: "🎬", x: "left-8 bottom-1/4", delay: 0.6 },
  { label: "Text Translated", sub: "52 languages", icon: "🌐", x: "right-4 bottom-1/3", delay: 0.15 },
];

// ─────────────────────────────────────────────
// Animation variants
// ─────────────────────────────────────────────

const EASE_OUT: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.05,
    },
  },
};

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.52, ease: EASE_OUT },
  },
};

const scaleInVariant: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.42, ease: EASE_OUT },
  },
};

// ─────────────────────────────────────────────
// Animated mesh background orbs
// Reduced on mobile for performance — full set on lg+
// ─────────────────────────────────────────────

function MeshBackground({ shouldReduce }: { shouldReduce: boolean }) {
  const orb1Animate = shouldReduce
    ? { scale: 1, opacity: 0.7 }
    : { scale: [1, 1.08, 1] as number[], opacity: [0.7, 1, 0.7] as number[] };
  const orb2Animate = shouldReduce
    ? { scale: 1, opacity: 0.6 }
    : { scale: [1, 1.12, 1] as number[], opacity: [0.6, 0.9, 0.6] as number[] };
  const orb3Animate = shouldReduce
    ? { scale: 1, opacity: 0.5 }
    : { scale: [1, 1.1, 1] as number[], opacity: [0.5, 0.8, 0.5] as number[] };

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-background" />

      {/*
       * Orb 1 — always rendered but smaller on mobile
       * On mobile (< lg) we scale down the orb significantly to avoid heavy GPU paint.
       */}
      <motion.div
        className="absolute -top-32 -left-32 h-[350px] w-[350px] lg:h-[600px] lg:w-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(55% 0.22 285 / 0.12) 0%, transparent 70%)",
        }}
        animate={orb1Animate}
        transition={{ duration: 7, repeat: shouldReduce ? 0 : Infinity, ease: "easeInOut" }}
      />

      {/* Orb 2 — hidden on mobile, visible on lg+ */}
      <motion.div
        className="absolute -top-20 right-0 h-[500px] w-[500px] rounded-full hidden lg:block"
        style={{
          background:
            "radial-gradient(circle, oklch(58% 0.2 248 / 0.1) 0%, transparent 70%)",
        }}
        animate={orb2Animate}
        transition={{ duration: 9, repeat: shouldReduce ? 0 : Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Orb 3 — hidden on mobile, visible on lg+ */}
      <motion.div
        className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full hidden lg:block"
        style={{
          background:
            "radial-gradient(circle, oklch(62% 0.18 195 / 0.08) 0%, transparent 70%)",
        }}
        animate={orb3Animate}
        transition={{ duration: 8, repeat: shouldReduce ? 0 : Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Subtle grid — hidden on mobile (performance) */}
      <div
        className="absolute inset-0 opacity-[0.03] hidden sm:block"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// Floating badge card — desktop-only decorative
// ─────────────────────────────────────────────

function FloatingBadge({
  label,
  sub,
  icon,
  posClass,
  delay,
  shouldReduce,
}: {
  label: string;
  sub: string;
  icon: string;
  posClass: string;
  delay: number;
  shouldReduce: boolean;
}) {
  const floatAnimate = shouldReduce
    ? { opacity: 1, scale: 1, y: 0 }
    : { opacity: 1, scale: 1, y: [0, -6, 0] as number[] };

  const floatTransition = shouldReduce
    ? { opacity: { delay: delay + 0.8, duration: 0.5 }, scale: { delay: delay + 0.8, duration: 0.5 } }
    : {
        opacity: { delay: delay + 0.8, duration: 0.5 },
        scale: { delay: delay + 0.8, duration: 0.5 },
        y: { delay: delay + 0.8, duration: 3.5, repeat: Infinity, ease: "easeInOut" as const },
      };

  return (
    <motion.div
      className={clsx(
        "absolute hidden xl:flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5",
        "glass-card shadow-xl border border-card-border",
        "pointer-events-none select-none",
        posClass
      )}
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={floatAnimate}
      transition={floatTransition}
    >
      <span className="text-lg leading-none">{icon}</span>
      <div>
        <p className="text-xs font-semibold text-foreground leading-none">{label}</p>
        <p className="text-xs text-foreground-muted mt-0.5 leading-none">{sub}</p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Search bar
// Full-width on mobile with taller touch target
// ─────────────────────────────────────────────

function HeroSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <form
      onSubmit={handleSearch}
      role="search"
      className={clsx(
        "group relative flex w-full items-center",
        "rounded-2xl border bg-card shadow-xl",
        "transition-all duration-300",
        isFocused
          ? "border-primary/50 shadow-[0_0_0_4px_color-mix(in_oklch,var(--color-primary)_12%,transparent),0_20px_40px_-10px_rgb(0_0_0/0.15)]"
          : "border-card-border hover:border-border-strong hover:shadow-2xl"
      )}
      aria-label="Search tools"
    >
      {/* Search icon */}
      <div className="pointer-events-none pl-4 pr-3 shrink-0">
        <Search
          className={clsx(
            "h-5 w-5 transition-colors duration-200",
            isFocused ? "text-primary" : "text-foreground-subtle"
          )}
          aria-hidden="true"
        />
      </div>

      {/* Input — h-12 on mobile for comfortable tap target, h-11 on sm+ */}
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Search 200+ free AI tools..."
        className={clsx(
          "flex-1 bg-transparent text-sm text-foreground",
          "h-12 sm:h-11",
          "placeholder:text-foreground-subtle",
          "focus:outline-none",
          "min-w-0"
        )}
        aria-label="Search tools"
        autoComplete="off"
      />

      {/* Clear button */}
      <AnimatePresence>
        {query && (
          <motion.button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
            className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background-muted text-foreground-subtle hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Submit button */}
      <div className="p-1.5 shrink-0">
        <button
          type="submit"
          className={clsx(
            "flex items-center gap-1.5 rounded-xl px-4 sm:px-5",
            "h-9 sm:h-10", // matches input height on each breakpoint
            "bg-gradient-brand text-white text-sm font-semibold",
            "shadow-md hover:opacity-90 hover:shadow-lg",
            "transition-all duration-200 active:scale-95",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
          aria-label="Search"
        >
          <span className="hidden xs:inline">Search</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────
// Category pill
// ─────────────────────────────────────────────

function CategoryPill({
  cat,
}: {
  cat: (typeof TOOL_CATEGORIES)[number];
}) {
  const Icon = CATEGORY_ICONS[cat.iconName] ?? FileText;

  return (
    <Link
      href={cat.href}
      className={clsx(
        "group inline-flex items-center gap-1.5 rounded-full",
        "border border-border bg-card/80 px-3.5 py-1.5 backdrop-blur-sm",
        "text-sm font-medium text-foreground-muted",
        "hover:border-primary/40 hover:bg-primary/5 hover:text-primary hover:shadow-sm",
        "transition-all duration-200 whitespace-nowrap",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
      <span>{cat.label}</span>
    </Link>
  );
}

// ─────────────────────────────────────────────
// Stats row — grid on mobile, flex on sm+
// ─────────────────────────────────────────────

function SocialProof() {
  const items = [
    { icon: TrendingUp, value: "10M+", label: "files processed" },
    { icon: Zap, value: "200+", label: "free tools" },
    { icon: Users, value: "2M+", label: "happy users" },
  ];

  return (
    <>
      {/* Mobile: 3-column stacked grid */}
      <div className="grid grid-cols-3 gap-3 w-full sm:hidden" role="list">
        {items.map(({ icon: Icon, value, label }) => (
          <div
            key={label}
            role="listitem"
            className={clsx(
              "flex flex-col items-center gap-1 rounded-xl",
              "border border-border/60 bg-card/60 px-2 py-3",
              "text-center"
            )}
          >
            <Icon className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
            <span className="text-base font-extrabold text-foreground tabular-nums leading-none">
              {value}
            </span>
            <span className="text-xs text-foreground-muted leading-snug">{label}</span>
          </div>
        ))}
      </div>

      {/* sm+: original inline flex row */}
      <div className="hidden sm:flex flex-wrap items-center justify-center gap-3 sm:gap-6">
        {items.map(({ icon: Icon, value, label }, i) => (
          <React.Fragment key={label}>
            <div className="flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium text-foreground-muted whitespace-nowrap">
                {value} {label}
              </span>
            </div>
            {i < items.length - 1 && (
              <span className="h-1 w-1 rounded-full bg-border-strong" aria-hidden="true" />
            )}
          </React.Fragment>
        ))}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// HeroSection
// ─────────────────────────────────────────────

/**
 * HeroSection — Client Component
 *
 * Mobile-first responsive hero:
 * - Search bar: full-width, h-12 on mobile
 * - Category pills: horizontal scroll on mobile
 * - Stats: 3-col stacked grid on mobile
 * - Headline: text-3xl → 4xl → 5xl → 6xl
 * - CTA buttons: full-width on mobile
 * - Background orbs: reduced count on mobile for perf
 * - "No signup" badge: always visible
 */
export function HeroSection() {
  const shouldReduce = useReducedMotion() ?? false;

  return (
    <section
      className={clsx(
        "relative isolate overflow-hidden",
        "pt-12 pb-14 sm:pt-20 sm:pb-24 lg:pt-28 lg:pb-32"
      )}
      aria-labelledby="hero-heading"
    >
      <MeshBackground shouldReduce={shouldReduce} />

      {/* Floating badges — decorative only, xl+ */}
      {FLOATING_BADGES.map((b) => (
        <FloatingBadge
          key={b.label}
          label={b.label}
          sub={b.sub}
          icon={b.icon}
          posClass={b.x}
          delay={b.delay}
          shouldReduce={shouldReduce}
        />
      ))}

      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center gap-5 sm:gap-6"
        >
          {/* Announcement badge */}
          <motion.div variants={fadeUpVariant}>
            <Link
              href="/blog/ai-tools-update"
              className={clsx(
                "group inline-flex items-center gap-2 rounded-full",
                "border border-primary/25 bg-primary/8 px-4 py-1.5",
                "text-xs font-semibold text-primary",
                "hover:bg-primary/12 hover:border-primary/40",
                "transition-all duration-200 backdrop-blur-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>New: AI Background Remover is live</span>
              <ArrowRight
                className="h-3 w-3 group-hover:translate-x-0.5 transition-transform duration-200"
                aria-hidden="true"
              />
            </Link>
          </motion.div>

          {/* Headline — mobile-first scale: 3xl → 4xl → 5xl → 6xl */}
          <motion.h1
            id="hero-heading"
            variants={fadeUpVariant}
            className={clsx(
              "max-w-4xl text-balance",
              "text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl",
              "text-foreground leading-[1.08]"
            )}
          >
            Your All-in-One{" "}
            <span className="text-gradient">AI Toolkit</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeUpVariant}
            className={clsx(
              "max-w-xl text-pretty",
              "text-sm sm:text-base lg:text-lg text-foreground-muted",
              "leading-relaxed"
            )}
          >
            200+ free AI-powered tools for PDF, images, video, and writing.
            No account needed — start processing files instantly.
          </motion.p>

          {/* "No signup required" badge — visible on all screen sizes */}
          <motion.div variants={fadeUpVariant}>
            <span
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-full",
                "border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1",
                "text-xs font-semibold text-emerald-600 dark:text-emerald-400"
              )}
            >
              <ShieldOff className="h-3.5 w-3.5" aria-hidden="true" />
              No signup required — 100% free
            </span>
          </motion.div>

          {/* Search bar — full-width on mobile */}
          <motion.div variants={scaleInVariant} className="w-full sm:max-w-xl">
            <HeroSearchBar />
          </motion.div>

          {/* Category pills — horizontal scroll on mobile, wrap on sm+ */}
          <motion.div variants={fadeUpVariant} className="w-full">
            {/* Mobile: horizontal scroll row */}
            <div className="sm:hidden -mx-4 px-4">
              <div
                className={clsx(
                  "flex gap-2 overflow-x-auto pb-1",
                  "snap-x snap-mandatory",
                  "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                )}
                aria-label="Browse by category"
              >
                <span className="flex items-center text-xs text-foreground-subtle shrink-0 mr-0.5 whitespace-nowrap">
                  Browse:
                </span>
                {TOOL_CATEGORIES.map((cat) => (
                  <div key={cat.id} className="snap-start shrink-0">
                    <CategoryPill cat={cat} />
                  </div>
                ))}
                {/* Trailing spacer */}
                <div className="shrink-0 w-4" aria-hidden="true" />
              </div>
            </div>

            {/* sm+: wrapping flex (original) */}
            <div className="hidden sm:flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-foreground-subtle mr-0.5">Browse:</span>
              {TOOL_CATEGORIES.map((cat) => (
                <CategoryPill key={cat.id} cat={cat} />
              ))}
            </div>
          </motion.div>

          {/* CTA buttons — full-width on mobile, auto on sm+ */}
          <motion.div
            variants={fadeUpVariant}
            className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
          >
            <Link
              href="/tools"
              className={clsx(
                "inline-flex items-center justify-center gap-2 rounded-xl",
                "w-full sm:w-auto px-7 py-3",
                "bg-gradient-brand text-white text-sm font-semibold",
                "shadow-lg hover:opacity-90 hover:shadow-xl",
                "transition-all duration-200 active:scale-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
            >
              Explore all tools
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/tools/pdf"
              className={clsx(
                "inline-flex items-center justify-center gap-2 rounded-xl",
                "w-full sm:w-auto px-7 py-3",
                "border border-border bg-card text-sm font-semibold text-foreground",
                "hover:border-border-strong hover:shadow-md hover:text-primary",
                "transition-all duration-200 active:scale-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
            >
              PDF Tools
            </Link>
          </motion.div>

          {/* Social proof — stacked grid on mobile, row on sm+ */}
          <motion.div variants={fadeUpVariant} className="w-full sm:w-auto">
            <SocialProof />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
