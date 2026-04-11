"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Theme, ThemeContextValue } from "@/types";

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null);
ThemeContext.displayName = "ThemeContext";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const STORAGE_KEY = "toolhive-theme";
const DARK_CLASS = "dark";

// ─────────────────────────────────────────────
// Safe localStorage helpers
// ─────────────────────────────────────────────

function readStorage(): Theme | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "light" || raw === "dark" || raw === "system") return raw;
    return null;
  } catch {
    // localStorage unavailable (private browsing, storage-access policy, etc.)
    return null;
  }
}

function writeStorage(value: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Silently ignore — the theme still works for this session.
  }
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(resolved: "light" | "dark"): void {
  const root = document.documentElement;

  if (resolved === "dark") {
    root.classList.add(DARK_CLASS);
  } else {
    root.classList.remove(DARK_CLASS);
  }

  // Keep meta theme-color in sync for mobile browser chrome / PWA.
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute(
      "content",
      resolved === "dark" ? "#0f0e14" : "#ffffff"
    );
  }
}

/**
 * Briefly suppress CSS transitions so that React hydration re-applies the
 * theme class without an animated flash.  The inline script in layout.tsx
 * already handles the very first paint — this guards the React reconcile.
 */
function withoutTransitions(fn: () => void): void {
  const root = document.documentElement;
  root.classList.add("no-transitions");
  fn();
  // Two rAFs: let the DOM apply the class change, then re-enable transitions
  // so the next user interaction gets the full animation.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root.classList.remove("no-transitions");
    });
  });
}

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────

interface ThemeProviderProps {
  children: React.ReactNode;
  /** Default theme before localStorage is read. Defaults to "system". */
  defaultTheme?: Theme;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps) {
  // Initialise state from localStorage immediately (client) so the React tree
  // matches what the inline script already painted.  On the server we cannot
  // read localStorage, so we defer to defaultTheme.
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    return readStorage() ?? defaultTheme;
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const stored = readStorage() ?? defaultTheme;
    return stored === "system" ? getSystemTheme() : stored;
  });

  // On mount: reconcile with localStorage and ensure the DOM class is correct.
  // withoutTransitions() prevents a visible animated sweep when nothing
  // actually needs to change (which is the common case).
  useEffect(() => {
    const stored = readStorage() ?? defaultTheme;
    const resolved = stored === "system" ? getSystemTheme() : stored;

    withoutTransitions(() => {
      setThemeState(stored);
      setResolvedTheme(resolved);
      applyTheme(resolved);
    });
  // defaultTheme is a prop from the static layout — it never changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When theme is "system", follow OS preference changes in real time.
  useEffect(() => {
    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handler = (e: MediaQueryListEvent) => {
      const resolved = e.matches ? "dark" : "light";
      setResolvedTheme(resolved);
      applyTheme(resolved);
    };

    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    const resolved = next === "system" ? getSystemTheme() : next;
    writeStorage(next);
    setThemeState(next);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  // Cycles through all three options: light → dark → system → light
  const toggleTheme = useCallback(() => {
    setTheme(
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light"
    );
  }, [theme, setTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  );

  // Do NOT hide children while resolving. The inline <script> in layout.tsx
  // applies the correct .dark class before first paint, eliminating the need
  // to suppress rendering. Hiding children only causes a jarring layout shift.
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return ctx;
}
