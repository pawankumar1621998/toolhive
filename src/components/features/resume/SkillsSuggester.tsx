"use client";

import React, { useState, useEffect } from "react";
import { clsx } from "clsx";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Check, Copy, Plus } from "lucide-react";
import { useAIGenerate } from "@/hooks/useAIGenerate";

interface SkillSet { technical: string[]; soft: string[]; tools: string[]; certifications: string[]; }
interface ChipProps { label: string; color: "blue"|"green"|"orange"|"purple"; added: boolean; onToggle: () => void; }

function SkillChip({ label, color, added, onToggle }: ChipProps) {
  const base = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer select-none";
  const colors = {
    blue:   added ? "bg-blue-100 border-blue-300 text-blue-800"     : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
    green:  added ? "bg-emerald-100 border-emerald-300 text-emerald-800" : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100",
    orange: added ? "bg-orange-100 border-orange-300 text-orange-800"   : "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100",
    purple: added ? "bg-purple-100 border-purple-300 text-purple-800"   : "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100",
  };
  return (
    <button type="button" onClick={onToggle} className={clsx(base, colors[color])}>
      {added ? <Check className="h-3 w-3 shrink-0" /> : <Plus className="h-3 w-3 shrink-0" />}
      {label}
    </button>
  );
}

function parseSkills(raw: string): SkillSet {
  const result: SkillSet = { technical: [], soft: [], tools: [], certifications: [] };
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  let current: keyof SkillSet = "technical";
  for (const line of lines) {
    const l = line.toLowerCase();
    if (l.includes("technical") || l.includes("hard skill")) { current = "technical"; continue; }
    if (l.includes("soft") || l.includes("interpersonal"))   { current = "soft"; continue; }
    if (l.includes("tool") || l.includes("software") || l.includes("platform")) { current = "tools"; continue; }
    if (l.includes("certif") || l.includes("qualif"))        { current = "certifications"; continue; }
    const skill = line.replace(/^[-•*\d.)]+\s*/, "").trim();
    if (skill.length > 1 && skill.length < 60) result[current].push(skill);
  }
  if (!result.technical.length && !result.soft.length)
    result.technical = lines.filter((l) => !l.endsWith(":")).slice(0, 8);
  return result;
}

export function SkillsSuggester() {
  const [jobTitle, setJobTitle]           = useState("");
  const [industry, setIndustry]           = useState("Technology");
  const [experienceLevel, setExpLevel]    = useState("Mid Level");
  const [results, setResults]             = useState<SkillSet | null>(null);
  const [addedSkills, setAddedSkills]     = useState<Set<string>>(new Set());
  const [copied, setCopied]               = useState(false);
  const { generate, loading, error, output } = useAIGenerate("skills-suggest");

  useEffect(() => { if (output) setResults(parseSkills(output)); }, [output]);

  const handleGenerate = () => generate({ jobTitle, industry, experienceLevel });
  const toggleSkill = (s: string) => setAddedSkills((p) => { const n = new Set(p); n.has(s) ? n.delete(s) : n.add(s); return n; });
  const copyAll = () => {
    if (!results) return;
    const all = ["Technical:", ...results.technical, "\nSoft:", ...results.soft, "\nTools:", ...results.tools, "\nCertifications:", ...results.certifications].join("\n");
    navigator.clipboard.writeText(all).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const inputClass = "border border-border rounded-lg px-3 py-2 text-sm bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground";
  const cardClass  = "border border-card-border bg-card rounded-2xl p-6";
  const categories: Array<{ key: keyof SkillSet; label: string; color: ChipProps["color"] }> = [
    { key: "technical",      label: "Technical Skills",  color: "blue"   },
    { key: "soft",           label: "Soft Skills",       color: "green"  },
    { key: "tools",          label: "Tools & Software",  color: "orange" },
    { key: "certifications", label: "Certifications",    color: "purple" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className={cardClass}>
        <h2 className="text-lg font-semibold text-foreground mb-1">Skills Suggester</h2>
        <p className="text-sm text-foreground-muted mb-6">Get AI-powered skill recommendations for any job title.</p>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Job Title</label>
            <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleGenerate()} placeholder="e.g. Frontend Developer" className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Industry</label>
            <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputClass}>
              {["Technology","Finance","Healthcare","Marketing","Education","Sales","Design","Engineering","Management","Other"].map((i) => <option key={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Experience Level</label>
            <select value={experienceLevel} onChange={(e) => setExpLevel(e.target.value)} className={inputClass}>
              {["Entry Level","Mid Level","Senior Level","Executive"].map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <Button variant="gradient" fullWidth isLoading={loading} loadingText="Analyzing…" onClick={handleGenerate} disabled={!jobTitle.trim()} className="bg-gradient-to-r from-indigo-500 to-purple-600 mt-2">Get Skills</Button>
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
      </div>

      <div className={clsx(cardClass, "flex flex-col")}>
        {!results && !loading && (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
            <p className="text-foreground-muted text-sm">Enter a job title and click &quot;Get Skills&quot;.</p>
          </div>
        )}
        {loading && (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-sm text-foreground-muted">Analyzing <span className="font-medium text-foreground">{jobTitle}</span>…</p>
          </div>
        )}
        {results && !loading && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div><h3 className="font-semibold text-foreground">{jobTitle}</h3><p className="text-xs text-foreground-muted">{experienceLevel} · {industry}</p></div>
              <Badge variant="info">{addedSkills.size} added</Badge>
            </div>
            {categories.map(({ key, label, color }) => results[key].length > 0 && (
              <div key={key}>
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted mb-2">{label}</p>
                <div className="flex flex-wrap gap-2">
                  {results[key].map((skill) => <SkillChip key={skill} label={skill} color={color} added={addedSkills.has(skill)} onToggle={() => toggleSkill(skill)} />)}
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={copyAll} leftIcon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}>
                {copied ? "Copied!" : "Copy All Skills"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
