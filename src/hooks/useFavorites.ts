"use client";

/**
 * useFavorites — localStorage-based favorites.
 * No auth / API required — all tools are free.
 * Favorites persist in localStorage under "th_favorites".
 */

import { useCallback, useEffect, useState } from "react";
import { TOOLS } from "@/config/tools";
import type { FavoriteItem, ToolCategory } from "@/types";

const STORAGE_KEY = "th_favorites";

function loadFromStorage(): FavoriteItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const slugs: string[] = JSON.parse(raw);
    return slugs
      .map((slug) => {
        const tool = TOOLS.find((t) => t.slug === slug);
        if (!tool) return null;
        return {
          id:   slug,
          tool: {
            id:          tool.id,
            name:        tool.name,
            slug:        tool.slug,
            category:    tool.category as ToolCategory,
            icon:        tool.icon,
            description: tool.description,
          },
          addedAt: new Date(),
        } satisfies FavoriteItem;
      })
      .filter(Boolean) as FavoriteItem[];
  } catch {
    return [];
  }
}

function saveToStorage(items: FavoriteItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.map((i) => i.id)));
  } catch {}
}

export function useFavorites() {
  const [items,   setItems]   = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(loadFromStorage());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(false);
  }, []);

  const addFavorite = useCallback(
    (slug: string, _category: string) => {
      setItems((prev) => {
        if (prev.some((i) => i.id === slug)) return prev;
        const tool = TOOLS.find((t) => t.slug === slug);
        if (!tool) return prev;
        const next: FavoriteItem[] = [
          ...prev,
          {
            id:   slug,
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
        ];
        saveToStorage(next);
        return next;
      });
    },
    []
  );

  const removeFavorite = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((f) => f.id !== id);
      saveToStorage(next);
      return next;
    });
  }, []);

  return { items, loading, error: null, addFavorite, removeFavorite };
}
