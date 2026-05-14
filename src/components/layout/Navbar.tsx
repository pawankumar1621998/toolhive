"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu, X, Search, Zap, Clock, ArrowRight, ChevronDown,
  FileText, Image, Pen, ArrowRightLeft, Calculator, Video, GraduationCap,
  Sparkles, FileCheck, PenTool, Scale, Briefcase, Scissors, ImageIcon, Volume2, Mic,
  QrCode, Receipt, Timer, Palette, Keyboard, Hourglass, CircleDot, KeyRound, Target,
  DollarSign, Layers, Sun, Moon, Monitor
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useSearch } from "@/hooks/useSearch";
import { TOOL_CATEGORIES } from "@/config/navigation";
import type { Theme } from "@/types";

// Icon map for categories
const CAT_ICONS: Record<string, React.FC<{ className?: string }>> = {
  pdf: FileText,
  image: Image,
  video: Video,
  "ai-writing": Pen,
  converter: ArrowRightLeft,
  resume: GraduationCap,
  calculator: Calculator,
};

// AI Tools with Lucide icons
const AI_TOOLS = [
  { label: "Smart Resume",        href: "/smart-resume",      icon: FileCheck,   gradient: "from-indigo-500 to-violet-500" },
  { label: "Cover Letter",        href: "/cover-letter",       icon: PenTool,    gradient: "from-violet-500 to-purple-500" },
  { label: "Legal Analyzer",     href: "/legal-analyzer",    icon: Scale,      gradient: "from-slate-600 to-gray-500"    },
  { label: "LinkedIn Optimizer", href: "/linkedin-optimizer",  icon: Briefcase,  gradient: "from-blue-500 to-cyan-500"    },
  { label: "Video Clipper",      href: "/video-clipper",       icon: Scissors,   gradient: "from-red-500 to-pink-500"      },
  { label: "AI Image Gen",       href: "/text-to-image",      icon: ImageIcon,  gradient: "from-pink-500 to-rose-500"      },
  { label: "Text to Audio",      href: "/text-to-audio",      icon: Volume2,    gradient: "from-emerald-500 to-teal-400"  },
  { label: "Audio Transcriber",  href: "/audio-transcriber",  icon: Mic,        gradient: "from-amber-500 to-orange-500" },
];

// Quick Tools with Lucide icons
const QUICK_TOOLS = [
  { label: "QR & Barcode",     href: "/qr-barcode",         icon: QrCode,    gradient: "from-violet-500 to-purple-500" },
  { label: "Invoice",          href: "/invoice-generator",  icon: Receipt,   gradient: "from-emerald-500 to-teal-400"   },
  { label: "Pomodoro",         href: "/pomodoro",           icon: Timer,     gradient: "from-rose-500 to-orange-400"    },
  { label: "Color Palette",    href: "/color-palette",      icon: Palette,   gradient: "from-pink-500 to-rose-400"      },
  { label: "Typing Test",      href: "/typing-test",        icon: Keyboard,  gradient: "from-blue-500 to-cyan-400"      },
  { label: "Countdown",        href: "/countdown",          icon: Hourglass, gradient: "from-amber-500 to-yellow-400"  },
  { label: "Spin Wheel",       href: "/spin-wheel",          icon: CircleDot, gradient: "from-purple-500 to-pink-400"   },
  { label: "Password Gen",     href: "/password-generator", icon: KeyRound,   gradient: "from-sky-500 to-indigo-400"    },
  { label: "Stopwatch",        href: "/stopwatch",           icon: Timer,     gradient: "from-orange-500 to-amber-400"  },
  { label: "Name Picker",      href: "/name-picker",        icon: Target,    gradient: "from-red-500 to-pink-500"      },
  { label: "Budget Planner",   href: "/budget-planner",      icon: DollarSign,gradient: "from-green-600 to-emerald-500"},
  { label: "Flashcard AI",    href: "/flashcard",           icon: Layers,    gradient: "from-indigo-500 to-purple-600" },
];

const COLOR_MAP: Record<string, string> = {
  rose: "bg-rose-500/10 text-rose-600",
  violet: "bg-violet-500/10 text-violet-600",
  blue: "bg-blue-500/10 text-blue-600",
  emerald: "bg-emerald-500/10 text-emerald-600",
  sky: "bg-sky-500/10 text-sky-600",
  indigo: "bg-indigo-500/10 text-indigo-600",
  orange: "bg-orange-500/10 text-orange-600",
};

// Theme dropdown
const THEME_OPTIONS: { value: Theme; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { value: "light",  label: "Light",  Icon: Sun    },
  { value: "dark",   label: "Dark",   Icon: Moon   },
  { value: "system", label: "System", Icon: Monitor },
];

// ─── Logo ────────────────────────────────────────────────────────────────────

function NavLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0 group" aria-label="ToolHive home">
      <div className={clsx(
        "flex h-8 w-8 items-center justify-center rounded-xl",
        "bg-gradient-to-br from-violet-600 to-purple-600",
        "shadow-lg shadow-violet-500/30",
        "group-hover:shadow-[0_0_20px_oklch(55%_0.22_285_/_0.35)]",
        "transition-all duration-300"
      )} aria-hidden="true">
        <Zap className="h-4 w-4 text-white" />
      </div>
      <span className="text-lg font-black tracking-tight hidden sm:block bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
        ToolHive
      </span>
    </Link>
  );
}

// ─── Theme Switcher ─────────────────────────────────────────────────────────

function ThemeSwitcherButton() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentOption = THEME_OPTIONS.find(o => o.value === theme) ?? THEME_OPTIONS[0];
  const CurrentIcon = currentOption.Icon;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={clsx(
          "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium",
          "border border-border/50 bg-card/80 backdrop-blur-sm",
          "text-foreground-muted hover:text-foreground hover:border-violet-500/30 hover:bg-card",
          "transition-all duration-200"
        )}
        aria-label="Change theme"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <CurrentIcon className="h-4 w-4" />
        <span className="hidden lg:inline">{currentOption.label}</span>
        <ChevronDown className={clsx("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-48 z-modal rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/15 overflow-hidden"
          >
            {THEME_OPTIONS.map((option) => {
              const OptionIcon = option.Icon;
              const isActive = theme === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => { setTheme(option.value); setOpen(false); }}
                  className={clsx(
                    "flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-150",
                    isActive
                      ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                      : "text-foreground hover:bg-background-subtle"
                  )}
                >
                  <OptionIcon className={clsx("h-4 w-4 shrink-0", isActive ? "text-violet-600" : "text-foreground-muted")} />
                  {option.label}
                  {isActive && (
                    <span className="ml-auto flex h-2 w-2 rounded-full bg-violet-500" aria-label="active" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── More dropdown ───────────────────────────────────────────────────────────

const MORE_CATEGORIES = ["resume", "video"] as const;

function MoreDropdown({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  const moreCats = TOOL_CATEGORIES.filter(c => (MORE_CATEGORIES as readonly string[]).includes(c.id));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={clsx(
          "flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150",
          "text-foreground-muted hover:text-foreground hover:bg-background-subtle"
        )}
        aria-expanded={open}
        aria-haspopup="true"
      >
        More
        <ChevronDown className={clsx("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 top-full mt-2 w-80 z-modal rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/15 p-4"
          >
            {/* AI Assistants */}
            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground-subtle mb-2 px-1">AI Assistants</p>
            <div className="grid grid-cols-2 gap-1 mb-3">
              {AI_TOOLS.map((t) => {
                const Icon = t.icon;
                return (
                  <Link key={t.href} href={t.href} onClick={() => setOpen(false)}
                    className={clsx(
                      "flex items-center gap-2 rounded-xl px-3 py-2.5 transition-colors text-sm font-medium",
                      "border border-border/50 bg-card/80 backdrop-blur-sm",
                      pathname === t.href
                        ? "border-violet-500/30 bg-violet-500/10 text-violet-600"
                        : "hover:bg-background-subtle text-foreground"
                    )}>
                    <div className={clsx(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                      `bg-gradient-to-br ${t.gradient}`
                    )}>
                      <Icon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="truncate text-xs">{t.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Resume + Video categories */}
            <div className="border-t border-border/60 pt-3 mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-foreground-subtle mb-2 px-1">More Categories</p>
              <div className="space-y-1">
                {moreCats.map((cat) => {
                  const IconComp = CAT_ICONS[cat.id] ?? FileText;
                  return (
                    <Link key={cat.id} href={cat.href} onClick={() => setOpen(false)}
                      className={clsx(
                        "flex items-center gap-3 rounded-xl px-3 py-2 transition-colors",
                        pathname.startsWith(cat.href)
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-background-subtle text-foreground"
                      )}>
                      <span className={clsx(
                        "flex h-6 w-6 items-center justify-center rounded-lg shrink-0 text-xs",
                        COLOR_MAP[cat.color] ?? "bg-primary/10 text-primary"
                      )}>
                        <IconComp className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-tight">{cat.label}</p>
                        <p className="text-[10px] text-foreground-muted">{cat.toolCount} tools</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick standalone tools */}
            <div className="border-t border-border/60 pt-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-foreground-subtle mb-2 px-1">Quick Tools</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TOOLS.map((t) => {
                  const Icon = t.icon;
                  return (
                    <Link key={t.href} href={t.href} onClick={() => setOpen(false)}
                      className={clsx(
                        "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium",
                        "border border-border/50 bg-card/80 backdrop-blur-sm",
                        "text-foreground-muted hover:text-foreground hover:border-violet-500/30 hover:bg-violet-500/5 hover:text-violet-600 dark:hover:text-violet-400",
                        "transition-all duration-200"
                      )}>
                      <Icon className="h-3 w-3 shrink-0" />
                      {t.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Desktop Nav ──────────────────────────────────────────────────────────────

const MAIN_CATS = ["pdf", "image", "ai-writing", "converter", "calculator"] as const;

function DesktopNav({ pathname }: { pathname: string }) {
  const mainCats = TOOL_CATEGORIES.filter(c => (MAIN_CATS as readonly string[]).includes(c.id));

  return (
    <nav className="hidden lg:flex items-center gap-0.5 ml-4" aria-label="Main navigation">
      {mainCats.map((cat) => {
        const isActive = pathname.startsWith(cat.href);
        return (
          <Link key={cat.id} href={cat.href}
            className={clsx(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150 whitespace-nowrap",
              isActive
                ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20"
                : "text-foreground-muted hover:text-foreground hover:bg-background-subtle"
            )}>
            {cat.label}
          </Link>
        );
      })}
      <MoreDropdown pathname={pathname} />
      <Link href="/tools"
        className={clsx(
          "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150 whitespace-nowrap",
          pathname === "/tools" ? "bg-primary/10 text-primary" : "text-foreground-muted hover:text-foreground hover:bg-background-subtle"
        )}>
        All Tools
      </Link>
    </nav>
  );
}

// ─── Search ───────────────────────────────────────────────────────────────────

function NavSearch() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { query, setQuery, results, isLoading, isOpen, setIsOpen, clearSearch, inputRef } = useSearch();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [setIsOpen]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") clearSearch();
  }, [clearSearch]);

  return (
    <div ref={wrapperRef} className="relative hidden md:block">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-subtle" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search 200+ tools…"
          className={clsx(
            "h-9 w-44 rounded-xl",
            "border border-border/60 bg-card/80 backdrop-blur-sm",
            "pl-9 pr-8 text-sm text-foreground placeholder:text-foreground-subtle",
            "transition-all duration-200",
            "focus:w-60 focus:border-violet-500/50 focus:bg-card focus:shadow-[0_0_0_3px_oklch(55%_0.22_285_/_0.1)]",
            "[outline:none]"
          )}
          aria-label="Search tools"
          aria-autocomplete="list"
          aria-controls={isOpen ? "nav-search-results" : undefined}
          aria-expanded={isOpen}
          role="combobox"
        />
        {query && (
          <button onMouseDown={(e) => e.preventDefault()} onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-subtle hover:text-foreground transition-colors" aria-label="Clear search">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="nav-search-results"
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.13, ease: "easeOut" }}
            className="absolute top-full right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] z-modal rounded-xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/15 py-2 max-h-80 overflow-y-auto scrollbar-thin"
          >
            {isLoading && <div className="px-4 py-3 text-sm text-foreground-muted">Searching…</div>}

            {!isLoading && results.length === 0 && query && (
              <div className="px-4 py-5 text-center">
                <p className="text-sm text-foreground-muted">No results for &ldquo;{query}&rdquo;</p>
                <Link href={`/search?q=${encodeURIComponent(query)}`} onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setIsOpen(false)} className="mt-2 inline-block text-xs text-violet-600 hover:underline">
                  Search all tools →
                </Link>
              </div>
            )}

            {!isLoading && !query && (
              <div className="px-4 py-3 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground-subtle mb-2">Popular searches</p>
                {["Compress PDF", "Resize image", "AI rewriter", "Background remover", "Grammar check"].map((term) => (
                  <button key={term} onMouseDown={(e) => e.preventDefault()} onClick={() => { setQuery(term); }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground-muted hover:bg-background-subtle hover:text-foreground transition-colors">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-foreground-subtle" aria-hidden="true" />
                    {term}
                  </button>
                ))}
              </div>
            )}

            {!isLoading && results.length > 0 && (
              <>
                {results.map((result) => (
                  <Link key={result.id} href={result.href} role="option" aria-selected="false"
                    onMouseDown={(e) => e.preventDefault()} onClick={() => { setIsOpen(false); clearSearch(); }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-background-subtle transition-colors duration-100 cursor-pointer">
                    <span className="shrink-0 rounded-md bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">{result.type}</span>
                    <span className="font-medium truncate flex-1">{result.name}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-foreground-subtle shrink-0" aria-hidden="true" />
                  </Link>
                ))}
                <div className="border-t border-border/60 px-4 pt-2 pb-1 mt-1">
                  <Link href={`/search?q=${encodeURIComponent(query)}`} onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setIsOpen(false)} className="text-xs text-violet-600 hover:underline underline-offset-2">
                    See all results for &ldquo;{query}&rdquo; →
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Mobile Drawer ────────────────────────────────────────────────────────────

function MobileDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-overlay md:hidden bg-background/70 backdrop-blur-sm"
            onClick={onClose} aria-hidden="true" />

          <motion.div key="drawer" role="dialog" aria-modal="true" aria-label="Navigation menu"
            initial={{ x: "-100%" }} animate={{ x: "0%" }} exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38, mass: 0.8 }}
            className="fixed inset-y-0 left-0 z-modal md:hidden w-72 bg-card border-r border-border/80 shadow-2xl flex flex-col overflow-y-auto scrollbar-thin">

            <div className="flex items-center justify-between p-4 border-b border-border/60 shrink-0">
              <NavLogo />
              <button onClick={onClose} aria-label="Close navigation menu"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-foreground-muted hover:text-foreground hover:bg-background-subtle transition-all duration-150 shrink-0">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Theme switcher */}
            <div className="px-4 py-3 border-b border-border/60">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-foreground-subtle">Theme</p>
              <div className="flex gap-1.5">
                {THEME_OPTIONS.map((option) => {
                  const OptionIcon = option.Icon;
                  const isActive = theme === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      className={clsx(
                        "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium border transition-all duration-200",
                        isActive
                          ? "border-violet-500/40 bg-violet-500/10 text-violet-600"
                          : "border-border/60 bg-card text-foreground-muted hover:border-violet-500/30"
                      )}
                    >
                      <OptionIcon className="h-3.5 w-3.5" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <nav className="flex-1 p-4" aria-label="Mobile navigation">
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-foreground-subtle">Tool Categories</p>
              <ul className="space-y-0.5">
                {TOOL_CATEGORIES.map((cat) => {
                  const isActive = pathname.startsWith(cat.href);
                  return (
                    <li key={cat.id}>
                      <Link href={cat.href} onClick={onClose}
                        className={clsx(
                          "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-violet-500/10 text-violet-600 border border-violet-500/20"
                            : "text-foreground hover:bg-background-subtle"
                        )}
                        aria-current={isActive ? "page" : undefined}>
                        <div className={clsx(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                          `bg-gradient-to-br ${cat.gradient}`
                        )}>
                          {(() => {
                            const IconComp = CAT_ICONS[cat.id] ?? FileText;
                            return <IconComp className="h-4 w-4 text-white" />;
                          })()}
                        </div>
                        <span className="flex-1">{cat.label}</span>
                        <span className="text-xs text-foreground-subtle">{cat.toolCount}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 pt-4 border-t border-border/60">
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-foreground-subtle">AI Assistants</p>
                <ul className="space-y-0.5">
                  {AI_TOOLS.map((t) => {
                    const Icon = t.icon;
                    return (
                      <li key={t.href}>
                        <Link href={t.href} onClick={onClose}
                          className={clsx(
                            "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                            "border border-border/50 bg-card/80 backdrop-blur-sm",
                            pathname === t.href
                              ? "border-violet-500/30 bg-violet-500/10 text-violet-600"
                              : "text-foreground hover:bg-background-subtle"
                          )}>
                          <div className={clsx(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                            `bg-gradient-to-br ${t.gradient}`
                          )}>
                            <Icon className="h-3.5 w-3.5 text-white" />
                          </div>
                          <span className="text-xs">{t.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="mt-4 pt-4 border-t border-border/60">
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-foreground-subtle">Quick Tools</p>
                <div className="flex flex-wrap gap-1.5 px-3">
                  {QUICK_TOOLS.map((t) => {
                    const Icon = t.icon;
                    return (
                      <Link key={t.href} href={t.href} onClick={onClose}
                        className={clsx(
                          "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium",
                          "border border-border/50 bg-card/80 backdrop-blur-sm",
                          "text-foreground-muted hover:text-foreground hover:border-violet-500/30 hover:bg-violet-500/5",
                          "transition-all duration-200"
                        )}>
                        <Icon className="h-3 w-3 shrink-0" />
                        {t.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border/60 space-y-0.5">
                {[{ href: "/pricing", label: "Pricing" }, { href: "/blog", label: "Blog" }, { href: "/about", label: "About" }].map(({ href, label }) => (
                  <Link key={href} href={href} onClick={onClose}
                    className="flex items-center rounded-xl px-3 py-3 text-sm font-medium text-foreground-muted hover:text-foreground hover:bg-background-subtle transition-colors">
                    {label}
                  </Link>
                ))}
              </div>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Navbar (main export) ─────────────────────────────────────────────────────

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      <header className={clsx(
        "fixed top-0 left-0 right-0 z-navbar",
        "flex h-16 items-center",
        "transition-all duration-300",
        "bg-background/80 backdrop-blur-xl border-b border-border/60",
        scrolled ? "shadow-md md:shadow-xl" : "shadow-none"
      )}>
        <div className="container mx-auto flex items-center gap-3 px-4">
          {/* Mobile hamburger */}
          <button
            className="md:hidden shrink-0 flex h-10 w-10 items-center justify-center rounded-xl text-foreground-muted hover:text-foreground hover:bg-background-subtle transition-all duration-150"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-drawer"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <NavLogo />

          {/* Desktop nav */}
          <DesktopNav pathname={pathname} />

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right cluster */}
          <div className="flex items-center gap-2 shrink-0">
            <NavSearch />

            {/* Mobile search link */}
            <Link href="/search" aria-label="Search tools"
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl text-foreground-muted hover:text-foreground hover:bg-background-subtle transition-all duration-150">
              <Search className="h-4 w-4" />
            </Link>

            {/* Theme toggle */}
            <ThemeSwitcherButton />
          </div>
        </div>
      </header>

      <div className="h-16" aria-hidden="true" />
      <MobileDrawer isOpen={mobileOpen} onClose={closeMobile} />
    </>
  );
}