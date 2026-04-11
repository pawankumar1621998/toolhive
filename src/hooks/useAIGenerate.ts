"use client";

import { useCallback, useState } from "react";
import { apiPost } from "@/lib/api";
import { AxiosError } from "axios";

export function useAIGenerate(toolSlug: string) {
  const [output,  setOutput]  = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const generate = useCallback(
    async (body: Record<string, unknown>) => {
      setLoading(true);
      setOutput("");
      setError(null);
      try {
        const res = await apiPost<{ result: string }>(`/tools/ai/${toolSlug}`, body);
        setOutput(res.data.result ?? "");
      } catch (err) {
        const msg =
          (err as AxiosError<{ message: string }>).response?.data?.message ??
          "Generation failed. Please try again.";
        setError(msg);
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
