import type { Metadata } from "next";
import { PrivacyPolicyPage } from "@/components/features/legal/PrivacyPolicyPage";

export const metadata: Metadata = {
  title: "Privacy Policy — ToolHive",
  description:
    "Learn how ToolHive collects, uses, and protects your data. We believe in full transparency and your right to privacy.",
};

export default function PrivacyRoute() {
  return <PrivacyPolicyPage />;
}
