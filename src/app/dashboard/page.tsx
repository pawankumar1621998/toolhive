import type { Metadata } from "next";
import { DashboardOverview } from "@/components/features/dashboard/DashboardOverview";

export const metadata: Metadata = {
  title: "Overview",
};

/**
 * /dashboard — Overview page
 *
 * Renders: WelcomeBanner, StatsGrid, MostUsedTools, RecentActivity, JumpTo
 */
export default function DashboardPage() {
  return <DashboardOverview />;
}
