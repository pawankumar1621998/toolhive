"use client";

import React, { useRef, useState } from "react";
import { clsx } from "clsx";
import { Upload, FileText, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { useLanguageStore } from "@/stores/languageStore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SectionScore {
  label: string;
  score: number;
}

interface Issue {
  message: string;
  severity: "High" | "Medium" | "Low";
}

interface AnalysisResult {
  overallScore: number;
  sections: SectionScore[];
  issues: Issue[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────


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

function progressBarColor(score: number): string {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-red-500";
}

function severityVariant(severity: Issue["severity"]): "error" | "warning" | "muted" {
  if (severity === "High") return "error";
  if (severity === "Medium") return "warning";
  return "muted";
}

function SeverityIcon({ severity }: { severity: Issue["severity"] }) {
  if (severity === "High") return <AlertCircle className="h-4 w-4 text-destructive shrink-0" />;
  if (severity === "Medium") return <AlertTriangle className="h-4 w-4 text-warning shrink-0" />;
  return <CheckCircle2 className="h-4 w-4 text-foreground-muted shrink-0" />;
}

// ─── Score Circle ─────────────────────────────────────────────────────────────

function ScoreCircle({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const color = scoreRingColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center" style={{ width: 136, height: 136 }}>
        <svg width="136" height="136" className="-rotate-90" viewBox="0 0 136 136">
          <circle
            cx="68"
            cy="68"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-border"
          />
          <circle
            cx="68"
            cy="68"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
            style={{ transition: "stroke-dasharray 0.8s ease" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={clsx("text-3xl font-bold tabular-nums", scoreColor(score))}>{score}</span>
          <span className="text-xs text-foreground-muted">/ 100</span>
        </div>
      </div>
      <p className="text-sm font-medium text-foreground">Overall Score</p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ResumeAnalyzerUI() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguageStore();

  function handleFile(file: File) {
    setSelectedFile(file);
    setResult(null);
    setError(null);
    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => setResumeText((e.target?.result as string) ?? "");
      reader.readAsText(file);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  async function handleAnalyze() {
    if (!selectedFile && !resumeText.trim()) return;
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ toolSlug: "resume-analyzer", resumeText, language }),
      });
      const data = await res.json() as { output?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "Analysis failed");
      const raw = (data.output ?? "").trim();
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid response. Please try again.");
      const parsed = JSON.parse(jsonMatch[0]) as AnalysisResult;
      setResult(parsed);
    } catch (err: unknown) {
      setError((err as Error).message ?? "Analysis failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ── Left: Upload ── */}
      <div className="flex flex-col gap-4">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={clsx(
            "border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer",
            isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          )}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.doc"
            className="sr-only"
            onChange={handleInputChange}
          />
          {selectedFile ? (
            <div className="flex flex-col items-center gap-3">
              <FileText className="h-10 w-10 text-primary" />
              <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
              <p className="text-xs text-foreground-muted">
                {(selectedFile.size / 1024).toFixed(1)} KB · Click to change
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload className="h-10 w-10 text-foreground-muted" />
              <div>
                <p className="text-sm font-medium text-foreground">Drop your resume here</p>
                <p className="text-xs text-foreground-muted mt-1">PDF, DOCX, or DOC · Max 10 MB</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              >
                Browse Files
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground-muted">
            Paste Resume Text <span className="text-foreground-muted font-normal">(required for AI analysis)</span>
          </label>
          <textarea
            rows={6}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume text here for accurate AI analysis…"
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground resize-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground-muted">Output language:</span>
          <LanguageSelector />
        </div>
        <Button
          variant="primary"
          fullWidth
          isLoading={isLoading}
          loadingText="Analyzing…"
          disabled={!selectedFile && !resumeText.trim()}
          onClick={handleAnalyze}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 hover:opacity-90"
        >
          Analyze Resume
        </Button>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>

      {/* ── Right: Results ── */}
      <div className="flex flex-col gap-5">
        {!result && !isLoading && (
          <div className="border border-card-border bg-card rounded-2xl p-6 flex flex-col items-center justify-center gap-3 min-h-[300px] text-center">
            <FileText className="h-12 w-12 text-foreground-muted/40" />
            <p className="text-sm text-foreground-muted">Upload a resume and click Analyze Resume to see your results.</p>
          </div>
        )}

        {isLoading && (
          <div className="border border-card-border bg-card rounded-2xl p-6 flex flex-col items-center justify-center gap-4 min-h-[300px]">
            <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
            <p className="text-sm text-foreground-muted">Analyzing your resume…</p>
          </div>
        )}

        {result && (
          <>
            {/* Score */}
            <div className="border border-card-border bg-card rounded-2xl p-6 flex flex-col items-center gap-4">
              <ScoreCircle score={result.overallScore} />
            </div>

            {/* Section Scores */}
            <div className="border border-card-border bg-card rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-foreground">Section Scores</h3>
              <div className="flex flex-col gap-3">
                {result.sections.map((section) => (
                  <div key={section.label} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground-muted">{section.label}</span>
                      <span className={clsx("font-semibold tabular-nums", scoreColor(section.score))}>
                        {section.score}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-background-subtle overflow-hidden">
                      <div
                        className={clsx("h-full rounded-full transition-all duration-700", progressBarColor(section.score))}
                        style={{ width: `${section.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Issues */}
            <div className="border border-card-border bg-card rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-foreground">Issues Found</h3>
              <div className="flex flex-col gap-3">
                {result.issues.map((issue, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-background-subtle">
                    <SeverityIcon severity={issue.severity} />
                    <span className="text-sm text-foreground flex-1">{issue.message}</span>
                    <Badge variant={severityVariant(issue.severity)} size="sm">
                      {issue.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
