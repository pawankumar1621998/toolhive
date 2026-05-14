"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { ArrowRight, Zap, QrCode, Receipt, Timer, Palette, Keyboard, Hourglass, CircleDot, KeyRound, Target, DollarSign, Layers } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const QUICK_TOOLS = [
  { label: "QR & Barcode",      href: "/qr-barcode",          icon: QrCode,        gradient: "from-violet-500 to-purple-500" },
  { label: "Invoice Generator", href: "/invoice-generator",   icon: Receipt,       gradient: "from-emerald-500 to-teal-400" },
  { label: "Pomodoro Timer",    href: "/pomodoro",             icon: Timer,         gradient: "from-rose-500 to-orange-400"   },
  { label: "Color Palette",    href: "/color-palette",       icon: Palette,       gradient: "from-pink-500 to-rose-400"      },
  { label: "Typing Test",       href: "/typing-test",         icon: Keyboard,      gradient: "from-blue-500 to-cyan-400"     },
  { label: "Countdown Timer",  href: "/countdown",           icon: Hourglass,     gradient: "from-amber-500 to-yellow-400"   },
  { label: "Spin Wheel",       href: "/spin-wheel",          icon: CircleDot,     gradient: "from-purple-500 to-pink-400"   },
  { label: "Password Gen",     href: "/password-generator",  icon: KeyRound,      gradient: "from-sky-500 to-indigo-400"     },
  { label: "Stopwatch",        href: "/stopwatch",           icon: Timer,     gradient: "from-orange-500 to-amber-400"   },
  { label: "Name Picker",       href: "/name-picker",        icon: Target,        gradient: "from-red-500 to-pink-500"       },
  { label: "Budget Planner",    href: "/budget-planner",     icon: DollarSign,     gradient: "from-green-600 to-emerald-500" },
  { label: "Flashcard AI",     href: "/flashcard",           icon: Layers,        gradient: "from-indigo-500 to-purple-600"  },
] as const;

export function QuickToolsSection() {
  const shouldReduce = useReducedMotion() ?? false;

  return (
    <section className="container mx-auto px-4 py-12 lg:py-16" aria-labelledby="quick-tools-heading">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-8 sm:flex-row sm:items-end sm:justify-between sm:mb-10">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 backdrop-blur-sm px-4 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 mb-3">
            <Zap className="h-3.5 w-3.5" />
            Instant Use
          </div>
          <h2 id="quick-tools-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            Quick Tools
          </h2>
          <p className="mt-2 text-sm sm:text-base text-foreground-muted">
            One-click utilities — no setup, works instantly
          </p>
        </div>
      </div>

      {/* Grid */}
      <motion.div
        className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4"
        role="list"
        initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
      >
        {QUICK_TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <div key={tool.href} role="listitem">
              <Link
                href={tool.href}
                className={clsx(
                  "group flex flex-col items-center gap-2.5 rounded-2xl p-3 sm:p-4 text-center",
                  "border border-border/50 bg-card/80 backdrop-blur-sm",
                  "transition-all duration-250",
                  "hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-xl hover:shadow-black/10 hover:bg-primary/5",
                  "active:scale-[0.97]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2"
                )}
                aria-label={tool.label}
              >
                <div
                  className={clsx(
                    "flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl",
                    `bg-gradient-to-br ${tool.gradient}`,
                    "shadow-md transition-all duration-250",
                    "group-hover:shadow-lg group-hover:scale-110"
                  )}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <span className="text-[11px] sm:text-xs font-semibold text-foreground-muted group-hover:text-primary transition-colors leading-snug">
                  {tool.label}
                </span>
              </Link>
            </div>
          );
        })}
      </motion.div>

      {/* View all CTA */}
      <div className="mt-8 flex justify-center">
        <Link
          href="/tools"
          className={clsx(
            "inline-flex items-center gap-2.5 rounded-2xl px-7 py-3",
            "bg-gradient-to-r from-violet-600 to-purple-600",
            "text-sm font-bold text-white shadow-lg shadow-violet-500/20",
            "hover:opacity-90 hover:shadow-xl hover:shadow-violet-500/30",
            "transition-all duration-250 active:scale-[0.98]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          )}
        >
          <Zap className="h-4 w-4" />
          Explore all 200+ Tools
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}