"use client";

import Link from "next/link";
import { Code2, Sparkles, ArrowRight, Terminal } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { clsx } from "clsx";

const LANGS = ["Python", "JavaScript", "Java", "C++", "Rust", "Go", "TypeScript", "PHP"];

export function CodeAIBanner() {
  const shouldReduce = useReducedMotion() ?? false;

  return (
    <section className="container mx-auto px-4 py-6">
      <motion.div
        initial={shouldReduce ? undefined : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
        className={clsx(
          "relative overflow-hidden rounded-3xl",
          "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
          "border border-slate-700/60 shadow-2xl",
          "px-6 py-8 sm:px-10 sm:py-10"
        )}
      >
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Icon */}
          <div className="h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-xl">
            <Code2 className="text-white" style={{ width: 26, height: 26 }} />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-teal-400 uppercase tracking-widest">New</span>
              <Sparkles className="text-teal-400" style={{ width: 12, height: 12 }} />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              ToolHive Code AI
            </h2>
            <p className="mt-1 text-sm text-slate-400 max-w-md">
              Generate code in any language instantly — Python, JavaScript, Java, C++ and 20+ more. Powered by NVIDIA Magistral.
            </p>

            {/* Language pills */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {LANGS.map((l) => (
                <span
                  key={l}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-700/60 border border-slate-600/50 text-[11px] text-slate-300 font-medium"
                >
                  <Terminal style={{ width: 9, height: 9 }} className="text-teal-400" />
                  {l}
                </span>
              ))}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-700/60 border border-slate-600/50 text-[11px] text-slate-400">
                +12 more
              </span>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/code-ai"
            className={clsx(
              "shrink-0 inline-flex items-center gap-2",
              "px-6 py-3 rounded-xl",
              "bg-gradient-to-r from-teal-500 to-cyan-600",
              "text-white text-sm font-bold shadow-lg",
              "hover:opacity-90 hover:shadow-xl active:scale-95",
              "transition-all duration-200 whitespace-nowrap"
            )}
          >
            Try Now
            <ArrowRight style={{ width: 15, height: 15 }} />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
