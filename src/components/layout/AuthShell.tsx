"use client";

/**
 * AuthShell — Layout wrapper for all /auth/* pages.
 *
 * Desktop (lg+): Split-screen layout.
 *   Left half  — brand panel with gradient background, animated floating
 *                tool cards, logo, tagline, and feature bullets.
 *   Right half — white/dark card panel containing the form.
 *
 * Mobile: Single-column layout. Shows the form with a compact logo header.
 *
 * Framer Motion is used for:
 *   - Floating tool cards on the left panel (looping y-axis animation)
 *   - Staggered entrance of brand copy
 *   - Form card fade + slide entrance
 */

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap,
  FileText,
  Image,
  Video,
  Mic,
  Wand2,
  RefreshCw,
  ShieldCheck,
  Bolt,
  Infinity as InfinityIcon,
} from "lucide-react";

// ─────────────────────────────────────────────
// Floating tool cards data
// ─────────────────────────────────────────────

interface FloatingCard {
  icon: React.ReactNode;
  label: string;
  /** Tailwind color class for the icon container */
  color: string;
  /** Initial x offset (%) for visual variety */
  x: string;
  /** Initial y position (%) */
  y: string;
  /** Animation duration (s) for the float cycle */
  duration: number;
  /** Animation delay (s) */
  delay: number;
}

const FLOATING_CARDS: FloatingCard[] = [
  {
    icon: <FileText className="h-4 w-4" />,
    label: "PDF Merge",
    color: "bg-red-500/20 text-red-400",
    x: "8%",
    y: "18%",
    duration: 4.2,
    delay: 0,
  },
  {
    icon: <Image className="h-4 w-4" />,
    label: "Image Convert",
    color: "bg-violet-500/20 text-violet-400",
    x: "62%",
    y: "12%",
    duration: 3.8,
    delay: 0.6,
  },
  {
    icon: <Wand2 className="h-4 w-4" />,
    label: "AI Writer",
    color: "bg-blue-500/20 text-blue-400",
    x: "72%",
    y: "54%",
    duration: 5.1,
    delay: 1.2,
  },
  {
    icon: <Video className="h-4 w-4" />,
    label: "Video Trim",
    color: "bg-pink-500/20 text-pink-400",
    x: "5%",
    y: "64%",
    duration: 4.5,
    delay: 0.3,
  },
  {
    icon: <Mic className="h-4 w-4" />,
    label: "Transcribe",
    color: "bg-emerald-500/20 text-emerald-400",
    x: "48%",
    y: "76%",
    duration: 3.6,
    delay: 0.9,
  },
  {
    icon: <RefreshCw className="h-4 w-4" />,
    label: "File Convert",
    color: "bg-amber-500/20 text-amber-400",
    x: "30%",
    y: "38%",
    duration: 4.8,
    delay: 1.5,
  },
];

// ─────────────────────────────────────────────
// Feature bullets data
// ─────────────────────────────────────────────

const FEATURES = [
  {
    icon: <InfinityIcon className="h-4 w-4" />,
    text: "200+ AI-powered tools, free forever",
  },
  {
    icon: <ShieldCheck className="h-4 w-4" />,
    text: "Privacy-first — files deleted after 1 hour",
  },
  {
    icon: <Bolt className="h-4 w-4" />,
    text: "Blazing fast with GPU-accelerated AI",
  },
];

// ─────────────────────────────────────────────
// FloatingToolCard
// ─────────────────────────────────────────────

function FloatingToolCard({ card }: { card: FloatingCard }) {
  return (
    <motion.div
      className="absolute flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-sm"
      style={{ left: card.x, top: card.y }}
      initial={{ opacity: 0, y: 12 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [12, 0, -8, -8],
      }}
      transition={{
        duration: card.duration,
        delay: card.delay,
        repeat: Infinity,
        repeatDelay: 1.5,
        ease: "easeInOut",
      }}
      aria-hidden="true"
    >
      <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${card.color}`}>
        {card.icon}
      </span>
      <span className="text-xs font-medium text-white/80 whitespace-nowrap">
        {card.label}
      </span>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Logo mark (shared between both panels)
// ─────────────────────────────────────────────

function LogoMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { wrap: "h-8 w-8 rounded-lg", icon: "h-4 w-4", text: "text-lg" },
    md: { wrap: "h-10 w-10 rounded-xl", icon: "h-5 w-5", text: "text-xl" },
    lg: { wrap: "h-12 w-12 rounded-xl", icon: "h-6 w-6", text: "text-2xl" },
  }[size];

  return (
    <Link href="/" className="flex items-center gap-3 group" aria-label="ToolHive home">
      <div
        className={`flex items-center justify-center bg-gradient-brand shadow-lg transition-transform duration-200 group-hover:scale-105 ${sizes.wrap}`}
      >
        <Zap className={`text-white ${sizes.icon}`} />
      </div>
      <span className={`font-bold text-gradient ${sizes.text}`}>ToolHive</span>
    </Link>
  );
}

// ─────────────────────────────────────────────
// AuthShell
// ─────────────────────────────────────────────

interface AuthShellProps {
  children: React.ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Left brand panel (lg+) ─────────────────────────────── */}
      <div
        className={[
          "hidden lg:flex lg:w-[52%] xl:w-1/2",
          "flex-col justify-between",
          "relative overflow-hidden",
          "bg-gradient-brand",
          "p-12",
        ].join(" ")}
        aria-hidden="true"
      >
        {/* Layered background texture */}
        <div className="absolute inset-0 bg-black/20" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 15% 15%, rgba(255,255,255,0.12) 0%, transparent 55%), radial-gradient(ellipse at 85% 85%, rgba(255,255,255,0.08) 0%, transparent 55%)",
          }}
        />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Floating tool cards */}
        <div className="absolute inset-0">
          {FLOATING_CARDS.map((card) => (
            <FloatingToolCard key={card.label} card={card} />
          ))}
        </div>

        {/* Top: Logo */}
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 border border-white/20 shadow-lg backdrop-blur-sm transition-transform duration-200 group-hover:scale-105">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              ToolHive
            </span>
          </Link>
        </motion.div>

        {/* Center: Hero copy + features */}
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/60">
            The AI tools platform
          </p>
          <h2 className="text-4xl font-bold text-white leading-[1.15] text-balance mb-8">
            200+ AI-powered tools.
            <br />
            <span className="text-white/75">Completely free.</span>
          </h2>

          <ul className="space-y-4">
            {FEATURES.map((feature, i) => (
              <motion.li
                key={feature.text}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1, ease: "easeOut" }}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 border border-white/20 text-white">
                  {feature.icon}
                </span>
                <span className="text-sm text-white/85 font-medium">
                  {feature.text}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Bottom: Social proof */}
        <motion.p
          className="relative z-10 text-xs text-white/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          Trusted by 500,000+ creators, developers, and teams worldwide
        </motion.p>
      </div>

      {/* ── Right form panel ─────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 lg:p-10 bg-background">
        {/* Mobile logo (hidden on lg+) */}
        <div className="mb-8 lg:hidden w-full max-w-sm">
          <LogoMark size="md" />
        </div>

        {/* Form card */}
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
