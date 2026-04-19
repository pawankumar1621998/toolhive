"use client";

import React, { useRef, useState } from "react";
import { clsx } from "clsx";
import { Upload, FileText, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "skills" | "experience" | "keywords" | "recommendations";

interface SkillsGap {
  have: string[];
  missing: string[];
}

interface ExperienceRow {
  requirement: string;
  required: string;
  yours: string;
  match: "strong" | "partial" | "missing";
}

interface KeywordRow {
  keyword: string;
  inJD: number;
  inResume: number;
}

interface JobMatchResult {
  matchPercentage: number;
  skillsGap: SkillsGap;
  experience: ExperienceRow[];
  keywords: KeywordRow[];
  recommendations: string[];
}


// ─── Helpers ──────────────────────────────────────────────────────────────────

function matchColor(score: number): string {
  if (score >= 75) return "text-emerald-500";
  if (score >= 50) return "text-amber-500";
  return "text-red-500";
}

function matchRingColor(score: number): string {
  if (score >= 75) return "#10b981";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

function experienceMatchBadge(match: ExperienceRow["match"]) {
  if (match === "strong") return <Badge variant="success" size="sm">Strong</Badge>;
  if (match === "partial") return <Badge variant="warning" size="sm">Partial</Badge>;
  return <Badge variant="error" size="sm">Missing</Badge>;
}

// ─── Match Circle ─────────────────────────────────────────────────────────────

function MatchCircle({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const color = matchRingColor(score);

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
          <span className={clsx("text-3xl font-bold tabular-nums", matchColor(score))}>{score}%</span>
          <span className="text-xs text-foreground-muted">Match</span>
        </div>
      </div>
      <p className="text-sm font-medium text-foreground">Job Match Score</p>
    </div>
  );
}

// ─── File Upload Zone ─────────────────────────────────────────────────────────

function FileUploadZone({ file, onFile }: { file: File | null; onFile: (f: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
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
          <p className="text-xs font-medium text-foreground truncate max-w-[200px]">{file.name}</p>
          <p className="text-xs text-foreground-muted">Click to change</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-7 w-7 text-foreground-muted" />
          <p className="text-sm font-medium text-foreground">Upload Resume</p>
          <p className="text-xs text-foreground-muted">PDF, DOCX, DOC</p>
        </div>
      )}
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string }[] = [
  { id: "skills", label: "Skills Gap" },
  { id: "experience", label: "Experience" },
  { id: "keywords", label: "Keywords" },
  { id: "recommendations", label: "Recommendations" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function JobMatchUI() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDesc, setJobDesc] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<JobMatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("skills");
  const [addedSkills, setAddedSkills] = useState<Set<string>>(new Set());

  async function handleAnalyze() {
    if (!resumeFile && !jobDesc.trim()) return;
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 1800));
      const mockResult: JobMatchResult = {
        matchPercentage: 74,
        skillsGap: {
          have: ["Communication", "Leadership", "Project Management", "Problem Solving", "Teamwork"],
          missing: ["Agile Methodologies", "Scrum Framework", "Stakeholder Management", "Data-driven Decision Making"],
        },
        experience: [
          { requirement: "Years of Experience", required: "5+ years", yours: "4 years", match: "partial" },
          { requirement: "Team Leadership", required: "Required", yours: "2 years", match: "strong" },
          { requirement: "Budget Management", required: "Preferred", yours: "Not listed", match: "missing" },
          { requirement: "Cross-functional Collaboration", required: "Required", yours: "Demonstrated", match: "strong" },
        ],
        keywords: [
          { keyword: "communication", inJD: 4, inResume: 3 },
          { keyword: "leadership", inJD: 3, inResume: 2 },
          { keyword: "agile", inJD: 2, inResume: 0 },
          { keyword: "project management", inJD: 3, inResume: 1 },
          { keyword: "scrum", inJD: 2, inResume: 0 },
        ],
        recommendations: [
          "Add Agile and Scrum experience to your resume — these appear frequently in the job description.",
          "Quantify your project management achievements with specific metrics and outcomes.",
          "Highlight any experience with stakeholder management or executive communication.",
          "Consider adding a brief skills summary at the top of your resume to improve ATS matching.",
        ],
      };
      setResult(mockResult);
      setActiveTab("skills");
      setAddedSkills(new Set());
    } catch (err: unknown) {
      void err;
      setError("Analysis failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Inputs ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FileUploadZone file={resumeFile} onFile={setResumeFile} />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground-muted">Paste Job Description</label>
          <textarea
            rows={8}
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            placeholder="Paste the full job description here…"
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground resize-none flex-1"
          />
        </div>
      </div>

      <Button
        variant="primary"
        fullWidth
        isLoading={isLoading}
        loadingText="Analyzing match…"
        disabled={!resumeFile && !jobDesc.trim()}
        onClick={handleAnalyze}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 hover:opacity-90"
      >
        Analyze Match
      </Button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {/* ── Results ── */}
      {!result && !isLoading && (
        <div className="border border-card-border bg-card rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-center">
          <FileText className="h-12 w-12 text-foreground-muted/40" />
          <p className="text-sm text-foreground-muted">Upload your resume and paste a job description to see your match analysis.</p>
        </div>
      )}

      {isLoading && (
        <div className="border border-card-border bg-card rounded-2xl p-8 flex flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <p className="text-sm text-foreground-muted">Analyzing your job match…</p>
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-5">
          {/* Score */}
          <div className="border border-card-border bg-card rounded-2xl p-6 flex justify-center">
            <MatchCircle score={result.matchPercentage} />
          </div>

          {/* Tabs */}
          <div className="border border-card-border bg-card rounded-2xl overflow-hidden">
            <div className="flex border-b border-border overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    "px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                    activeTab === tab.id
                      ? "text-primary border-b-2 border-primary -mb-px"
                      : "text-foreground-muted hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {/* Skills Gap */}
              {activeTab === "skills" && (
                <div className="flex flex-col gap-5">
                  <div>
                    <h4 className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-3">Skills You Have</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.skillsGap.have.map((skill) => (
                        <span key={skill} className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-3">Skills You&apos;re Missing</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.skillsGap.missing.map((skill) => (
                        <button
                          key={skill}
                          onClick={() => setAddedSkills((prev) => { const n = new Set(prev); n.has(skill) ? n.delete(skill) : n.add(skill); return n; })}
                          className={clsx(
                            "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors",
                            addedSkills.has(skill)
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 line-through opacity-60"
                              : "bg-red-500/10 text-red-600 border-red-500/30 hover:bg-red-500/20"
                          )}
                        >
                          <PlusCircle className="h-3 w-3 shrink-0" />
                          {skill}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-foreground-muted mt-2">Click a skill to mark as &quot;Added to Resume&quot;</p>
                  </div>
                </div>
              )}

              {/* Experience */}
              {activeTab === "experience" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-xs font-semibold text-foreground-muted py-2 pr-4">Requirement</th>
                        <th className="text-left text-xs font-semibold text-foreground-muted py-2 pr-4">Required</th>
                        <th className="text-left text-xs font-semibold text-foreground-muted py-2 pr-4">Yours</th>
                        <th className="text-left text-xs font-semibold text-foreground-muted py-2">Match</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.experience.map((row) => (
                        <tr key={row.requirement} className="border-b border-border/50 last:border-0">
                          <td className="py-2.5 pr-4 text-foreground font-medium">{row.requirement}</td>
                          <td className="py-2.5 pr-4 text-foreground-muted">{row.required}</td>
                          <td className="py-2.5 pr-4 text-foreground-muted">{row.yours}</td>
                          <td className="py-2.5">{experienceMatchBadge(row.match)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Keywords */}
              {activeTab === "keywords" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-xs font-semibold text-foreground-muted py-2 pr-4">Keyword</th>
                        <th className="text-center text-xs font-semibold text-foreground-muted py-2 pr-4">In Job Description</th>
                        <th className="text-center text-xs font-semibold text-foreground-muted py-2">In Your Resume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.keywords.map((row) => (
                        <tr key={row.keyword} className="border-b border-border/50 last:border-0">
                          <td className="py-2.5 pr-4 text-foreground font-medium">{row.keyword}</td>
                          <td className="py-2.5 pr-4 text-center">
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                              {row.inJD}
                            </span>
                          </td>
                          <td className="py-2.5 text-center">
                            <span className={clsx(
                              "inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-semibold",
                              row.inResume === 0
                                ? "bg-red-500/10 text-red-600"
                                : "bg-emerald-500/10 text-emerald-600"
                            )}>
                              {row.inResume}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Recommendations */}
              {activeTab === "recommendations" && (
                <ol className="flex flex-col gap-3">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-foreground pt-0.5">{rec}</p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
