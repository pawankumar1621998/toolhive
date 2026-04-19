"use client";

import React, { useRef, useState } from "react";
import { clsx } from "clsx";
import { Upload, FileText, ChevronDown, ChevronUp, Check } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────

type InputMode = "upload" | "title";
type QuestionCategory = "behavioral" | "technical" | "situational" | "about";

interface Question {
  id: number;
  text: string;
  modelAnswer: string;
  practiced: boolean;
}

interface QuestionSet {
  behavioral: Question[];
  technical: Question[];
  situational: Question[];
  about: Question[];
}


// ─── Question Card ────────────────────────────────────────────────────────────

function QuestionCard({
  question,
  onTogglePracticed,
}: {
  question: Question;
  onTogglePracticed: (id: number) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={clsx(
      "border rounded-xl p-4 transition-colors",
      question.practiced ? "border-emerald-500/30 bg-emerald-500/5" : "border-card-border bg-card"
    )}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => onTogglePracticed(question.id)}
          className={clsx(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            question.practiced
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-border hover:border-primary"
          )}
          aria-label={question.practiced ? "Mark as not practiced" : "Mark as practiced"}
        >
          {question.practiced && <Check className="h-3 w-3" />}
        </button>

        <div className="flex-1 flex flex-col gap-2">
          <p className={clsx(
            "text-sm font-medium leading-snug",
            question.practiced ? "text-foreground-muted line-through" : "text-foreground"
          )}>
            {question.text}
          </p>

          <button
            onClick={() => setIsExpanded((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors w-fit"
          >
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {isExpanded ? "Hide Model Answer" : "Show Model Answer"}
          </button>

          {isExpanded && (
            <div className="rounded-lg bg-background-subtle border border-border p-3">
              <p className="text-xs font-semibold text-primary mb-1">Model Answer Framework</p>
              <p className="text-sm text-foreground-muted leading-relaxed">{question.modelAnswer}</p>
            </div>
          )}
        </div>
      </div>
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
        "border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors",
        isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
      )}
    >
      <input ref={inputRef} type="file" accept=".pdf,.docx,.doc" className="sr-only"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      {file ? (
        <div className="flex items-center gap-2 justify-center">
          <FileText className="h-5 w-5 text-primary shrink-0" />
          <span className="text-xs font-medium text-foreground truncate max-w-[200px]">{file.name}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 justify-center">
          <Upload className="h-5 w-5 text-foreground-muted" />
          <span className="text-sm text-foreground-muted">Drop resume here or click to browse</span>
        </div>
      )}
    </div>
  );
}

// ─── Tabs config ──────────────────────────────────────────────────────────────

const TABS: { id: QuestionCategory; label: string; count: number }[] = [
  { id: "behavioral", label: "Behavioral", count: 5 },
  { id: "technical", label: "Technical", count: 5 },
  { id: "situational", label: "Situational", count: 5 },
  { id: "about", label: "About You", count: 3 },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function InterviewPrepUI() {
  const [inputMode, setInputMode] = useState<InputMode>("upload");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("mid");
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<QuestionSet | null>(null);
  const [activeTab, setActiveTab] = useState<QuestionCategory>("behavioral");
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    const isValid = inputMode === "upload" ? (resumeFile !== null || jobTitle.trim() !== "") : jobTitle.trim() !== "";
    if (!isValid) return;
    setIsLoading(true);
    setQuestions(null);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      const mockQuestions: QuestionSet = {
        behavioral: [
          { id: 1, text: "Tell me about a time you demonstrated leadership.", modelAnswer: "Use the STAR method: describe a Situation, the Task you faced, the Action you took, and the Result you achieved.", practiced: false },
          { id: 2, text: "Describe a challenging situation and how you handled it.", modelAnswer: "Focus on your problem-solving process and what you learned from the experience.", practiced: false },
          { id: 3, text: "Give an example of when you worked effectively in a team.", modelAnswer: "Highlight your collaboration skills and how you contributed to the team's success.", practiced: false },
          { id: 4, text: "Tell me about a time you failed and what you learned.", modelAnswer: "Be honest about the failure, focus on the lessons learned and how you improved.", practiced: false },
          { id: 5, text: "Describe a situation where you had to meet a tight deadline.", modelAnswer: "Explain your prioritization strategy and how you managed your time effectively.", practiced: false },
        ],
        technical: [
          { id: 6, text: `What key technical skills do you bring to the ${jobTitle || "role"}?`, modelAnswer: "Highlight your most relevant technical skills and provide concrete examples of how you've used them.", practiced: false },
          { id: 7, text: "How do you stay up to date with industry trends and technologies?", modelAnswer: "Mention specific resources like blogs, courses, conferences, and communities you engage with.", practiced: false },
          { id: 8, text: "Walk me through how you approach solving a complex technical problem.", modelAnswer: "Describe your systematic approach: gather requirements, research, prototype, iterate, and validate.", practiced: false },
          { id: 9, text: "How do you ensure quality in your work?", modelAnswer: "Discuss testing strategies, code reviews, documentation, and continuous improvement practices.", practiced: false },
          { id: 10, text: "Describe your experience with relevant tools and technologies.", modelAnswer: "Be specific about tools you've used and the impact they had on your projects.", practiced: false },
        ],
        situational: [
          { id: 11, text: "What would you do if you disagreed with your manager's decision?", modelAnswer: "Explain how you would respectfully voice your concerns, listen to their perspective, and ultimately support the team decision.", practiced: false },
          { id: 12, text: "How would you handle a situation where you had multiple urgent priorities?", modelAnswer: "Describe how you would assess urgency and importance, communicate with stakeholders, and delegate if possible.", practiced: false },
          { id: 13, text: "What would you do if a project you were leading was falling behind schedule?", modelAnswer: "Talk about early escalation, root cause analysis, replanning, and transparent communication.", practiced: false },
          { id: 14, text: "How would you onboard yourself in the first 30 days in this role?", modelAnswer: "Outline a structured approach: learn the team, understand goals, identify quick wins, build relationships.", practiced: false },
          { id: 15, text: "How would you handle a difficult stakeholder or client?", modelAnswer: "Emphasize active listening, empathy, clear communication, and finding common ground.", practiced: false },
        ],
        about: [
          { id: 16, text: "Tell me about yourself.", modelAnswer: "Craft a 2-minute narrative covering your background, key achievements, and why you're excited about this opportunity.", practiced: false },
          { id: 17, text: "Why do you want to work here?", modelAnswer: "Research the company's mission, products, and culture. Connect their goals to your own career aspirations.", practiced: false },
          { id: 18, text: "Where do you see yourself in 5 years?", modelAnswer: "Show ambition while aligning your goals with the company's growth. Focus on skills you want to develop.", practiced: false },
        ],
      };
      setQuestions(mockQuestions);
      setActiveTab("behavioral");
    } catch {
      setError("Failed to generate questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleTogglePracticed(id: number) {
    if (!questions) return;
    const update = (arr: Question[]) => arr.map((q) => q.id === id ? { ...q, practiced: !q.practiced } : q);
    setQuestions({
      behavioral: update(questions.behavioral),
      technical: update(questions.technical),
      situational: update(questions.situational),
      about: update(questions.about),
    });
  }

  const activeQuestions = questions ? questions[activeTab] : [];
  const practicedCount = questions
    ? [...questions.behavioral, ...questions.technical, ...questions.situational, ...questions.about].filter((q) => q.practiced).length
    : 0;
  const totalCount = 18;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Mode Toggle ── */}
      <div className="border border-card-border bg-card rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-1 rounded-lg bg-background-subtle border border-border p-1 w-fit">
          <button
            onClick={() => setInputMode("upload")}
            className={clsx(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
              inputMode === "upload"
                ? "bg-card text-foreground shadow-sm"
                : "text-foreground-muted hover:text-foreground"
            )}
          >
            Upload Resume
          </button>
          <button
            onClick={() => setInputMode("title")}
            className={clsx(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
              inputMode === "title"
                ? "bg-card text-foreground shadow-sm"
                : "text-foreground-muted hover:text-foreground"
            )}
          >
            Enter Job Title
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {inputMode === "upload" && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground-muted">Resume File</label>
                <FileUploadZone file={resumeFile} onFile={setResumeFile} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground-muted">Job Title (optional)</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="border border-border rounded-lg px-3 py-2 text-sm bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                />
              </div>
            </>
          )}

          {inputMode === "title" && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground-muted">Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Data Scientist, Product Manager…"
                  className="border border-border rounded-lg px-3 py-2 text-sm bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground-muted">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="border border-border rounded-lg px-3 py-2 text-sm bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                >
                  <option value="entry">Entry Level (0–2 years)</option>
                  <option value="mid">Mid Level (2–5 years)</option>
                  <option value="senior">Senior Level (5–8 years)</option>
                  <option value="lead">Lead / Staff (8+ years)</option>
                </select>
              </div>
            </>
          )}
        </div>

        <Button
          variant="primary"
          fullWidth
          isLoading={isLoading}
          loadingText="Generating questions…"
          disabled={inputMode === "title" ? !jobTitle.trim() : (!resumeFile && !jobTitle.trim())}
          onClick={handleGenerate}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 hover:opacity-90"
        >
          Generate Questions
        </Button>
      </div>

      {/* ── Error ── */}
      {error && !isLoading && (
        <div className="border border-red-500/30 bg-red-500/5 rounded-2xl p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* ── Loading ── */}
      {isLoading && (
        <div className="border border-card-border bg-card rounded-2xl p-8 flex flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <p className="text-sm text-foreground-muted">Generating personalized interview questions…</p>
        </div>
      )}

      {/* ── Questions ── */}
      {questions && !isLoading && (
        <div className="flex flex-col gap-4">
          {/* Progress */}
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold text-foreground">Interview Questions</h3>
            <span className="text-xs text-foreground-muted">
              {practicedCount}/{totalCount} practiced
            </span>
          </div>

          {/* Tab Navigation */}
          <div className="border border-card-border bg-card rounded-2xl overflow-hidden">
            <div className="flex border-b border-border overflow-x-auto">
              {TABS.map((tab) => {
                const practiced = questions[tab.id].filter((q) => q.practiced).length;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                      activeTab === tab.id
                        ? "text-primary border-b-2 border-primary -mb-px"
                        : "text-foreground-muted hover:text-foreground"
                    )}
                  >
                    {tab.label}
                    <span className={clsx(
                      "text-xs rounded-full px-1.5 py-0.5 font-semibold",
                      practiced === tab.count
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-background-subtle text-foreground-muted"
                    )}>
                      {practiced}/{tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="p-5 flex flex-col gap-3">
              {activeQuestions.map((q) => (
                <QuestionCard key={q.id} question={q} onTogglePracticed={handleTogglePracticed} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
