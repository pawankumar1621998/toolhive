import type { Metadata } from "next";
import { FAQPage } from "@/components/features/faq/FAQPage";

export const metadata: Metadata = {
  title: "AI Writing Tools FAQ — Grammar, Paraphrasing, Summarizing 2026",
  description:
    "Common questions about free AI writing tools: grammar checker, paraphrasing, summarization, translation. No signup, no limits, no watermarks. Learn how to use AI writing tools effectively.",
  keywords: [
    "AI writing tools FAQ",
    "grammar checker questions",
    "paraphrasing tool FAQ",
    "AI summarizer questions",
    "free AI writing no signup",
    "People also ask AI writing",
  ],
  alternates: { canonical: "https://toolhive.co.in/guides/ai-writing-faq" },
  openGraph: {
    title: "AI Writing Tools FAQ — Your Questions Answered",
    description: "Answers to questions about free AI writing tools. Grammar check, paraphrase, summarize — all without signup.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "AI Writing Tools FAQ" }],
  },
};

export default function AIWritingFAQPage() {
  return <FAQPage category="ai-writing" />;
}