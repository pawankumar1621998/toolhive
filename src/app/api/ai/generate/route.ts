import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
// Provider definitions
// ─────────────────────────────────────────────────────────────────────────────

type Provider = "gemini" | "groq" | "deepseek" | "anthropic";

interface ProviderConfig {
  name: string;
  envKey: string;
  call: (apiKey: string, prompt: string) => Promise<string>;
}

const PROVIDERS: Record<Provider, ProviderConfig> = {
  gemini: {
    name: "Gemini",
    envKey: "GEMINI_API_KEY",
    call: async (apiKey, prompt) => {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
          }),
        }
      );
      if (!res.ok) {
        const err = await res.json() as { error?: { message?: string } };
        throw new Error(err.error?.message ?? `Gemini error ${res.status}`);
      }
      const data = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
      return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    },
  },

  groq: {
    name: "Groq",
    envKey: "GROQ_API_KEY",
    call: async (apiKey, prompt) => {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 2048,
          temperature: 0.7,
        }),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: { message?: string } };
        throw new Error(err.error?.message ?? `Groq error ${res.status}`);
      }
      const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      return data.choices?.[0]?.message?.content ?? "";
    },
  },

  deepseek: {
    name: "DeepSeek",
    envKey: "DEEPSEEK_API_KEY",
    call: async (apiKey, prompt) => {
      const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 2048,
          temperature: 0.7,
        }),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: { message?: string } };
        throw new Error(err.error?.message ?? `DeepSeek error ${res.status}`);
      }
      const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      return data.choices?.[0]?.message?.content ?? "";
    },
  },

  anthropic: {
    name: "Claude (Anthropic)",
    envKey: "ANTHROPIC_API_KEY",
    call: async (apiKey, prompt) => {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2048,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: { message?: string } };
        throw new Error(err.error?.message ?? `Anthropic error ${res.status}`);
      }
      const data = await res.json() as { content?: Array<{ text?: string }> };
      return data.content?.[0]?.text ?? "";
    },
  },
};

// Priority order — first provider with a key wins
const PROVIDER_ORDER: Provider[] = ["gemini", "groq", "deepseek", "anthropic"];

async function callAI(prompt: string, preferredProvider?: Provider): Promise<{ output: string; provider: string }> {
  const order = preferredProvider
    ? [preferredProvider, ...PROVIDER_ORDER.filter((p) => p !== preferredProvider)]
    : PROVIDER_ORDER;

  const errors: string[] = [];

  for (const providerKey of order) {
    const config = PROVIDERS[providerKey];
    const apiKey = process.env[config.envKey];
    if (!apiKey?.trim()) continue;

    try {
      const output = await config.call(apiKey, prompt);
      if (output.trim()) return { output, provider: config.name };
    } catch (err) {
      errors.push(`${config.name}: ${(err as Error).message}`);
    }
  }

  // No provider worked — return demo
  if (errors.length > 0) {
    throw new Error(`All AI providers failed:\n${errors.join("\n")}`);
  }

  // No keys configured at all
  return {
    output: "⚠️ No AI API key configured.\n\nAdd one of these to your .env.local file:\n• GEMINI_API_KEY\n• GROQ_API_KEY\n• DEEPSEEK_API_KEY\n• ANTHROPIC_API_KEY\n\nGet free keys at:\n• Gemini: aistudio.google.com\n• Groq: console.groq.com\n• DeepSeek: platform.deepseek.com\n• Anthropic: console.anthropic.com",
    provider: "demo",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Prompt builder
// ─────────────────────────────────────────────────────────────────────────────

function buildPrompt(toolSlug: string, params: Record<string, unknown>): string {
  switch (toolSlug) {
    case "summarize": {
      const { text, options } = params as { text: string; options: { format: string; length: string } };
      return `Summarize the following text. Format: ${options?.format ?? "Bullet Points"}. Length: ${options?.length ?? "Medium"}.\n\nRespond ONLY with the summary, no explanations or preamble.\n\nText:\n${text}`;
    }
    case "translate": {
      const { text, targetLanguage } = params as { text: string; targetLanguage: string };
      return `Translate the following text to ${targetLanguage}. Respond ONLY with the translation, preserving paragraph structure.\n\nText:\n${text}`;
    }
    case "rewrite": {
      const { text, tone } = params as { text: string; tone: string };
      return `Rewrite the following text in a ${tone} tone. Keep the same meaning but improve clarity and style. Respond ONLY with the rewritten text.\n\nText:\n${text}`;
    }
    case "grammar-check": {
      const { text } = params as { text: string };
      return `Check and fix the grammar, spelling, and punctuation in the following text. Return the corrected version followed by a brief list of changes made. Format: corrected text, then "---CHANGES---", then bullet list of corrections.\n\nText:\n${text}`;
    }
    case "paraphrase": {
      const { text, mode } = params as { text: string; mode: string };
      return `Paraphrase the following text using ${mode ?? "Standard"} mode. Make it sound different while keeping the same meaning. Respond ONLY with the paraphrased text.\n\nText:\n${text}`;
    }
    case "summarize-pdf":
    case "blog-writer": {
      const { topic, keywords, length, tone } = params as { topic: string; keywords?: string; length?: string; tone?: string };
      return `Write a complete ${length ?? "medium-length"} blog post about: "${topic}"\n${keywords ? `Keywords to include: ${keywords}` : ""}\nTone: ${tone ?? "Professional"}\n\nInclude: engaging title, introduction, 3-5 main sections with headings, conclusion. Format with clear headings using markdown ##.`;
    }
    case "email-writer": {
      const { emailType, context, tone } = params as { emailType: string; context: string; tone: string };
      return `Write a ${tone ?? "Professional"} ${emailType ?? "business"} email.\nContext/purpose: ${context}\n\nInclude Subject line, greeting, body, and sign-off. Format clearly.`;
    }
    case "social-caption": {
      const { platform, topic, emojiPref } = params as { platform: string; topic: string; emojiPref: string };
      return `Write 3 engaging ${platform ?? "Instagram"} captions for: "${topic}"\n${emojiPref === "Yes" ? "Include relevant emojis." : "No emojis."}\nInclude relevant hashtags at the end. Number each caption 1, 2, 3.`;
    }
    case "headline": {
      const { topic, count, style } = params as { topic: string; count: number; style: string };
      return `Generate ${count ?? 10} compelling ${style ?? "engaging"} headlines for the topic: "${topic}"\nNumber each headline. Make them click-worthy and varied in style.`;
    }
    case "script-writer": {
      const { platform, topic, style, duration } = params as { platform: string; topic: string; style: string; duration: string };
      return `Write a complete ${platform ?? "YouTube"} video script about: "${topic}"\nStyle: ${style ?? "Educational"}, Duration: ${duration ?? "5 minutes"}\n\nInclude: Hook, Introduction, Main Content, Call to Action. Use [PAUSE], [VISUAL:], and [CUT TO:] cues.`;
    }
    case "instagram-bio": {
      const { mood, name, details } = params as { mood: string; name?: string; details?: string };
      return `Generate 5 Instagram bio variations with ${mood ?? "Professional"} vibe.\n${name ? `Name: ${name}` : ""}\n${details ? `Details: ${details}` : ""}\nEach bio max 150 characters. Number them 1-5. Include relevant emojis.`;
    }
    case "description": {
      const { type, title, features, audience, tone } = params as { type: string; title: string; features: string; audience?: string; tone?: string };
      return `Write a compelling ${tone ?? "professional"} description for this ${type ?? "product"}: "${title}"\nKey features/details: ${features}\n${audience ? `Target audience: ${audience}` : ""}\nMake it engaging, clear, and persuasive.`;
    }
    case "story-generator": {
      const { topic, genre, emotion, wordCount, language, characters } = params as { topic: string; genre: string; emotion: string; wordCount: number; language: string; characters?: string };
      return `Write a ${wordCount ?? 500}-word ${genre ?? "general"} story about: "${topic}"\nLanguage: ${language ?? "English"}\nEmotion/Tone: ${emotion ?? "Happy"}\n${characters ? `Main characters: ${characters}` : ""}\n\nWrite a complete story with beginning, middle, and end. Be creative and engaging.`;
    }
    case "note-maker": {
      const { topic, format, detail, language } = params as { topic: string; format: string; detail: string; language: string };
      return `Create ${detail ?? "detailed"} study notes about: "${topic}"\nFormat: ${format ?? "Bullet Points"}\nLanguage: ${language ?? "English"}\n\nInclude: key concepts, important points, examples where relevant. Make it easy to study from.`;
    }
    case "article-writer": {
      const { topic, wordCount, tone, language, sections } = params as { topic: string; wordCount: number; tone: string; language: string; sections?: string };
      return `Write a complete ${wordCount ?? 800}-word ${tone ?? "informative"} article about: "${topic}"\nLanguage: ${language ?? "English"}\n${sections ? `Include these sections: ${sections}` : "Include relevant sections with headings."}\n\nWrite in a clear, engaging style with proper introduction and conclusion.`;
    }
    case "ad-copy": {
      const { product, platform, benefits, tone, count } = params as { product: string; platform: string; benefits: string; tone: string; count: number };
      return `Generate ${count ?? 3} high-converting ad copy variations for:\nProduct/Service: ${product}\nPlatform: ${platform ?? "Facebook Ads"}\nKey benefits: ${benefits}\nTone: ${tone ?? "Persuasive"}\n\nFor each: write a Headline (max 30 chars), Description (max 90 chars), and CTA. Number them.`;
    }
    case "hashtag-gen": {
      const { topic, platform, niche } = params as { topic: string; platform: string; niche?: string };
      return `Generate 30 relevant hashtags for ${platform ?? "Instagram"} about: "${topic}"\n${niche ? `Niche: ${niche}` : ""}\n\nGroup them:\n🔥 High reach (10 hashtags - very popular)\n📈 Medium reach (10 hashtags - balanced)\n🎯 Niche (10 hashtags - targeted)\n\nFormat: #hashtag`;
    }
    case "business-name": {
      const { keywords, industry, style, count } = params as { keywords: string; industry: string; style: string; count: number };
      return `Generate ${count ?? 20} creative business/brand names for:\nIndustry: ${industry ?? "General"}\nKeywords/Theme: ${keywords}\nStyle: ${style ?? "Creative"}\n\nFor each name, provide: Name, Why it works (1 line). Number them. Make them unique, memorable, and brandable.`;
    }
    case "roast-gen": {
      const { name, traits } = params as { name: string; traits: string };
      return `Write a funny, lighthearted roast for "${name}". Their traits: ${traits}. Keep it playful and friendly, not mean. 5-7 roast lines. Make it genuinely funny!`;
    }
    case "dad-jokes": {
      const { topic, count } = params as { topic?: string; count: number };
      return `Generate ${count ?? 10} original dad jokes${topic ? ` about ${topic}` : ""}. Make them groan-worthy! Format: Q: question A: answer`;
    }
    case "emoji-translator": {
      const { text } = params as { text: string };
      return `Translate the following text into emojis (replace key words with relevant emojis while keeping some text for context):\n${text}\nAlso provide a "Full Emoji Version" that uses ONLY emojis to represent the message.`;
    }
    case "shakespeare": {
      const { text } = params as { text: string };
      return `Translate this modern text into Shakespearean English (thee, thou, hast, dost, etc.):\n"${text}"\nMake it dramatic and theatrical!`;
    }
    case "corporate-jargon": {
      const { text } = params as { text: string };
      return `Rewrite this simple statement using maximum corporate buzzwords and jargon to make it sound unnecessarily complex:\n"${text}"\nInclude terms like: synergize, leverage, bandwidth, circle back, move the needle, deep dive, etc.`;
    }
    case "fortune-cookie": {
      const { theme } = params as { theme?: string };
      return `Generate 5 unique fortune cookie messages${theme ? ` with a ${theme} theme` : ""}. Mix ancient wisdom with modern humor. Each fortune should be 1-2 sentences, cryptic yet meaningful.\n\nFormat each as:\n🥠 [Fortune here]\n\nMake them feel authentic but with a subtle twist of humor.`;
    }
    case "excuse-gen": {
      const { situation, creativity } = params as { situation: string; creativity?: string };
      return `Generate 5 creative, funny excuses for: "${situation || "being late"}"\nCreativity level: ${creativity || "Medium"}\n\nMake them funny but plausible. Each excuse should be 1-3 sentences. Number them 1-5. The more creative the level, the more outlandish the excuse.`;
    }
    case "compliment-gen": {
      const { name, vibe, count } = params as { name?: string; vibe?: string; count?: number };
      return `Generate ${count || 5} ${vibe || "funny"} compliments${name ? ` for ${name}` : ""}.\n\nVibe: ${vibe || "Funny & Cheesy"}\nMake them genuine but with the right vibe. Number them 1-${count || 5}. Each compliment should be 1-2 sentences.`;
    }
    default: {
      const { text, topic } = params as { text?: string; topic?: string };
      return `${text ?? topic ?? "Generate helpful content for " + toolSlug}`;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Route handler
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const { toolSlug, provider: preferredProvider, ...params } = body as {
      toolSlug: string;
      provider?: Provider;
    } & Record<string, unknown>;

    const prompt = buildPrompt(toolSlug, params);
    const { output, provider } = await callAI(prompt, preferredProvider);

    return NextResponse.json({ output, provider });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET — return which providers are configured (for UI badge)
// ─────────────────────────────────────────────────────────────────────────────

export async function GET() {
  const available = PROVIDER_ORDER
    .filter((p) => !!process.env[PROVIDERS[p].envKey]?.trim())
    .map((p) => ({ id: p, name: PROVIDERS[p].name }));

  return NextResponse.json({ providers: available });
}
