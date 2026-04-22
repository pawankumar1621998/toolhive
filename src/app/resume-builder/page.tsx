import type { Metadata } from "next";
import { ResumeBuilder } from "@/components/features/resume/ResumeBuilder";

export const metadata: Metadata = {
  title: "Resume Builder — Free AI-Powered Resume Maker | ToolHive",
  description:
    "Build a professional resume in minutes with our free AI-powered resume builder. Live preview, 3 templates, ATS-friendly PDF download. No signup required.",
};

export default function ResumeBuilderPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <ResumeBuilder />
      </div>
    </div>
  );
}
