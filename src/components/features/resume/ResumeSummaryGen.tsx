"use client";

import React, { useState } from "react";
import { clsx } from "clsx";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Check, Copy, Loader2 } from "lucide-react";
import { apiPost } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tone = "Professional" | "Dynamic" | "Creative";
type ExperienceRange = "0-1" | "1-3" | "3-5" | "5-10" | "10+";

interface SummaryVariation {
  text: string;
  label: string;
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCard({ variation, index }: { variation: SummaryVariation; index: number }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(variation.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const wordCount = variation.text.split(/\s+/).filter(Boolean).length;
  const accentColors = [
    "border-l-indigo-400",
    "border-l-purple-400",
    "border-l-violet-400",
  ];

  return (
    <div className={clsx("border border-card-border bg-card rounded-xl p-5 border-l-4", accentColors[index])}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
          Variation {index + 1} — {variation.label}
        </span>
        <Badge variant="default" size="sm">{wordCount} words</Badge>
      </div>

      <p className="text-sm text-foreground leading-relaxed mb-4">{variation.text}</p>

      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        leftIcon={copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      >
        {copied ? "Copied!" : "Use This"}
      </Button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ResumeSummaryGen() {
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [experience, setExperience] = useState<ExperienceRange>("3-5");
  const [skills, setSkills] = useState<[string, string, string]>(["", "", ""]);
  const [achievement, setAchievement] = useState("");
  const [tone, setTone] = useState<Tone>("Professional");
  const [loading, setLoading] = useState(false);
  const [summaries, setSummaries] = useState<SummaryVariation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setSkill = (i: 0 | 1 | 2) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = [...skills] as [string, string, string];
    next[i] = e.target.value;
    setSkills(next);
  };

  const isValid = name.trim() && jobTitle.trim() && skills[0].trim() && skills[1].trim() && skills[2].trim();

  const handleGenerate = async () => {
    if (!isValid) return;
    setLoading(true);
    setSummaries(null);
    setError(null);
    try {
      const res = await apiPost<{ result: string }>("/tools/ai/resume-summary", {
        name,
        jobTitle,
        experience,
        skills: skills.filter(Boolean),
        achievement,
        tone,
      });
      try {
        const parsed: Array<{ label: string; summary: string }> = JSON.parse(res.data.result);
        setSummaries(parsed.map((item) => ({ label: item.label, text: item.summary })));
      } catch {
        setError("Failed to parse response. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "border border-border rounded-lg px-3 py-2 text-sm bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground";
  const textareaClass = clsx(inputClass, "resize-none");
  const labelClass = "text-sm font-medium text-foreground mb-1 block";
  const cardClass = "border border-card-border bg-card rounded-2xl p-6";
  const tones: Tone[] = ["Professional", "Dynamic", "Creative"];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* ── Form ── */}
      <div className={cardClass}>
        <h2 className="text-lg font-semibold text-foreground mb-1">Resume Summary Generator</h2>
        <p className="text-sm text-foreground-muted mb-6">
          Generate 3 tailored resume summary variations to impress recruiters.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Your Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Job Title / Target Role</label>
              <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Software Engineer" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Years of Experience</label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value as ExperienceRange)}
              className={inputClass}
            >
              {(["0-1", "1-3", "3-5", "5-10", "10+"] as ExperienceRange[]).map((v) => (
                <option key={v} value={v}>{v} years</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Top 3 Skills</label>
            <div className="space-y-2">
              {(["Skill 1", "Skill 2", "Skill 3"] as const).map((placeholder, i) => (
                <input
                  key={i}
                  type="text"
                  value={skills[i as 0 | 1 | 2]}
                  onChange={setSkill(i as 0 | 1 | 2)}
                  placeholder={placeholder}
                  className={inputClass}
                />
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>
              Key Achievement <span className="text-foreground-muted font-normal">(optional)</span>
            </label>
            <textarea
              value={achievement}
              onChange={(e) => setAchievement(e.target.value)}
              placeholder="e.g. Increased sales by 40% in Q3 2024"
              rows={3}
              className={textareaClass}
            />
          </div>

          {/* Tone */}
          <div>
            <label className={labelClass}>Tone</label>
            <div className="flex flex-wrap gap-2">
              {tones.map((t) => (
                <label
                  key={t}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-all",
                    tone === t
                      ? "border-indigo-400 bg-indigo-50 text-indigo-700 font-medium"
                      : "border-border bg-background text-foreground-muted hover:border-border-strong"
                  )}
                >
                  <input
                    type="radio"
                    name="summary-tone"
                    value={t}
                    checked={tone === t}
                    onChange={() => setTone(t)}
                    className="sr-only"
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>

          <Button
            variant="gradient"
            fullWidth
            isLoading={loading}
            loadingText="Generating…"
            onClick={handleGenerate}
            disabled={!isValid}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 mt-2"
          >
            Generate Summary
          </Button>
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          <p className="text-sm text-foreground-muted">Crafting 3 unique summaries…</p>
        </div>
      )}

      {/* ── Results ── */}
      {!loading && summaries && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Your Summaries</h3>
            <Badge variant="info">{tone}</Badge>
          </div>
          {summaries.map((s, i) => (
            <SummaryCard key={i} variation={s} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
