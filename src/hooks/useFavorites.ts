"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { TOOLS } from "@/config/tools";
import type { FavoriteItem, ToolCategory } from "@/types";

// ─── Backend shape ─────────────────────────────────────────────────────────────

interface BackendFavorite {
  _id:      string;
  slug:     string;
  category: string;
  addedAt:  string;
}

// ─── Map backend → FavoriteItem ────────────────────────────────────────────────

function toFavoriteItem(f: BackendFavorite): FavoriteItem | null {
  // Match against tools catalog by slug
  const tool = TOOLS.find((t) => t.slug === f.slug);
  if (!tool) return null;
  return {
    id:      f.slug,          // use slug as stable ID for remove operations
    tool: {
      id:          tool.id,
      name:        tool.name,
      slug:        tool.slug,
      category:    tool.category as ToolCategory,
      icon:        tool.icon,
      description: tool.description,
    },
    addedAt: new Date(f.addedAt),
  };
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useFavorites() {
  const [items,   setItems]   = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiGet<{ favorites: BackendFavorite[] }>("/auth/favorites")
      .then((res) => {
        const mapped = (res.data.favorites ?? [])
          .map(toFavoriteItem)
          .filter(Boolean) as FavoriteItem[];
        setItems(mapped);
        setError(null);
      })
      .catch(() => setError("Failed to load favorites"))
      .finally(() => setLoading(false));
  }, []);

  const addFavorite = useCallback(async (slug: string, category: string) => {
    // Optimistic update
    const tool = TOOLS.find((t) => t.slug === slug);
    if (tool && !items.some((i) => i.id === slug)) {
      setItems((prev) => [
        ...prev,
        {
          id:      slug,
          tool: {
            id:          tool.id,
            name:        tool.name,
            slug:        tool.slug,
            category:    tool.category as ToolCategory,
            icon:        tool.icon,
            description: tool.description,
          },
          addedAt: new Date(),
        },
      ]);
    }
    await apiPost("/auth/favorites", { slug, category });
  }, [items]);

  const removeFavorite = useCallback(async (id: string) => {
    // id === slug (see toFavoriteItem)
    setItems((prev) => prev.filter((f) => f.id !== id));
    await apiDelete(`/auth/favorites/${id}`).catch(() => {
      // Refetch to restore on failure
      apiGet<{ favorites: BackendFavorite[] }>("/auth/favorites").then((res) => {
        const mapped = (res.data.favorites ?? [])
          .map(toFavoriteItem)
          .filter(Boolean) as FavoriteItem[];
        setItems(mapped);
      });
    });
  }, []);

  return { items, loading, error, addFavorite, removeFavorite };
}
