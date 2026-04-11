import type { Metadata } from "next";
import { FavoritesPage } from "@/components/features/dashboard/FavoritesPage";

export const metadata: Metadata = {
  title: "Favorites",
  description: "Your saved AI tools for quick access on ToolHive.",
};

/**
 * /dashboard/favorites
 *
 * Renders FavoritesPage which includes:
 * - 6-item responsive card grid of favorited tools
 * - Search input to filter the grid
 * - Per-card: icon, category badge, description, "Use Now" CTA, unfavorite button
 * - Empty state with heart icon and browse-tools link
 */
export default function FavoritesRoute() {
  return <FavoritesPage />;
}
