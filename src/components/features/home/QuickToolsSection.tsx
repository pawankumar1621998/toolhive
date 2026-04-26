"use client";

import React from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { ArrowRight, Zap } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

// ─── Quick Tools (same as Navbar "More → Quick Tools") ────────────────────────

const QUICK_TOOLS = [
  { label: "QR & Barcode",        href: "/qr-barcode",          icon: "📱" },
  { label: "Invoice Generator",   href: "/invoice-generator",   icon: "🧾" },
  { label: "Pomodoro Timer",      href: "/pomodoro",            icon: "⏱️" },
  { label: "Color Palette",       href: "/color-palette",       icon: "🎨" },
  { label: "Typing Test",         href: "/typing-test",         icon: "⌨️" },
  { label: "Countdown Timer",     href: "/countdown",           icon: "⏳" },
  { label: "Spin Wheel",          href: "/spin-wheel",          icon: "🎡" },
  { label: "Password Generator",  href: "/password-generator",  icon: "🔐" },
  { label: "Stopwatch",           href: "/stopwatch",           icon: "⏱️" },
  { label: "Name Picker",         href: "/name-picker",         icon: "🎯" },
  { label: "Budget Planner",      href: "/budget-planner",      icon: "💰" },
  { label: "Flashcard AI",        href: "/flashcard",           icon: "🃏" },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function QuickToolsSection() {
  const shouldReduce = useReducedMotion() ?? false;

  return (
    <section className="container mx-auto px-4 py-10 lg:py-14" aria-labelledby="quick-tools-heading">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-3">
            <Zap className="h-3 w-3" />
            Instant Use
          </div>
          <h2 id="quick-tools-heading" className="text-2xl sm:text-3xl font-bold text-foreground">
            Quick Tools
          </h2>
          <p className="mt-1.5 text-sm text-foreground-muted">
            One-click utilities — no setup, works instantly
          </p>
        </div>
      </div>

      {/* Grid — 3-col on mobile, 4-col on sm, 6-col on lg */}
      <motion.div
        className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3"
        role="list"
        initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
      >
        {QUICK_TOOLS.map((tool) => (
          <div key={tool.href} role="listitem">
            <Link
              href={tool.href}
              className={clsx(
                "group flex flex-col items-center gap-2 rounded-2xl p-3 sm:p-4 text-center",
                "border border-card-border bg-card",
                "transition-all duration-200",
                "hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg hover:bg-primary/5",
                "active:scale-[0.97]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
              aria-label={tool.label}
            >
              <span className="text-2xl sm:text-3xl leading-none transition-transform duration-200 group-hover:scale-110">
                {tool.icon}
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-foreground-muted group-hover:text-primary transition-colors leading-snug">
                {tool.label}
              </span>
            </Link>
          </div>
        ))}
      </motion.div>

      {/* View all tools CTA */}
      <div className="mt-6 flex justify-center">
        <Link
          href="/tools"
          className={clsx(
            "inline-flex items-center gap-2 rounded-xl",
            "bg-gradient-to-r from-primary to-violet-500",
            "px-6 py-3 text-sm font-semibold text-white",
            "shadow-md hover:opacity-90 hover:shadow-lg transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
        >
          Explore all 200+ Tools
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
