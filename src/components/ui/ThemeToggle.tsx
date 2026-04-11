"use client";

import React, { useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "./Button";
import type { Theme } from "@/types";

// ─────────────────────────────────────────────
// Icon map
// ─────────────────────────────────────────────

const ICON_MAP = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

// Entry/exit rotation directions for each icon transition.
// We spin clockwise when going "forward" (light → dark → system) and
// counter-clockwise on the wrap-around, giving a natural feel.
const ENTER_ROTATE = { light: -90, dark: -90, system: -90 } as const;
const EXIT_ROTATE  = { light:  90, dark:  90, system:  90 } as const;

// Human-readable label for the NEXT state (what clicking will switch to).
const NEXT_LABEL: Record<Theme, string> = {
  light:  "Switch to dark mode",
  dark:   "Switch to system mode",
  system: "Switch to light mode",
};

// Current state label — shown in the tooltip.
const CURRENT_LABEL: Record<Theme, string> = {
  light:  "Light mode",
  dark:   "Dark mode",
  system: "System mode",
};

// Icon colour classes per resolved theme.
const ICON_COLOR: Record<Theme, string> = {
  light:  "text-amber-500 dark:text-amber-400",
  dark:   "text-indigo-400",
  system: "text-foreground-muted",
};

// ─────────────────────────────────────────────
// ThemeToggle — compact icon button (Navbar)
// ─────────────────────────────────────────────

/**
 * Compact icon button that cycles: Light → Dark → System → Light.
 * Uses Framer Motion for a smooth rotate + scale transition on each step.
 * Shows a tooltip with the current theme name on hover/focus.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [showTooltip, setShowTooltip] = useState(false);

  const Icon = ICON_MAP[theme];
  const ariaLabel = NEXT_LABEL[theme];
  const tooltipText = CURRENT_LABEL[theme];
  const iconColor = ICON_COLOR[theme];

  return (
    <div className="relative inline-flex">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={toggleTheme}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className={clsx("relative overflow-hidden", className)}
        aria-label={ariaLabel}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            initial={{ rotate: ENTER_ROTATE[theme], scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: EXIT_ROTATE[theme], scale: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <Icon className={clsx("h-4 w-4", iconColor)} />
          </motion.span>
        </AnimatePresence>
      </Button>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            role="tooltip"
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className={clsx(
              "pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2",
              "z-tooltip whitespace-nowrap rounded-md px-2.5 py-1",
              "bg-foreground text-background text-xs font-medium shadow-lg",
              // Caret
              "before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2",
              "before:border-4 before:border-transparent before:border-b-foreground before:content-['']"
            )}
          >
            {tooltipText}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// ThemeSwitcher — 3-way pill tabs (Settings)
// ─────────────────────────────────────────────

const THEME_OPTIONS: {
  value: Theme;
  label: string;
  Icon: React.FC<{ className?: string }>;
  description: string;
}[] = [
  {
    value: "light",
    label: "Light",
    Icon: Sun,
    description: "Always use light theme",
  },
  {
    value: "dark",
    label: "Dark",
    Icon: Moon,
    description: "Always use dark theme",
  },
  {
    value: "system",
    label: "System",
    Icon: Monitor,
    description: "Follow OS preference",
  },
];

/**
 * Full-width 3-way theme switcher with a spring-animated selection indicator.
 * Designed for settings/profile pages where all three options should be visible.
 */
export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={clsx(
        "flex items-stretch gap-1 rounded-xl bg-background-muted p-1",
        className
      )}
      role="radiogroup"
      aria-label="Color theme"
    >
      {THEME_OPTIONS.map(({ value, label, Icon, description }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            role="radio"
            aria-checked={isActive}
            aria-label={`${label} — ${description}`}
            onClick={() => setTheme(value)}
            className={clsx(
              "relative flex flex-1 items-center justify-center gap-1.5",
              "rounded-lg px-3 py-2 text-xs font-medium",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:z-10",
              // Colour transitions handled by the animated pill — keep text smooth.
              "transition-colors duration-200",
              isActive
                ? "text-foreground"
                : "text-foreground-muted hover:text-foreground"
            )}
          >
            {/* Spring-animated background pill that slides between options */}
            {isActive && (
              <motion.span
                layoutId="theme-switcher-pill"
                className={clsx(
                  "absolute inset-0 rounded-lg",
                  "bg-card shadow-sm border border-card-border"
                )}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                aria-hidden="true"
              />
            )}
            <span className="relative flex items-center gap-1.5 select-none">
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
