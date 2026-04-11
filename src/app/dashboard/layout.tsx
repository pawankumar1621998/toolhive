import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/DashboardShell";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s — Dashboard | ToolHive",
  },
  description: "Manage your files, tools, and account settings on ToolHive.",
};

/**
 * Dashboard Layout
 *
 * Wraps all /dashboard/* routes with:
 * - DashboardShell: collapsible sidebar (md+), bottom nav (mobile), auth guard
 *
 * unstable_instant = false: dashboard reads session cookies — cannot be static.
 */
export const unstable_instant = false;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
