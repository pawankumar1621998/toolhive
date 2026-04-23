"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ChevronRight, ChevronLeft, Copy, Check, Loader2, X,
  TrendingUp, Zap, Target, User, Briefcase, Award, ArrowUpRight,
  RefreshCw,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

const LEVELS = ["Entry", "Mid", "Senior", "Lead", "Executive"] as const;
type LevelType = typeof LEVELS[number];

const INDUSTRIES_LIST = [
  "Software", "Finance", "Healthcare", "Marketing", "Design", "Data Science",
  "Product Management", "Consulting", "Sales", "Operations", "HR", "Legal",
];

interface TargetForm {
  fullName: string;
  targetRole: string;
  targetLevel: LevelType;
  targetIndustries: string[];
}

interface CurrentProfile {
  currentHeadline: string;
  currentAbout: string;
  skills: string[];
  experienceBullets: string;
}

interface OptimizedResult {
  headline: string;
  about: string;
  improvedBullets: string[];
  recommendedSkills: string[];
  keywords: string[];
  tips: string[];
  headlineScore: number;
  aboutScore: number;
  overallScore: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-foreground-muted">{label}</span>
        <span className="text-xs font-bold" style={{ color }}>{score}/100</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full" style={{ backgroundColor: color }} />
      </div>
    </div>
  );
}

function CopyBlock({ label, content, color }: { label: string; content: string; color: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div className="border border-slate-700/50 bg-slate-900/30 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>{label}</span>
        <button onClick={copy} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-slate-700">
          {copied ? <><Check className="h-3 w-3 text-emerald-400" />Copied</> : <><Copy className="h-3 w-3" />Copy</>}
        </button>
      </div>
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LinkedInOptimizer() {
  const [phase, setPhase] = useState<"target" | "input" | "results">("target");
  const [target, setTarget] = useState<TargetForm>({ fullName: "", targetRole: "", targetLevel: "Mid", targetIndustries: [] });
  const [profile, setProfile] = useState<CurrentProfile>({ currentHeadline: "", currentAbout: "", skills: [], experienceBullets: "" });
  const [result, setResult] = useState<OptimizedResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [industryInput, setIndustryInput] = useState("");
  const [activeTab, setActiveTab] = useState<"headline" | "about" | "bullets" | "skills" | "keywords">("headline");

  const accentColor = "#0077B5";

  function addSkill(s: string) {
    if (s.trim() && !profile.skills.includes(s.trim())) {
      setProfile(p => ({ ...p, skills: [...p.skills, s.trim()] }));
    }
    setSkillInput("");
  }

  function addIndustry(ind: string) {
    if (!target.targetIndustries.includes(ind)) {
      setTarget(t => ({ ...t, targetIndustries: [...t.targetIndustries, ind] }));
    }
    setIndustryInput("");
  }

  async function optimize() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/linkedin-optimizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...target, ...profile }),
      });
      const d = await res.json() as { optimized?: OptimizedResult; error?: string };
      if (d.error) throw new Error(d.error);
      setResult(d.optimized!);
      setPhase("results");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // ── Phase: Target ──────────────────────────────────────────────────────────

  if (phase === "target") {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #0077B5, #00a0dc)" }}>
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-white fill-current"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" /></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI LinkedIn Optimizer</h1>
            <p className="text-sm text-foreground-muted">AI rewrites your headline, about, and bullets to maximize recruiter visibility</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Your Name</label>
              <input value={target.fullName} onChange={e => setTarget(t => ({ ...t, fullName: e.target.value }))} placeholder="Jane Smith"
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Target Role</label>
              <input value={target.targetRole} onChange={e => setTarget(t => ({ ...t, targetRole: e.target.value }))} placeholder="e.g. Senior Software Engineer"
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Seniority Level</label>
            <div className="flex gap-2 flex-wrap">
              {LEVELS.map(l => (
                <button key={l} onClick={() => setTarget(t => ({ ...t, targetLevel: l }))}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${target.targetLevel === l ? "text-white shadow-md" : "bg-card border border-border text-foreground-muted hover:border-blue-500/50"}`}
                  style={target.targetLevel === l ? { backgroundColor: accentColor } : undefined}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Target Industries</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {target.targetIndustries.map(ind => (
                <span key={ind} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {ind}<button onClick={() => setTarget(t => ({ ...t, targetIndustries: t.targetIndustries.filter(x => x !== ind) }))}><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {INDUSTRIES_LIST.filter(i => !target.targetIndustries.includes(i)).map(ind => (
                <button key={ind} onClick={() => addIndustry(ind)} className="px-2.5 py-1 rounded-full text-xs bg-slate-700/50 text-slate-400 hover:bg-blue-500/10 hover:text-blue-400 border border-slate-600/50 hover:border-blue-500/30 transition-colors">
                  + {ind}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button onClick={() => setPhase("input")} disabled={!target.targetRole}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none shadow-xl"
            style={{ background: `linear-gradient(135deg, ${accentColor}, #00a0dc)` }}>
            Next: Add Your Profile <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── Phase: Input ───────────────────────────────────────────────────────────

  if (phase === "input") {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <button onClick={() => setPhase("target")} className="flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground mb-6 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground">Your Current Profile</h2>
          <p className="text-sm text-foreground-muted mt-1">Paste your current LinkedIn sections — AI will rewrite everything for maximum impact</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Current Headline</label>
            <input value={profile.currentHeadline} onChange={e => setProfile(p => ({ ...p, currentHeadline: e.target.value }))}
              placeholder="e.g. Software Engineer at Acme | Python | React"
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors" />
            <p className="text-[11px] text-foreground-muted mt-1">Leave blank if you don&apos;t have one yet</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Current About Section</label>
            <textarea value={profile.currentAbout} onChange={e => setProfile(p => ({ ...p, currentAbout: e.target.value }))} rows={5}
              placeholder="Paste your current LinkedIn About/Summary section here…"
              className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Your Skills</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {profile.skills.map(s => (
                <span key={s} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {s}<button onClick={() => setProfile(p => ({ ...p, skills: p.skills.filter(x => x !== s) }))}><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
            <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && skillInput.trim()) addSkill(skillInput); }}
              placeholder="Add skill and press Enter (React, Python, SQL…)"
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Experience Highlights</label>
            <textarea value={profile.experienceBullets} onChange={e => setProfile(p => ({ ...p, experienceBullets: e.target.value }))} rows={4}
              placeholder={"• Increased revenue by 30% through...\n• Led a team of 5 engineers to...\n• Built and deployed a microservice that..."}
              className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors resize-none" />
            <p className="text-[11px] text-foreground-muted mt-1">Paste 2-3 of your best existing bullet points — AI will improve them</p>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

        <div className="mt-8 flex justify-end">
          <button onClick={optimize} disabled={loading}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 shadow-xl"
            style={{ background: `linear-gradient(135deg, #7c3aed, ${accentColor})` }}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Optimizing your profile…</> : <><Sparkles className="h-4 w-4" />Optimize My LinkedIn Profile</>}
          </button>
        </div>
      </div>
    );
  }

  // ── Phase: Results ─────────────────────────────────────────────────────────

  if (phase === "results" && result) {
    const overallColor = result.overallScore >= 80 ? "#22c55e" : result.overallScore >= 60 ? "#f59e0b" : "#ef4444";

    const TABS = [
      { id: "headline" as const, label: "Headline", icon: User },
      { id: "about" as const, label: "About", icon: Briefcase },
      { id: "bullets" as const, label: "Bullets", icon: TrendingUp },
      { id: "skills" as const, label: "Skills", icon: Zap },
      { id: "keywords" as const, label: "Keywords", icon: Target },
    ];

    return (
      <div className="w-full">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setPhase("input")} className="flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <div>
            <h2 className="text-xl font-bold text-foreground">Optimized Profile — {target.targetRole}</h2>
            <p className="text-sm text-foreground-muted">{target.targetLevel} · {target.targetIndustries.join(", ") || "Tech"}</p>
          </div>
          <button onClick={() => { setPhase("input"); setResult(null); }} className="ml-auto flex items-center gap-1.5 text-xs text-foreground-muted hover:text-foreground border border-border rounded-lg px-3 py-1.5 transition-colors">
            <RefreshCw className="h-3.5 w-3.5" /> Redo
          </button>
        </div>

        <div className="flex flex-col xl:flex-row gap-6">
          {/* Left: Score card + Tips */}
          <div className="xl:w-[260px] shrink-0 space-y-4">
            {/* Score */}
            <div className="border border-card-border bg-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Profile Score</h3>
                <span className="text-2xl font-black" style={{ color: overallColor }}>{result.overallScore}</span>
              </div>
              <div className="space-y-3">
                <ScoreBar label="Headline" score={result.headlineScore} color={accentColor} />
                <ScoreBar label="About Section" score={result.aboutScore} color="#7c3aed" />
                <ScoreBar label="Overall" score={result.overallScore} color={overallColor} />
              </div>
            </div>

            {/* Tips */}
            <div className="border border-card-border bg-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3"><Award className="h-4 w-4 text-amber-500" /><h3 className="text-sm font-semibold text-foreground">Action Tips</h3></div>
              <ul className="space-y-2">
                {result.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-foreground-muted">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Before/After summary */}
            {profile.currentHeadline && (
              <div className="border border-card-border bg-card rounded-2xl p-5">
                <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-3">Before → After</h3>
                <div className="p-2.5 rounded-lg bg-red-500/5 border border-red-500/15 mb-2">
                  <p className="text-[10px] text-red-400 font-bold uppercase mb-1">Before</p>
                  <p className="text-xs text-foreground-muted">{profile.currentHeadline}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                  <p className="text-[10px] text-emerald-400 font-bold uppercase mb-1">After</p>
                  <p className="text-xs text-foreground">{result.headline}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Tabs with results */}
          <div className="flex-1 min-w-0">
            <div className="border border-card-border bg-card rounded-2xl overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-card-border overflow-x-auto">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors ${activeTab === id ? "border-b-2 text-foreground" : "text-foreground-muted hover:text-foreground"}`}
                    style={activeTab === id ? { borderBottomColor: accentColor } : undefined}>
                    <Icon className="h-3.5 w-3.5" />{label}
                  </button>
                ))}
              </div>

              <div className="p-5">
                <AnimatePresence mode="wait">
                  <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    {activeTab === "headline" && (
                      <div className="space-y-3">
                        <p className="text-xs text-foreground-muted mb-4">Keyword-optimized headline for {target.targetRole} at {target.targetLevel} level — copy and paste directly into LinkedIn.</p>
                        <CopyBlock label="Optimized Headline" content={result.headline} color={accentColor} />
                        <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                          <p className="text-[11px] text-blue-400 font-semibold mb-1">Character count: {result.headline.length} / 220</p>
                          <p className="text-[11px] text-foreground-muted">LinkedIn headlines can be up to 220 characters. Yours uses them well.</p>
                        </div>
                      </div>
                    )}

                    {activeTab === "about" && (
                      <div className="space-y-3">
                        <p className="text-xs text-foreground-muted mb-4">Rewritten About section with strong hook, relevant keywords, and a clear call-to-action.</p>
                        <CopyBlock label="Optimized About Section" content={result.about} color="#7c3aed" />
                      </div>
                    )}

                    {activeTab === "bullets" && (
                      <div className="space-y-3">
                        <p className="text-xs text-foreground-muted mb-4">Your experience bullets rewritten with stronger action verbs and quantified impact.</p>
                        {result.improvedBullets.map((bullet, i) => (
                          <CopyBlock key={i} label={`Improved Bullet ${i + 1}`} content={bullet} color="#10b981" />
                        ))}
                      </div>
                    )}

                    {activeTab === "skills" && (
                      <div>
                        <p className="text-xs text-foreground-muted mb-4">Top skills to add to your LinkedIn Skills section for maximum recruiter searchability.</p>
                        <div className="flex flex-wrap gap-2">
                          {result.recommendedSkills.map(s => (
                            <span key={s} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border" style={{ backgroundColor: `${accentColor}15`, color: accentColor, borderColor: `${accentColor}30` }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "keywords" && (
                      <div>
                        <p className="text-xs text-foreground-muted mb-4">Add these keywords naturally throughout your profile to improve search ranking.</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {result.keywords.map(kw => (
                            <span key={kw} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">{kw}</span>
                          ))}
                        </div>
                        <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                          <p className="text-[11px] text-amber-500 font-semibold mb-1">How to use these keywords</p>
                          <p className="text-[11px] text-foreground-muted">Sprinkle them in your headline, about section, and job descriptions. Don&apos;t keyword-stuff — use them naturally in context.</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
