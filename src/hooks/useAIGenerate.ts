"use client";

import { useCallback, useState } from "react";
import { useLanguageStore } from "@/stores/languageStore";

const RENDER_URL = (process.env.NEXT_PUBLIC_API_URL || "https://toolhive-backend.onrender.com/api/v1").replace(/\/$/, "");

export function useAIGenerate(toolSlug: string) {
  const [output,   setOutput]   = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const { language } = useLanguageStore();

  const generate = useCallback(
    async (body: Record<string, unknown>) => {
      setLoading(true);
      setOutput("");
      setError(null);
      setProvider(null);

      // Attach language to every request (skip for translate — it has its own target language)
      const lang = toolSlug !== "translate" && language !== "English" ? language : undefined;
      const bodyWithLang = lang ? { ...body, language: lang } : body;

      // 1. Try Render backend directly from browser (no Vercel timeout)
      if (RENDER_URL) {
        try {
          const res = await fetch(`${RENDER_URL}/tools/ai/${toolSlug}`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(bodyWithLang),
          });
          if (res.ok) {
            const data = await res.json() as { result?: string; output?: string; error?: string };
            const out = (data.result ?? data.output ?? "").trim();
            if (out) {
              setOutput(out);
              setProvider("ToolHive AI");
              setLoading(false);
              return;
            }
          }
        } catch {
          // fall through to Next.js route
        }
      }

      // 2. Fallback: Next.js route
      try {
        const res = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ toolSlug, ...bodyWithLang }),
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
    [toolSlug, language]
  );

  const clear = useCallback(() => {
    setOutput("");
    setError(null);
    setProvider(null);
  }, []);

  return { output, loading, error, provider, generate, clear, setOutput };
}
