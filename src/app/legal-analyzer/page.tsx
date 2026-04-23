import type { Metadata } from "next";
import { LegalAnalyzer } from "@/components/features/legal-analyzer/LegalAnalyzer";

export const metadata: Metadata = {
  title: "AI Legal Document Analyzer — Understand Any Contract | ToolHive",
  description: "Paste any contract, rental agreement, NDA, or terms of service. AI explains it in plain language, highlights risky clauses, and tells you what to watch out for before signing.",
};

export default function LegalAnalyzerPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <LegalAnalyzer />
      </div>
    </main>
  );
}
