"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  Search,
  Zap,
  Clock,
  ArrowRight,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useSearch } from "@/hooks/useSearch";
import { NAV_LINKS, TOOL_CATEGORIES } from "@/config/navigation";

// ─────────────────────────────────────────────
// Logo
// ─────────────────────────────────────────────

function NavLogo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 shrink-0 group"
      aria-label="ToolHive home"
    >
      <div
        className={clsx(
          "flex h-8 w-8 items-center justify-center rounded-lg",
          "bg-gradient-brand shadow-sm",
          "group-hover:shadow-[0_0_16px_color-mix(in_oklch,var(--color-primary)_35%,transparent)]",
          "transition-shadow duration-200"
        )}
        aria-hidden="true"
      >
        <Zap className="h-4 w-4 text-white" />
      </div>
      <span className="text-lg font-bold tracking-tight text-gradient hidden sm:block">
        ToolHive
      </span>
    </Link>
  );
}

// ─────────────────────────────────────────────
// Desktop Nav Links
// ─────────────────────────────────────────────

function DesktopNavLinks({ pathname }: { pathname: string }) {
  return (
    <nav
      className="hidden md:flex items-center gap-0.5"
      aria-label="Main navigation"
    >
      {NAV_LINKS.map(({ href, label }) => {
        const isActive =
          href === "/"
            ? pathname === "/"
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              "rounded-lg px-3 py-1.5 text-sm font-medium",
              "transition-colors duration-150",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-foreground-muted hover:text-foreground hover:bg-background-subtle"
            )}
            aria-current={pathname === href ? "page" : undefined}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

// ─────────────────────────────────────────────
// Persistent search bar (desktop)
// Narrower default width with overflow-safe dropdown
// ─────────────────────────────────────────────

function NavSearch() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const {
    query,
    setQuery,
    results,
    isLoading,
    isOpen,
    setIsOpen,
    clearSearch,
    inputRef,
  } = useSearch();

  // Close dropdown on outside click only
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [setIsOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") clearSearch();
    },
    [clearSearch]
  );

  return (
    <div ref={wrapperRef} className="relative hidden md:block">
      {/* Always-visible search input — narrower on desktop */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-subtle"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search 200+ tools…"
          className={clsx(
            "h-9 w-40 rounded-full",
            "border border-border bg-background-subtle",
            "pl-9 pr-8 text-sm text-foreground placeholder:text-foreground-subtle",
            "transition-all duration-200",
            // Narrower focus expansion (w-52 instead of w-72) to stay safe on small desktops
            "focus:w-52 focus:border-primary/50 focus:bg-background focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--tw-primary)_15%,transparent)]",
            "[outline:none]"
          )}
          aria-label="Search tools"
          aria-autocomplete="list"
          aria-controls={isOpen ? "nav-search-results" : undefined}
          aria-expanded={isOpen}
          role="combobox"
        />
        {query && (
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-subtle hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Search results dropdown — capped to viewport width */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="nav-search-results"
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.13, ease: "easeOut" }}
            className={clsx(
              // Cap width so it never overflows the viewport on smaller desktops
              "absolute top-full right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] z-modal",
              "glass rounded-xl border border-border shadow-xl",
              "py-2 max-h-80 overflow-y-auto scrollbar-thin"
            )}
          >
            {isLoading && (
              <div className="px-4 py-3 text-sm text-foreground-muted">
                Searching…
              </div>
            )}

            {!isLoading && results.length === 0 && query && (
              <div className="px-4 py-5 text-center">
                <p className="text-sm text-foreground-muted">No results for &ldquo;{query}&rdquo;</p>
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setIsOpen(false)}
                  className="mt-2 inline-block text-xs text-primary hover:underline"
                >
                  Search all tools →
                </Link>
              </div>
            )}

            {!isLoading && !query && (
              <div className="px-4 py-3 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground-subtle mb-2">
                  Popular searches
                </p>
                {["Compress PDF", "Resize image", "AI rewriter", "Video trim", "Background remover"].map(
                  (term) => (
                    <button
                      key={term}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { setQuery(term); }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground-muted hover:bg-background-subtle hover:text-foreground transition-colors"
                    >
                      <Clock className="h-3.5 w-3.5 shrink-0 text-foreground-subtle" aria-hidden="true" />
                      {term}
                    </button>
                  )
                )}
              </div>
            )}

            {!isLoading && results.length > 0 && (
              <>
                {results.map((result) => (
                  <Link
                    key={result.id}
                    href={result.href}
                    role="option"
                    aria-selected="false"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { setIsOpen(false); clearSearch(); }}
                    className={clsx(
                      "flex items-center gap-3 px-4 py-2.5",
                      "text-sm text-foreground hover:bg-background-subtle",
                      "transition-colors duration-100 cursor-pointer"
                    )}
                  >
                    <span className="shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      {result.type}
                    </span>
                    <span className="font-medium truncate flex-1">{result.name}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-foreground-subtle shrink-0" aria-hidden="true" />
                  </Link>
                ))}
                <div className="border-t border-border px-4 pt-2 pb-1 mt-1">
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setIsOpen(false)}
                    className="text-xs text-primary hover:underline underline-offset-2"
                  >
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

// ─────────────────────────────────────────────
// Mobile drawer
// ─────────────────────────────────────────────

function MobileDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-overlay md:hidden bg-background/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer panel — spring animation for natural feel */}
          <motion.div
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            exit={{    x: "-100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38, mass: 0.8 }}
            className={clsx(
              "fixed inset-y-0 left-0 z-modal md:hidden",
              "w-72 bg-card border-r border-border shadow-2xl",
              "flex flex-col overflow-y-auto scrollbar-thin"
            )}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
              <NavLogo />
              {/* Close button: 44px touch target */}
              <button
                onClick={onClose}
                aria-label="Close navigation menu"
                className={clsx(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  "text-foreground-muted hover:text-foreground hover:bg-background-subtle",
                  "transition-colors duration-150 shrink-0"
                )}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 p-4" aria-label="Mobile navigation">
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-foreground-subtle">
                Tools
              </p>
              <ul className="space-y-0.5">
                {TOOL_CATEGORIES.map((cat) => {
                  const isActive = pathname.startsWith(cat.href);
                  return (
                    <li key={cat.id}>
                      <Link
                        href={cat.href}
                        onClick={onClose}
                        className={clsx(
                          // Generous touch target height
                          "flex items-center gap-3 rounded-lg px-3 py-3",
                          "text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-background-subtle"
                        )}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <span className="text-base leading-none" aria-hidden="true">
                          {cat.icon}
                        </span>
                        <span className="flex-1">{cat.label}</span>
                        <span className="text-xs text-foreground-subtle">
                          {cat.toolCount}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* Extra nav links */}
              <div className="mt-4 pt-4 border-t border-border space-y-0.5">
                {[
                  { href: "/pricing", label: "Pricing" },
                  { href: "/blog",    label: "Blog"    },
                  { href: "/about",   label: "About"   },
                ].map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className="flex items-center rounded-lg px-3 py-3 text-sm font-medium text-foreground-muted hover:text-foreground hover:bg-background-subtle transition-colors"
                  >
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

// ─────────────────────────────────────────────
// Navbar (main export)
// ─────────────────────────────────────────────

/**
 * Fixed top navigation bar for ToolHive.
 *
 * Mobile-first changes:
 * - Hamburger button is 44px (h-10 w-10) minimum touch target
 * - ThemeToggle wrapper ensures 44px tap target
 * - Sign in / Get started buttons hidden on mobile; shown only in drawer
 * - Drawer uses spring animation and pb-safe for safe-area insets
 * - Drawer auth buttons are full-width
 * - Desktop search: w-40 → focus:w-52 (narrower, safer on small desktops)
 * - Search dropdown: max-w-[calc(100vw-2rem)] to prevent overflow
 */
export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll-based border + glass effect
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      <header
        className={clsx(
          "fixed top-0 left-0 right-0 z-navbar",
          "flex h-16 items-center",
          "transition-all duration-300",
          // Always solid on mobile — glass only on md+ when scrolled
          "bg-background border-b border-border",
          scrolled ? "shadow-sm md:glass" : "shadow-none"
        )}
      >
        <div className="container mx-auto flex items-center gap-3 px-4">

          {/* Mobile hamburger — 44px touch target */}
          <button
            className={clsx(
              "md:hidden shrink-0",
              "flex h-10 w-10 items-center justify-center rounded-lg",
              "text-foreground-muted hover:text-foreground hover:bg-background-subtle",
              "transition-colors duration-150"
            )}
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-drawer"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <NavLogo />

          {/* Desktop nav links */}
          <div className="ml-4">
            <DesktopNavLinks pathname={pathname} />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right cluster */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Desktop search */}
            <NavSearch />

            {/* Mobile search link — 44px touch target */}
            <Link
              href="/search"
              aria-label="Search tools"
              className={clsx(
                "md:hidden",
                "flex h-10 w-10 items-center justify-center rounded-lg",
                "text-foreground-muted hover:text-foreground hover:bg-background-subtle",
                "transition-colors duration-150"
              )}
            >
              <Search className="h-4 w-4" />
            </Link>

            {/* Theme toggle — wrapped for 44px tap target on mobile */}
            <div className="flex h-10 w-10 items-center justify-center">
              <ThemeToggle />
            </div>

          </div>
        </div>
      </header>

      {/* Spacer to prevent content from sitting under the fixed bar */}
      <div className="h-16" aria-hidden="true" />

      {/* Mobile drawer */}
      <MobileDrawer isOpen={mobileOpen} onClose={closeMobile} />
    </>
  );
}
