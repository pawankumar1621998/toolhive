"use client";

import { useCallback, useState } from "react";

const DEMO_RESPONSES: Record<string, string> = {
  default: "This AI feature is in demo mode. Connect a backend with your preferred AI provider (OpenAI, Anthropic, etc.) to enable real content generation.",
};

function getDemoResponse(toolSlug: string): string {
  return DEMO_RESPONSES[toolSlug] ?? DEMO_RESPONSES.default;
}

export function useAIGenerate(toolSlug: string) {
  const [output,  setOutput]  = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const generate = useCallback(
    async (_body: Record<string, unknown>) => {
      setLoading(true);
      setOutput("");
      setError(null);
      try {
        // Simulate generation delay
        await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
        setOutput(getDemoResponse(toolSlug));
      } catch (err) {
        setError((err as Error).message ?? "Generation failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [toolSlug]
  );

  const clear = useCallback(() => {
    setOutput("");
    setError(null);
  }, []);

  return { output, loading, error, generate, clear, setOutput };
}
