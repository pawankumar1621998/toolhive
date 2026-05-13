import type { Metadata } from "next";
import { ComparisonPage } from "@/components/features/compare/ComparisonPage";

export const metadata: Metadata = {
  title: "ToolHive vs iLovePDF — Free PDF Tools Comparison 2026",
  description:
    "Compare ToolHive vs iLovePDF: which offers better free PDF tools? No signup vs signup required, unlimited uses vs limits, watermarks, and feature depth. Find your best free PDF solution for 2026.",
  keywords: [
    "ToolHive vs iLovePDF",
    "ilovepdf vs toolhive",
    "free PDF tools comparison",
    "PDF merger free",
    "PDF splitter free",
    "iLovePDF alternative",
  ],
  alternates: { canonical: "https://toolhive-red.vercel.app/compare/toolhive-vs-ilovepdf" },
  openGraph: {
    title: "ToolHive vs iLovePDF — Free PDF Tools Compared",
    description: "ToolHive vs iLovePDF: which free PDF tool wins? ToolHive has 200+ free tools with no account required. Compare features, limits, and quality.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ToolHive vs iLovePDF Comparison" }],
  },
};

export default function ToolhiveVsILovePdfPage() {
  return <ComparisonPage competitor="ilovepdf" />;
}