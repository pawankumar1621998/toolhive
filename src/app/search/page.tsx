import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchPageClient } from "@/components/features/search/SearchPageClient";
import { SectionSkeleton } from "@/components/ui/Skeletons";

export const metadata: Metadata = {
  title: "Search Tools — ToolHive",
  description: "Search ToolHive's library of 200+ AI-powered file and content tools.",
};

// ─────────────────────────────────────────────
// Page — search params read client-side via useSearchParams()
// ─────────────────────────────────────────────

export default function SearchPage() {
  return (
    <Suspense fallback={<SectionSkeleton rows={3} />}>
      <SearchPageClient />
    </Suspense>
  );
}
