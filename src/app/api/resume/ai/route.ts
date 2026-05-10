import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 45;

async function callAI(prompt: string): Promise<string> {
  const errors: string[] = [];

  for (const key of [process.env.NVIDIA_API_KEY, process.env.NVIDIA_API_KEY_2].filter(Boolean)) {
    try {
      const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "meta/llama-3.3-70b-instruct",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 8000, temperature: 0.5, stream: false,
        }),
        signal: AbortSignal.timeout,
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
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 8000, temperature: 0.5,
        }),
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
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 8000 } }),
        }
      );
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
  throw new Error("No AI API keys configured.");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      type: "bullets" | "summary";
      position?: string;
      company?: string;
      existing?: string;
      name?: string;
      jobTitle?: string;
      experience?: string;
      skills?: string;
    };

    let prompt = "";

    if (body.type === "bullets") {
      prompt = `You are a professional resume writer. Generate 3-4 strong resume bullet points for the following work experience.

Position: ${body.position || "Unknown"}
Company: ${body.company || "Unknown"}
${body.existing ? `Existing description (improve if provided): ${body.existing}` : ""}

Rules:
- Start each bullet with a strong action verb (Developed, Led, Increased, Managed, etc.)
- Include quantifiable achievements where possible (%, $, numbers)
- Keep each bullet under 15 words
- Return ONLY the bullet points, one per line, starting with bullet symbol
- No extra text, no explanations`;
    } else {
      prompt = `You are a professional resume writer. Write a concise, powerful professional summary for a resume.

Name: ${body.name || ""}
Job Title: ${body.jobTitle || "Professional"}
Experience: ${body.experience || ""}
Key Skills: ${body.skills || ""}

Rules:
- Write 2-3 sentences maximum
- Start with years of experience or expertise level
- Mention key skills and value you bring
- Sound human and confident, not generic
- Return ONLY the summary text, no labels or headings`;
    }

    const result = await callAI(prompt);
    return NextResponse.json({ result });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
