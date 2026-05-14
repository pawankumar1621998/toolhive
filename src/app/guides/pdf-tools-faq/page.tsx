import type { Metadata } from "next";
import { FAQPage } from "@/components/features/faq/FAQPage";

export const metadata: Metadata = {
  title: "PDF Tools FAQ — Common Questions About Free PDF Tools 2026",
  description:
    "Answers to common questions about free PDF tools: compress PDF limits, watermarks, signup requirements, file security, and more. Learn how to use ToolHive for all your PDF needs — no signup, no watermark, unlimited use.",
  keywords: [
    "PDF tools FAQ",
    "compress PDF questions",
    "free PDF tools no signup",
    "PDF security questions",
    "how to compress PDF free",
    "PDF watermark removal",
    "People also ask PDF tools",
  ],
  alternates: { canonical: "https://toolhive-red.vercel.app/guides/pdf-tools-faq" },
  openGraph: {
    title: "PDF Tools FAQ — Your Questions Answered",
    description: "Find answers to common PDF tool questions. Free compression, merge, split, and more — no signup required.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "PDF Tools FAQ" }],
  },
};

export default function PDFToolsFAQPage() {
  return <FAQPage category="pdf" />;
}