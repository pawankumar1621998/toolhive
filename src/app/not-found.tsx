import type { Metadata } from "next";
import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "404 — Page Not Found | ToolHive",
  description: "The page you're looking for doesn't exist. Browse our 200+ free AI tools instead.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5 pointer-events-none" />

      <div className="relative text-center max-w-lg mx-auto">
        {/* 404 Number */}
        <div className="mb-8">
          <span className="text-[150px] sm:text-[200px] font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent leading-none select-none">
            404
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-foreground-muted text-base sm:text-lg mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track!
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity"
          >
            <Home className="h-4 w-4" />
            Go to Homepage
          </Link>
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card text-foreground font-medium hover:bg-background-subtle transition-colors"
          >
            <Search className="h-4 w-4" />
            Browse Tools
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-foreground-subtle mb-4">Popular pages</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/tools/pdf" className="text-xs text-foreground-muted hover:text-primary transition-colors">PDF Tools</Link>
            <span className="text-foreground-subtle">•</span>
            <Link href="/tools/image" className="text-xs text-foreground-muted hover:text-primary transition-colors">Image Tools</Link>
            <span className="text-foreground-subtle">•</span>
            <Link href="/tools/ai-writing" className="text-xs text-foreground-muted hover:text-primary transition-colors">AI Writing</Link>
            <span className="text-foreground-subtle">•</span>
            <Link href="/pricing" className="text-xs text-foreground-muted hover:text-primary transition-colors">Pricing</Link>
            <span className="text-foreground-subtle">•</span>
            <Link href="/about" className="text-xs text-foreground-muted hover:text-primary transition-colors">About</Link>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-foreground-subtle hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}