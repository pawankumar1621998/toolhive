"use client";

import React, { useState } from "react";
import { CategorySidebar } from "./CategorySidebar";
import { ToolsGrid, type ToolFilter } from "./ToolsGrid";
import type { ToolCategory } from "@/types";

// ─────────────────────────────────────────────────────────────────
// CategoryPageClient
//
// Thin client wrapper that owns the shared filter state between
// CategorySidebar and ToolsGrid. This keeps both the page server
// component and the heavy grid client-rendered only when needed.
// ─────────────────────────────────────────────────────────────────

interface CategoryPageClientProps {
  category: ToolCategory;
}

export function CategoryPageClient({ category }: CategoryPageClientProps) {
  const [activeFilter, setActiveFilter] = useState<ToolFilter>("all");
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Sidebar: hidden on mobile, sticky on lg+ */}
        <div className="hidden lg:block w-56 shrink-0">
          <CategorySidebar
            category={category}
            activeFilter={activeFilter}
            activeSubCategory={activeSubCategory}
            onFilterChange={setActiveFilter}
            onSubCategoryChange={setActiveSubCategory}
          />
        </div>

        {/* Tools grid */}
        <div className="flex-1 min-w-0">
          <ToolsGrid
            category={category}
            filter={activeFilter}
            subCategory={activeSubCategory}
          />
        </div>
      </div>
    </div>
  );
}
