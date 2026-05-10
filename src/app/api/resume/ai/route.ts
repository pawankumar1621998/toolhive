import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

async function callAI(prompt: string, maxTokens = 2500): Promise<string> {
  const errors: string[] = [];

  // Try STEP API first
  if (process.env.STEP_API_KEY?.trim()) {
    try {
      const res = await fetch("https://api.stepfun.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.STEP_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "stepfun-ai/step-3.5-flash", messages: [{ role: "user", content: prompt }], max_tokens: maxTokens, temperature: 0.7 }),
      });
      if (res.ok) {
        const d = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
        const out = d.choices?.[0]?.message?.content?.trim();
        if (out) return out;
      } else {
        errors.push(`STEP: ${res.status}`);
      }
    } catch (e) {
      errors.push(`STEP: ${(e as Error).message}`);
    }
  }

  for (const key of [process.env.NVIDIA_API_KEY, process.env.NVIDIA_API_KEY_2].filter(Boolean)) {
    try {
      const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "nvidia/llama-3.1-nemotron-nano-8b-instruct", messages: [{ role: "user", content: prompt }], max_tokens: maxTokens, temperature: 0.7, stream: false }),
        signal: (() => { const ac = new AbortController(); setTimeout(() => ac.abort(), 25000); return ac.signal; })(),
      });
      if (res.ok) {
        const d = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
        const out = d.choices?.[0]?.message?.content?.trim();
        if (out) return out;
      } else {
        errors.push(`NVIDIA: ${res.status}`);
      }
    } catch (e) {
      errors.push(`NVIDIA: ${(e as Error).message}`);
    }
  }

  if (process.env.GROQ_API_KEY?.trim()) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], max_tokens: maxTokens, temperature: 0.7 }),
      });
      if (res.ok) {
        const d = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
        const out = d.choices?.[0]?.message?.content?.trim();
        if (out) return out;
      } else {
        errors.push(`Groq: ${res.status}`);
      }
    } catch (e) {
      errors.push(`Groq: ${(e as Error).message}`);
    }
  }

  if (process.env.GEMINI_API_KEY?.trim()) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: maxTokens } }),
      });
      if (res.ok) {
        const d = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
        const out = d.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (out) return out;
      } else {
        errors.push(`Gemini: ${res.status}`);
      }
    } catch (e) {
      errors.push(`Gemini: ${(e as Error).message}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`All AI providers failed:\n${errors.join("\n")}`);
  }
  throw new Error("No AI API keys configured. Please add NVIDIA_API_KEY, GROQ_API_KEY, or GEMINI_API_KEY to .env.local");
}

export async function POST(req: NextRequest) {
  try {
    const { targetRole, targetLevel, targetIndustries, currentHeadline, currentAbout, skills, experienceBullets, fullName } = await req.json() as {
      targetRole: string; targetLevel: string; targetIndustries: string[];
      currentHeadline: string; currentAbout: string; skills: string[];
      experienceBullets: string; fullName: string;
    };

    const prompt = `You are a LinkedIn optimization expert and career coach. Optimize this LinkedIn profile for maximum recruiter visibility.

Profile owner: ${fullName || "the user"}
Target role: ${targetRole} (${targetLevel} level)
Target industries: ${targetIndustries.join(", ") || "tech"}

Current headline: "${currentHeadline || "not provided"}"
Current about: "${currentAbout || "not provided"}"
Current skills: ${skills.join(", ") || "not provided"}
Experience bullets: "${experienceBullets || "not provided"}"

Return ONLY valid JSON (no markdown):
{
  "headline": "optimized LinkedIn headline (max 220 chars, keyword-rich)",
  "about": "rewritten About section (3-4 paragraphs, starts with hook, includes keywords, ends with CTA)",
  "improvedBullets": ["improved bullet 1", "improved bullet 2", "improved bullet 3"],
  "recommendedSkills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6", "skill7", "skill8"],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6"],
  "tips": ["actionable tip 1", "actionable tip 2", "actionable tip 3"],
  "headlineScore": 85,
  "aboutScore": 78,
  "overallScore": 82
}`;

    const raw = await callAI(prompt, 2500);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response. Please try again.");
    const optimized = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ optimized });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}