import type { Metadata } from "next";
import { CodeAIWorkspace } from "@/components/features/code-ai/CodeAIWorkspace";

export const metadata: Metadata = {
  title: "Code AI — Generate Code in Any Language | ToolHive",
  description:
    "Free AI code generator powered by NVIDIA Magistral. Write code in Python, JavaScript, Java, C++, and 20+ languages instantly.",
};

export default function CodeAIPage() {
  return <CodeAIWorkspace />;
}
