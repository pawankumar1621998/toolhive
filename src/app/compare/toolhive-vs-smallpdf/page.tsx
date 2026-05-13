import type { Metadata } from "next";
import { ComparisonPage } from "@/components/features/compare/ComparisonPage";

export const metadata: Metadata = {
  title: "ToolHive vs Smallpdf — The Best Free PDF Tools Comparison 2026",
  description:
    "Compare ToolHive vs Smallpdf: which free PDF tool wins? See features, pricing, watermarks, signup requirements, and which tool is best for compress PDF, merge, split, and more. Updated for 2026.",
  keywords: [
    "ToolHive vs Smallpdf",
    "smallpdf vs toolhive",
    "free PDF tools comparison",
    "compress PDF online free no watermark",
    "PDF tools no signup",
    "smallpdf alternative free",
  ],
  alternates: { canonical: "https://toolhive-red.vercel.app/compare/toolhive-vs-smallpdf" },
  openGraph: {
    title: "ToolHive vs Smallpdf — Free PDF Tools Compared",
    description: "Which free PDF tool is better? ToolHive offers unlimited free PDF tools with no signup. Smallpdf requires signup after limited uses. See the full comparison.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ToolHive vs Smallpdf Comparison" }],
  },
};

export default function ToolhiveVsSmallpdfPage() {
  return <ComparisonPage competitor="smallpdf" />;
}