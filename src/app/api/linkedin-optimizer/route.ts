import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

async function callAI(prompt: string, maxTokens = 1500): Promise<string> {
  for (const key of [process.env.NVIDIA_API_KEY, process.env.NVIDIA_API_KEY_2].filter(Boolean)) {
    try {
      const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "nvidia/llama-3.1-nemotron-nano-8b-instruct", messages: [{ role: "user", content: prompt }], max_tokens: maxTokens, temperature: 0.7, stream: false }),
        signal: AbortSignal.timeout(20000),
      });
      if (res.ok) {
        const d = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
        const out = d.choices?.[0]?.message?.content?.trim();
        if (out) return out;
      }
    } catch { /* next */ }
  }
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
    }
  } catch { /* next */ }
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: maxTokens } }),
  });
  const d = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  return d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
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

    const raw = await callAI(prompt, 1500);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    const optimized = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ optimized });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
