import type { Metadata } from "next";
import { ComparisonPage } from "@/components/features/compare/ComparisonPage";

export const metadata: Metadata = {
  title: "ToolHive vs QuillBot — Free Writing Tools Comparison 2026",
  description:
    "Compare ToolHive vs QuillBot for free AI writing tools: grammar checker, paraphrasing, summarizer, rewriter. No signup vs premium required, free vs paid. Find the best free writing assistant for 2026.",
  keywords: [
    "ToolHive vs QuillBot",
    "quillbot vs toolhive",
    "free grammar checker",
    "free paraphrasing tool",
    "AI writing tools comparison",
    "quillbot alternative free",
  ],
  alternates: { canonical: "https://toolhive.co.in/compare/toolhive-vs-quillbot" },
  openGraph: {
    title: "ToolHive vs QuillBot — Free AI Writing Tools Compared",
    description: "ToolHive offers grammar checker, paraphrasing, and summarizer completely free with no signup. QuillBot limits free use. Compare features and find your best free writing tool.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ToolHive vs QuillBot Comparison" }],
  },
};

export default function ToolhiveVsQuillbotPage() {
  return <ComparisonPage competitor="quillbot" />;
}