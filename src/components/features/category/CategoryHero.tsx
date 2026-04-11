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
// CategoryHero
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

  // Filter results to this category only
  const scopedResults = results.filter(
    (r) => r.type === "tool" && r.category === (category.id as ToolCategory)
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen) return;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((p) =>
            p < scopedResults.length - 1 ? p + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((p) =>
            p > 0 ? p - 1 : scopedResults.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (activeIndex >= 0 && scopedResults[activeIndex]) {
            commitSearch(query);
            router.push(scopedResults[activeIndex].href);
            setIsOpen(false);
          } else if (query.trim()) {
            commitSearch();
            router.push(
              `/search?q=${encodeURIComponent(query.trim())}&category=${category.id}`
            );
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

  // Reset active index when results change
  React.useEffect(() => {
    setActiveIndex(-1);
  }, [scopedResults.length]);

  const showDropdown = isOpen && query.trim().length > 0;

  return (
    <div className="relative border-b border-border bg-background-subtle overflow-hidden">
      {/* Subtle radial gradient overlay */}
      <div
        aria-hidden="true"
        className={clsx(
          "pointer-events-none absolute inset-0 opacity-40",
          `bg-gradient-to-br ${category.gradient}`
        )}
        style={{ opacity: 0.04 }}
      />

      <div className="container mx-auto px-4 py-10 lg:py-14">
        {/* ── Breadcrumb ── */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-1.5 text-xs text-foreground-subtle"
        >
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Home className="h-3 w-3" aria-hidden="true" />
            <span>Home</span>
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0" aria-hidden="true" />
          <Link
            href="/tools"
            className="hover:text-foreground transition-colors"
          >
            Tools
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="font-medium text-foreground" aria-current="page">
            {category.label}
          </span>
        </nav>

        {/* ── Hero content ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-8">
          {/* Category icon */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={clsx(
              "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl",
              `bg-gradient-to-br ${category.gradient}`,
              "shadow-lg"
            )}
            aria-hidden="true"
          >
            <Icon className="h-8 w-8 text-white" />
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" }}
          >
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                {category.label}
              </h1>
              {/* Tool count badge */}
              <span
                className={clsx(
                  "inline-flex items-center rounded-full px-2.5 py-0.5",
                  "text-xs font-medium",
                  "bg-background-muted text-foreground-muted border border-border"
                )}
              >
                {category.toolCount} tools
              </span>
            </div>
            <p className="mt-2 text-foreground-muted max-w-xl text-base">
              {category.description}
            </p>
          </motion.div>
        </div>

        {/* ── Scoped search bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
          className="relative max-w-xl"
        >
          <div
            role="combobox"
            aria-expanded={showDropdown}
            aria-haspopup="listbox"
            aria-owns="hero-search-listbox"
            className={clsx(
              "flex items-center gap-3 rounded-xl border bg-background px-4 shadow-sm",
              "transition-all duration-200 h-12",
              isOpen && query
                ? "border-primary shadow-[0_0_0_3px_color-mix(in_oklch,var(--tw-primary)_20%,transparent)]"
                : "border-border hover:border-border-strong"
            )}
          >
            <span className="shrink-0 text-foreground-subtle" aria-hidden="true">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
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
              aria-activedescendant={
                activeIndex >= 0 ? `hero-result-${activeIndex}` : undefined
              }
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
                  "flex items-center justify-center h-5 w-5 rounded-full shrink-0",
                  "bg-foreground-subtle/20 hover:bg-foreground-subtle/30",
                  "text-foreground-subtle hover:text-foreground",
                  "transition-colors duration-150"
                )}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Scoped search dropdown */}
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                key="hero-dropdown"
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className={clsx(
                  "absolute left-0 right-0 top-[calc(100%+8px)]",
                  "rounded-2xl border border-card-border bg-card shadow-xl",
                  "overflow-hidden z-modal"
                )}
                style={{ zIndex: 60 }}
              >
                {isLoading ? (
                  <div className="flex flex-col gap-2 p-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg animate-shimmer shrink-0" />
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
                              "flex w-full items-center gap-3 px-4 py-2.5",
                              "transition-colors duration-100 text-left",
                              activeIndex === i
                                ? "bg-primary/8"
                                : "hover:bg-background-subtle"
                            )}
                          >
                            <div
                              className={clsx(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                                `bg-gradient-to-br ${category.gradient} opacity-90`
                              )}
                              aria-hidden="true"
                            >
                              <ResultIcon className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
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

                    {/* Footer */}
                    <li className="border-t border-border px-4 py-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          commitSearch();
                          router.push(
                            `/search?q=${encodeURIComponent(query.trim())}&category=${category.id}`
                          );
                          setIsOpen(false);
                        }}
                        className="w-full text-left text-xs font-medium text-primary hover:underline underline-offset-2"
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
                        router.push(
                          `/search?q=${encodeURIComponent(query.trim())}`
                        );
                        setIsOpen(false);
                      }}
                      className="mt-2 text-xs text-primary hover:underline underline-offset-2"
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
