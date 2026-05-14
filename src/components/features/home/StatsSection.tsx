"use client";

import React, { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp, Zap, Users, Clock } from "lucide-react";

// ─────────────────────────────────────────────
// Stat data
// ─────────────────────────────────────────────

interface StatItem {
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  gradient: string;
  glowClass: string;
}

const STATS: StatItem[] = [
  {
    value: 50,
    suffix: "M+",
    label: "Files Processed",
    description: "Files processed by ToolHive users globally",
    icon: TrendingUp,
    gradient: "from-rose-500 to-orange-400",
    glowClass: "hover:shadow-[0_8px_32px_oklch(65%_0.17_50_/_0.2)]",
  },
  {
    value: 200,
    suffix: "+",
    label: "Free Tools",
    description: "Tools available with no subscription required",
    icon: Zap,
    gradient: "from-violet-600 to-purple-500",
    glowClass: "hover:shadow-[0_8px_32px_oklch(55%_0.22_285_/_0.2)]",
  },
  {
    value: 2,
    suffix: "M+",
    label: "Happy Users",
    description: "Professionals and individuals using ToolHive",
    icon: Users,
    gradient: "from-emerald-500 to-teal-400",
    glowClass: "hover:shadow-[0_8px_32px_oklch(70%_0.16_160_/_0.2)]",
  },
  {
    value: 99.9,
    suffix: "%",
    label: "Uptime",
    description: "Reliable availability when you need it most",
    icon: Clock,
    gradient: "from-sky-500 to-cyan-400",
    glowClass: "hover:shadow-[0_8px_32px_oklch(60%_0.18_195_/_0.2)]",
  },
];

// ─────────────────────────────────────────────
// Animated counter hook
// ─────────────────────────────────────────────

function useAnimatedCounter(
  target: number,
  duration = 1800,
  active = false,
  disabled = false
): number {
  const [current, setCurrent] = useState(disabled ? target : 0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (disabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrent(target);
      return;
    }
    if (!active) return;

    startRef.current = null;

    function step(timestamp: number) {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = eased * target;
      setCurrent(Number.isInteger(target) ? Math.floor(next) : Math.round(next * 10) / 10);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setCurrent(target);
      }
    }

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, active, disabled]);

  return current;
}

// ─────────────────────────────────────────────
// Premium StatCard — glass morphism with animated glow
// ─────────────────────────────────────────────

function StatCard({
  item,
  active,
  shouldReduce,
  index,
}: {
  item: StatItem;
  active: boolean;
  shouldReduce: boolean;
  index: number;
}) {
  const count = useAnimatedCounter(item.value, 1800, active, shouldReduce);
  const displayValue = Number.isInteger(item.value)
    ? Math.floor(count).toString()
    : count.toFixed(1);

  const Icon = item.icon;

  return (
    <motion.div
      initial={shouldReduce ? undefined : { opacity: 0, y: 28 }}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={
        shouldReduce
          ? undefined
          : {
              duration: 0.55,
              delay: index * 0.1,
              ease: [0.22, 0.61, 0.36, 1] as [number, number, number, number],
            }
      }
      className={clsx(
        "relative rounded-2xl overflow-hidden",
        "border border-border/50 bg-card/80 backdrop-blur-md",
        "transition-all duration-300",
        "hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/10",
        item.glowClass,
        // Mobile: horizontal flex
        "flex flex-row items-center gap-4 p-5 sm:p-6 sm:flex-col sm:items-center sm:gap-3 sm:p-8 lg:p-8"
      )}
      role="listitem"
    >
      {/* Background gradient accent */}
      <div
        className={clsx(
          "pointer-events-none absolute inset-0 rounded-2xl opacity-0",
          "group-hover:opacity-100 transition-opacity duration-300",
          `bg-gradient-to-br ${item.gradient}`
        )}
        aria-hidden="true"
      >
        <div className="absolute inset-0 rounded-2xl bg-card/95 backdrop-blur-md" />
      </div>

      {/* Top accent line */}
      <div
        className={clsx(
          "absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl",
          `bg-gradient-to-r ${item.gradient}`
        )}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative flex flex-row sm:flex-col items-center sm:items-center gap-4 sm:gap-3 w-full sm:w-auto">
        {/* Icon */}
        <div
          className={clsx(
            "relative flex shrink-0 items-center justify-center rounded-2xl",
            "h-14 w-14 sm:h-15 sm:w-15",
            `bg-gradient-to-br ${item.gradient}`,
            "shadow-lg"
          )}
          style={{ width: "3.75rem", height: "3.75rem" }}
          aria-hidden="true"
        >
          <Icon className="h-7 w-7 text-white" />
          {/* Glow ring */}
          <div
            className={clsx(
              "absolute inset-0 rounded-2xl opacity-0",
              "group-hover:opacity-100 transition-opacity duration-300",
              `bg-gradient-to-br ${item.gradient} blur-xl`
            )}
            style={{ transform: "scale(1.3)" }}
          />
        </div>

        {/* Number + label */}
        <div className="flex-1 sm:flex-none sm:text-center">
          {/* Big animated number */}
          <p
            className={clsx(
              "text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tabular-nums leading-none",
              "bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text"
            )}
            aria-label={`${item.value}${item.suffix} ${item.label}`}
          >
            {displayValue}
            <span className={clsx("text-2xl sm:text-3xl lg:text-4xl", `bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`)}>
              {item.suffix}
            </span>
          </p>
          {/* Label */}
          <p className="mt-2 text-sm sm:text-base font-bold text-foreground leading-snug sm:text-center">
            {item.label}
          </p>
          {/* Description */}
          <p className="hidden sm:block mt-1 text-sm text-foreground-muted max-w-[160px] mx-auto leading-snug">
            {item.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// StatsSection
// ─────────────────────────────────────────────

export function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);
  const shouldReduce = useReducedMotion() ?? false;

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (shouldReduce) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldReduce]);

  return (
    <section
      ref={sectionRef}
      className={clsx(
        "relative overflow-hidden",
        "py-14 sm:py-20 lg:py-24"
      )}
      aria-labelledby="stats-heading"
    >
      {/* Background layers */}
      <div className="absolute inset-0 bg-background-subtle -z-10" aria-hidden="true" />
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: [
            "radial-gradient(ellipse at 15% 50%, oklch(55% 0.22 285 / var(--stats-violet-opacity, 0.18)) 0%, transparent 60%)",
            "radial-gradient(ellipse at 85% 50%, oklch(60% 0.18 195 / var(--stats-cyan-opacity, 0.15)) 0%, transparent 60%)",
            "radial-gradient(ellipse at 50% 80%, oklch(65% 0.17 50 / var(--stats-orange-opacity, 0.12)) 0%, transparent 50%)",
          ].join(", "),
        }}
        aria-hidden="true"
      />

      {/* Top/bottom gradient border accents */}
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"
        aria-hidden="true"
      />

      <div className="container mx-auto px-4">
        {/* Section heading */}
        <div className="text-center mb-10 sm:mb-12">
          <motion.h2
            id="stats-heading"
            initial={shouldReduce ? undefined : { opacity: 0, y: 18 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            transition={{
              duration: 0.5,
              ease: [0.22, 0.61, 0.36, 1] as [number, number, number, number],
            }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight"
          >
            Trusted by millions worldwide
          </motion.h2>
          <motion.p
            initial={shouldReduce ? undefined : { opacity: 0, y: 12 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{
              duration: 0.5,
              delay: 0.08,
              ease: [0.22, 0.61, 0.36, 1] as [number, number, number, number],
            }}
            className="mt-2 text-sm sm:text-base text-foreground-muted"
          >
            Numbers that speak for themselves
          </motion.p>
        </div>

        {/* Stats grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
          role="list"
          aria-label="Platform statistics"
        >
          {STATS.map((item, index) => (
            <StatCard
              key={item.label}
              item={item}
              active={active}
              shouldReduce={shouldReduce}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}