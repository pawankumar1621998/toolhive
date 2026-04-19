"use client";

import React from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import {
  Check,
  Zap,
  FileText,
  Image,
  Video,
  Pen,
  ArrowRight,
  Sparkles,
  Heart,
} from "lucide-react";

const EASE_OUT: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

const FREE_FEATURES = [
  "200+ AI-powered tools",
  "Unlimited tool uses",
  "No account required",
  "2 GB max file size",
  "PDF, Image, Video & AI tools",
  "Priority processing",
  "No hidden charges ever",
  "Supported by ads",
];

const TOOL_CATEGORIES = [
  { icon: FileText, label: "PDF Tools",   count: "14 tools", color: "from-rose-500 to-orange-400",   href: "/tools/pdf"        },
  { icon: Image,    label: "Image Tools", count: "12 tools", color: "from-violet-500 to-purple-400", href: "/tools/image"      },
  { icon: Video,    label: "Video Tools", count: "9 tools",  color: "from-blue-500 to-cyan-400",     href: "/tools/video"      },
  { icon: Pen,      label: "AI Writing",  count: "13 tools", color: "from-emerald-500 to-teal-400",  href: "/tools/ai-writing" },
];

export function PricingPage() {
  return (
    <main>
      {/* ── Hero ── */}
      <section className="relative isolate overflow-hidden pt-16 pb-12 sm:pt-24 sm:pb-16">
        {/* Background orbs */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0 bg-background" />
          <div
            className="absolute -top-32 -left-24 h-[500px] w-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, oklch(55% 0.22 285 / 0.1) 0%, transparent 70%)" }}
          />
          <div
            className="absolute -top-16 right-0 h-[420px] w-[420px] rounded-full"
            style={{ background: "radial-gradient(circle, oklch(62% 0.18 195 / 0.08) 0%, transparent 70%)" }}
          />
        </div>

        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center gap-5">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
            >
              <span className={clsx(
                "inline-flex items-center gap-1.5 rounded-full",
                "border border-primary/25 bg-primary/8 px-4 py-1.5",
                "text-xs font-semibold text-primary"
              )}>
                <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                100% Free, Forever
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: EASE_OUT }}
              className={clsx(
                "max-w-3xl text-balance",
                "text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl",
                "text-foreground leading-[1.08]"
              )}
            >
              All Tools.{" "}
              <span className="text-gradient">Completely Free.</span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: EASE_OUT }}
              className="max-w-lg text-pretty text-base sm:text-lg text-foreground-muted leading-relaxed"
            >
              No subscriptions. No credit cards. No limits.
              200+ AI-powered tools — free forever, supported by ads.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: EASE_OUT }}
            >
              <Link
                href="/tools"
                className={clsx(
                  "inline-flex items-center justify-center gap-2 rounded-xl",
                  "bg-gradient-brand px-8 py-3.5",
                  "text-sm font-bold text-white",
                  "shadow-lg hover:shadow-xl hover:-translate-y-0.5",
                  "transition-all duration-200 active:scale-[0.98]"
                )}
              >
                Start Using Free Tools
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Free plan card ── */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: EASE_OUT }}
              className={clsx(
                "relative flex flex-col rounded-2xl p-8",
                "border border-primary/40 bg-card",
                "ring-1 ring-primary/20",
                "shadow-[0_8px_32px_color-mix(in_oklch,var(--color-primary)_12%,transparent)]"
              )}
            >
              {/* Top accent */}
              <div className="absolute -top-px inset-x-0 h-0.5 rounded-t-2xl bg-gradient-brand" aria-hidden="true" />

              {/* Plan header */}
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand shadow-md">
                  <Heart className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Free Forever</h2>
                  <p className="text-xs text-foreground-muted">No credit card needed</p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-extrabold text-foreground leading-none">₹0</span>
                  <span className="text-sm text-foreground-muted mb-1">/month</span>
                </div>
                <p className="mt-1 text-xs text-success font-medium">Supported by ads — always free</p>
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-3 mb-8">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                    </span>
                    <span className="text-sm text-foreground-muted">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="/tools"
                className={clsx(
                  "inline-flex items-center justify-center gap-2 rounded-xl",
                  "bg-gradient-brand px-6 py-3",
                  "text-sm font-bold text-white",
                  "shadow-md hover:shadow-lg hover:-translate-y-0.5",
                  "transition-all duration-200 active:scale-[0.98]"
                )}
              >
                <Zap className="h-4 w-4" aria-hidden="true" />
                Start Using Tools — Free
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Tool categories ── */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              All categories — all free
            </h2>
            <p className="mt-2 text-sm text-foreground-muted">
              200+ tools across 4 categories, zero cost
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TOOL_CATEGORIES.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.08, ease: EASE_OUT }}
                >
                  <Link
                    href={cat.href}
                    className={clsx(
                      "flex items-center gap-4 rounded-2xl p-5",
                      "border border-card-border bg-card",
                      "hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                    )}
                  >
                    <div className={clsx(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                      `bg-gradient-to-br ${cat.color}`,
                      "shadow-md"
                    )}>
                      <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{cat.label}</p>
                      <p className="text-sm text-foreground-muted">{cat.count}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs font-bold text-success bg-success/10 border border-success/20 rounded-full px-2 py-0.5">
                        FREE
                      </span>
                      <ArrowRight className="h-4 w-4 text-foreground-muted" aria-hidden="true" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className={clsx(
              "relative overflow-hidden rounded-3xl px-8 py-12 sm:py-16 text-center",
              "bg-gradient-brand max-w-4xl mx-auto"
            )}
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
              <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-white/8 blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-5">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-balance leading-tight">
                Ready to get started?
              </h2>
              <p className="max-w-md text-white/80 text-base sm:text-lg leading-relaxed">
                Join millions of users who use ToolHive&apos;s free AI-powered tools every day.
              </p>
              <Link
                href="/tools"
                className={clsx(
                  "inline-flex items-center justify-center gap-2 rounded-xl",
                  "bg-white px-7 py-3.5",
                  "text-sm font-bold text-primary",
                  "shadow-xl hover:bg-white/90 hover:shadow-2xl",
                  "transition-all duration-200 active:scale-[0.98]"
                )}
              >
                Explore All Free Tools
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <p className="text-xs text-white/55">
                No account needed &middot; No credit card &middot; 100% free forever
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
