"use client";

import { useCallback, useState, useRef } from "react";
import { useLanguageStore } from "@/stores/languageStore";

const RENDER_URL = (process.env.NEXT_PUBLIC_API_URL || "https://toolhive-backend.onrender.com/api/v1").replace(/\/$/, "");

// Streams text character by character into setOutput (ChatGPT feel)
async function typewriterStream(
  text: string,
  setOutput: (fn: (prev: string) => string) => void,
  cancelRef: React.MutableRefObject<boolean>
) {
  const CHUNK = 3; // chars per tick
  const DELAY = 8; // ms per tick — fast but visible
  for (let i = 0; i < text.length; i += CHUNK) {
    if (cancelRef.current) break;
    const slice = text.slice(i, i + CHUNK);
    setOutput((prev) => prev + slice);
    await new Promise((r) => setTimeout(r, DELAY));
  }
}

export function useAIGenerate(toolSlug: string) {
  const [output,   setOutput]   = useState("");
  const [loading,  setLoading]  = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const { language } = useLanguageStore();
  const cancelRef = useRef(false);

  const generate = useCallback(
    async (body: Record<string, unknown>) => {
      cancelRef.current = false;
      setLoading(true);
      setStreaming(false);
      setOutput("");
      setError(null);
      setProvider(null);

      const lang = toolSlug !== "translate" && language !== "English" ? language : undefined;
      const bodyWithLang = lang ? { ...body, language: lang } : body;

      let rawOutput = "";
      let providerName: string | null = null;

      // 1. Try /api/ai/stream first (real SSE streaming)
      try {
        const res = await fetch("/api/ai/stream", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ toolSlug, ...bodyWithLang }),
        });

        if (res.ok && res.body) {
          setLoading(false);
          setStreaming(true);
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done || cancelRef.current) break;
            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6).trim();
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data) as {
                  choices?: Array<{ delta?: { content?: string } }>;
                  provider?: string;
                };
                const chunk = parsed.choices?.[0]?.delta?.content ?? "";
                if (chunk) {
                  setOutput((prev) => prev + chunk);
                  rawOutput += chunk;
                }
                if (parsed.provider) providerName = parsed.provider;
              } catch {}
            }
          }

          if (rawOutput.trim()) {
            setProvider(providerName ?? "NVIDIA AI");
            setStreaming(false);
            setLoading(false);
            return;
          }
        }
      } catch {
        // fall through
      }

      // 2. Try Render backend
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
              rawOutput = out;
              providerName = "ToolHive AI";
            }
          }
        } catch {}
      }

      // 3. Fallback: Next.js generate route
      if (!rawOutput) {
        try {
          const res = await fetch("/api/ai/generate", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ toolSlug, ...bodyWithLang }),
          });
          const data = await res.json() as { output?: string; error?: string; provider?: string };
          if (!res.ok || data.error) throw new Error(data.error ?? "Generation failed.");
          rawOutput = data.output ?? "";
          providerName = data.provider ?? null;
        } catch (err) {
          setError((err as Error).message ?? "Generation failed.");
          setLoading(false);
          setStreaming(false);
          return;
        }
      }

      // Typewriter effect for non-streaming results
      if (rawOutput) {
        setLoading(false);
        setStreaming(true);
        await typewriterStream(rawOutput, setOutput as (fn: (prev: string) => string) => void, cancelRef);
        setProvider(providerName ?? null);
        setStreaming(false);
      }
    },
    [toolSlug, language]
  );

  const clear = useCallback(() => {
    cancelRef.current = true;
    setOutput("");
    setError(null);
    setProvider(null);
    setStreaming(false);
  }, []);

  return { output, loading, streaming, error, provider, generate, clear, setOutput };
}
