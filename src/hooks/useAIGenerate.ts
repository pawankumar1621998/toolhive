"use client";

import { useCallback, useState } from "react";

export function useAIGenerate(toolSlug: string) {
  const [output,   setOutput]   = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);

  const generate = useCallback(
    async (body: Record<string, unknown>) => {
      setLoading(true);
      setOutput("");
      setError(null);
      setProvider(null);
      try {
        const res = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ toolSlug, ...body }),
        });

        const data = await res.json() as { output?: string; error?: string; provider?: string };

        if (!res.ok || data.error) {
          throw new Error(data.error ?? "Generation failed. Please try again.");
        }

        setOutput(data.output ?? "");
        setProvider(data.provider ?? null);
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
    setProvider(null);
  }, []);

  return { output, loading, error, provider, generate, clear, setOutput };
}
