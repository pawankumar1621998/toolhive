import type { Metadata } from "next";
import { SmartResumeBuilder } from "@/components/features/resume/SmartResumeBuilder";

export const metadata: Metadata = {
  title: "Smart Resume Builder — AI Analyzes Company Resumes | ToolHive",
  description:
    "AI studies what resumes get selected at Google, Amazon, Microsoft, Meta & 20+ top companies. Then builds your resume the same way. Free, no signup needed.",
};

export default function SmartResumePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <SmartResumeBuilder />
      </div>
    </div>
  );
}
