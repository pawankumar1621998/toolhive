import type { Metadata } from "next";
import { AccessibilityPage } from "@/components/features/legal/AccessibilityPage";

export const metadata: Metadata = {
  title: "Accessibility — ToolHive",
  description:
    "ToolHive is committed to making our platform accessible to everyone. Learn about our accessibility standards and features.",
};

export default function AccessibilityRoute() {
  return <AccessibilityPage />;
}
