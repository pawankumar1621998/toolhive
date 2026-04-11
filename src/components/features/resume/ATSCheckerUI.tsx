"use client";

import React, { useRef, useState } from "react";
import { clsx } from "clsx";
import { Upload, FileText, Plus, Check } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { apiUpload } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryScore {
  label: string;
  score: number;
  detail?: string;
}

interface ATSResult {
  atsScore: number;
  keywordMatch: { found: number; total: number; percentage: number };
  categories: CategoryScore[];
  missingKeywords: string[];
  matchedKeywords: string[];
  quickFixes: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 75) return "text-emerald-500";
  if (score >= 50) return "text-amber-500";
  return "text-red-500";
}

function scoreRingColor(score: number): string {
  if (score >= 75) return "#10b981";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

function barColor(score: number): string {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-red-500";
}

// ─── Score Circle ─────────────────────────────────────────────────────────────

function ATSScoreCircle({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const color = scoreRingColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center" style={{ width: 136, height: 136 }}>
        <svg width="136" height="136" className="-rotate-90" viewBox="0 0 136 136">
          <circle cx="68" cy="68" r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-border" />
          <circle
            cx="68" cy="68" r={radius} fill="none" stroke={color} strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
            style={{ transition: "stroke-dasharray 0.8s ease" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={clsx("text-3xl font-bold tabular-nums", scoreColor(score))}>{score}</span>
          <span className="text-xs text-foreground-muted">ATS Score</span>
        </div>
      </div>
    </div>
  );
}

// ─── File Upload Zone ─────────────────────────────────────────────────────────

function FileUploadZone({
  label,
  file,
  onFile,
}: {
  label: string;
  file: File | null;
  onFile: (f: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
      }}
      onClick={() => inputRef.current?.click()}
      className={clsx(
        "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors",
        isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
      )}
    >
      <input ref={inputRef} type="file" accept=".pdf,.docx,.doc" className="sr-only"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      {file ? (
        <div className="flex flex-col items-center gap-2">
          <FileText className="h-7 w-7 text-primary" />
          <p className="text-xs font-medium text-foreground truncate max-w-[180px]">{file.name}</p>
          <p className="text-xs text-foreground-muted">Click to change</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-7 w-7 text-foreground-muted" />
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-foreground-muted">PDF, DOCX, DOC</p>
        </div>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ATSCheckerUI() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDesc, setJobDesc] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addedKeywords, setAddedKeywords] = useState<Set<string>>(new Set());
  const [checkedFixes, setCheckedFixes] = useState<Set<number>>(new Set());

  async function handleCheck() {
    if (!resumeFile && !jobDesc.trim()) return;
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const fd = new FormData();
      if (resumeFile) fd.append("file", resumeFile);
      fd.append("tool", "ats-check");
      if (jobDesc.trim()) fd.append("jobDescription", jobDesc);
      const res = await apiUpload<ATSResult>("/tools/resume/analyze", fd);
      setResult(res.data as ATSResult);
      setAddedKeywords(new Set());
      setCheckedFixes(new Set());
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Analysis failed. Please try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  function toggleKeyword(kw: string) {
    setAddedKeywords((prev) => {
      const next = new Set(prev);
      if (next.has(kw)) next.delete(kw); else next.add(kw);
      return next;
    });
  }

  function toggleFix(idx: number) {
    setCheckedFixes((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ── Left panel ── */}
      <div className="flex flex-col gap-4">
        <FileUploadZone label="Upload Your Resume" file={resumeFile} onFile={setResumeFile} />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground-muted">Paste Job Description</label>
          <textarea
            rows={8}
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            placeholder="Paste the full job description here…"
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground resize-none"
          />
        </div>

        <Button
          variant="primary"
          fullWidth
          isLoading={isLoading}
          loadingText="Checking…"
          disabled={!resumeFile && !jobDesc.trim()}
          onClick={handleCheck}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 hover:opacity-90"
        >
          Check ATS Score
        </Button>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>

      {/* ── Right panel ── */}
      <div className="flex flex-col gap-5">
        {!result && !isLoading && (
          <div className="border border-card-border bg-card rounded-2xl p-6 flex flex-col items-center justify-center gap-3 min-h-[300px] text-center">
            <FileText className="h-12 w-12 text-foreground-muted/40" />
            <p className="text-sm text-foreground-muted">Upload your resume and paste a job description, then click Check ATS Score.</p>
          </div>
        )}

        {isLoading && (
          <div className="border border-card-border bg-card rounded-2xl p-6 flex flex-col items-center justify-center gap-4 min-h-[300px]">
            <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
            <p className="text-sm text-foreground-muted">Running ATS analysis…</p>
          </div>
        )}

        {result && (
          <>
            {/* ATS Score */}
            <div className="border border-card-border bg-card rounded-2xl p-6 flex flex-col items-center gap-4">
              <ATSScoreCircle score={result.atsScore} />
            </div>

            {/* Category Breakdown */}
            <div className="border border-card-border bg-card rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-foreground">Score Breakdown</h3>
              {result.categories.map((cat) => (
                <div key={cat.label} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground-muted">{cat.label}</span>
                    <span className="flex items-center gap-2">
                      {cat.detail && <span className="text-foreground-muted">{cat.detail}</span>}
                      <span className={clsx("font-semibold tabular-nums", scoreColor(cat.score))}>{cat.score}%</span>
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-background-subtle overflow-hidden">
                    <div
                      className={clsx("h-full rounded-full transition-all duration-700", barColor(cat.score))}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Missing Keywords */}
            <div className="border border-card-border bg-card rounded-2xl p-6 flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-foreground">Missing Keywords</h3>
              <p className="text-xs text-foreground-muted">These keywords appear in the job description but not in your resume. Click + to mark as added.</p>
              <div className="flex flex-wrap gap-2">
                {result.missingKeywords.map((kw) => (
                  <button
                    key={kw}
                    onClick={() => toggleKeyword(kw)}
                    className={clsx(
                      "inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors",
                      addedKeywords.has(kw)
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 line-through opacity-60"
                        : "bg-red-500/10 text-red-600 border-red-500/30 hover:bg-red-500/20"
                    )}
                  >
                    {addedKeywords.has(kw) ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                    {kw}
                  </button>
                ))}
              </div>
            </div>

            {/* Matched Keywords */}
            <div className="border border-card-border bg-card rounded-2xl p-6 flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-foreground">Matched Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {result.matchedKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                  >
                    <Check className="h-3 w-3" />
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Fixes */}
            <div className="border border-card-border bg-card rounded-2xl p-6 flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-foreground">Quick Fixes</h3>
              <div className="flex flex-col gap-2">
                {result.quickFixes.map((fix, idx) => (
                  <label
                    key={idx}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={checkedFixes.has(idx)}
                      onChange={() => toggleFix(idx)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary cursor-pointer"
                    />
                    <span className={clsx(
                      "text-sm text-foreground transition-colors",
                      checkedFixes.has(idx) && "line-through text-foreground-muted"
                    )}>
                      {fix}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
