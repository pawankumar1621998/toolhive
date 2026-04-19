"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Zap, Check } from "lucide-react";
import { clsx } from "clsx";
import { motion, useReducedMotion } from "framer-motion";

// ─────────────────────────────────────────────
// Shared easing
// ─────────────────────────────────────────────

const EASE_OUT: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

// ─────────────────────────────────────────────
// Animated gradient orbs — decorative background
// ─────────────────────────────────────────────

function GradientOrbs({ shouldReduce }: { shouldReduce: boolean }) {
  const orb1 = shouldReduce
    ? { scale: 1, opacity: 0.6 }
    : { scale: [1, 1.15, 1] as number[], opacity: [0.6, 1, 0.6] as number[] };
  const orb2 = shouldReduce
    ? { scale: 1, opacity: 0.4 }
    : { scale: [1, 1.1, 1] as number[], opacity: [0.4, 0.7, 0.4] as number[] };
  const orb3 = shouldReduce
    ? { scale: 1, opacity: 0.5 }
    : { scale: [1, 1.2, 1] as number[], opacity: [0.5, 0.9, 0.5] as number[] };

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/15 blur-3xl"
        animate={orb1}
        transition={{ duration: 8, repeat: shouldReduce ? 0 : Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-white/8 blur-3xl"
        animate={orb2}
        transition={{ duration: 10, repeat: shouldReduce ? 0 : Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/12 blur-3xl"
        animate={orb3}
        transition={{ duration: 7, repeat: shouldReduce ? 0 : Infinity, ease: "easeInOut", delay: 2 }}
      />
      {/* Subtle noise overlay */}
      <div className="absolute inset-0 opacity-[0.06] noise" />
    </div>
  );
}

// ─────────────────────────────────────────────
// Feature bullet
// ─────────────────────────────────────────────

function FeatureBullet({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20"
        aria-hidden="true"
      >
        <Check className="h-3 w-3 text-white" />
      </span>
      <span className="text-sm text-white/85">{text}</span>
    </li>
  );
}

// ─────────────────────────────────────────────
// CtaSection
// ─────────────────────────────────────────────

/**
 * CtaSection — Client Component
 *
 * Full-width gradient CTA banner at the bottom of the homepage.
 * Animated gradient orbs, bold headline, feature bullets, and two CTA buttons.
 */
export function CtaSection() {
  const shouldReduce = useReducedMotion() ?? false;

  const features = [
    "No account needed",
    "200+ tools at your fingertips",
    "Free forever — no credit card",
  ];

  return (
    <section
      className="relative overflow-hidden py-20 lg:py-28"
      aria-labelledby="cta-heading"
    >
      {/* Brand gradient base */}
      <div className="absolute inset-0 bg-gradient-brand -z-10" aria-hidden="true" />

      {/* Animated orbs */}
      <GradientOrbs shouldReduce={shouldReduce} />

      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center gap-6 max-w-2xl mx-auto">
          {/* Icon */}
          <motion.div
            initial={shouldReduce ? undefined : { opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            className={clsx(
              "flex h-16 w-16 items-center justify-center rounded-2xl",
              "bg-white/20 shadow-xl backdrop-blur-sm",
              "border border-white/30"
            )}
            aria-hidden="true"
          >
            <Zap className="h-8 w-8 text-white" />
          </motion.div>

          {/* Headline */}
          <motion.h2
            id="cta-heading"
            initial={shouldReduce ? undefined : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05, ease: EASE_OUT }}
            className={clsx(
              "text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white text-balance",
              "leading-[1.1] tracking-tight"
            )}
          >
            Start Creating for Free
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            initial={shouldReduce ? undefined : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: EASE_OUT }}
            className="text-lg text-white/80 max-w-md text-pretty"
          >
            Join 2 million+ users who save hours every week with ToolHive&apos;s
            AI-powered tool suite.
          </motion.p>

          {/* Feature bullets */}
          <motion.ul
            initial={shouldReduce ? undefined : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15, ease: EASE_OUT }}
            className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6"
            aria-label="Key features"
          >
            {features.map((f) => (
              <FeatureBullet key={f} text={f} />
            ))}
          </motion.ul>

          {/* CTA buttons */}
          <motion.div
            initial={shouldReduce ? undefined : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease: EASE_OUT }}
            className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
          >
            {/* Primary — white solid */}
            <Link
              href="/tools"
              className={clsx(
                "inline-flex w-full sm:w-auto items-center justify-center gap-2",
                "rounded-xl bg-white px-8 py-3.5",
                "text-base font-bold text-primary",
                "shadow-xl hover:bg-white/90 hover:shadow-2xl",
                "transition-all duration-200 active:scale-[0.98]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              )}
            >
              Explore Tools
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>

            {/* Secondary — ghost outline */}
            <Link
              href="/tools/pdf"
              className={clsx(
                "inline-flex w-full sm:w-auto items-center justify-center gap-2",
                "rounded-xl border border-white/40 bg-white/10 px-8 py-3.5",
                "text-base font-semibold text-white",
                "hover:bg-white/20 hover:border-white/60",
                "backdrop-blur-sm",
                "transition-all duration-200 active:scale-[0.98]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              )}
            >
              Try PDF Tools
            </Link>
          </motion.div>

          {/* Trust note */}
          <motion.p
            initial={shouldReduce ? undefined : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="text-xs text-white/55"
          >
            No account needed &middot; No credit card &middot; 100% free forever
          </motion.p>
        </div>
      </div>
    </section>
  );
}
