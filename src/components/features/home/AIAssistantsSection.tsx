"use client";

import React from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { ArrowRight, Sparkles, FileText, ImageIcon, Mic, Volume2, Scale, Scissors, Briefcase } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

const AI_TOOLS = [
  { label: "Smart Resume",       href: "/smart-resume",       icon: FileText,   gradient: "from-indigo-500 to-violet-500",  desc: "AI resume for any profession"       },
  { label: "Cover Letter",       href: "/cover-letter",       icon: FileText,   gradient: "from-violet-500 to-purple-500",  desc: "Tailored cover letters instantly"   },
  { label: "AI Image Gen",       href: "/text-to-image",      icon: ImageIcon,  gradient: "from-pink-500 to-rose-500",      desc: "Generate images from text prompts"  },
  { label: "Audio Transcriber",  href: "/audio-transcriber",  icon: Mic,        gradient: "from-amber-500 to-orange-500",   desc: "Convert speech to text with AI"    },
  { label: "Text to Audio",     href: "/text-to-audio",      icon: Volume2,     gradient: "from-emerald-500 to-teal-400",   desc: "Natural AI voices, downloadable"    },
  { label: "Legal Analyzer",    href: "/legal-analyzer",     icon: Scale,      gradient: "from-slate-600 to-gray-500",     desc: "Analyze legal documents with AI"    },
  { label: "LinkedIn Optimizer", href: "/linkedin-optimizer",  icon: Briefcase,   gradient: "from-blue-500 to-cyan-500",    desc: "AI-optimize your LinkedIn profile"  },
  { label: "Video Clipper",     href: "/video-clipper",      icon: Scissors,   gradient: "from-red-500 to-pink-500",       desc: "Trim and clip videos in browser"    },
] as const;

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.45, ease: [0.22, 0.61, 0.36, 1] as [number, number, number, number] },
  },
};

export function AIAssistantsSection() {
  const shouldReduce = useReducedMotion() ?? false;

  return (
    <section className="container mx-auto px-4 py-12 lg:py-16" aria-labelledby="ai-assistants-heading">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-8 sm:flex-row sm:items-end sm:justify-between sm:mb-10">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 backdrop-blur-sm px-4 py-1.5 text-xs font-bold text-violet-600 dark:text-violet-400 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered
          </div>
          <h2 id="ai-assistants-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            AI Assistants
          </h2>
          <p className="mt-2 text-sm sm:text-base text-foreground-muted">
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
        {AI_TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <motion.div key={tool.href} role="listitem" variants={shouldReduce ? undefined : cardVariants}>
              <Link
                href={tool.href}
                className={clsx(
                  "group flex flex-col gap-3 rounded-2xl p-4 sm:p-5",
                  "border border-border/50 bg-card/80 backdrop-blur-sm",
                  "transition-all duration-250",
                  "hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-xl hover:shadow-black/10",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2"
                )}
                aria-label={tool.label}
              >
                {/* Icon with gradient */}
                <div
                  className={clsx(
                    "flex h-11 w-11 items-center justify-center rounded-xl",
                    `bg-gradient-to-br ${tool.gradient}`,
                    "shadow-md transition-all duration-250",
                    "group-hover:shadow-lg group-hover:scale-110"
                  )}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>

                {/* Text */}
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors duration-200 leading-snug">
                    {tool.label}
                  </h3>
                  <p className="mt-1 text-xs text-foreground-muted line-clamp-2 leading-relaxed hidden sm:block">
                    {tool.desc}
                  </p>
                </div>

                {/* Arrow */}
                <div className={clsx(
                  "flex items-center gap-1.5 text-xs font-semibold",
                  "text-foreground-subtle group-hover:text-primary group-hover:gap-2.5",
                  "transition-all duration-200"
                )}>
                  Try now <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}