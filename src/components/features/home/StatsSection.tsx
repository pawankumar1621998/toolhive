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
}

const STATS: StatItem[] = [
  {
    value: 50,
    suffix: "M+",
    label: "Files Processed",
    description: "Files processed by ToolHive users globally",
    icon: TrendingUp,
    gradient: "from-rose-500 to-orange-400",
  },
  {
    value: 200,
    suffix: "+",
    label: "Free Tools",
    description: "Tools available with no subscription required",
    icon: Zap,
    gradient: "from-violet-500 to-blue-400",
  },
  {
    value: 2,
    suffix: "M+",
    label: "Happy Users",
    description: "Professionals and individuals using ToolHive",
    icon: Users,
    gradient: "from-emerald-500 to-teal-400",
  },
  {
    value: 99.9,
    suffix: "%",
    label: "Uptime",
    description: "Reliable availability when you need it most",
    icon: Clock,
    gradient: "from-sky-500 to-cyan-400",
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
      // Ease out cubic
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
// Stat card
// Mobile: horizontal layout (icon left, text+number right) with divider below
// Desktop: centered vertical layout (unchanged)
// ─────────────────────────────────────────────

function StatCard({
  item,
  active,
  shouldReduce,
  index,
  isLast,
}: {
  item: StatItem;
  active: boolean;
  shouldReduce: boolean;
  index: number;
  isLast: boolean;
}) {
  const count = useAnimatedCounter(item.value, 1800, active, shouldReduce);
  const displayValue = Number.isInteger(item.value)
    ? Math.floor(count).toString()
    : count.toFixed(1);

  const Icon = item.icon;

  return (
    <>
      <motion.div
        initial={shouldReduce ? undefined : { opacity: 0, y: 24 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={
          shouldReduce
            ? undefined
            : {
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.22, 0.61, 0.36, 1] as [number, number, number, number],
              }
        }
        className={clsx(
          "relative rounded-2xl",
          "glass-card border border-card-border",
          "transition-all duration-250 hover:-translate-y-1 hover:shadow-xl",
          // Mobile: horizontal flex layout
          "flex flex-row items-center gap-4 p-5 sm:p-6",
          // sm+: override to centered vertical layout
          "sm:flex-col sm:items-center sm:gap-4 sm:p-6 sm:p-8 lg:p-8"
        )}
        role="listitem"
      >
        {/* Icon */}
        <div
          className={clsx(
            "flex shrink-0 items-center justify-center rounded-xl",
            "h-12 w-12",
            `bg-gradient-to-br ${item.gradient}`,
            "shadow-md"
          )}
          aria-hidden="true"
        >
          <Icon className="h-6 w-6 text-white" />
        </div>

        {/* Number + label + description */}
        <div className="flex-1 sm:text-center">
          {/* Big animated number */}
          <p
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gradient tabular-nums leading-none"
            aria-label={`${item.value}${item.suffix} ${item.label}`}
          >
            {displayValue}
            <span className="text-2xl sm:text-3xl lg:text-4xl">{item.suffix}</span>
          </p>
          {/* Label */}
          <p className="mt-2 text-sm sm:text-base font-semibold text-foreground leading-snug">
            {item.label}
          </p>
          {/* Description — visible on sm+ only to keep mobile cards compact */}
          <p className="hidden sm:block mt-1 text-sm text-foreground-muted max-w-[160px] mx-auto leading-snug">
            {item.description}
          </p>
        </div>
      </motion.div>

      {/* Divider between cards on mobile (inside the grid flow) */}
      {!isLast && (
        <div
          className="block sm:hidden h-px bg-border/60 col-span-1"
          aria-hidden="true"
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────
// StatsSection
// ─────────────────────────────────────────────

/**
 * StatsSection — Client Component
 *
 * Mobile:  single-column stacked cards with horizontal layout + dividers
 * sm+:     3-column grid
 * lg:      4-column grid
 *
 * Animated number counters trigger when the section enters the viewport.
 */
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
      { threshold: 0.15 } // lower threshold so mobile triggers before fully in view
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
            "radial-gradient(ellipse at 20% 50%, oklch(55% 0.22 285 / 0.07) 0%, transparent 60%)",
            "radial-gradient(ellipse at 80% 50%, oklch(62% 0.18 195 / 0.06) 0%, transparent 60%)",
          ].join(", "),
        }}
        aria-hidden="true"
      />
      {/* Top/bottom border accents */}
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-brand opacity-20"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-brand opacity-20"
        aria-hidden="true"
      />

      <div className="container mx-auto px-4">
        {/* Section heading */}
        <div className="text-center mb-10 sm:mb-12">
          <motion.h2
            id="stats-heading"
            initial={shouldReduce ? undefined : { opacity: 0, y: 16 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{
              duration: 0.5,
              ease: [0.22, 0.61, 0.36, 1] as [number, number, number, number],
            }}
            className="text-2xl sm:text-3xl font-bold text-foreground"
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
            className="mt-2 text-sm text-foreground-muted"
          >
            Numbers that speak for themselves
          </motion.p>
        </div>

        {/*
         * Stats grid
         * Mobile:  1 column (stacked, each card has horizontal layout)
         * sm:      2 columns
         * lg:      4 columns
         *
         * Note: dividers are rendered as sibling elements inside StatCard,
         * using col-span-1 so they slot between cards in the single-column flow.
         */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
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
              isLast={index === STATS.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
