import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";

// ─────────────────────────────────────────────
// Variants
// ─────────────────────────────────────────────

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-medium transition-colors",
  {
    variants: {
      variant: {
        /** Neutral muted default */
        default:     "bg-background-muted text-foreground-muted border border-border",
        /** Semantic primary/violet */
        primary:     "bg-primary/10 text-primary border border-primary/20",
        /** Semantic secondary/blue */
        secondary:   "bg-secondary/10 text-secondary border border-secondary/20",
        /** Accent/cyan */
        accent:      "bg-accent/10 text-accent border border-accent/20",
        /** Success — green */
        success:     "bg-success/10 text-success border border-success/20",
        /** Warning — amber */
        warning:     "bg-warning/10 text-[var(--tw-warning-fg)] border border-warning/20",
        /** Error / destructive — red */
        error:       "bg-destructive/10 text-destructive border border-destructive/20",
        /** Info — blue */
        info:        "bg-info/10 text-info border border-info/20",
        /** Muted, low-contrast label */
        muted:       "bg-transparent text-foreground-subtle border border-border",
        /** Gradient fill — violet→cyan. Used for Pro badge etc. */
        gradient:    "bg-gradient-brand text-white border-0 shadow-sm",
        /** "New" label — violet → blue gradient */
        new:         "bg-gradient-to-r from-violet-500 to-blue-500 text-white border-0 shadow-sm",
        /** "Popular" label — orange → rose gradient */
        popular:     "bg-gradient-to-r from-orange-400 to-rose-500 text-white border-0 shadow-sm",
        /** "Premium" label — gold/amber gradient */
        premium:     "bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 shadow-sm",
        /** "Free" label — teal/green */
        free:        "bg-success/10 text-success border border-success/30",
      },
      size: {
        /** Extra-small — for tight spaces like cards */
        sm: "px-1.5 py-0 text-[10px] leading-5",
        /** Default — most use cases */
        md: "px-2 py-0.5 text-xs",
        /** Larger — standalone usage */
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size:    "md",
    },
  }
);

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Render a small colored dot before the label.
   * Inherits current text color.
   */
  dot?: boolean;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

/**
 * Compact label component for statuses, categories, and feature flags.
 * Supports 14 visual variants and 3 sizes.
 *
 * @example
 * <Badge variant="new" size="sm">New</Badge>
 * <Badge variant="popular" dot>Popular</Badge>
 * <Badge variant="premium">Pro</Badge>
 */
export function Badge({
  className,
  variant,
  size,
  dot,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={clsx(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {dot && (
        <span
          className="inline-block h-1.5 w-1.5 rounded-full bg-current shrink-0"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

// Re-export for composability
export { badgeVariants };
