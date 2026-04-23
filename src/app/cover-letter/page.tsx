import type { Metadata } from "next";
import { CoverLetterBuilder } from "@/components/features/cover-letter/CoverLetterBuilder";

export const metadata: Metadata = {
  title: "AI Cover Letter Builder — Company-Specific | ToolHive",
  description: "Generate a tailored, professional cover letter for any company. AI analyzes what each company values and writes your letter accordingly.",
};

export default function CoverLetterPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <CoverLetterBuilder />
      </div>
    </main>
  );
}
