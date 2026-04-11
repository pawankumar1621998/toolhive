import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryHero } from "@/components/features/category/CategoryHero";
import { CategoryPageClient } from "@/components/features/category/CategoryPageClient";
import { ToolPageSidebar } from "@/components/features/tool/ToolPageSidebar";
import { TOOL_CATEGORIES } from "@/config/tools";
import type { ToolCategory } from "@/types";

// ─────────────────────────────────────────────
// Static params — pre-render all known categories
// ─────────────────────────────────────────────

export function generateStaticParams() {
  return TOOL_CATEGORIES.map((cat) => ({ category: cat.id }));
}

// ─────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = TOOL_CATEGORIES.find((c) => c.id === category);
  if (!cat) return {};
  return {
    title: `${cat.label} — Free Online Tools | ToolHive`,
    description: cat.description,
    keywords: [cat.label, "free tools", "online tools", "ToolHive", category],
    openGraph: {
      title: `${cat.label} | ToolHive`,
      description: cat.description,
      type: "website",
    },
    alternates: {
      canonical: `/tools/${category}`,
    },
  };
}

// ─────────────────────────────────────────────
// JSON-LD structured data
// ─────────────────────────────────────────────

function CategoryJsonLd({
  cat,
}: {
  cat: (typeof TOOL_CATEGORIES)[number];
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${cat.label} — ToolHive`,
    description: cat.description,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

/**
 * Category Page — /tools/[category]
 *
 * Layout:
 *   - CategoryHero        — icon, name, description, tool count
 *   - CategoryPageClient  — client wrapper owning sidebar + grid filter state
 *       - CategorySidebar — type filter + sub-category filter (sticky, desktop)
 *       - ToolsGrid       — responsive card grid with filter/sort support
 *
 * Server/client boundary:
 * - CategoryHero is a Server Component
 * - CategoryPageClient is a Client Component (owns shared filter state between
 *   CategorySidebar and ToolsGrid)
 */
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = TOOL_CATEGORIES.find((c) => c.id === category);
  if (!cat) notFound();

  return (
    <>
      <CategoryJsonLd cat={cat} />
      <div className="min-h-screen bg-background flex">
        {/* ── Left sidebar — desktop only (lg+) ───────────── */}
        <aside className="hidden lg:block w-60 shrink-0" aria-label="Category navigation">
          <div className="sticky top-0 h-screen overflow-y-auto border-r border-border bg-card">
            <ToolPageSidebar currentCategory={cat.id} currentSlug="__home__" />
          </div>
        </aside>

        {/* ── Main content column ──────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Mobile category nav — visible below lg only */}
          <div className="lg:hidden px-4 pt-4">
            <ToolPageSidebar currentCategory={cat.id} currentSlug="__home__" />
          </div>

          {/* Banner */}
          <CategoryHero category={cat} />
          {/* Interactive layout: sidebar + grid with shared filter state */}
          <CategoryPageClient category={cat.id as ToolCategory} />
        </div>
      </div>
    </>
  );
}
