import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
// Provider definitions
// ─────────────────────────────────────────────────────────────────────────────

type Provider = "gemini" | "groq" | "deepseek" | "anthropic" | "mistral" | "openrouter" | "nvidia-gpt" | "nvidia-glm" | "nvidia-deepseek" | "nvidia2-nemotron" | "nvidia2-llama";

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

  mistral: {
    name: "Mistral AI",
    envKey: "MISTRAL_API_KEY",
    call: async (apiKey, prompt) => {
      const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistral-small-latest",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 2048,
          temperature: 0.7,
        }),
      });
      if (!res.ok) {
        const err = await res.json() as { message?: string };
        throw new Error(err.message ?? `Mistral error ${res.status}`);
      }
      const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      return data.choices?.[0]?.message?.content ?? "";
    },
  },

  "nvidia-gpt": {
    name: "GPT-OSS 120B",
    envKey: "NVIDIA_API_KEY",
    call: async (apiKey, prompt) => {
      const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 4096,
          temperature: 0.7,
          stream: false,
        }),
      });
      if (!res.ok) throw new Error(`NVIDIA GPT ${res.status}`);
      const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      return data.choices?.[0]?.message?.content ?? "";
    },
  },

  "nvidia-glm": {
    name: "GLM-5.1",
    envKey: "NVIDIA_API_KEY",
    call: async (apiKey, prompt) => {
      const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "z-ai/glm-5.1",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 4096,
          temperature: 0.7,
          stream: false,
        }),
      });
      if (!res.ok) throw new Error(`NVIDIA GLM ${res.status}`);
      const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      return data.choices?.[0]?.message?.content ?? "";
    },
  },

  "nvidia-deepseek": {
    name: "DeepSeek V3.1",
    envKey: "NVIDIA_API_KEY",
    call: async (apiKey, prompt) => {
      const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "deepseek-ai/deepseek-v3.1-terminus",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 4096,
          temperature: 0.3,
          stream: false,
        }),
      });
      if (!res.ok) throw new Error(`NVIDIA DeepSeek ${res.status}`);
      const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      return data.choices?.[0]?.message?.content ?? "";
    },
  },

  "nvidia2-nemotron": {
    name: "NVIDIA Nemotron",
    envKey: "NVIDIA_API_KEY_2",
    call: async (apiKey, prompt) => {
      const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "nvidia/llama-3.1-nemotron-70b-instruct",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 4096,
          temperature: 0.3,
          stream: false,
        }),
      });
      if (!res.ok) throw new Error(`NVIDIA Nemotron ${res.status}`);
      const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      return data.choices?.[0]?.message?.content ?? "";
    },
  },

  "nvidia2-llama": {
    name: "NVIDIA Llama",
    envKey: "NVIDIA_API_KEY_2",
    call: async (apiKey, prompt) => {
      const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "meta/llama-3.3-70b-instruct",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 4096,
          temperature: 0.3,
          stream: false,
        }),
      });
      if (!res.ok) throw new Error(`NVIDIA Llama ${res.status}`);
      const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      return data.choices?.[0]?.message?.content ?? "";
    },
  },

  openrouter: {
    name: "OpenRouter",
    envKey: "OPENROUTER_API_KEY",
    call: async (apiKey, prompt) => {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://toolhive.app",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.1-8b-instruct:free",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 2048,
        }),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: { message?: string } };
        throw new Error(err.error?.message ?? `OpenRouter error ${res.status}`);
      }
      const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      return data.choices?.[0]?.message?.content ?? "";
    },
  },
};

// Priority order — Groq fastest, NVIDIA GPT-120B best quality, then fallbacks
const PROVIDER_ORDER: Provider[] = ["nvidia-gpt", "nvidia-glm", "nvidia-deepseek", "nvidia2-nemotron", "nvidia2-llama", "groq", "mistral", "openrouter", "gemini", "deepseek", "anthropic"];

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Provider timeout after ${ms}ms`)), ms)
    ),
  ]);
}

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
      const output = await withTimeout(config.call(apiKey, prompt), 25_000);
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
// Language instruction helper
// ─────────────────────────────────────────────────────────────────────────────

function langInstruction(language?: string): string {
  if (!language || language === "English") return "";
  const map: Record<string, string> = {
    Hindi:      "IMPORTANT: Respond entirely in Hindi (Devanagari script). Write all content in हिंदी.",
    Hinglish:   "IMPORTANT: Respond in Hinglish — Hindi words written in Roman/English script, casual conversational style (like: 'Yeh bahut helpful hai, aap iska use kar sakte hain'). Sound natural like WhatsApp messages in India.",
    Spanish:    "IMPORTANT: Respond entirely in Spanish.",
    French:     "IMPORTANT: Respond entirely in French.",
    German:     "IMPORTANT: Respond entirely in German.",
    Arabic:     "IMPORTANT: Respond entirely in Arabic.",
    Portuguese: "IMPORTANT: Respond entirely in Portuguese.",
    Bengali:    "IMPORTANT: Respond entirely in Bengali.",
    Urdu:       "IMPORTANT: Respond entirely in Urdu (Nastaliq script).",
  };
  return map[language] ? `\n\n${map[language]}` : "";
}

// For JSON-returning tools: translate values but keep keys in English
function langInstructionJSON(language?: string): string {
  if (!language || language === "English") return "";
  const base = langInstruction(language);
  if (!base) return "";
  return base + " Keep all JSON property keys in English; translate only the string values.";
}

// ─────────────────────────────────────────────────────────────────────────────
// Prompt builder
// ─────────────────────────────────────────────────────────────────────────────

// Tools that return JSON — language instruction must tell AI to keep keys in English
const JSON_TOOLS = new Set([
  "resume-summary", "linkedin-headlines", "linkedin-bullets",
  "interview-prep", "resume-analyzer", "ats-checker", "job-match", "keyword-optimizer", "resume-from-jd", "resume-career-insights",
]);

function buildPrompt(toolSlug: string, params: Record<string, unknown>): string {
  const lang = params.language as string | undefined;
  const base = buildBasePrompt(toolSlug, params);
  if (!lang || lang === "English") return base;
  return base + (JSON_TOOLS.has(toolSlug) ? langInstructionJSON(lang) : langInstruction(lang));
}

function buildBasePrompt(toolSlug: string, params: Record<string, unknown>): string {
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
    case "resume-summary": {
      const { name, jobTitle, experience, skills, achievement, tone } = params as { name: string; jobTitle: string; experience: string; skills: string; achievement?: string; tone: string };
      return `Generate 3 professional resume summary variations for ${name || "a candidate"} targeting the role of ${jobTitle} with ${experience} years of experience. Key skills: ${skills}.${achievement ? ` Notable achievement: ${achievement}.` : ""} Primary tone: ${tone}.

Return ONLY a valid JSON array (no markdown, no code block, no explanation):
[{"label":"${tone}","text":"...full summary here..."},{"label":"Concise","text":"...concise 2-sentence summary..."},{"label":"Achievement-focused","text":"...achievement-driven summary..."}]`;
    }

    case "linkedin-headlines": {
      const { jobTitle, specialization, industry, value } = params as { jobTitle: string; specialization?: string; industry?: string; value?: string };
      return `Generate 5 compelling LinkedIn headline options for a ${jobTitle}${specialization ? ` specializing in ${specialization}` : ""}${industry ? ` in the ${industry} industry` : ""}${value ? `. Unique value: ${value}` : ""}.

Return ONLY a valid JSON array of exactly 5 strings (no markdown, no explanation):
["Headline option 1","Headline option 2","Headline option 3","Headline option 4","Headline option 5"]`;
    }

    case "linkedin-about": {
      const { jobTitle, experience, achievements, cta } = params as { jobTitle: string; experience?: string; achievements?: string; cta?: string };
      return `Write a compelling LinkedIn About section for a ${jobTitle}${experience ? ` with ${experience} years of experience` : ""}${achievements ? `. Top achievements: ${achievements}` : ""}.${cta ? ` Close with a CTA about: ${cta}.` : ""}

Write 2-3 engaging paragraphs. Return ONLY the plain text (no JSON, no markdown, no quotes).`;
    }

    case "linkedin-bullets": {
      const { jobTitle, company, whatDid, results } = params as { jobTitle: string; company?: string; whatDid: string; results?: string };
      return `Generate 5 strong resume/LinkedIn experience bullet points for a ${jobTitle}${company ? ` at ${company}` : ""}. What they did: ${whatDid}.${results ? ` Results/Impact: ${results}.` : ""}

Each bullet must start with a strong action verb. Return ONLY a valid JSON array of 5 strings (no markdown, no explanation):
["Led cross-functional...","Increased efficiency...","Collaborated with...","Developed...","Delivered..."]`;
    }

    case "interview-prep": {
      const { jobTitle, experienceLevel } = params as { jobTitle?: string; experienceLevel?: string };
      return `Generate personalized interview questions for a ${jobTitle || "professional"} at ${experienceLevel || "mid"} experience level.

Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure — IDs 1-18:
{"behavioral":[{"id":1,"text":"...","modelAnswer":"STAR method framework hint","practiced":false},{"id":2,"text":"...","modelAnswer":"...","practiced":false},{"id":3,"text":"...","modelAnswer":"...","practiced":false},{"id":4,"text":"...","modelAnswer":"...","practiced":false},{"id":5,"text":"...","modelAnswer":"...","practiced":false}],"technical":[{"id":6,"text":"...","modelAnswer":"...","practiced":false},{"id":7,"text":"...","modelAnswer":"...","practiced":false},{"id":8,"text":"...","modelAnswer":"...","practiced":false},{"id":9,"text":"...","modelAnswer":"...","practiced":false},{"id":10,"text":"...","modelAnswer":"...","practiced":false}],"situational":[{"id":11,"text":"...","modelAnswer":"...","practiced":false},{"id":12,"text":"...","modelAnswer":"...","practiced":false},{"id":13,"text":"...","modelAnswer":"...","practiced":false},{"id":14,"text":"...","modelAnswer":"...","practiced":false},{"id":15,"text":"...","modelAnswer":"...","practiced":false}],"about":[{"id":16,"text":"...","modelAnswer":"...","practiced":false},{"id":17,"text":"...","modelAnswer":"...","practiced":false},{"id":18,"text":"...","modelAnswer":"...","practiced":false}]}`;
    }

    case "resume-analyzer": {
      const { resumeText } = params as { resumeText?: string };
      return `Analyze the following resume and return scores and improvement suggestions.

Resume text:
${resumeText || "(No resume text provided — give general resume feedback)"}

Return ONLY a valid JSON object (no markdown, no explanation):
{"overallScore":<0-100>,"sections":[{"label":"Contact Information","score":<0-100>},{"label":"Professional Summary","score":<0-100>},{"label":"Work Experience","score":<0-100>},{"label":"Education","score":<0-100>},{"label":"Skills","score":<0-100>},{"label":"Formatting & Layout","score":<0-100>}],"issues":[{"message":"specific actionable tip","severity":"High"},{"message":"specific actionable tip","severity":"Medium"},{"message":"specific actionable tip","severity":"Low"}]}
Include 4-6 issues.`;
    }

    case "ats-checker": {
      const { resumeText, jobDesc } = params as { resumeText?: string; jobDesc?: string };
      return `You are an expert ATS (Applicant Tracking System) resume coach. Analyze this resume against the job description and give SPECIFIC, ACTIONABLE improvement advice.

Resume: ${resumeText || "(not provided — give general advice)"}
Job Description: ${jobDesc || "(not provided — give general advice)"}

Return ONLY a valid JSON object (no markdown, no code blocks):
{
  "atsScore": <0-100>,
  "keywordMatch": {"found": <n>, "total": <n>, "percentage": <n>},
  "categories": [
    {"label": "Formatting", "score": <0-100>, "detail": "specific note about formatting"},
    {"label": "Keywords", "score": <0-100>, "detail": "specific note about keywords"},
    {"label": "Experience", "score": <0-100>, "detail": "specific note about experience section"},
    {"label": "Education", "score": <0-100>, "detail": "specific note about education section"}
  ],
  "missingKeywords": ["keyword1", "keyword2", "keyword3"],
  "matchedKeywords": ["keyword1", "keyword2", "keyword3"],
  "quickFixes": ["Quick fix 1 with specific action", "Quick fix 2", "Quick fix 3"],
  "improvements": [
    {
      "section": "Professional Summary",
      "issue": "Specific problem found",
      "fix": "EXACT text or phrase to add: 'example phrase to add'",
      "priority": "Critical"
    },
    {
      "section": "Work Experience",
      "issue": "Specific problem found",
      "fix": "EXACT bullet point to add or how to rewrite: 'example text'",
      "priority": "High"
    },
    {
      "section": "Skills",
      "issue": "Specific problem found",
      "fix": "EXACT skills to add: 'Skill A, Skill B, Skill C'",
      "priority": "High"
    },
    {
      "section": "Keywords",
      "issue": "Missing important keywords",
      "fix": "Add these exact phrases to your resume: 'phrase 1', 'phrase 2'",
      "priority": "Medium"
    }
  ]
}
Include 4-6 improvement items with SPECIFIC text to add. Return ONLY valid JSON.`;
    }

    case "job-match": {
      const { resumeText, jobDesc } = params as { resumeText?: string; jobDesc?: string };
      return `Analyze how well this resume matches the job description.

Resume: ${resumeText || "(not provided)"}
Job Description: ${jobDesc || "(not provided)"}

Return ONLY a valid JSON object (no markdown, no explanation):
{"matchPercentage":<0-100>,"skillsGap":{"have":["skill1","skill2"],"missing":["skill1","skill2"]},"experience":[{"requirement":"Years of Experience","required":"X years","yours":"Y years","match":"strong"},{"requirement":"Another req","required":"...","yours":"...","match":"partial"}],"keywords":[{"keyword":"word","inJD":<n>,"inResume":<n>}],"recommendations":["rec1","rec2","rec3","rec4"]}`;
    }

    case "keyword-optimizer": {
      const { resumeText, jobDescText } = params as { resumeText?: string; jobDescText?: string };
      return `Analyze keyword optimization for this resume vs job description.

Resume: ${resumeText || "(not provided)"}
Job Description: ${jobDescText || "(not provided)"}

Return ONLY a valid JSON object (no markdown, no explanation):
{"overallScore":<0-100>,"densityTable":[{"keyword":"word","inResume":<n>,"inJD":<n>,"status":"Good"},{"keyword":"word","inResume":<n>,"inJD":<n>,"status":"Low"},{"keyword":"word","inResume":0,"inJD":<n>,"status":"Missing"}],"missingKeywords":[{"keyword":"word","suggestion":"Where and how to add this keyword"}],"recommendations":["rec1","rec2","rec3","rec4"]}
Include 4-8 keywords in densityTable, 2-4 missingKeywords.`;
    }

    case "resume-from-jd": {
      const { jobTitle, company, jobDescription } = params as { jobTitle?: string; company?: string; jobDescription: string };
      return `You are a professional resume writer. A candidate wants to apply for ${jobTitle ? `"${jobTitle}"` : "a job"}${company ? ` at ${company}` : ""}.

Based on this job description, suggest the most relevant skills and write a professional resume summary.

Job Description:
${jobDescription}

Return ONLY a valid JSON object (no markdown, no code blocks):
{"skills":{"technical":["skill1","skill2","skill3","skill4","skill5"],"soft":["skill1","skill2","skill3"]},"summary":"2-3 sentence professional summary tailored to this role","suggestedSkills":["additional skill to learn 1","additional skill to learn 2","additional skill to learn 3"]}

Include 5-8 technical skills and 3-4 soft skills. Make the summary ATS-optimized.`;
    }

    case "resume-career-insights": {
      const { skills, jobTitle, experience } = params as { skills?: { technical?: string[]; soft?: string[] }; jobTitle?: string; experience?: string };
      const techSkills = skills?.technical?.join(", ") || "";
      const softSkills = skills?.soft?.join(", ") || "";
      return `You are a career counselor. Based on this professional's profile, suggest career paths and skills to learn.

Target Role: ${jobTitle || "Not specified"}
Technical Skills: ${techSkills || "Not listed"}
Soft Skills: ${softSkills || "Not listed"}
Experience: ${experience || "Not specified"}

Return ONLY a valid JSON object (no markdown, no code blocks):
{"careerPaths":["Role Title - one-line description of fit","Role Title - one-line description of fit","Role Title - one-line description of fit"],"skillsToLearn":["Skill Name - why it will boost your career","Skill Name - why it will boost your career","Skill Name - why it will boost your career","Skill Name - why it will boost your career"],"industries":["Industry 1","Industry 2","Industry 3"]}

Provide 3-4 career paths, 4-5 skills to learn, 3 industries. Be specific and actionable.`;
    }

    case "poem-gen": {
      const { topic, style, mood, language } = params as { topic: string; style?: string; mood?: string; language?: string };
      return `Write a beautiful ${style ?? "free verse"} poem about: "${topic}"\nMood/Tone: ${mood ?? "Thoughtful"}\nLanguage: ${language ?? "English"}\n\nWrite ONLY the poem — no title unless it's a sonnet. Use vivid imagery, rhythm, and emotion. Make it memorable and meaningful.`;
    }

    case "song-lyrics": {
      const { theme, genre, mood, hook } = params as { theme: string; genre?: string; mood?: string; hook?: string };
      return `Write original song lyrics for a ${genre ?? "Pop"} song.\nTheme/Story: ${theme}\nMood: ${mood ?? "Uplifting"}${hook ? `\nHook/Key phrase to include: ${hook}` : ""}\n\nStructure: [Verse 1], [Pre-Chorus], [Chorus], [Verse 2], [Chorus], [Bridge], [Final Chorus]\nMake the chorus catchy and memorable. Use rhyme and rhythm appropriate for ${genre ?? "Pop"}.`;
    }

    case "tagline-gen": {
      const { brand, industry, vibe, audience } = params as { brand: string; industry?: string; vibe?: string; audience?: string };
      return `Generate 10 catchy taglines/slogans for: "${brand}"\nIndustry: ${industry ?? "General"}\nVibe/Tone: ${vibe ?? "Bold"}\n${audience ? `Target audience: ${audience}` : ""}\n\nCreate varied options: 2 bold, 2 witty, 2 inspirational, 2 minimal/clean, 2 question-based.\nEach tagline max 8 words. Number them 1-10. Add a brief note (1-3 words) after each in brackets like [bold], [witty], [inspirational].`;
    }

    case "speech-writer": {
      const { occasion, speakerName, aboutPerson, tone, duration, personalDetails } = params as { occasion: string; speakerName?: string; aboutPerson?: string; tone?: string; duration?: string; personalDetails?: string };
      return `Write a complete ${tone ?? "Heartfelt"} ${occasion} speech.\n${speakerName ? `Speaker: ${speakerName}` : ""}\n${aboutPerson ? `Speech is about/for: ${aboutPerson}` : ""}\nDuration: ${duration ?? "3 minutes"} (~${duration === "1 minute" ? "130" : duration === "2 minutes" ? "260" : duration === "5 minutes" ? "650" : "390"} words)\n${personalDetails ? `Personal details/stories to include: ${personalDetails}` : ""}\n\nStructure: Opening hook, personal story/memory, heartfelt message, advice or wishes, memorable closing line.\nMake it emotional, authentic, and memorable. Use natural spoken language.`;
    }

    case "cold-dm": {
      const { platform, purpose, aboutMe, aboutThem, offer } = params as { platform: string; purpose?: string; aboutMe?: string; aboutThem?: string; offer?: string };
      return `Write 3 cold ${platform ?? "Instagram"} DM/outreach message variations.\nPurpose: ${purpose ?? "Collaboration"}\n${aboutMe ? `About me/my brand: ${aboutMe}` : ""}\n${aboutThem ? `About the recipient: ${aboutThem}` : ""}\n${offer ? `What I'm offering/proposing: ${offer}` : ""}\n\nRules: Not spammy, personalized, under 100 words each, clear CTA. Start with a genuine observation, not "Hey" or "Hi I found you". Number each variation 1, 2, 3. Add a subject/opening strategy note after each.`;
    }

    case "code-generator": {
      const { language, task, details } = params as { language: string; task: string; details?: string };
      return `Write clean, well-commented ${language ?? "Python"} code for: "${task}"\n${details ? `Additional details: ${details}` : ""}\n\nProvide: working code with comments explaining key parts, plus a brief usage example. Use best practices.`;
    }
    case "code-debugger": {
      const { code, language, error } = params as { code: string; language?: string; error?: string };
      return `Debug and fix this ${language ?? ""} code.\n${error ? `Error message: ${error}` : ""}\n\nCode:\n\`\`\`\n${code}\n\`\`\`\n\nProvide: 1) What was wrong (brief), 2) Fixed code, 3) Explanation of the fix.`;
    }
    case "essay-writer": {
      const { topic, type, wordCount, tone } = params as { topic: string; type?: string; wordCount?: string; tone?: string };
      return `Write a ${wordCount ?? "500"}-word ${type ?? "argumentative"} essay on: "${topic}"\nTone: ${tone ?? "Academic"}\n\nStructure: Introduction with thesis, 3 body paragraphs with evidence, Conclusion. Use proper essay format with clear transitions.`;
    }
    case "business-plan": {
      const { businessName, industry, description, target } = params as { businessName: string; industry: string; description: string; target?: string };
      return `Write a detailed business plan for: "${businessName}"\nIndustry: ${industry}\nBusiness: ${description}\n${target ? `Target market: ${target}` : ""}\n\nInclude: Executive Summary, Problem & Solution, Market Analysis, Revenue Model, Marketing Strategy, Financial Projections overview, Team Requirements. Use clear headings.`;
    }
    case "news-article": {
      const { headline, details, tone } = params as { headline: string; details: string; tone?: string };
      return `Write a professional ${tone ?? "neutral"} news article with headline: "${headline}"\nFacts/Details: ${details}\n\nFollow inverted pyramid structure: most important info first, then context, then background. Include: Headline, dateline, 5W1H in first paragraph, quotes (if relevant), background context. Keep it factual and objective.`;
    }
    case "legal-summarizer": {
      const { text, focus } = params as { text: string; focus?: string };
      return `Summarize this legal document in plain English. ${focus ? `Focus on: ${focus}` : ""}\n\nDocument:\n${text}\n\nProvide: 1) Plain English summary (3-5 sentences), 2) Key obligations/rights, 3) Important dates/deadlines, 4) Red flags or unusual clauses. Use simple language anyone can understand.`;
    }
    case "paragraph-expander": {
      const { text, length, tone } = params as { text: string; length?: string; tone?: string };
      return `Expand this short text into a ${length ?? "full"} paragraph with ${tone ?? "professional"} tone:\n"${text}"\n\nAdd: supporting details, examples, context, and smooth transitions. Make it engaging and informative while keeping the original meaning.`;
    }
    case "product-review": {
      const { product, pros, cons, rating } = params as { product: string; pros?: string; cons?: string; rating?: number };
      return `Write a genuine, balanced product review for: "${product}"\n${pros ? `Pros: ${pros}` : ""}\n${cons ? `Cons: ${cons}` : ""}\n${rating ? `Rating: ${rating}/5` : ""}\n\nInclude: overview, pros, cons, who it's for, verdict. Sound authentic and helpful. 200-300 words.`;
    }
    case "faq-generator": {
      const { topic, count, audience } = params as { topic: string; count?: number; audience?: string };
      return `Generate ${count ?? 10} FAQs about: "${topic}"\n${audience ? `Target audience: ${audience}` : ""}\n\nFormat each as:\nQ: [question]\nA: [clear, helpful answer]\n\nCover different aspects: basics, how-to, troubleshooting, pricing, comparisons. Make answers concise but complete.`;
    }
    case "cover-letter-gen": {
      const { name, role, company, experience, skills } = params as { name?: string; role: string; company: string; experience?: string; skills?: string };
      return `Write a compelling cover letter for ${name ?? "a candidate"} applying for ${role} at ${company}.\n${experience ? `Experience: ${experience}` : ""}\n${skills ? `Key skills: ${skills}` : ""}\n\nInclude: strong opening hook, relevant experience, why this company, call to action. Keep it to 3-4 paragraphs. Sound enthusiastic but professional.`;
    }
    case "resignation-letter": {
      const { name, position, company, lastDay, reason, tone } = params as { name?: string; position?: string; company?: string; lastDay?: string; reason?: string; tone?: string };
      return `Write a ${tone ?? "professional"} resignation letter.\nName: ${name ?? "Employee"}\nPosition: ${position ?? "current position"}\nCompany: ${company ?? "the company"}\nLast working day: ${lastDay ?? "two weeks from now"}\n${reason ? `Reason (brief): ${reason}` : ""}\n\nKeep it gracious, professional, and brief. Express gratitude, state last day clearly, offer transition help.`;
    }
    case "interview-prep": {
      const { role, company, type, count } = params as { role: string; company?: string; type?: string; count?: number };
      return `Generate ${count ?? 10} interview questions with model answers for: "${role}"${company ? ` at ${company}` : ""}.\nInterview type: ${type ?? "Mixed (behavioral + technical)"}\n\nFormat each as:\nQ: [question]\nA: [strong model answer using STAR method where applicable]\n\nCover: experience-based, behavioral, situational, and role-specific technical questions. Make answers concise, impressive, and authentic.`;
    }
    case "linkedin-post": {
      const { topic, tone: postTone, goal } = params as { topic: string; tone?: string; goal?: string };
      return `Write a viral LinkedIn post about: "${topic}"\nTone: ${postTone ?? "Authentic & professional"}\n${goal ? `Goal: ${goal}` : ""}\n\nStructure:\n1. Hook (first line that stops scrolling)\n2. Story or insight (3-5 short paragraphs, each 1-2 sentences)\n3. Key takeaway\n4. CTA (question or call to action)\n\nUse line breaks generously. No hashtag overload (max 3 relevant hashtags at the end). Sound human, not corporate.`;
    }
    case "youtube-script": {
      const { title, niche, duration, style } = params as { title: string; niche?: string; duration?: string; style?: string };
      return `Write a complete YouTube video script for: "${title}"\n${niche ? `Channel niche: ${niche}` : ""}\nVideo length: ${duration ?? "8-10 minutes"}\nStyle: ${style ?? "Educational / informative"}\n\nInclude these labeled sections:\n[HOOK] - First 30 seconds, pattern interrupt that grabs attention\n[INTRO] - Brief intro, what viewer will learn, subscribe mention\n[MAIN CONTENT] - 3-5 clearly labeled sections with transitions\n[OUTRO] - Recap key points, CTA to subscribe/like/comment, tease next video\n\nWrite natural, conversational speech. Suggest B-roll visuals in brackets.`;
    }
    case "twitter-thread": {
      const { topic, angle, tweetCount } = params as { topic: string; angle?: string; tweetCount?: number };
      return `Write a viral Twitter/X thread about: "${topic}"\n${angle ? `Angle: ${angle}` : ""}\nNumber of tweets: ${tweetCount ?? 10}\n\nFormat:\n1/ [Hook tweet — bold statement or surprising fact that makes people want to read more]\n2/ [Supporting point]\n...\n${tweetCount ?? 10}/ [Strong closing + CTA: follow for more, retweet, or question]\n\nEach tweet max 280 characters. Use line breaks inside tweets. No filler. Every tweet must add value or build curiosity.`;
    }
    case "bio-writer": {
      const { name, role, achievements, platform, length, personality } = params as { name?: string; role: string; achievements?: string; platform?: string; length?: string; personality?: string };
      return `Write a professional bio for ${name ?? "a professional"}.\nRole/Title: ${role}\n${achievements ? `Key achievements: ${achievements}` : ""}\nPlatform: ${platform ?? "LinkedIn / General"}\nLength: ${length ?? "Short (2-3 sentences)"}\nPersonality: ${personality ?? "Professional & approachable"}\n\nWrite in third person. Start with the name. Highlight unique value, notable achievements, and personality. End with current focus or mission. Sound human, not robotic.`;
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

    // Try Render backend first
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (backendUrl) {
      try {
        const res = await fetch(`${backendUrl}/tools/ai/${toolSlug}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
          signal: AbortSignal.timeout(25000),
        });
        if (res.ok) {
          const data = await res.json() as { result?: string; output?: string };
          const output = (data.result ?? data.output ?? "").trim();
          if (output) return NextResponse.json({ output, provider: "ToolHive AI" });
        }
      } catch {
        // fall through to local providers
      }
    }

    // Fallback: local AI providers with crafted prompts
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
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;
  if (backendUrl) {
    return NextResponse.json({ providers: [{ id: "render", name: "ToolHive AI" }] });
  }

  const available = PROVIDER_ORDER
    .filter((p) => !!process.env[PROVIDERS[p].envKey]?.trim())
    .map((p) => ({ id: p, name: PROVIDERS[p].name }));

  return NextResponse.json({ providers: available });
}
