import type { Metadata } from "next";
import { DashboardOverview } from "@/components/features/dashboard/DashboardOverview";

export const metadata: Metadata = {
  title: "Overview",
};

/**
 * /dashboard — Overview page
 *
 * Renders:
 * - WelcomeBanner       — "Good morning, {name}!" with monthly usage bar
 * - StatsGrid           — Files Today, Total Files, Tools Used, Storage
 * - MostUsedTools       — 6-item quick-launch grid
 * - RecentActivity      — Last 5 operations timeline
 * - JumpTo              — Quick nav cards
 * - ProUpgradeBanner    — Shown only to free-tier users
 */
export default function DashboardPage() {
  return <DashboardOverview />;
}
