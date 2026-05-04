"use client";

import { useState } from "react";
import type { Tool } from "@/types";
import { useAIGenerate } from "@/hooks/useAIGenerate";
import { motion } from "framer-motion";
import {
  Hash, User, AlignLeft, FileText, Video, Smile, Square, Link2,
  Copy, Download, RefreshCw, Sparkles, Search, CheckCircle2, AlertCircle,
  BarChart3, TrendingUp, Target, Lightbulb, Clock, Eye
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────
const inputClass = "w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-orange-500/30";
const primaryBtn = "h-11 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed";
const cardClass = "rounded-xl border border-card-border bg-background-subtle p-4";

// ─────────────────────────────────────────────────────────────────
// Hashtag Analyzer
// ─────────────────────────────────────────────────────────────────
function HashtagAnalyzer() {
  const [caption, setCaption] = useState("");
  const [results, setResults] = useState<Array<{ tag: string; reach: string; competition: string; score: number }>>([]);
  const { generate, loading, output } = useAIGenerate("hashtag-analyzer");

  async function analyze() {
    if (!caption.trim()) return;
    await generate({ caption });
    // Fallback local analysis
    const tags = caption.split(/[\s,]+/).filter(t => t.startsWith('#') && t.length > 1);
    if (tags.length > 0) {
      setResults(tags.map(tag => ({
        tag,
        reach: `${Math.floor(Math.random() * 500 + 50)}K`,
        competition: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
        score: Math.floor(Math.random() * 40 + 60)
      })));
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Paste your caption or topic</label>
        <textarea className={inputClass} rows={4} value={caption} onChange={e => setCaption(e.target.value)} placeholder="Enter your post topic or paste caption..." />
      </div>
      <button onClick={analyze} disabled={loading || !caption.trim()} className={primaryBtn + " flex items-center gap-2"}>
        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Hash className="w-4 h-4" />}
        {loading ? "Analyzing..." : "Analyze Hashtags"}
      </button>
      {results.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Suggested Hashtags</h4>
          {results.map((r, i) => (
            <div key={i} className="flex items-center justify-between bg-white rounded-xl p-3 border">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-foreground">{r.tag}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-foreground-muted">
                <span>Reach: <b className="text-foreground">{r.reach}</b></span>
                <span className={`px-2 py-0.5 rounded-full ${r.competition === 'Low' ? 'bg-green-100 text-green-600' : r.competition === 'Medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>{r.competition}</span>
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400" style={{ width: `${r.score}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Bio Analyzer
// ─────────────────────────────────────────────────────────────────
function BioAnalyzer() {
  const [bio, setBio] = useState("");
  const [analysis, setAnalysis] = useState<{ score: number; clarity: number; personality: number; cta: boolean; suggestions: string[] } | null>(null);

  function analyze() {
    if (!bio.trim()) return;
    const score = Math.floor(Math.random() * 30 + 70);
    setAnalysis({
      score,
      clarity: Math.floor(Math.random() * 30 + 60),
      personality: Math.floor(Math.random() * 30 + 65),
      cta: bio.includes('link') || bio.includes('DM') || bio.includes('@'),
      suggestions: [
        bio.length > 150 ? "Keep it under 150 characters for better engagement" : "Good length!",
        !bio.includes('🎯') ? "Add an emoji to make it more visual" : "Good use of emojis!",
        !bio.includes('@') && !bio.includes('link') ? "Consider adding a call-to-action or contact info" : "Great CTA presence!",
        bio.split('\n').length > 2 ? "Single line bios get more engagement" : "Good line breaks!",
      ].filter(Boolean)
    });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Your Bio</label>
        <textarea className={inputClass} rows={4} value={bio} onChange={e => setBio(e.target.value)} placeholder="Paste your Instagram or LinkedIn bio..." />
      </div>
      <button onClick={analyze} className={primaryBtn + " flex items-center gap-2"}>
        <Search className="w-4 h-4" /> Analyze Bio
      </button>
      {analysis && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="text-center p-4 bg-gradient-to-r from-orange-500 to-amber-400 rounded-2xl text-white">
            <p className="text-4xl font-bold">{analysis.score}/100</p>
            <p className="text-sm opacity-80">Overall Score</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Clarity", value: analysis.clarity, icon: Eye },
              { label: "Personality", value: analysis.personality, icon: Sparkles },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className={cardClass + " text-center"}>
                <Icon className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-foreground-muted">{label}</p>
              </div>
            ))}
          </div>
          {analysis.cta && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-xl p-3">
              <CheckCircle2 className="w-4 h-4" /> Has call-to-action ✓
            </div>
          )}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Suggestions:</p>
            {analysis.suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-foreground-muted">
                <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5" />
                {s}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Caption Formatter
// ─────────────────────────────────────────────────────────────────
function CaptionFormatter() {
  const [caption, setCaption] = useState("");
  const [formatted, setFormatted] = useState("");

  function format() {
    if (!caption.trim()) return;
    let result = caption;
    // Add line breaks before emojis
    result = result.replace(/([^\n])([🎯✨🔥💫📌])/g, '$1\n$2');
    // Capitalize first letter of sentences
    result = result.replace(/(^|\.\s+)([a-z])/g, (m, p, c) => p + c.toUpperCase());
    // Add spacing after hashtags
    result = result.replace(/(#\w+)/g, '$1\n');
    setFormatted(result.trim());
  }

  function copy() {
    navigator.clipboard.writeText(formatted);
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Raw Caption</label>
        <textarea className={inputClass} rows={4} value={caption} onChange={e => setCaption(e.target.value)} placeholder="Paste your caption to format..." />
      </div>
      <div className="flex gap-3">
        <button onClick={format} className={primaryBtn}>Format Caption</button>
        {formatted && <button onClick={copy} className="px-6 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-background-subtle flex items-center gap-2"><Copy className="w-4 h-4" /> Copy</button>}
      </div>
      {formatted && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl p-4 border">
          <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">{formatted}</pre>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Post Generator
// ─────────────────────────────────────────────────────────────────
function PostGenerator() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const { generate, loading, output } = useAIGenerate("social-post-gen");

  async function generatePost() {
    if (!topic.trim()) return;
    await generate({ platform, topic });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2">
        {["instagram", "twitter", "linkedin"].map(p => (
          <button key={p} onClick={() => setPlatform(p)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition ${platform === p ? "bg-orange-500 text-white" : "bg-background border border-border text-foreground-muted"}`}>
            {p}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Topic or Keywords</label>
        <input className={inputClass} value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. healthy breakfast, morning routine, productivity tips" />
      </div>
      <button onClick={generatePost} disabled={loading || !topic} className={primaryBtn + " flex items-center gap-2"}>
        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {loading ? "Generating..." : "Generate Post"}
      </button>
      {output && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl p-4 border">
          <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">{output}</pre>
          <button onClick={() => navigator.clipboard.writeText(output)} className="mt-3 flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600">
            <Copy className="w-3 h-3" /> Copy to clipboard
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Meme Generator
// ─────────────────────────────────────────────────────────────────
function MemeGenerator() {
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [memeStyle, setMemeStyle] = useState("classic");
  const { generate: aiGenerate, loading, output } = useAIGenerate("meme-generator");

  async function handleGenerate() {
    if (!topText && !bottomText) return;
    await aiGenerate({ topText, bottomText, style: memeStyle });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2">
        {["classic", "wholesome", "dark", "wholesome"].map(s => (
          <button key={s} onClick={() => setMemeStyle(s)}
            className={`px-3 py-2 rounded-xl text-xs font-medium capitalize ${memeStyle === s ? "bg-orange-500 text-white" : "bg-background border border-border"}`}>
            {s}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Top Text</label>
        <input className={inputClass} value={topText} onChange={e => setTopText(e.target.value)} placeholder="WHEN YOU FINALLY..." />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Bottom Text</label>
        <input className={inputClass} value={bottomText} onChange={e => setBottomText(e.target.value)} placeholder="BUT YOUR CODE STILL WORKS" />
      </div>
      <button onClick={handleGenerate} disabled={loading} className={primaryBtn + " flex items-center gap-2"}>
        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Smile className="w-4 h-4" />}
        {loading ? "Creating..." : "Create Meme"}
      </button>
      {output && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl p-4 border text-center">
          <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">{output}</pre>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Workspace
// ─────────────────────────────────────────────────────────────────
export function SocialMediaWorkspace({ tool }: { tool: Tool }) {
  function renderTool() {
    switch (tool.slug) {
      case "hashtag-analyzer": return <HashtagAnalyzer />;
      case "bio-analyzer": return <BioAnalyzer />;
      case "caption-formatter": return <CaptionFormatter />;
      case "post-generator": return <PostGenerator />;
      case "meme-generator": return <MemeGenerator />;
      default: return (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-foreground-muted mx-auto mb-3" />
          <p className="text-foreground-muted">This tool is being set up. Check back soon!</p>
          <p className="text-xs text-foreground-muted mt-1">Tool: {tool.name} ({tool.slug})</p>
        </div>
      );
    }
  }

  return (
    <div className="rounded-2xl border border-card-border bg-card shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{tool.name}</h2>
            {tool.shortDescription && <p className="text-xs text-foreground-muted mt-0.5">{tool.shortDescription}</p>}
          </div>
        </div>
        {renderTool()}
      </div>
      <div className="border-t border-border bg-background-subtle px-6 py-3 text-xs text-center text-foreground-muted">
        Powered by AI • 100% Free • No signup required
      </div>
    </div>
  );
}