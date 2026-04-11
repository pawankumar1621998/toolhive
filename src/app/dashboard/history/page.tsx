import type { Metadata } from "next";
import { HistoryPage } from "@/components/features/dashboard/HistoryPage";

export const metadata: Metadata = {
  title: "History",
  description: "View and download your previously processed files on ToolHive.",
};

/**
 * /dashboard/history
 *
 * Renders HistoryPage which includes:
 * - Searchable, filterable list of 10 mock history items
 * - Per-item: tool icon, input files, output file, status badge, download + delete
 * - Empty state with CTA when list is cleared or filters return no results
 */
export default function HistoryRoute() {
  return <HistoryPage />;
}
