"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { Loader2 } from "lucide-react";

// ─────────────────────────────────────────────
// Variants
// ─────────────────────────────────────────────

const buttonVariants = cva(
  // Base classes — applied to every variant
  [
    "inline-flex items-center justify-center gap-2",
    "whitespace-nowrap rounded-lg font-medium",
    "transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "select-none cursor-pointer",
  ],
  {
    variants: {
      variant: {
        /** Solid brand gradient — violet → blue → cyan. Primary CTA. */
        gradient: [
          "bg-gradient-brand text-white",
          "shadow-md hover:shadow-[0_0_24px_color-mix(in_oklch,var(--color-primary)_35%,transparent)]",
          "hover:opacity-90 active:scale-[0.98]",
        ],
        /** Solid primary (violet). Secondary CTA. */
        primary: [
          "bg-primary text-[var(--tw-primary-fg)]",
          "hover:bg-[var(--tw-primary-hover)] shadow-sm hover:shadow-md",
          "active:scale-[0.98]",
        ],
        /** Muted surface with border. Tertiary action. */
        secondary: [
          "bg-background-muted text-foreground border border-border",
          "hover:bg-background-subtle hover:border-border-strong",
          "active:scale-[0.98]",
        ],
        /** Transparent with visible border. */
        outline: [
          "border border-border bg-transparent text-foreground",
          "hover:bg-background-subtle hover:border-border-strong",
          "active:scale-[0.98]",
        ],
        /** Transparent, no border — for subtle icon buttons and inline actions. */
        ghost: [
          "bg-transparent text-foreground",
          "hover:bg-background-subtle",
          "active:scale-[0.98]",
        ],
        /** Danger / delete actions. */
        destructive: [
          "bg-destructive text-[var(--tw-destructive-fg)]",
          "hover:bg-destructive/90 shadow-sm",
          "active:scale-[0.98]",
        ],
        /** Inline text link appearance. No background. */
        link: [
          "bg-transparent text-primary underline-offset-4",
          "hover:underline p-0 h-auto",
        ],
      },
      size: {
        xs:      "h-7 px-2.5 text-xs rounded-md gap-1",
        sm:      "h-8 px-3 text-sm gap-1.5",
        md:      "h-10 px-4 text-sm",
        lg:      "h-11 px-6 text-base",
        xl:      "h-12 px-8 text-base",
        /** Square icon button, standard size. */
        icon:    "h-10 w-10 p-0 shrink-0",
        /** Square icon button, small. */
        "icon-sm": "h-8 w-8 p-0 rounded-md shrink-0",
        /** Square icon button, large. */
        "icon-lg": "h-12 w-12 p-0 shrink-0",
      },
      fullWidth: {
        true:  "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant:   "primary",
      size:      "md",
      fullWidth: false,
    },
  }
);

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Show loading spinner and disable interaction. */
  isLoading?: boolean;
  /** Text shown to screen readers when isLoading is true. */
  loadingText?: string;
  /** Icon rendered before the label. Hidden when isLoading. */
  leftIcon?: React.ReactNode;
  /** Icon rendered after the label. Hidden when isLoading. */
  rightIcon?: React.ReactNode;
  /**
   * Render the button's inner markup inside a child element instead
   * (e.g. wrap a Next.js Link). Pass `asChild` and nest a single child.
   *
   * @example
   * <Button variant="gradient" asChild>
   *   <Link href="/pricing">Get started</Link>
   * </Button>
   */
  asChild?: boolean;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

/**
 * Polymorphic button supporting 7 visual variants, 8 sizes,
 * a loading state with spinner, and optional left/right icons.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disabled,
      children,
      asChild = false,
      onClick,
      ...props
    },
    ref
  ) => {
    const isIconOnly =
      size === "icon" || size === "icon-sm" || size === "icon-lg";

    const classes = clsx(buttonVariants({ variant, size, fullWidth }), className);

    // When asChild is true, clone the single child and apply button classes + props
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(
        children as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
        {
          className: clsx(
            classes,
            (children as React.ReactElement<React.HTMLAttributes<HTMLElement>>).props.className
          ),
          ...props,
        }
      );
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        aria-disabled={disabled || isLoading}
        aria-busy={isLoading}
        onClick={isLoading ? undefined : onClick}
        {...props}
      >
        {/* Loading spinner replaces leftIcon */}
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
        ) : leftIcon ? (
          <span className="shrink-0 inline-flex" aria-hidden="true">
            {leftIcon}
          </span>
        ) : null}

        {/* Label — hidden visually for icon-only, still accessible */}
        {children && (
          <span className={isIconOnly ? "sr-only" : undefined}>
            {isLoading && loadingText ? loadingText : children}
          </span>
        )}

        {/* Right icon — hidden while loading */}
        {!isLoading && rightIcon && (
          <span className="shrink-0 inline-flex" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

// Re-export variants for composability in other components
export { buttonVariants };
