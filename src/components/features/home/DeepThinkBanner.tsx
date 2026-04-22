"use client";

import Link from "next/link";
import { Brain, ArrowRight, Lightbulb } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { clsx } from "clsx";

const FEATURES = ["Math & Logic", "Decision Making", "Research", "Analysis", "Puzzles", "Step-by-step Reasoning"];

export function DeepThinkBanner() {
  const shouldReduce = useReducedMotion() ?? false;

  return (
    <section className="container mx-auto px-4 pb-6">
      <motion.div
        initial={shouldReduce ? undefined : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
        className={clsx(
          "relative overflow-hidden rounded-3xl",
          "bg-gradient-to-br from-slate-900 via-violet-950/30 to-slate-900",
          "border border-violet-500/20 shadow-2xl",
          "px-6 py-8 sm:px-10 sm:py-10"
        )}
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-purple-500/8 blur-3xl" />
        </div>

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-xl">
            <Brain className="text-white" style={{ width: 26, height: 26 }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-violet-400 uppercase tracking-widest">New · Like o1</span>
              <Lightbulb className="text-violet-400" style={{ width: 12, height: 12 }} />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              Deep Think AI
            </h2>
            <p className="mt-1 text-sm text-slate-400 max-w-md">
              AI that shows its thinking process step by step — like ChatGPT o1. Powered by GLM-5.1 Thinking model.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {FEATURES.map((f) => (
                <span key={f} className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-violet-900/40 border border-violet-500/20 text-[11px] text-violet-300 font-medium">
                  {f}
                </span>
              ))}
            </div>
          </div>

          <Link href="/deep-think"
            className={clsx(
              "shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl",
              "bg-gradient-to-r from-violet-600 to-purple-700",
              "text-white text-sm font-bold shadow-lg",
              "hover:opacity-90 hover:shadow-xl active:scale-95 transition-all duration-200 whitespace-nowrap"
            )}
          >
            Try Now <ArrowRight style={{ width: 15, height: 15 }} />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
