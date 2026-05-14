"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as LucideIcons from "lucide-react";
import {
  Search,
  X,
  ChevronRight,
  Home,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { useSearch } from "@/hooks/useSearch";
import type { ToolCategory } from "@/types";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface CategoryHeroCategory {
  id: string;
  label: string;
  description: string;
  iconName: string;
  gradient: string;
  toolCount: number;
  href: string;
}

interface CategoryHeroProps {
  category: CategoryHeroCategory;
}

// ─────────────────────────────────────────────────────────────────
// CategoryHero — premium redesigned
// ─────────────────────────────────────────────────────────────────

export function CategoryHero({ category }: CategoryHeroProps) {
  const router = useRouter();
  const {
    query,
    setQuery,
    results,
    isLoading,
    isOpen,
    setIsOpen,
    clearSearch,
    commitSearch,
    inputRef,
  } = useSearch(250);

  const [activeIndex, setActiveIndex] = useState(-1);

  const Icon =
    (LucideIcons as unknown as Record<string, React.FC<{ className?: string }>>)[category.iconName] ??
    LucideIcons.Wrench;

  const scopedResults = results.filter(
    (r) => r.type === "tool" && r.category === (category.id as ToolCategory)
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen) return;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((p) => p < scopedResults.length - 1 ? p + 1 : 0);
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((p) => p > 0 ? p - 1 : scopedResults.length - 1);
          break;
        case "Enter":
          e.preventDefault();
          if (activeIndex >= 0 && scopedResults[activeIndex]) {
            commitSearch(query);
            router.push(scopedResults[activeIndex].href);
            setIsOpen(false);
          } else if (query.trim()) {
            commitSearch();
            router.push(`/search?q=${encodeURIComponent(query.trim())}&category=${category.id}`);
            setIsOpen(false);
          }
          break;
        case "Escape":
          setIsOpen(false);
          inputRef.current?.blur();
          break;
      }
    },
    [isOpen, scopedResults, activeIndex, commitSearch, query, router, category.id, setIsOpen, inputRef]
  );

  React.useEffect(() => { setActiveIndex(-1); }, [scopedResults.length]);

  const showDropdown = isOpen && query.trim().length > 0;

  return (
    <div className="relative overflow-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 -z-10" style={{
        backgroundImage: [
          `radial-gradient(ellipse at 0% 50%, oklch(55% 0.22 285 / 0.05) 0%, transparent 50%)`,
          `radial-gradient(ellipse at 100% 50%, oklch(58% 0.2 248 / 0.04) 0%, transparent 50%)`,
        ].join(", "),
      }} />
      <div className="absolute inset-0 -z-10 bg-background" />
      {/* Top accent line */}
      <div className={clsx("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r", category.gradient)} />

      <div className="container mx-auto px-4 py-10 lg:py-14">

        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-1.5 text-xs text-foreground-subtle"
        >
          <Link href="/" className="hover:text-violet-600 transition-colors font-medium">
            <Home className="h-3 w-3 inline mr-1" aria-hidden="true" />
            Home
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0" aria-hidden="true" />
          <Link href="/tools" className="hover:text-violet-600 transition-colors font-medium">
            Tools
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="font-semibold text-foreground" aria-current="page">
            {category.label}
          </span>
        </nav>

        {/* Hero content */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-8">
          {/* Category icon */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={clsx(
              "relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl",
              `bg-gradient-to-br ${category.gradient}`,
              "shadow-xl shadow-black/10"
            )}
            aria-hidden="true"
          >
            <Icon className="h-8 w-8 text-white" />
            {/* Glow */}
            <div
              className={clsx("absolute inset-0 rounded-2xl opacity-30", `bg-gradient-to-br ${category.gradient} blur-lg`)}
              style={{ transform: "scale(1.3)" }}
            />
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                {category.label}
              </h1>
              <span className={clsx(
                "inline-flex items-center rounded-xl px-3 py-1 text-xs font-bold",
                "bg-gradient-to-br from-violet-500/10 to-purple-500/10",
                "border border-violet-500/20 text-violet-600 dark:text-violet-400"
              )}>
                {category.toolCount} tools
              </span>
            </div>
            <p className="mt-2 text-foreground-muted max-w-xl text-base leading-relaxed">
              {category.description}
            </p>
          </motion.div>
        </div>

        {/* Scoped search bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 0.61, 0.36, 1] }}
          className="relative max-w-xl"
        >
          <div
            role="combobox"
            aria-expanded={showDropdown}
            aria-haspopup="listbox"
            aria-owns="hero-search-listbox"
            className={clsx(
              "flex items-center gap-3 rounded-2xl border-2",
              "bg-card/80 backdrop-blur-sm px-4 shadow-lg shadow-black/5",
              "transition-all duration-250 h-12",
              isOpen && query
                ? "border-violet-500/50 shadow-[0_0_0_4px_oklch(55%_0.22_285_/_0.08),0_8px_24px_-4px_rgb(0_0_0/_0.1)]"
                : "border-border/60 hover:border-violet-500/30"
            )}
          >
            <span className="shrink-0 text-foreground-subtle" aria-hidden="true">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </span>

            <input
              ref={inputRef}
              type="search"
              role="searchbox"
              autoComplete="off"
              spellCheck={false}
              aria-label={`Search ${category.label}`}
              aria-autocomplete="list"
              aria-controls="hero-search-listbox"
              aria-activedescendant={activeIndex >= 0 ? `hero-result-${activeIndex}` : undefined}
              placeholder={`Search ${category.label}…`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
              className={clsx(
                "flex-1 bg-transparent text-sm text-foreground",
                "placeholder:text-foreground-subtle",
                "outline-none border-none focus:ring-0"
              )}
            />

            {query && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className={clsx(
                  "flex items-center justify-center h-6 w-6 rounded-full shrink-0",
                  "bg-background-muted text-foreground-subtle hover:text-foreground hover:bg-background-muted/80",
                  "transition-all duration-150"
                )}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Scoped search dropdown */}
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                key="hero-dropdown"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/15 overflow-hidden"
              >
                {isLoading ? (
                  <div className="flex flex-col gap-2.5 p-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl animate-shimmer shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 w-2/5 rounded animate-shimmer" />
                          <div className="h-2.5 w-3/4 rounded animate-shimmer" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : scopedResults.length > 0 ? (
                  <ul
                    id="hero-search-listbox"
                    role="listbox"
                    aria-label={`${category.label} search results`}
                    className="py-2"
                  >
                    {scopedResults.slice(0, 6).map((result, i) => {
                      const ResultIcon =
                        result.icon
                          ? (LucideIcons as unknown as Record<string, React.FC<{ className?: string }>>)[result.icon] ??
                            LucideIcons.Wrench
                          : LucideIcons.Wrench;
                      return (
                        <li
                          key={result.id}
                          id={`hero-result-${i}`}
                          role="option"
                          aria-selected={activeIndex === i}
                        >
                          <button
                            type="button"
                            onMouseEnter={() => setActiveIndex(i)}
                            onClick={() => {
                              commitSearch(query);
                              router.push(result.href);
                              setIsOpen(false);
                            }}
                            className={clsx(
                              "flex w-full items-center gap-3 px-4 py-3",
                              "transition-all duration-150 text-left",
                              "hover:bg-background-subtle",
                              activeIndex === i
                                ? "bg-violet-500/8 text-violet-600"
                                : "text-foreground"
                            )}
                          >
                            <div
                              className={clsx(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                                `bg-gradient-to-br ${category.gradient}`,
                                "shadow-md"
                              )}
                              aria-hidden="true"
                            >
                              <ResultIcon className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">
                                {result.name}
                              </p>
                              <p className="text-xs text-foreground-muted truncate">
                                {result.description}
                              </p>
                            </div>
                          </button>
                        </li>
                      );
                    })}

                    <li className="border-t border-border/60 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          commitSearch();
                          router.push(`/search?q=${encodeURIComponent(query.trim())}&category=${category.id}`);
                          setIsOpen(false);
                        }}
                        className="w-full text-left text-xs font-semibold text-violet-600 hover:underline underline-offset-2"
                      >
                        See all results for &ldquo;{query}&rdquo; in {category.label}
                      </button>
                    </li>
                  </ul>
                ) : (
                  <div className="px-6 py-8 text-center">
                    <p className="text-sm text-foreground-muted">
                      No {category.label} tools match &ldquo;{query}&rdquo;
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        commitSearch();
                        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                        setIsOpen(false);
                      }}
                      className="mt-2 text-xs text-violet-600 hover:underline underline-offset-2 font-semibold"
                    >
                      Search all categories instead
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}