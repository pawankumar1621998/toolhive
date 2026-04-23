import type { Metadata } from "next";
import { LinkedInOptimizer } from "@/components/features/linkedin-optimizer/LinkedInOptimizer";

export const metadata: Metadata = {
  title: "AI LinkedIn Profile Optimizer | ToolHive",
  description: "AI rewrites your LinkedIn headline, about section, and experience bullets to maximize profile visibility and recruiter response rates.",
};

export default function LinkedInOptimizerPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <LinkedInOptimizer />
      </div>
    </main>
  );
}
