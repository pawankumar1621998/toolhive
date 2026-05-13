import type { Metadata } from "next";
import { ComparisonPage } from "@/components/features/compare/ComparisonPage";

export const metadata: Metadata = {
  title: "ToolHive vs remove.bg — Free Background Removal Comparison 2026",
  description:
    "Compare ToolHive vs remove.bg: which free background removal tool wins? See features, quality, limits, resolution, pricing, and which tool is best for remove background from image free no watermark.",
  keywords: [
    "ToolHive vs remove.bg",
    "remove.bg vs toolhive",
    "free background remover comparison",
    "remove background from image free no watermark",
    "remove.bg alternative free",
  ],
  alternates: { canonical: "https://toolhive-red.vercel.app/compare/toolhive-vs-removebg" },
  openGraph: {
    title: "ToolHive vs remove.bg — Free Background Removal Compared",
    description: "Which free background removal tool is better? ToolHive offers unlimited free BG removal at full resolution. remove.bg limits free users to 3 exports/month. See the full comparison.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ToolHive vs remove.bg Comparison" }],
  },
};

export default function ToolhiveVsRemovebgPage() {
  return <ComparisonPage competitor="removebg" />;
}