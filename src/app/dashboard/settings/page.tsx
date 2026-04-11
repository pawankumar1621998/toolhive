import type { Metadata } from "next";
import { SettingsPage } from "@/components/features/dashboard/SettingsPage";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your ToolHive account settings.",
};

export default function SettingsRoute() {
  return <SettingsPage />;
}
