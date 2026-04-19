"use client";

import React, { useState } from "react";
import { clsx } from "clsx";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Check, Copy, Loader2 } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type TabId = "headline" | "about" | "experience";


// ─── Reusable Copy Card ───────────────────────────────────────────────────────

function CopyCard({ text, label, index }: { text: string; label?: string; index?: number }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="border border-card-border bg-card rounded-xl p-4 flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        {label && (
          <span className="text-xs font-semibold uppercase tracking-wide text-foreground-muted mb-1.5 block">
            {index !== undefined ? `Option ${index + 1}` : label}
          </span>
        )}
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{text}</p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 p-1.5 rounded-lg hover:bg-background-subtle transition-colors text-foreground-muted hover:text-foreground"
        title="Copy"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

// ─── Tab: Headline ────────────────────────────────────────────────────────────

function HeadlineTab({ inputClass, labelClass }: { inputClass: string; labelClass: string }) {
  const [jobTitle, setJobTitle] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [industry, setIndustry] = useState("");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [headlines, setHeadlines] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isValid = jobTitle.trim();

  const handleGenerate = async () => {
    if (!isValid) return;
    setLoading(true);
    setHeadlines(null);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      const headlines: string[] = [
        `${jobTitle || "Results-driven Professional"} | Expert in ${specialization || "Your Field"} | Passionate about Innovation`,
        `${jobTitle || "Dedicated Professional"} | Transforming ${industry || "Industries"} Through ${specialization || "Excellence"}`,
        `${jobTitle || "Strategic Leader"} | ${specialization || "Specialist"} | Driving Impact in ${industry || "Technology"}`,
        `${specialization || "Domain Expert"} & ${jobTitle || "Professional"} | ${value || "Delivering measurable results"}`,
        `${jobTitle || "Forward-thinking Professional"} | ${industry || "Industry"} Expert | ${value || "Building high-performing teams"}`,
      ];
      setHeadlines(headlines);
    } catch {
      setError("Failed to generate headlines. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Current / Target Job Title</label>
          <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Software Engineer" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Top Specialization</label>
          <input type="text" value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="Full-Stack Development" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Industry</label>
          <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="FinTech" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Unique Value (1 sentence)</label>
          <input type="text" value={value} onChange={(e) => setValue(e.target.value)} placeholder="helping startups scale faster" className={inputClass} />
        </div>
      </div>

      <Button
        variant="gradient"
        isLoading={loading}
        loadingText="Generating…"
        onClick={handleGenerate}
        disabled={!isValid}
        className="bg-gradient-to-r from-indigo-500 to-purple-600"
      >
        Generate Headline
      </Button>

      {error && !loading && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {loading && (
        <div className="flex items-center gap-2 py-4 text-sm text-foreground-muted">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-500" /> Crafting headlines…
        </div>
      )}

      {!loading && headlines && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">5 Headline Options</p>
          {headlines.map((h, i) => (
            <CopyCard key={i} text={h} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab: About ───────────────────────────────────────────────────────────────

function AboutTab({ inputClass, labelClass }: { inputClass: string; labelClass: string }) {
  const textareaClass = clsx(inputClass, "resize-none");
  const [jobTitle, setJobTitle] = useState("");
  const [experience, setExperience] = useState("");
  const [achievements, setAchievements] = useState<[string, string, string]>(["", "", ""]);
  const [cta, setCta] = useState("");
  const [loading, setLoading] = useState(false);
  const [about, setAbout] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setAch = (i: 0 | 1 | 2) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = [...achievements] as [string, string, string];
    next[i] = e.target.value;
    setAchievements(next);
  };

  const isValid = jobTitle.trim();

  const handleGenerate = async () => {
    if (!isValid) return;
    setLoading(true);
    setAbout(null);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      const result = `I am a dedicated ${jobTitle || "professional"} with${experience ? ` ${experience} years of` : ""} expertise in my field. I bring a combination of technical skills and creative thinking to solve complex problems.\n\nThroughout my career, I have consistently delivered results and built strong relationships. I am passionate about continuous learning and making a positive impact.\n\n${cta ? `Feel free to reach out if you'd like to ${cta}.` : "Let's connect and explore opportunities to collaborate!"}`;
      setAbout(result);
    } catch {
      setError("Failed to generate About section. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const wordCount = about ? about.split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Job Title</label>
          <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Product Manager" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Years of Experience</label>
          <input type="text" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="7" className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Top 3 Achievements</label>
        <div className="space-y-2">
          {(["Achievement 1", "Achievement 2", "Achievement 3"] as const).map((placeholder, i) => (
            <textarea
              key={i}
              value={achievements[i as 0 | 1 | 2]}
              onChange={setAch(i as 0 | 1 | 2)}
              placeholder={placeholder}
              rows={2}
              className={textareaClass}
            />
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>Call to Action</label>
        <input type="text" value={cta} onChange={(e) => setCta(e.target.value)} placeholder="explore collaboration opportunities" className={inputClass} />
      </div>

      <Button
        variant="gradient"
        isLoading={loading}
        loadingText="Generating…"
        onClick={handleGenerate}
        disabled={!isValid}
        className="bg-gradient-to-r from-indigo-500 to-purple-600"
      >
        Generate About Section
      </Button>

      {error && !loading && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {loading && (
        <div className="flex items-center gap-2 py-4 text-sm text-foreground-muted">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-500" /> Writing your About section…
        </div>
      )}

      {!loading && about && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground">Your About Section</p>
            <Badge variant="default" size="sm">{wordCount} words</Badge>
          </div>
          <CopyCard text={about} />
        </div>
      )}
    </div>
  );
}

// ─── Tab: Experience Bullets ──────────────────────────────────────────────────

function ExperienceTab({ inputClass, labelClass }: { inputClass: string; labelClass: string }) {
  const textareaClass = clsx(inputClass, "resize-none");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [whatDid, setWhatDid] = useState("");
  const [results, setResults] = useState("");
  const [loading, setLoading] = useState(false);
  const [bullets, setBullets] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isValid = jobTitle.trim() && whatDid.trim();

  const handleGenerate = async () => {
    if (!isValid) return;
    setLoading(true);
    setBullets(null);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      const bullets: string[] = [
        `Led cross-functional teams to deliver ${whatDid ? "key projects" : "projects"} on time and within budget${company ? ` at ${company}` : ""}`,
        `Increased efficiency by 30% through process optimization initiatives as ${jobTitle || "a professional"}`,
        `Collaborated with stakeholders to align business goals with technical solutions${results ? `, resulting in ${results}` : ""}`,
        `Mentored junior team members and established best practices that improved overall team performance`,
        `Drove strategic initiatives that contributed to organizational growth and customer satisfaction`,
      ];
      setBullets(bullets);
    } catch {
      setError("Failed to generate bullets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Job Title</label>
          <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Senior Engineer" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Company</label>
          <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Corp" className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>What You Did</label>
        <textarea
          value={whatDid}
          onChange={(e) => setWhatDid(e.target.value)}
          placeholder="Describe your main responsibilities and projects…"
          rows={3}
          className={textareaClass}
        />
      </div>

      <div>
        <label className={labelClass}>Results / Impact</label>
        <textarea
          value={results}
          onChange={(e) => setResults(e.target.value)}
          placeholder="e.g. reduced costs by 25%, improved NPS by 15 points…"
          rows={3}
          className={textareaClass}
        />
      </div>

      <Button
        variant="gradient"
        isLoading={loading}
        loadingText="Generating…"
        onClick={handleGenerate}
        disabled={!isValid}
        className="bg-gradient-to-r from-indigo-500 to-purple-600"
      >
        Generate Bullets
      </Button>

      {error && !loading && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {loading && (
        <div className="flex items-center gap-2 py-4 text-sm text-foreground-muted">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-500" /> Writing action-oriented bullets…
        </div>
      )}

      {!loading && bullets && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">5 Bullet Points</p>
          {bullets.map((b, i) => (
            <CopyCard key={i} text={b} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "headline",   label: "Headline"           },
  { id: "about",      label: "About Section"      },
  { id: "experience", label: "Experience Bullets"  },
];

export function LinkedInWriter() {
  const [activeTab, setActiveTab] = useState<TabId>("headline");

  const inputClass = "border border-border rounded-lg px-3 py-2 text-sm bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground";
  const labelClass = "text-sm font-medium text-foreground mb-1 block";
  const cardClass = "border border-card-border bg-card rounded-2xl p-6";

  return (
    <div className="max-w-2xl mx-auto">
      <div className={cardClass}>
        <h2 className="text-lg font-semibold text-foreground mb-1">LinkedIn Writer</h2>
        <p className="text-sm text-foreground-muted mb-6">
          Craft compelling LinkedIn content that gets you noticed by recruiters and peers.
        </p>

        {/* ── Tabs ── */}
        <div className="flex gap-0 border-b border-border mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px",
                activeTab === tab.id
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "border-transparent text-foreground-muted hover:text-foreground hover:border-border"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        {activeTab === "headline"   && <HeadlineTab   inputClass={inputClass} labelClass={labelClass} />}
        {activeTab === "about"      && <AboutTab      inputClass={inputClass} labelClass={labelClass} />}
        {activeTab === "experience" && <ExperienceTab inputClass={inputClass} labelClass={labelClass} />}
      </div>
    </div>
  );
}
