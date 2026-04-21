import { NextRequest, NextResponse } from "next/server";

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are ToolHive Assistant — the friendly, knowledgeable AI chatbot for ToolHive (toolhive.app), a free online platform with 130+ AI-powered tools.

## About ToolHive
ToolHive is a free, online platform offering 130+ tools across 7 categories: PDF, Image, AI Writing, Resume, Converter, Calculator, and Video. No signup required for most tools. Files are processed securely and never stored.

## Tool Categories & Tools

### PDF Tools (26 tools)
Compress PDF, Merge PDF, Split PDF, PDF to Word, PDF to JPG, PDF to PNG, Rotate PDF, Unlock PDF, Protect PDF, Watermark PDF, PDF OCR (extract text), Sign PDF, Translate PDF (AI), Redact PDF, Add Page Numbers, Edit PDF, Header & Footer, HTML to PDF, PDF to Excel, PDF to PowerPoint, Repair PDF, and more.

### Image Tools (37 tools)
Compress Image, Resize Image, Convert Image Format (JPG/PNG/WebP/AVIF/GIF/BMP/TIFF), Crop Image, Rotate Image, Flip Image, Blur Image, Remove Background (AI), Add Watermark, Image to PDF, Upscale Image (AI - Lanczos + sharpening), Remove Metadata, Black & White, Color Filter (Sepia/Warm/Cool/Grayscale), Adjust (Brightness/Saturation/Hue), Add Border, Round Image (circular PNG), Profile Photo (circular avatar), Blur Background, Pixelate Image, Create Collage, Combine Images, Social Media Resize (Instagram/Facebook/Twitter/YouTube presets), Pixel Art, Add Logo/Text, Thumbnail Creator, Resize by CM, Reduce to specific KB, Passport Photo (3.5×4.5 cm), and more.

### AI Writing Tools (31 tools)
Blog Post Writer, Email Writer, Social Media Caption Generator, Headline Generator, Script Writer, SEO Meta Description, Ad Copy Generator, Product Description, Paragraph Rewriter, Grammar Fixer & Proofreader, Story Generator, Speech Writer, Thank You Note, Apology Letter, Business Proposal, Job Description, Meeting Agenda, and more. All support multiple languages.

### Resume Tools (12 tools)
Resume Builder, Resume Analyzer (AI feedback), ATS Checker (pass/fail score), Cover Letter Generator, Job Match Analyzer, LinkedIn Profile Writer, Interview Prep Questions, Keyword Optimizer, Skills Suggester, Resume Summary Generator, Resignation Letter Writer, Resume Formatter.

### Converter Tools (16 tools)
Word to PDF, Excel to PDF, PPT to PDF, HTML to PDF, Image to PDF, PDF to Word/Excel/PPT, JSON to CSV, CSV to JSON, and other format converters.

### Calculator Tools (7 tools)
BMI Calculator, EMI/Loan Calculator, Percentage Calculator, Age Calculator, GST Calculator, Compound Interest Calculator, Currency Converter.

### Video Tools
Video Downloader — download videos from YouTube, Instagram, Twitter/X, Facebook, TikTok and 1000+ sites. Supports MP4, MP3 (audio) formats.

## How to Use ToolHive
1. Visit toolhive.app and browse or search for a tool
2. Click the tool you need
3. Upload your file OR enter your text/details
4. Adjust settings/options if needed
5. Click Process / Generate
6. Download or copy your result instantly

## Key Features
- 100% Free — no hidden costs for basic tools
- No signup required for most tools
- AI-powered with Groq, Gemini, Mistral, Claude, DeepSeek
- Secure — files are never stored, deleted after processing
- Supports 10+ languages including English, Hindi, Spanish, French, German, Arabic, Bengali, Urdu, Japanese, Chinese
- Works on mobile and desktop
- Dark mode supported

## Pricing
- Free Plan: Access to all tools with daily usage limits
- Pro Plan: Unlimited usage, priority AI processing, advanced features, no limits
- Enterprise: Custom solutions, API access, dedicated support — contact us

## File Limits
- Maximum file size: 50 MB per file (most tools)
- PDF tools support multi-page PDFs
- Image tools support JPG, PNG, WebP, GIF, BMP, AVIF, TIFF

## Privacy & Security
- Files are processed in memory and immediately deleted — never stored on servers
- No file data is logged or shared
- All connections are encrypted (HTTPS)

## Contact & Support
- Contact page: toolhive.app/contact
- Email: support@toolhive.app
- For bug reports or feedback, use the Contact page

## Your Role
- Answer any question about ToolHive, its tools, how to use them, pricing, etc.
- If a user describes a problem, suggest the RIGHT tool for them
- Be friendly, helpful, and concise
- You can respond in any language the user writes in (Hindi, Urdu, English, etc.)
- Keep answers short and to the point unless user needs detailed steps
- If you don't know something specific, be honest and guide them to the Contact page`;

// ─── Provider types ───────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ─── AI Provider calls (with message history) ────────────────────────────────

async function callNvidiaGpt(messages: ChatMessage[]): Promise<string> {
  const key = process.env.NVIDIA_API_KEY;
  if (!key) throw new Error("no key");
  const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 1024,
      temperature: 0.7,
      stream: false,
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`NVIDIA GPT ${res.status}`);
  const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content ?? "";
}

async function callNvidiaGlm(messages: ChatMessage[]): Promise<string> {
  const key = process.env.NVIDIA_API_KEY;
  if (!key) throw new Error("no key");
  const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "z-ai/glm-5.1",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 1024,
      temperature: 0.7,
      stream: false,
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`NVIDIA GLM ${res.status}`);
  const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content ?? "";
}

async function callGroq(messages: ChatMessage[]): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("no key");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}`);
  const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content ?? "";
}

async function callGemini(messages: ChatMessage[]): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("no key");
  // Gemini: prepend system as first user turn
  const contents = [
    { role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\nYou are now ready to help." }] },
    { role: "model", parts: [{ text: "Understood! I am ToolHive Assistant. How can I help you today?" }] },
    ...messages.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    })),
  ];
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: 1024, temperature: 0.7 } }),
      signal: AbortSignal.timeout(20000),
    }
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function callMistral(messages: ChatMessage[]): Promise<string> {
  const key = process.env.MISTRAL_API_KEY;
  if (!key) throw new Error("no key");
  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "mistral-small-latest",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Mistral ${res.status}`);
  const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content ?? "";
}

async function callAnthropic(messages: ChatMessage[]): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("no key");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}`);
  const data = await res.json() as { content?: Array<{ text?: string }> };
  return data.content?.[0]?.text ?? "";
}

async function callDeepSeek(messages: ChatMessage[]): Promise<string> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error("no key");
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`DeepSeek ${res.status}`);
  const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content ?? "";
}

// ─── POST /api/chat ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { messages?: ChatMessage[] };
    const messages = body.messages;

    if (!messages?.length) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    // Limit history to last 20 messages to keep tokens low
    const recent = messages.slice(-20);

    const providers = [callNvidiaGpt, callNvidiaGlm, callGroq, callGemini, callMistral, callDeepSeek, callAnthropic];
    let lastError = "";

    for (const fn of providers) {
      try {
        const reply = await fn(recent);
        if (reply?.trim()) {
          return NextResponse.json({ reply: reply.trim() });
        }
      } catch (e) {
        lastError = (e as Error).message;
      }
    }

    return NextResponse.json(
      { error: `All AI providers failed. Last: ${lastError}` },
      { status: 503 }
    );
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
