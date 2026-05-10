import { NextRequest, NextResponse } from "next/server";

const SIZES: Record<string, { width: number; height: number }> = {
  "1:1":  { width: 1024, height: 1024 },
  "16:9": { width: 1024, height: 576 },
  "9:16": { width: 576,  height: 1024 },
  "4:3":  { width: 1024, height: 768 },
  "3:4":  { width: 768,  height: 1024 },
};

export const maxDuration = 180;

export async function POST(req: NextRequest) {
  try {
    const { prompt, aspectRatio = "1:1", steps = 4, seed } = await req.json() as {
      prompt: string;
      aspectRatio?: string;
      steps?: number;
      seed?: number;
    };

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.NVIDIA_IMAGE_KEY || process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Image API key not configured" }, { status: 500 });
    }

    const { width, height } = SIZES[aspectRatio] ?? SIZES["1:1"];
    const resolvedSeed = seed !== undefined ? Math.max(0, Math.floor(seed)) : Math.floor(Math.random() * 999999);
    const resolvedSteps = Math.min(Math.max(steps, 1), 4);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 180000);

    try {
      const res = await fetch(
        "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.2-klein-4b",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            prompt: prompt.trim(),
            width,
            height,
            seed: resolvedSeed,
            steps: resolvedSteps,
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeout);

      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json(
          { error: `API error ${res.status}: ${errText}` },
          { status: res.status }
        );
      }

      const data = await res.json() as {
        artifacts?: Array<{
          base64?: string;
          finishReason?: string;
          seed?: number;
        }>;
      };

      // More robust artifact extraction
      let base64 = data?.artifacts?.[0]?.base64;

      if (!base64) {
        // Try alternative field names
        base64 = data?.artifacts?.[0]?.image ?? data?.artifacts?.[0]?.data;
      }

      if (!base64) {
        return NextResponse.json(
          { error: "No image returned from API. Please try again." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        image: base64,
        seed: data.artifacts?.[0]?.seed ?? resolvedSeed,
        width,
        height,
      });
    } catch (err) {
      clearTimeout(timeout);
      const errorMessage = err instanceof Error ? err.message : "Generation failed";
      return NextResponse.json(
        { error: errorMessage },
        { status: 502 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid request" },
      { status: 400 }
    );
  }
}