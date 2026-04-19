"use client";

import React, { useState } from "react";
import { clsx } from "clsx";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Check, Copy, Plus } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SkillSet {
  technical: string[];
  soft: string[];
  tools: string[];
  certifications: string[];
}

// ─── Sub-component: Skill Chip ────────────────────────────────────────────────

interface ChipProps {
  label: string;
  color: "blue" | "green" | "orange" | "purple";
  added: boolean;
  onToggle: () => void;
}

function SkillChip({ label, color, added, onToggle }: ChipProps) {
  const base = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150 cursor-pointer select-none";
  const colors = {
    blue:   added ? "bg-blue-100 border-blue-300 text-blue-800" : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
    green:  added ? "bg-emerald-100 border-emerald-300 text-emerald-800" : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100",
    orange: added ? "bg-orange-100 border-orange-300 text-orange-800" : "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100",
    purple: added ? "bg-purple-100 border-purple-300 text-purple-800" : "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100",
  };

  return (
    <button type="button" onClick={onToggle} className={clsx(base, colors[color])}>
      {added ? <Check className="h-3 w-3 shrink-0" /> : <Plus className="h-3 w-3 shrink-0" />}
      {label}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SkillsSuggester() {
  const [jobTitle, setJobTitle] = useState("");
  const [industry, setIndustry] = useState("Technology");
  const [experienceLevel, setExperienceLevel] = useState("Mid Level");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SkillSet | null>(null);
  const [addedSkills, setAddedSkills] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!jobTitle.trim()) return;
    setLoading(true);
    setAddedSkills(new Set());
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      const mockSkills: SkillSet = {
        technical: ["Project Management", "Data Analysis", "Microsoft Office Suite", "Process Improvement", "Technical Documentation", "Quality Assurance"],
        soft: ["Leadership", "Problem-solving", "Teamwork", "Time Management", "Adaptability", "Communication", "Critical Thinking"],
        tools: ["Slack", "Trello", "Jira", "Google Workspace", "Zoom", "Notion", "Confluence"],
        certifications: ["PMP (Project Management Professional)", "Relevant industry certification", "Google Analytics", "Agile/Scrum certification"],
      };
      setResults(mockSkills);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setAddedSkills((prev) => {
      const next = new Set(prev);
      next.has(skill) ? next.delete(skill) : next.add(skill);
      return next;
    });
  };

  const copyAll = () => {
    if (!results) return;
    const all = [
      "Technical Skills:", ...results.technical,
      "\nSoft Skills:", ...results.soft,
      "\nTools & Software:", ...results.tools,
      "\nCertifications:", ...results.certifications,
    ].join("\n");
    navigator.clipboard.writeText(all).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const inputClass = "border border-border rounded-lg px-3 py-2 text-sm bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground";
  const labelClass = "text-sm font-medium text-foreground mb-1 block";
  const cardClass = "border border-card-border bg-card rounded-2xl p-6";

  const categories: Array<{ key: keyof SkillSet; label: string; color: ChipProps["color"] }> = [
    { key: "technical",     label: "Technical Skills",  color: "blue"   },
    { key: "soft",          label: "Soft Skills",       color: "green"  },
    { key: "tools",         label: "Tools & Software",  color: "orange" },
    { key: "certifications",label: "Certifications",    color: "purple" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ── Left Panel: Inputs ── */}
      <div className={cardClass}>
        <h2 className="text-lg font-semibold text-foreground mb-1">Skills Suggester</h2>
        <p className="text-sm text-foreground-muted mb-6">
          Enter your job title to get tailored skill recommendations.
        </p>

        <div className="space-y-4">
          {/* Job Title */}
          <div>
            <label className={labelClass}>Job Title</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder="e.g. Frontend Developer"
              className={inputClass}
            />
          </div>

          {/* Industry */}
          <div>
            <label className={labelClass}>Industry</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className={inputClass}
            >
              {["Technology", "Finance", "Healthcare", "Marketing", "Education", "Sales", "Design", "Engineering", "Management", "Other"].map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </div>

          {/* Experience Level */}
          <div>
            <label className={labelClass}>Experience Level</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className={inputClass}
            >
              {["Entry Level", "Mid Level", "Senior Level", "Executive"].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>

          <Button
            variant="gradient"
            fullWidth
            isLoading={loading}
            loadingText="Analyzing..."
            onClick={handleGenerate}
            disabled={!jobTitle.trim()}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 mt-2"
          >
            Get Skills
          </Button>
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
      </div>

      {/* ── Right Panel: Results ── */}
      <div className={clsx(cardClass, "flex flex-col")}>
        {!results && !loading && (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-foreground-muted text-sm">Enter a job title and click &quot;Get Skills&quot; to see recommendations.</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-sm text-foreground-muted">Analyzing skills for <span className="font-medium text-foreground">{jobTitle}</span>…</p>
          </div>
        )}

        {results && !loading && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{jobTitle}</h3>
                <p className="text-xs text-foreground-muted">{experienceLevel} · {industry}</p>
              </div>
              <Badge variant="info">{addedSkills.size} added</Badge>
            </div>

            {categories.map(({ key, label, color }) => (
              <div key={key}>
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted mb-2">{label}</p>
                <div className="flex flex-wrap gap-2">
                  {results[key].map((skill) => (
                    <SkillChip
                      key={skill}
                      label={skill}
                      color={color}
                      added={addedSkills.has(skill)}
                      onToggle={() => toggleSkill(skill)}
                    />
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={copyAll}
                leftIcon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              >
                {copied ? "Copied!" : "Copy All Skills"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
