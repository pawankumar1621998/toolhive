"use client";

/**
 * Toast notification system — self-contained, no external dependencies beyond zustand.
 *
 * Usage:
 *   const { toast } = useToast();
 *   toast({ title: "Done!", description: "File processed.", variant: "success" });
 *   toast({ title: "Error", variant: "error", duration: 6000 });
 *   toast({ title: "Upgrade", variant: "info", action: { label: "View plans", onClick: () => router.push("/pricing") } });
 *
 * Architecture:
 *   - useToastStore (Zustand internal store)
 *   - useToast()   — public hook for triggering/dismissing toasts
 *   - <Toaster />  — renders active toasts; place once in root layout
 */

import React, { useEffect, useState } from "react";
import { create } from "zustand";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cva } from "class-variance-authority";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** Auto-dismiss duration in ms. Set to 0 to disable. Defaults to 4000. */
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ─────────────────────────────────────────────
// Internal Zustand store
// ─────────────────────────────────────────────

interface ToastStore {
  toasts: Toast[];
  add:        (toast: Omit<Toast, "id">) => string;
  dismiss:    (id: string) => void;
  dismissAll: () => void;
}

let _counter = 0;

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  add: (toast) => {
    const id = `toast-${++_counter}`;
    set((s) => ({
      // Cap at 5 simultaneous toasts — oldest is pushed out
      toasts: [...s.toasts.slice(-4), { ...toast, id }],
    }));
    return id;
  },

  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  dismissAll: () => set({ toasts: [] }),
}));

// ─────────────────────────────────────────────
// Public hook
// ─────────────────────────────────────────────

/**
 * Returns helpers to trigger and dismiss toast notifications.
 *
 * @example
 * const { toast, dismiss, dismissAll } = useToast();
 * const id = toast({ title: "Saved!", variant: "success" });
 * dismiss(id); // manual early dismiss
 */
export function useToast() {
  const { add, dismiss, dismissAll } = useToastStore();
  return {
    toast:      (options: Omit<Toast, "id">) => add(options),
    dismiss,
    dismissAll,
  };
}

// ─────────────────────────────────────────────
// Styling
// ─────────────────────────────────────────────

const toastVariants = cva(
  [
    "pointer-events-auto flex w-full max-w-sm items-start gap-3",
    "rounded-xl border p-4 shadow-xl",
    "transition-colors duration-200",
  ],
  {
    variants: {
      variant: {
        default: "bg-card border-card-border text-foreground",
        success: "bg-success/8 border-success/25 text-foreground",
        error:   "bg-destructive/8 border-destructive/25 text-foreground",
        warning: "bg-warning/8 border-warning/25 text-foreground",
        info:    "bg-info/8 border-info/25 text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

// Icon map — color-coded per variant
const ICONS: Record<ToastVariant, React.ReactElement> = {
  default: <Info      className="h-5 w-5 text-foreground-muted shrink-0 mt-0.5" />,
  success: <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />,
  error:   <AlertCircle  className="h-5 w-5 text-destructive shrink-0 mt-0.5" />,
  warning: <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />,
  info:    <Info      className="h-5 w-5 text-info shrink-0 mt-0.5" />,
};

// ─────────────────────────────────────────────
// Progress bar sub-component
// ─────────────────────────────────────────────

function ToastProgress({
  duration,
  variant,
}: {
  duration: number;
  variant: ToastVariant;
}) {
  const [width, setWidth] = useState(100);

  useEffect(() => {
    const start = Date.now();
    const raf = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setWidth(remaining);
      if (remaining > 0) requestAnimationFrame(raf);
    };
    const id = requestAnimationFrame(raf);
    return () => cancelAnimationFrame(id);
  }, [duration]);

  const colorMap: Record<ToastVariant, string> = {
    default: "bg-foreground-muted",
    success: "bg-success",
    error:   "bg-destructive",
    warning: "bg-warning",
    info:    "bg-info",
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl overflow-hidden bg-border/30">
      <div
        className={clsx("h-full transition-none", colorMap[variant])}
        style={{ width: `${width}%` }}
        aria-hidden="true"
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// Toast Item
// ─────────────────────────────────────────────

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss  = useToastStore((s) => s.dismiss);
  const variant  = toast.variant ?? "default";
  const duration = toast.duration ?? 4000;

  // Auto-dismiss
  useEffect(() => {
    if (duration === 0) return;
    const timer = setTimeout(() => dismiss(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, dismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.96 }}
      animate={{ opacity: 1, x: 0,  scale: 1    }}
      exit={{    opacity: 0, x: 60, scale: 0.94, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
    >
      <div
        className={clsx(toastVariants({ variant }), "relative overflow-hidden")}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        {ICONS[variant]}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-snug">{toast.title}</p>
          {toast.description && (
            <p className="mt-0.5 text-xs text-foreground-muted leading-relaxed line-clamp-2">
              {toast.description}
            </p>
          )}
          {toast.action && (
            <button
              onClick={() => {
                toast.action!.onClick();
                dismiss(toast.id);
              }}
              className="mt-1.5 text-xs font-semibold text-primary hover:underline underline-offset-2 focus-visible:outline-none"
            >
              {toast.action.label}
            </button>
          )}
        </div>

        <button
          onClick={() => dismiss(toast.id)}
          className={clsx(
            "shrink-0 rounded-md p-1 -mt-0.5 -mr-0.5",
            "text-foreground-subtle hover:text-foreground",
            "hover:bg-background-muted transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
          aria-label="Dismiss notification"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Auto-dismiss progress bar */}
        {duration > 0 && (
          <ToastProgress duration={duration} variant={variant} />
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Toaster — renders in root layout
// ─────────────────────────────────────────────

/**
 * Place once at the root layout level.
 * Renders active toasts in a fixed bottom-right stack.
 *
 * @example
 * // src/app/layout.tsx
 * <body>
 *   ...
 *   <Toaster />
 * </body>
 */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      className={clsx(
        "fixed bottom-4 right-4 z-toast",
        "flex flex-col-reverse gap-2",
        "w-[calc(100vw-2rem)] max-w-sm",
        "pointer-events-none",
        // Full width on small screens
        "sm:w-[22rem]"
      )}
      aria-label="Notifications"
      aria-live="polite"
      aria-relevant="additions removals"
    >
      <AnimatePresence mode="sync" initial={false}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
