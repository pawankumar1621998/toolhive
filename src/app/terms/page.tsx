import type { Metadata } from "next";
import { TermsOfServicePage } from "@/components/features/legal/TermsOfServicePage";

export const metadata: Metadata = {
  title: "Terms of Service — ToolHive",
  description:
    "Read ToolHive's Terms of Service to understand your rights and responsibilities when using our platform.",
  alternates: { canonical: "https://toolhive.app/terms" },
  openGraph: {
    title: "Terms of Service — ToolHive",
    description: "Read ToolHive's Terms of Service.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ToolHive Terms" }],
  },
};

export default function TermsRoute() {
  return <TermsOfServicePage />;
}
