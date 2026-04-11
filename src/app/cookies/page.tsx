import type { Metadata } from "next";
import { CookiePolicyPage } from "@/components/features/legal/CookiePolicyPage";

export const metadata: Metadata = {
  title: "Cookie Policy — ToolHive",
  description:
    "Understand how ToolHive uses cookies and similar technologies to improve your experience.",
};

export default function CookiesRoute() {
  return <CookiePolicyPage />;
}
