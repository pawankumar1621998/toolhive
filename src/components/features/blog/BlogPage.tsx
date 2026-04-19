"use client";

import React, { useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight, Clock, Calendar, BookOpen, TrendingUp, Tag, Rss, Mail } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Category = "All" | "Tutorials" | "Updates" | "Tips & Tricks" | "Product";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: Exclude<Category, "All">;
  author: { name: string; initial: string; color: string };
  date: string;
  readTime: string;
  headerGradient: string;
  featured?: boolean;
  trending?: boolean;
  tags: string[];
}

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────
const POSTS: BlogPost[] = [
  {
    id: "1",
    slug: "getting-started-with-ai-image-tools",
    title: "Getting Started with AI Image Tools: A Complete 2026 Guide",
    excerpt:
      "Learn how to use ToolHive's AI-powered image suite to remove backgrounds, upscale photos, and apply filters — all in your browser with zero installs. We cover every tool with real examples.",
    category: "Tutorials",
    author: { name: "Priya Sharma", initial: "P", color: "bg-violet-500" },
    date: "Apr 3, 2026",
    readTime: "8 min read",
    headerGradient: "from-violet-500 to-indigo-600",
    featured: true,
    trending: true,
    tags: ["AI", "Images", "Beginners"],
  },
  {
    id: "2",
    slug: "pdf-compression-tips",
    title: "5 Tips to Compress PDFs Without Losing Quality",
    excerpt:
      "Struggling with oversized PDF files? These five proven techniques will help you shrink file sizes dramatically while keeping text crisp and images sharp.",
    category: "Tips & Tricks",
    author: { name: "Marcus Lee", initial: "M", color: "bg-cyan-500" },
    date: "Mar 28, 2026",
    readTime: "5 min read",
    headerGradient: "from-cyan-500 to-blue-500",
    trending: true,
    tags: ["PDF", "Compression", "Productivity"],
  },
  {
    id: "3",
    slug: "toolhive-v2-launch",
    title: "Introducing ToolHive v2: Faster, Smarter, More Powerful",
    excerpt:
      "We've rebuilt ToolHive from the ground up. Discover the new AI engine, redesigned UI, batch processing, and 40 brand-new tools launching today.",
    category: "Updates",
    author: { name: "Alex Chen", initial: "A", color: "bg-emerald-500" },
    date: "Mar 20, 2026",
    readTime: "4 min read",
    headerGradient: "from-emerald-500 to-teal-500",
    tags: ["Product", "Launch", "AI"],
  },
  {
    id: "4",
    slug: "video-editing-in-browser",
    title: "How to Edit Videos Entirely in Your Browser",
    excerpt:
      "No software needed. We walk through trimming, merging, adding captions, and exporting in multiple formats — all with ToolHive's web-based video editor.",
    category: "Tutorials",
    author: { name: "Sofia Garcia", initial: "S", color: "bg-rose-500" },
    date: "Mar 15, 2026",
    readTime: "10 min read",
    headerGradient: "from-rose-500 to-pink-600",
    tags: ["Video", "Editing", "Tutorial"],
  },
  {
    id: "5",
    slug: "keyboard-shortcuts-power-users",
    title: "Power User Keyboard Shortcuts You Didn't Know About",
    excerpt:
      "Cut your workflow time in half with these hidden keyboard shortcuts built into every ToolHive tool. From instant uploads to batch operations.",
    category: "Tips & Tricks",
    author: { name: "Jordan Kim", initial: "J", color: "bg-amber-500" },
    date: "Mar 8, 2026",
    readTime: "3 min read",
    headerGradient: "from-amber-500 to-orange-500",
    tags: ["Shortcuts", "Productivity", "Power User"],
  },
  {
    id: "6",
    slug: "march-2026-product-updates",
    title: "March 2026 Product Updates: New Tools & Bug Fixes",
    excerpt:
      "This month we shipped 12 new tools, improved API rate limits for Pro users, added WhatsApp support, and squashed over 30 reported bugs.",
    category: "Product",
    author: { name: "Riley Brown", initial: "R", color: "bg-blue-500" },
    date: "Mar 1, 2026",
    readTime: "6 min read",
    headerGradient: "from-blue-500 to-violet-500",
    tags: ["Changelog", "Updates", "Bug Fixes"],
  },
  {
    id: "7",
    slug: "ai-writing-best-practices",
    title: "AI Writing in 2026: Best Practices & Pitfalls to Avoid",
    excerpt:
      "AI writing tools are everywhere — but most people use them wrong. Here's how to get the best results from ToolHive's AI rewriter, summarizer, and translator.",
    category: "Tips & Tricks",
    author: { name: "Priya Sharma", initial: "P", color: "bg-violet-500" },
    date: "Feb 22, 2026",
    readTime: "7 min read",
    headerGradient: "from-purple-500 to-violet-600",
    tags: ["AI Writing", "Content", "Best Practices"],
  },
  {
    id: "8",
    slug: "batch-processing-workflow",
    title: "The Definitive Guide to Batch Processing 500 Files",
    excerpt:
      "Processing hundreds of files one by one? Stop. ToolHive's batch mode lets you handle 500 files simultaneously with one click. Here's the complete workflow.",
    category: "Tutorials",
    author: { name: "Marcus Lee", initial: "M", color: "bg-cyan-500" },
    date: "Feb 15, 2026",
    readTime: "9 min read",
    headerGradient: "from-sky-500 to-cyan-600",
    tags: ["Batch", "Workflow", "Advanced"],
  },
];

const CATEGORIES: Category[] = ["All", "Tutorials", "Updates", "Tips & Tricks", "Product"];
const BADGE_VARIANT: Record<Exclude<Category, "All">, "primary" | "info" | "warning" | "success"> = {
  Tutorials: "primary",
  Updates: "info",
  "Tips & Tricks": "warning",
  Product: "success",
};

const EASE_OUT: [number, number, number, number] = [0.22, 0.61, 0.36, 1];
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

// ─────────────────────────────────────────────
// Featured Post Card
// ─────────────────────────────────────────────
function FeaturedPostCard({ post }: { post: BlogPost }) {
  return (
    <motion.article variants={fadeUpVariant} className="group relative overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm hover:shadow-xl transition-all duration-300">
      <div className={clsx("relative h-56 sm:h-72 bg-gradient-to-br", post.headerGradient)}>
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        {/* Badges row */}
        <div className="absolute bottom-5 left-6 flex items-center gap-2">
          <Badge variant={BADGE_VARIANT[post.category]} size="md">{post.category}</Badge>
          {post.trending && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-2.5 py-1 text-xs font-semibold text-white">
              <TrendingUp className="h-3 w-3" /> Trending
            </span>
          )}
        </div>
        <span className="absolute top-5 right-5 inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1 text-xs font-semibold text-white">
          <BookOpen className="h-3.5 w-3.5" /> Featured
        </span>
      </div>

      <div className="p-6 sm:p-8">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-primary/8 px-2.5 py-0.5 text-xs font-medium text-primary">
              <Tag className="h-2.5 w-2.5" />{tag}
            </span>
          ))}
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-snug mb-3 group-hover:text-primary transition-colors duration-200">
          {post.title}
        </h2>
        <p className="text-foreground-muted leading-relaxed text-sm sm:text-base mb-6 line-clamp-2">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className={clsx("flex h-9 w-9 items-center justify-center rounded-full text-white text-sm font-bold shrink-0", post.author.color)}>
              {post.author.initial}
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{post.author.name}</p>
              <div className="flex items-center gap-2 text-xs text-foreground-subtle">
                <Calendar className="h-3 w-3" />{post.date}
                <span aria-hidden="true">·</span>
                <Clock className="h-3 w-3" />{post.readTime}
              </div>
            </div>
          </div>
          <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
            Read article <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

// ─────────────────────────────────────────────
// Post Card
// ─────────────────────────────────────────────
function PostCard({ post }: { post: BlogPost }) {
  return (
    <motion.article variants={fadeUpVariant} className="group flex flex-col overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <div className={clsx("relative h-40 bg-gradient-to-br flex-shrink-0", post.headerGradient)}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute bottom-3 left-4 flex items-center gap-2">
          <Badge variant={BADGE_VARIANT[post.category]} size="sm">{post.category}</Badge>
          {post.trending && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-semibold text-white">
              <TrendingUp className="h-2.5 w-2.5" /> Hot
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5">
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {post.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-full bg-background-subtle px-2 py-0.5 text-[10px] font-medium text-foreground-muted">
              {tag}
            </span>
          ))}
        </div>

        <h3 className="font-bold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors text-sm line-clamp-2 flex-1">
          {post.title}
        </h3>
        <p className="text-xs text-foreground-muted leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-card-border/60">
          <div className="flex items-center gap-2">
            <span className={clsx("flex h-6 w-6 items-center justify-center rounded-full text-white text-[10px] font-bold shrink-0", post.author.color)}>
              {post.author.initial}
            </span>
            <span className="text-xs text-foreground-subtle">{post.date} · {post.readTime}</span>
          </div>
          <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:gap-1.5 transition-all">
            Read <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

// ─────────────────────────────────────────────
// Newsletter box
// ─────────────────────────────────────────────
function NewsletterBox() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-background-subtle to-accent/5 border border-primary/20 p-7">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 mb-4">
        <Rss className="h-5 w-5 text-primary" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1">Weekly digest</h3>
      <p className="text-sm text-foreground-muted mb-4">Tips & product updates, every Tuesday. No spam.</p>
      {sent ? (
        <p className="text-sm font-medium text-primary">✓ You&apos;re subscribed!</p>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); if (email) setSent(true); }} className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground-subtle focus:border-primary/50 transition-colors"
          />
          <button type="submit" className="w-full h-9 rounded-lg bg-primary text-sm font-semibold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            <Mail className="h-4 w-4" /> Subscribe Free
          </button>
        </form>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Trending posts sidebar widget
// ─────────────────────────────────────────────
function TrendingWidget({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="rounded-2xl border border-card-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Trending now</h3>
      </div>
      <div className="space-y-4">
        {posts.filter((p) => p.trending).slice(0, 3).map((post, i) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="flex items-start gap-3 group">
            <span className="text-2xl font-black text-foreground-subtle leading-none mt-0.5 w-5 shrink-0 group-hover:text-primary transition-colors">
              {i + 1}
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">{post.title}</p>
              <p className="text-xs text-foreground-subtle mt-1">{post.readTime}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// BlogPage
// ─────────────────────────────────────────────
export function BlogPage() {
  const shouldReduce = useReducedMotion() ?? false;
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const featuredPost = POSTS.find((p) => p.featured)!;
  const filteredPosts = POSTS.filter((p) => {
    if (p.featured) return false;
    return activeCategory === "All" || p.category === activeCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-background-subtle border-b border-card-border py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/4 h-[400px] w-[400px] rounded-full" style={{ background: "radial-gradient(circle, oklch(55% 0.22 285 / 0.08) 0%, transparent 70%)" }} />
          <div className="absolute -bottom-16 right-1/4 h-[300px] w-[300px] rounded-full" style={{ background: "radial-gradient(circle, oklch(62% 0.18 195 / 0.07) 0%, transparent 70%)" }} />
        </div>
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={shouldReduce ? undefined : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE_OUT }}>
            <Badge variant="primary" size="md" className="mb-4">
              <BookOpen className="mr-1.5 h-3.5 w-3.5" /> ToolHive Blog
            </Badge>
          </motion.div>
          <motion.h1 initial={shouldReduce ? undefined : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.06, ease: EASE_OUT }} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-4">
            Insights &{" "}
            <span className="bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">Updates</span>
          </motion.h1>
          <motion.p initial={shouldReduce ? undefined : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.12, ease: EASE_OUT }} className="max-w-xl mx-auto text-lg text-foreground-muted">
            Tips, tutorials, and product updates from the ToolHive team.
          </motion.p>
          {/* Stats row */}
          <motion.div initial={shouldReduce ? undefined : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.22 }} className="flex items-center justify-center gap-6 mt-6 text-sm text-foreground-muted">
            {[["8+", "Articles"], ["3", "Categories"], ["Weekly", "Updates"]].map(([num, label]) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="font-bold text-foreground">{num}</span>
                <span>{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 lg:py-16">
        {/* ── Category filter ── */}
        <motion.div initial={shouldReduce ? undefined : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.18, ease: EASE_OUT }} className="flex flex-wrap items-center gap-2 mb-10" role="tablist">
          {CATEGORIES.map((cat) => (
            <button key={cat} role="tab" aria-selected={activeCategory === cat} onClick={() => setActiveCategory(cat)}
              className={clsx(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                activeCategory === cat
                  ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                  : "border-card-border bg-card text-foreground-muted hover:border-primary/30 hover:text-foreground"
              )}
            >
              {cat}
              {cat !== "All" && (
                <span className="ml-1.5 text-[10px] opacity-70">
                  ({POSTS.filter((p) => p.category === cat).length})
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {/* ── Two-column layout ── */}
        <div className="grid gap-10 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_300px]">
          {/* Left: posts */}
          <div>
            {/* Featured post */}
            {activeCategory === "All" && (
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mb-8">
                <FeaturedPostCard post={featuredPost} />
              </motion.div>
            )}

            {/* Grid */}
            {filteredPosts.length > 0 ? (
              <motion.div key={activeCategory} variants={containerVariants} initial="hidden" animate="visible" className="grid gap-6 sm:grid-cols-2">
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-card-border bg-card">
                <BookOpen className="h-10 w-10 text-foreground-subtle mb-4" />
                <p className="font-medium text-foreground">No posts in this category yet.</p>
                <p className="text-sm text-foreground-subtle mt-1">Check back soon — we publish weekly.</p>
              </div>
            )}

            {/* Load more */}
            <div className="mt-10 text-center">
              <button className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-card px-6 py-2.5 text-sm font-medium text-foreground-muted hover:text-foreground hover:border-border-strong transition-all">
                Load more articles <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right: sidebar */}
          <div className="space-y-6">
            <TrendingWidget posts={POSTS} />
            <NewsletterBox />

            {/* All tags cloud */}
            <div className="rounded-2xl border border-card-border bg-card p-5">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" /> Popular Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(POSTS.flatMap((p) => p.tags))).map((tag) => (
                  <span key={tag} className="rounded-full border border-card-border bg-background-subtle px-2.5 py-1 text-xs font-medium text-foreground-muted hover:border-primary/30 hover:text-primary transition-colors cursor-pointer">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
