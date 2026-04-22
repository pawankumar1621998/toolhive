import type { Metadata } from "next";
import { DeepThinkWorkspace } from "@/components/features/deep-think/DeepThinkWorkspace";

export const metadata: Metadata = {
  title: "Deep Think AI — Reasoning AI like ChatGPT o1 | ToolHive",
  description:
    "Free AI that shows its thinking process step by step. Powered by GLM-5.1. Ask math problems, logic puzzles, decisions — see the reasoning live.",
};

export default function DeepThinkPage() {
  return <DeepThinkWorkspace />;
}
