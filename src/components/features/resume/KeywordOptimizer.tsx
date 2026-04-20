"use client";

import React, { useState } from "react";
import { clsx } from "clsx";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { useLanguageStore } from "@/stores/languageStore";

// ─── Types ────────────────────────────────────────────────────────────────────

type KeywordStatus = "Good" | "Low" | "Missing";

interface KeywordDensityRow {
  keyword: string;
  inResume: number;
  inJD: number;
  status: KeywordStatus;
}

interface MissingKeyword {
  keyword: string;
  suggestion: string;
}

interface OptimizationResult {
  overallScore: number;
  densityTable: KeywordDensityRow[];
  missingKeywords: MissingKeyword[];
  recommendations: string[];
}


// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusVariant(status: KeywordStatus): "success" | "warning" | "error" {
  if (status === "Good") return "success";
  if (status === "Low") return "warning";
  return "error";
}

function scoreColor(score: number): string {
  if (score >= 75) return "text-emerald-500";
  if (score >= 50) return "text-amber-500";
  return "text-red-500";
}

function scoreBarColor(score: number): string {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-red-500";
}

// ─── Missing Keyword Chip ─────────────────────────────────────────────────────

function MissingKeywordChip({
  item,
}: {
  item: MissingKeyword;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-red-500/10 text-red-600 border border-red-500/30 hover:bg-red-500/20 transition-colors w-fit"
      >
        {item.keyword}
        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      {isExpanded && (
        <div className="ml-1 rounded-lg bg-background-subtle border border-border p-3 max-w-lg">
          <p className="text-xs font-semibold text-primary mb-1">Where to add it</p>
          <p className="text-sm text-foreground-muted">{item.suggestion}</p>
        </div>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function KeywordOptimizer() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescText, setJobDescText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguageStore();

  async function handleOptimize() {
    if (!resumeText.trim() && !jobDescText.trim()) return;
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ toolSlug: "keyword-optimizer", resumeText, jobDescText, language }),
      });
      const data = await res.json() as { output?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "Optimization failed");
      const raw = (data.output ?? "").trim();
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid response format. Please try again.");
      const parsed = JSON.parse(jsonMatch[0]) as OptimizationResult;
      setResult(parsed);
    } catch (err: unknown) {
      setError((err as Error).message ?? "Optimization failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Inputs ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground-muted">Paste Your Resume</label>
          <textarea
            rows={10}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste the full text of your resume here…"
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground resize-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground-muted">Paste Job Description</label>
          <textarea
            rows={10}
            value={jobDescText}
            onChange={(e) => setJobDescText(e.target.value)}
            placeholder="Paste the full job description here…"
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground resize-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-foreground-muted">Output language:</span>
        <LanguageSelector />
      </div>
      <Button
        variant="primary"
        fullWidth
        isLoading={isLoading}
        loadingText="Optimizing…"
        disabled={!resumeText.trim() && !jobDescText.trim()}
        onClick={handleOptimize}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 hover:opacity-90"
      >
        Optimize Keywords
      </Button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {/* ── Loading ── */}
      {isLoading && (
        <div className="border border-card-border bg-card rounded-2xl p-8 flex flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <p className="text-sm text-foreground-muted">Analyzing keyword density…</p>
        </div>
      )}

      {/* ── Results ── */}
      {result && !isLoading && (
        <div className="flex flex-col gap-5">
          {/* 1. Keyword Density Table */}
          <div className="border border-card-border bg-card rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground">Keyword Density</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-semibold text-foreground-muted py-2 pr-4">Keyword</th>
                    <th className="text-center text-xs font-semibold text-foreground-muted py-2 pr-4">In Resume</th>
                    <th className="text-center text-xs font-semibold text-foreground-muted py-2 pr-4">In Job Description</th>
                    <th className="text-left text-xs font-semibold text-foreground-muted py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.densityTable.map((row) => (
                    <tr key={row.keyword} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 pr-4 font-medium text-foreground">{row.keyword}</td>
                      <td className="py-2.5 pr-4 text-center">
                        <span className={clsx(
                          "inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-semibold",
                          row.inResume === 0 ? "bg-red-500/10 text-red-600" : "bg-primary/10 text-primary"
                        )}>
                          {row.inResume}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-center">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-background-subtle text-foreground-muted text-xs font-semibold">
                          {row.inJD}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <Badge variant={statusVariant(row.status)} size="sm">{row.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Missing Keywords */}
          <div className="border border-card-border bg-card rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground">Missing Keywords</h3>
            <p className="text-xs text-foreground-muted">Click a keyword chip to see a suggested sentence for adding it to your resume.</p>
            <div className="flex flex-col gap-3">
              {result.missingKeywords.map((item) => (
                <MissingKeywordChip key={item.keyword} item={item} />
              ))}
            </div>
          </div>

          {/* 3. Optimization Score */}
          <div className="border border-card-border bg-card rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Optimization Score</h3>
              <span className={clsx("text-2xl font-bold tabular-nums", scoreColor(result.overallScore))}>
                {result.overallScore}%
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-background-subtle overflow-hidden">
              <div
                className={clsx("h-full rounded-full transition-all duration-700", scoreBarColor(result.overallScore))}
                style={{ width: `${result.overallScore}%` }}
              />
            </div>
            <div className="flex flex-col gap-2 mt-1">
              <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Recommendations</p>
              {result.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-background-subtle">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-[10px] font-bold mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-foreground">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
