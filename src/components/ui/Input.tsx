import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";

// ─────────────────────────────────────────────
// Variants
// ─────────────────────────────────────────────

const inputVariants = cva(
  [
    "flex w-full rounded-lg text-sm text-foreground",
    "placeholder:text-foreground-subtle",
    "transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
  ],
  {
    variants: {
      /** Visual surface style */
      variant: {
        /** Standard outlined style — white/card background with border */
        default: [
          "border border-border bg-background px-3 py-2",
          "hover:border-border-strong",
          "focus-visible:border-primary",
        ],
        /** Filled — subtly tinted background, no initial border */
        filled: [
          "border border-transparent bg-background-subtle px-3 py-2",
          "hover:bg-background-muted",
          "focus-visible:border-primary focus-visible:bg-background",
        ],
        /** Error state — red border, used automatically when error prop is set */
        error: [
          "border border-destructive bg-background px-3 py-2",
          "focus-visible:ring-destructive/30 focus-visible:border-destructive",
        ],
        /** Success state */
        success: [
          "border border-success bg-background px-3 py-2",
          "focus-visible:ring-success/30 focus-visible:border-success",
        ],
      },
      inputSize: {
        sm: "h-8 px-2.5 text-xs",
        md: "h-10 px-3 text-sm",
        lg: "h-11 px-4 text-base",
      },
    },
    defaultVariants: {
      variant:   "default",
      inputSize: "md",
    },
  }
);

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  /** Rendered above the input with a <label> element */
  label?: string;
  /** Screen-reader-only label (visually hidden) */
  srOnlyLabel?: boolean;
  /** Whether the field is required — appends red asterisk to label */
  required?: boolean;
  /** Error message shown below the input; also switches to error variant */
  error?: string;
  /** Hint / helper text shown below when no error */
  hint?: string;
  /** Element rendered inside the left edge (e.g. icon) */
  leftElement?: React.ReactNode;
  /** Element rendered inside the right edge (e.g. icon or clear button) */
  rightElement?: React.ReactNode;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

/**
 * Enhanced text input with label, error, hint, and icon slot support.
 *
 * @example
 * // Basic
 * <Input label="Email" type="email" placeholder="you@example.com" />
 *
 * // With left icon
 * <Input
 *   label="Search"
 *   leftElement={<Search className="h-4 w-4" />}
 *   placeholder="Search tools..."
 * />
 *
 * // Error state
 * <Input label="Password" type="password" error="Password is too short" />
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      inputSize,
      leftElement,
      rightElement,
      error,
      hint,
      label,
      srOnlyLabel,
      required,
      id,
      ...props
    },
    ref
  ) => {
    // Stable IDs for accessibility linkage
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId  = hint  ? `${inputId}-hint`  : undefined;

    // Auto-switch to error variant when error prop is provided
    const resolvedVariant = error ? "error" : variant;

    const inputEl = (
      <input
        ref={ref}
        id={inputId}
        required={required}
        className={clsx(
          inputVariants({ variant: resolvedVariant, inputSize }),
          leftElement  && "pl-9",
          rightElement && "pr-9",
          className
        )}
        aria-invalid={!!error}
        aria-required={required}
        aria-describedby={
          [errorId, hintId].filter(Boolean).join(" ") || undefined
        }
        {...props}
      />
    );

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={clsx(
              "text-sm font-medium text-foreground",
              srOnlyLabel && "sr-only"
            )}
          >
            {label}
            {required && (
              <span className="ml-1 text-destructive" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        {/* Input with optional side elements */}
        {leftElement || rightElement ? (
          <div className="relative">
            {leftElement && (
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-foreground-subtle">
                {leftElement}
              </div>
            )}
            {inputEl}
            {rightElement && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-foreground-subtle">
                {rightElement}
              </div>
            )}
          </div>
        ) : (
          inputEl
        )}

        {/* Error message */}
        {error && (
          <p id={errorId} className="text-xs text-destructive flex items-center gap-1" role="alert">
            <span aria-hidden="true">&#9679;</span>
            {error}
          </p>
        )}

        {/* Hint text — only shown when no error */}
        {hint && !error && (
          <p id={hintId} className="text-xs text-foreground-subtle">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
