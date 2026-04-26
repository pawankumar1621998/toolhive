"use client";

import React from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

// ─── AI Assistant tools (same as Navbar "More → AI Assistants") ───────────────

const AI_TOOLS = [
  { label: "Smart Resume",       href: "/smart-resume",    icon: "📋", desc: "AI resume for any profession",       color: "from-indigo-500 to-violet-500"  },
  { label: "Cover Letter",       href: "/cover-letter",    icon: "✉️",  desc: "Tailored cover letters instantly",   color: "from-violet-500 to-purple-500"  },
  { label: "AI Image Generator", href: "/text-to-image",   icon: "🎨", desc: "Generate images from text prompts",  color: "from-pink-500 to-rose-500"      },
  { label: "Audio Transcriber",  href: "/audio-transcriber", icon: "🎙️", desc: "Convert speech to text with AI",  color: "from-amber-500 to-orange-500"   },
  { label: "Text to Audio",      href: "/text-to-audio",   icon: "🔊", desc: "Natural AI voices, downloadable",    color: "from-emerald-500 to-teal-500"   },
  { label: "Legal Analyzer",     href: "/legal-analyzer",  icon: "⚖️", desc: "Analyze legal documents with AI",    color: "from-slate-500 to-gray-600"     },
  { label: "LinkedIn Optimizer", href: "/linkedin-optimizer", icon: "💼", desc: "AI-optimize your LinkedIn profile", color: "from-blue-500 to-cyan-500"    },
  { label: "Video Clipper",      href: "/video-clipper",   icon: "✂️", desc: "Trim and clip videos in browser",    color: "from-red-500 to-pink-500"       },
] as const;

// ─── Animation ────────────────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.4, ease: [0.22, 0.61, 0.36, 1] as [number, number, number, number] },
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function AIAssistantsSection() {
  const shouldReduce = useReducedMotion() ?? false;

  return (
    <section className="container mx-auto px-4 py-10 lg:py-14" aria-labelledby="ai-assistants-heading">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30 px-3 py-1 text-xs font-semibold text-violet-600 dark:text-violet-400 mb-3">
            <Sparkles className="h-3 w-3" />
            AI-Powered
          </div>
          <h2 id="ai-assistants-heading" className="text-2xl sm:text-3xl font-bold text-foreground">
            AI Assistants
          </h2>
          <p className="mt-1.5 text-sm text-foreground-muted">
            Smart tools that use AI to get your work done faster
          </p>
        </div>
      </div>

      {/* Grid */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
        role="list"
        variants={shouldReduce ? undefined : containerVariants}
        initial={shouldReduce ? "visible" : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        {AI_TOOLS.map((tool) => (
          <motion.div key={tool.href} role="listitem" variants={shouldReduce ? undefined : cardVariants}>
            <Link
              href={tool.href}
              className={clsx(
                "group flex flex-col gap-3 rounded-2xl p-4 sm:p-5",
                "border border-card-border bg-card",
                "transition-all duration-200",
                "hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
              aria-label={tool.label}
            >
              {/* Icon */}
              <div className={clsx(
                "flex h-11 w-11 items-center justify-center rounded-xl text-xl",
                `bg-gradient-to-br ${tool.color}`,
                "shadow-md transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg"
              )}>
                {tool.icon}
              </div>

              {/* Text */}
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                  {tool.label}
                </h3>
                <p className="mt-0.5 text-xs text-foreground-muted line-clamp-2 leading-relaxed hidden sm:block">
                  {tool.desc}
                </p>
              </div>

              {/* Arrow */}
              <div className="flex items-center gap-1 text-xs font-medium text-foreground-subtle group-hover:text-primary transition-colors">
                Try now <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
