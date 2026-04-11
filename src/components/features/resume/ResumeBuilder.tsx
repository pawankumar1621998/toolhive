"use client";

import React, { useState } from "react";
import { nanoid } from "nanoid";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  User,
  Briefcase,
  GraduationCap,
  Zap,
  FileText,
  Plus,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
}

interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  isPresent: boolean;
  description: string;
}

interface Education {
  id: string;
  degree: string;
  fieldOfStudy: string;
  school: string;
  graduationYear: string;
}

interface Skills {
  technical: string[];
  soft: string[];
}

interface ResumeData {
  personalInfo: PersonalInfo;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skills;
  summary: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeId(): string {
  return nanoid(8);
}

function emptyJob(): WorkExperience {
  return {
    id: makeId(),
    jobTitle: "",
    company: "",
    startDate: "",
    endDate: "",
    isPresent: false,
    description: "",
  };
}

function emptyDegree(): Education {
  return {
    id: makeId(),
    degree: "",
    fieldOfStudy: "",
    school: "",
    graduationYear: "",
  };
}

const STEPS = [
  { label: "Personal Info", icon: User },
  { label: "Experience", icon: Briefcase },
  { label: "Education", icon: GraduationCap },
  { label: "Skills", icon: Zap },
  { label: "Summary", icon: FileText },
];

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

function FormInput({ label, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        className={clsx(
          "border border-border rounded-lg px-3 py-2 text-sm bg-background w-full",
          "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
          "placeholder:text-foreground-muted/50 transition-colors",
          className
        )}
        {...props}
      />
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

function FormTextarea({ label, className, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">
          {label}
        </label>
      )}
      <textarea
        className={clsx(
          "border border-border rounded-lg px-3 py-2 text-sm bg-background w-full",
          "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
          "placeholder:text-foreground-muted/50 resize-none transition-colors",
          className
        )}
        {...props}
      />
    </div>
  );
}

// ─── Step Components ──────────────────────────────────────────────────────────

function StepPersonalInfo({
  data,
  onChange,
}: {
  data: PersonalInfo;
  onChange: (updated: PersonalInfo) => void;
}) {
  function set(field: keyof PersonalInfo, value: string) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          label="Full Name"
          placeholder="Jane Smith"
          value={data.fullName}
          onChange={(e) => set("fullName", e.target.value)}
        />
        <FormInput
          label="Email"
          type="email"
          placeholder="jane@example.com"
          value={data.email}
          onChange={(e) => set("email", e.target.value)}
        />
        <FormInput
          label="Phone"
          placeholder="+1 (555) 000-0000"
          value={data.phone}
          onChange={(e) => set("phone", e.target.value)}
        />
        <FormInput
          label="Location"
          placeholder="New York, NY"
          value={data.location}
          onChange={(e) => set("location", e.target.value)}
        />
        <FormInput
          label="LinkedIn URL"
          placeholder="linkedin.com/in/janesmith"
          value={data.linkedin}
          onChange={(e) => set("linkedin", e.target.value)}
        />
        <FormInput
          label="Portfolio URL"
          placeholder="janesmith.dev"
          value={data.portfolio}
          onChange={(e) => set("portfolio", e.target.value)}
        />
      </div>
    </div>
  );
}

function StepWorkExperience({
  jobs,
  onChange,
}: {
  jobs: WorkExperience[];
  onChange: (updated: WorkExperience[]) => void;
}) {
  function updateJob(id: string, field: keyof WorkExperience, value: string | boolean) {
    onChange(jobs.map((j) => (j.id === id ? { ...j, [field]: value } : j)));
  }

  function removeJob(id: string) {
    onChange(jobs.filter((j) => j.id !== id));
  }

  function addJob() {
    onChange([...jobs, emptyJob()]);
  }

  return (
    <div className="flex flex-col gap-5">
      {jobs.map((job, idx) => (
        <div
          key={job.id}
          className="border border-card-border bg-background-subtle rounded-xl p-4 flex flex-col gap-3 relative"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">
              Position {idx + 1}
            </span>
            {jobs.length > 1 && (
              <button
                onClick={() => removeJob(job.id)}
                className="text-foreground-muted hover:text-destructive transition-colors p-1 rounded-md hover:bg-destructive/10"
                aria-label="Remove job"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label="Job Title"
              placeholder="Senior Software Engineer"
              value={job.jobTitle}
              onChange={(e) => updateJob(job.id, "jobTitle", e.target.value)}
            />
            <FormInput
              label="Company"
              placeholder="Acme Corp"
              value={job.company}
              onChange={(e) => updateJob(job.id, "company", e.target.value)}
            />
            <FormInput
              label="Start Date"
              placeholder="Jan 2022"
              value={job.startDate}
              onChange={(e) => updateJob(job.id, "startDate", e.target.value)}
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">
                End Date
              </label>
              <div className="flex items-center gap-2">
                <input
                  className={clsx(
                    "border border-border rounded-lg px-3 py-2 text-sm bg-background flex-1",
                    "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
                    "placeholder:text-foreground-muted/50 transition-colors",
                    job.isPresent && "opacity-40 pointer-events-none"
                  )}
                  placeholder="Dec 2023"
                  value={job.isPresent ? "" : job.endDate}
                  disabled={job.isPresent}
                  onChange={(e) => updateJob(job.id, "endDate", e.target.value)}
                />
                <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="accent-primary h-4 w-4"
                    checked={job.isPresent}
                    onChange={(e) => updateJob(job.id, "isPresent", e.target.checked)}
                  />
                  <span className="text-xs text-foreground-muted whitespace-nowrap">Present</span>
                </label>
              </div>
            </div>
          </div>
          <FormTextarea
            label="Description"
            placeholder="• Led development of key product features, increasing user engagement by 30%&#10;• Mentored 3 junior engineers and conducted code reviews"
            rows={3}
            value={job.description}
            onChange={(e) => updateJob(job.id, "description", e.target.value)}
          />
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        leftIcon={<Plus className="h-4 w-4" />}
        onClick={addJob}
        className="self-start"
      >
        Add Position
      </Button>
    </div>
  );
}

function StepEducation({
  education,
  onChange,
}: {
  education: Education[];
  onChange: (updated: Education[]) => void;
}) {
  function updateDegree(id: string, field: keyof Education, value: string) {
    onChange(education.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  }

  function removeDegree(id: string) {
    onChange(education.filter((e) => e.id !== id));
  }

  function addDegree() {
    onChange([...education, emptyDegree()]);
  }

  return (
    <div className="flex flex-col gap-5">
      {education.map((edu, idx) => (
        <div
          key={edu.id}
          className="border border-card-border bg-background-subtle rounded-xl p-4 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">
              Degree {idx + 1}
            </span>
            {education.length > 1 && (
              <button
                onClick={() => removeDegree(edu.id)}
                className="text-foreground-muted hover:text-destructive transition-colors p-1 rounded-md hover:bg-destructive/10"
                aria-label="Remove degree"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label="Degree"
              placeholder="Bachelor of Science"
              value={edu.degree}
              onChange={(e) => updateDegree(edu.id, "degree", e.target.value)}
            />
            <FormInput
              label="Field of Study"
              placeholder="Computer Science"
              value={edu.fieldOfStudy}
              onChange={(e) => updateDegree(edu.id, "fieldOfStudy", e.target.value)}
            />
            <FormInput
              label="School / University"
              placeholder="State University"
              value={edu.school}
              onChange={(e) => updateDegree(edu.id, "school", e.target.value)}
            />
            <FormInput
              label="Graduation Year"
              placeholder="2021"
              value={edu.graduationYear}
              onChange={(e) => updateDegree(edu.id, "graduationYear", e.target.value)}
            />
          </div>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        leftIcon={<Plus className="h-4 w-4" />}
        onClick={addDegree}
        className="self-start"
      >
        Add Degree
      </Button>
    </div>
  );
}

function StepSkills({
  skills,
  onChange,
}: {
  skills: Skills;
  onChange: (updated: Skills) => void;
}) {
  const [techInput, setTechInput] = useState("");
  const [softInput, setSoftInput] = useState("");

  function addTech() {
    const val = techInput.trim();
    if (!val || skills.technical.includes(val)) return;
    onChange({ ...skills, technical: [...skills.technical, val] });
    setTechInput("");
  }

  function addSoft() {
    const val = softInput.trim();
    if (!val || skills.soft.includes(val)) return;
    onChange({ ...skills, soft: [...skills.soft, val] });
    setSoftInput("");
  }

  function removeTech(skill: string) {
    onChange({ ...skills, technical: skills.technical.filter((s) => s !== skill) });
  }

  function removeSoft(skill: string) {
    onChange({ ...skills, soft: skills.soft.filter((s) => s !== skill) });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Technical Skills */}
      <div className="flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Technical Skills</h3>
          <p className="text-xs text-foreground-muted mt-0.5">
            Programming languages, frameworks, tools, platforms
          </p>
        </div>
        <div className="flex gap-2">
          <input
            className={clsx(
              "border border-border rounded-lg px-3 py-2 text-sm bg-background flex-1",
              "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
              "placeholder:text-foreground-muted/50 transition-colors"
            )}
            placeholder="e.g. React, Python, Figma…"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
          />
          <Button variant="secondary" size="md" leftIcon={<Plus className="h-4 w-4" />} onClick={addTech}>
            Add
          </Button>
        </div>
        {skills.technical.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.technical.map((skill) => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-500 border border-indigo-500/20"
              >
                {skill}
                <button
                  onClick={() => removeTech(skill)}
                  className="ml-0.5 hover:text-indigo-700 transition-colors"
                  aria-label={`Remove ${skill}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.span>
            ))}
          </div>
        )}
      </div>

      {/* Soft Skills */}
      <div className="flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Soft Skills</h3>
          <p className="text-xs text-foreground-muted mt-0.5">
            Communication, leadership, collaboration, etc.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            className={clsx(
              "border border-border rounded-lg px-3 py-2 text-sm bg-background flex-1",
              "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
              "placeholder:text-foreground-muted/50 transition-colors"
            )}
            placeholder="e.g. Leadership, Communication…"
            value={softInput}
            onChange={(e) => setSoftInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSoft())}
          />
          <Button variant="secondary" size="md" leftIcon={<Plus className="h-4 w-4" />} onClick={addSoft}>
            Add
          </Button>
        </div>
        {skills.soft.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.soft.map((skill) => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-violet-500/10 text-violet-500 border border-violet-500/20"
              >
                {skill}
                <button
                  onClick={() => removeSoft(skill)}
                  className="ml-0.5 hover:text-violet-700 transition-colors"
                  aria-label={`Remove ${skill}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StepSummary({
  data,
  summary,
  onSummaryChange,
  onDownload,
  downloaded,
}: {
  data: ResumeData;
  summary: string;
  onSummaryChange: (val: string) => void;
  onDownload: () => void;
  downloaded: boolean;
}) {
  const { personalInfo: p, workExperience, education, skills } = data;

  return (
    <div className="flex flex-col gap-6">
      <FormTextarea
        label="Professional Summary"
        placeholder="Write 2–4 sentences summarising your experience, skills, and what you bring to a new role…"
        rows={4}
        value={summary}
        onChange={(e) => onSummaryChange(e.target.value)}
      />

      {/* Live preview */}
      <div className="border border-card-border bg-background-subtle rounded-xl p-5 text-sm leading-relaxed flex flex-col gap-4">
        <div className="pb-3 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">
            {p.fullName || "Your Name"}
          </h2>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-foreground-muted mt-1">
            {p.email && <span>{p.email}</span>}
            {p.phone && <span>{p.phone}</span>}
            {p.location && <span>{p.location}</span>}
            {p.linkedin && <span>{p.linkedin}</span>}
            {p.portfolio && <span>{p.portfolio}</span>}
          </div>
        </div>

        {summary && (
          <div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-1">
              Summary
            </h3>
            <p className="text-foreground-muted text-xs">{summary}</p>
          </div>
        )}

        {workExperience.some((j) => j.jobTitle || j.company) && (
          <div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-2">
              Experience
            </h3>
            <div className="flex flex-col gap-2.5">
              {workExperience
                .filter((j) => j.jobTitle || j.company)
                .map((job) => (
                  <div key={job.id}>
                    <div className="flex items-baseline justify-between">
                      <span className="font-semibold text-foreground text-xs">
                        {job.jobTitle}{job.company ? ` — ${job.company}` : ""}
                      </span>
                      <span className="text-foreground-muted text-xs shrink-0 ml-2">
                        {job.startDate}{job.startDate && (job.endDate || job.isPresent) ? " – " : ""}
                        {job.isPresent ? "Present" : job.endDate}
                      </span>
                    </div>
                    {job.description && (
                      <p className="text-foreground-muted text-xs mt-0.5 whitespace-pre-line">
                        {job.description}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {education.some((e) => e.degree || e.school) && (
          <div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-2">
              Education
            </h3>
            <div className="flex flex-col gap-1.5">
              {education
                .filter((e) => e.degree || e.school)
                .map((edu) => (
                  <div key={edu.id} className="flex items-baseline justify-between">
                    <span className="text-xs font-semibold text-foreground">
                      {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}
                      {edu.school ? ` — ${edu.school}` : ""}
                    </span>
                    {edu.graduationYear && (
                      <span className="text-foreground-muted text-xs shrink-0 ml-2">
                        {edu.graduationYear}
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {(skills.technical.length > 0 || skills.soft.length > 0) && (
          <div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-2">
              Skills
            </h3>
            {skills.technical.length > 0 && (
              <p className="text-xs text-foreground-muted">
                <span className="font-medium text-foreground">Technical: </span>
                {skills.technical.join(" · ")}
              </p>
            )}
            {skills.soft.length > 0 && (
              <p className="text-xs text-foreground-muted mt-0.5">
                <span className="font-medium text-foreground">Soft: </span>
                {skills.soft.join(" · ")}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Download area */}
      <AnimatePresence mode="wait">
        {downloaded ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center gap-4 py-6 px-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-500/20 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-lg">
              <span>🎉</span>
              <span>✨</span>
              <span>🎉</span>
            </div>
            <div className="flex items-center gap-2 text-indigo-500">
              <CheckCircle2 className="h-6 w-6 shrink-0" />
              <span className="font-bold text-base">Your resume is ready!</span>
            </div>
            <p className="text-sm text-foreground-muted max-w-xs">
              Your PDF has been generated. Open your Downloads folder to find{" "}
              <span className="font-medium text-foreground">
                {p.fullName ? `${p.fullName.replace(/\s+/g, "_")}_Resume.pdf` : "resume.pdf"}
              </span>
              .
            </p>
            <div className="flex items-center justify-center gap-2 text-lg">
              <span>⭐</span>
              <span>🌟</span>
              <span>⭐</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onDownload}
              leftIcon={<Download className="h-4 w-4" />}
            >
              Download Again
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="download"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center gap-3"
          >
            <Button
              variant="gradient"
              size="lg"
              leftIcon={<Download className="h-5 w-5" />}
              onClick={onDownload}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              Download PDF
            </Button>
            <p className="text-xs text-foreground-muted">
              Generates a clean, ATS-optimised PDF
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ResumeBuilder() {
  const [step, setStep] = useState(0);
  const [downloaded, setDownloaded] = useState(false);

  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      portfolio: "",
    },
    workExperience: [emptyJob()],
    education: [emptyDegree()],
    skills: {
      technical: [],
      soft: [],
    },
    summary: "",
  });

  function handleDownload() {
    setDownloaded(true);
    // In a real implementation this would trigger PDF generation
    alert(
      `Downloading PDF: ${
        resumeData.personalInfo.fullName
          ? `${resumeData.personalInfo.fullName.replace(/\s+/g, "_")}_Resume.pdf`
          : "resume.pdf"
      }`
    );
  }

  const canGoBack = step > 0;
  const canGoForward = step < STEPS.length - 1;
  const isLastStep = step === STEPS.length - 1;

  const progressPercent = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Resume Builder</h1>
          <Badge variant="primary" size="sm">
            <Sparkles className="h-3 w-3" />
            Free
          </Badge>
        </div>
        <p className="text-sm text-foreground-muted">
          Build a professional resume in 5 simple steps.
        </p>
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <button
                key={s.label}
                onClick={() => setStep(i)}
                className={clsx(
                  "flex flex-col items-center gap-1 group transition-opacity",
                  i > step && "opacity-40 pointer-events-none"
                )}
                aria-label={`Go to ${s.label}`}
              >
                <div
                  className={clsx(
                    "h-8 w-8 rounded-full flex items-center justify-center transition-all",
                    isActive &&
                      "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30",
                    isDone && "bg-indigo-500/20 text-indigo-500",
                    !isActive && !isDone && "bg-background-subtle text-foreground-muted"
                  )}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={clsx(
                    "text-xs font-medium hidden sm:block",
                    isActive ? "text-primary" : "text-foreground-muted"
                  )}
                >
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
        <div className="h-1.5 bg-background-subtle rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-foreground-muted">
          <span>Step {step + 1} of {STEPS.length}</span>
          <span>{Math.round(progressPercent)}% complete</span>
        </div>
      </div>

      {/* Card */}
      <div className="border border-card-border bg-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          {(() => {
            const Icon = STEPS[step].icon;
            return (
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                <Icon className="h-3.5 w-3.5 text-white" />
              </div>
            );
          })()}
          <h2 className="text-base font-semibold text-foreground">{STEPS[step].label}</h2>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            {step === 0 && (
              <StepPersonalInfo
                data={resumeData.personalInfo}
                onChange={(updated) =>
                  setResumeData((prev) => ({ ...prev, personalInfo: updated }))
                }
              />
            )}
            {step === 1 && (
              <StepWorkExperience
                jobs={resumeData.workExperience}
                onChange={(updated) =>
                  setResumeData((prev) => ({ ...prev, workExperience: updated }))
                }
              />
            )}
            {step === 2 && (
              <StepEducation
                education={resumeData.education}
                onChange={(updated) =>
                  setResumeData((prev) => ({ ...prev, education: updated }))
                }
              />
            )}
            {step === 3 && (
              <StepSkills
                skills={resumeData.skills}
                onChange={(updated) =>
                  setResumeData((prev) => ({ ...prev, skills: updated }))
                }
              />
            )}
            {step === 4 && (
              <StepSummary
                data={resumeData}
                summary={resumeData.summary}
                onSummaryChange={(val) =>
                  setResumeData((prev) => ({ ...prev, summary: val }))
                }
                onDownload={handleDownload}
                downloaded={downloaded}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="md"
          leftIcon={<ChevronLeft className="h-4 w-4" />}
          onClick={() => setStep((s) => s - 1)}
          disabled={!canGoBack}
        >
          Previous
        </Button>

        {!isLastStep ? (
          <Button
            variant="primary"
            size="md"
            rightIcon={<ChevronRight className="h-4 w-4" />}
            onClick={() => {
              setStep((s) => s + 1);
              setDownloaded(false);
            }}
            disabled={!canGoForward}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0"
          >
            Next
          </Button>
        ) : (
          <Button
            variant="gradient"
            size="md"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={handleDownload}
            className="bg-gradient-to-r from-indigo-500 to-purple-600"
          >
            Download PDF
          </Button>
        )}
      </div>
    </div>
  );
}
