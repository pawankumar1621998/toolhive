import type { Metadata } from "next";
import { Suspense } from "react";
import { AllToolsPage } from "@/components/features/tools/AllToolsPage";
import { SectionSkeleton } from "@/components/ui/Skeletons";

export const metadata: Metadata = {
  title: "All Tools — ToolHive",
  description: "Browse 200+ free AI-powered tools for PDF, image, video, writing, audio, and more. No signup required.",
};

export default function ToolsIndexPage() {
  return (
    <Suspense fallback={<SectionSkeleton rows={3} />}>
      <AllToolsPage />
    </Suspense>
  );
}
