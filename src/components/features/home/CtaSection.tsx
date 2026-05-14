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
// Premium animated gradient orbs
// ─────────────────────────────────────────────

function PremiumOrbs({ shouldReduce }: { shouldReduce: boolean }) {
  const orb1 = shouldReduce
    ? { scale: 1, opacity: 0.5 }
    : { scale: [1, 1.2, 1] as number[], opacity: [0.5, 0.85, 0.5] as number[] };
  const orb2 = shouldReduce
    ? { scale: 1, opacity: 0.4 }
    : { scale: [1, 1.15, 1] as number[], opacity: [0.4, 0.7, 0.4] as number[] };
  const orb3 = shouldReduce
    ? { scale: 1, opacity: 0.45 }
    : { scale: [1, 1.25, 1] as number[], opacity: [0.45, 0.8, 0.45] as number[] };

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Violet primary orb */}
      <motion.div
        className="absolute -top-32 -right-32 h-96 w-96 rounded-full"
        style={{
          background: "radial-gradient(circle, oklch(55% 0.24 285 / 0.3) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
        animate={orb1}
        transition={{ duration: 9, repeat: shouldReduce ? 0 : Infinity, ease: "easeInOut" }}
      />
      {/* Center orb */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, oklch(58% 0.22 248 / 0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={orb2}
        transition={{ duration: 12, repeat: shouldReduce ? 0 : Infinity, ease: "easeInOut", delay: 2 }}
      />
      {/* Bottom left amber orb */}
      <motion.div
        className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full"
        style={{
          background: "radial-gradient(circle, oklch(65% 0.2 50 / 0.25) 0%, transparent 70%)",
          filter: "blur(45px)",
        }}
        animate={orb3}
        transition={{ duration: 8, repeat: shouldReduce ? 0 : Infinity, ease: "easeInOut", delay: 4 }}
      />
      {/* Top accent orb */}
      <motion.div
        className="absolute top-1/4 left-1/4 h-48 w-48 rounded-full"
        style={{
          background: "radial-gradient(circle, oklch(62% 0.18 195 / 0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
        animate={orb1}
        transition={{ duration: 11, repeat: shouldReduce ? 0 : Infinity, ease: "easeInOut", delay: 1 }}
      />
      {/* Noise overlay */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")" }} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Feature bullet
// ─────────────────────────────────────────────

function FeatureBullet({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2.5">
      <span
        className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
        style={{ width: "1.375rem", height: "1.375rem" }}
        aria-hidden="true"
      >
        <Check className="h-3 w-3 text-white" />
      </span>
      <span className="text-sm font-medium text-white/85">{text}</span>
    </li>
  );
}

// ─────────────────────────────────────────────
// CtaSection — premium glass morphism over brand gradient
// ─────────────────────────────────────────────

export function CtaSection() {
  const shouldReduce = useReducedMotion() ?? false;

  const features = [
    "No account needed",
    "200+ tools at your fingertips",
    "Free forever — no credit card",
  ];

  return (
    <section
      className="relative overflow-hidden py-20 lg:py-32"
      aria-labelledby="cta-heading"
    >
      {/* Brand gradient base */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: "linear-gradient(135deg, oklch(55% 0.22 285) 0%, oklch(58% 0.2 248) 50%, oklch(55% 0.24 285) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Animated orbs */}
      <PremiumOrbs shouldReduce={shouldReduce} />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, oklch(0.15 0.05 285 / 0.5) 100%)",
        }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center gap-6 max-w-2xl mx-auto">
          {/* Premium icon */}
          <motion.div
            initial={shouldReduce ? undefined : { opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className={clsx(
              "relative flex h-18 w-18 items-center justify-center rounded-2xl",
              "bg-primary/15 backdrop-blur-xl shadow-2xl",
              "border border-primary/30"
            )}
            style={{ width: "4.5rem", height: "4.5rem" }}
            aria-hidden="true"
          >
            <Zap className="h-9 w-9 text-white" />
            {/* Glow ring */}
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: "radial-gradient(circle, oklch(65% 0.3 50 / 0.4) 0%, transparent 70%)",
                filter: "blur(8px)",
              }}
            />
          </motion.div>

          {/* Headline */}
          <motion.h2
            id="cta-heading"
            initial={shouldReduce ? undefined : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.05, ease: EASE_OUT }}
            className={clsx(
              "text-3xl sm:text-4xl lg:text-5xl font-black text-white text-balance",
              "leading-[1.08] tracking-tight"
            )}
          >
            Start Creating for Free
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            initial={shouldReduce ? undefined : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1, ease: EASE_OUT }}
            className="text-lg text-white/80 max-w-md text-pretty"
          >
            Join 2 million+ users who save hours every week with ToolHive&apos;s
            AI-powered tool suite.
          </motion.p>

          {/* Feature bullets */}
          <motion.ul
            initial={shouldReduce ? undefined : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.15, ease: EASE_OUT }}
            className="flex flex-col sm:flex-row items-center gap-3 sm:gap-7"
            aria-label="Key features"
          >
            {features.map((f) => (
              <FeatureBullet key={f} text={f} />
            ))}
          </motion.ul>

          {/* CTA buttons */}
          <motion.div
            initial={shouldReduce ? undefined : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.2, ease: EASE_OUT }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            {/* Primary — white glass */}
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/tools"
                className={clsx(
                  "inline-flex w-full sm:w-auto items-center justify-center gap-2.5",
                  "rounded-2xl bg-white px-9 py-4",
                  "text-base font-bold shadow-2xl shadow-black/20",
                  "hover:bg-white/95 hover:shadow-3xl hover:shadow-black/30",
                  "transition-all duration-250 active:scale-[0.98]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-violet-600"
                )}
              >
                Explore Tools
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </motion.div>

            {/* Secondary — glass outline */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/tools/pdf"
                className={clsx(
                  "inline-flex w-full sm:w-auto items-center justify-center gap-2.5",
                  "rounded-2xl border-2 border-white/40 bg-white/10 backdrop-blur-xl px-9 py-4",
                  "text-base font-semibold text-white",
                  "hover:bg-white/20 hover:border-white/60 hover:shadow-xl hover:shadow-black/20",
                  "transition-all duration-250 active:scale-[0.98]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-violet-600"
                )}
              >
                Try PDF Tools
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust note */}
          <motion.p
            initial={shouldReduce ? undefined : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="text-sm text-white/50"
          >
            No account needed &middot; No credit card &middot; 100% free forever
          </motion.p>
        </div>
      </div>
    </section>
  );
}