"use client";

import React, { useState } from "react";
import { nanoid } from "nanoid";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  User, Briefcase, GraduationCap, Zap, FileText, Plus, Trash2, X,
  ChevronLeft, ChevronRight, Download, CheckCircle2, Sparkles,
  Target, Code2, Lightbulb, TrendingUp, ExternalLink,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TargetRole {
  jobTitle: string;
  company: string;
  jobDescription: string;
}

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

interface Project {
  id: string;
  name: string;
  role: string;
  techStack: string;
  description: string;
  link: string;
}

interface Skills {
  technical: string[];
  soft: string[];
}

interface ResumeData {
  targetRole: TargetRole;
  personalInfo: PersonalInfo;
  workExperience: WorkExperience[];
  education: Education[];
  projects: Project[];
  skills: Skills;
  summary: string;
}

interface CareerInsights {
  careerPaths: string[];
  skillsToLearn: string[];
  industries: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeId(): string { return nanoid(8); }

function emptyJob(): WorkExperience {
  return { id: makeId(), jobTitle: "", company: "", startDate: "", endDate: "", isPresent: false, description: "" };
}

function emptyDegree(): Education {
  return { id: makeId(), degree: "", fieldOfStudy: "", school: "", graduationYear: "" };
}

function emptyProject(): Project {
  return { id: makeId(), name: "", role: "", techStack: "", description: "", link: "" };
}

const STEPS = [
  { label: "Target Role", icon: Target },
  { label: "Personal Info", icon: User },
  { label: "Experience", icon: Briefcase },
  { label: "Education", icon: GraduationCap },
  { label: "Projects", icon: Code2 },
  { label: "Skills", icon: Zap },
  { label: "Summary", icon: FileText },
];

// ─── Form primitives ──────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { label?: string; }
function FormInput({ label, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">{label}</label>}
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

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { label?: string; }
function FormTextarea({ label, className, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">{label}</label>}
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

// ─── Step: Target Role ────────────────────────────────────────────────────────

function StepTargetRole({
  data,
  onChange,
  onBuildFromJD,
  jdLoading,
  jdFilled,
}: {
  data: TargetRole;
  onChange: (updated: TargetRole) => void;
  onBuildFromJD: () => void;
  jdLoading: boolean;
  jdFilled: boolean;
}) {
  function set(field: keyof TargetRole, value: string) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          label="Target Job Title"
          placeholder="e.g. Frontend Developer"
          value={data.jobTitle}
          onChange={(e) => set("jobTitle", e.target.value)}
        />
        <FormInput
          label="Company Applying To"
          placeholder="e.g. Google (optional)"
          value={data.company}
          onChange={(e) => set("company", e.target.value)}
        />
      </div>

      <FormTextarea
        label="Job Description (paste here for AI to build your resume)"
        placeholder="Paste the job description here… AI will suggest relevant skills and write a tailored summary for you."
        rows={7}
        value={data.jobDescription}
        onChange={(e) => set("jobDescription", e.target.value)}
      />

      {data.jobDescription.trim().length > 50 && (
        <button
          type="button"
          onClick={onBuildFromJD}
          disabled={jdLoading}
          className={clsx(
            "flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity",
            jdLoading ? "opacity-60 cursor-wait" : "hover:opacity-90",
            "bg-gradient-to-r from-violet-500 to-indigo-600"
          )}
        >
          {jdLoading ? (
            <>
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              AI is building your resume…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Build Resume from Job Description
            </>
          )}
        </button>
      )}

      {jdFilled && (
        <div className="flex items-start gap-2.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-700 dark:text-emerald-300">
            Skills and summary pre-filled from the job description. Review and customize each section as you go.
          </p>
        </div>
      )}

      <p className="text-xs text-foreground-subtle text-center">
        Job description is optional — you can skip and fill everything manually.
      </p>
    </div>
  );
}

// ─── Step: Personal Info ──────────────────────────────────────────────────────

function StepPersonalInfo({ data, onChange }: { data: PersonalInfo; onChange: (u: PersonalInfo) => void }) {
  function set(field: keyof PersonalInfo, value: string) { onChange({ ...data, [field]: value }); }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormInput label="Full Name" placeholder="Jane Smith" value={data.fullName} onChange={(e) => set("fullName", e.target.value)} />
      <FormInput label="Email" type="email" placeholder="jane@example.com" value={data.email} onChange={(e) => set("email", e.target.value)} />
      <FormInput label="Phone" placeholder="+1 (555) 000-0000" value={data.phone} onChange={(e) => set("phone", e.target.value)} />
      <FormInput label="Location" placeholder="New York, NY" value={data.location} onChange={(e) => set("location", e.target.value)} />
      <FormInput label="LinkedIn URL" placeholder="linkedin.com/in/janesmith" value={data.linkedin} onChange={(e) => set("linkedin", e.target.value)} />
      <FormInput label="Portfolio URL" placeholder="janesmith.dev" value={data.portfolio} onChange={(e) => set("portfolio", e.target.value)} />
    </div>
  );
}

// ─── Step: Work Experience ────────────────────────────────────────────────────

function StepWorkExperience({ jobs, onChange }: { jobs: WorkExperience[]; onChange: (u: WorkExperience[]) => void }) {
  function updateJob(id: string, field: keyof WorkExperience, value: string | boolean) {
    onChange(jobs.map((j) => (j.id === id ? { ...j, [field]: value } : j)));
  }
  return (
    <div className="flex flex-col gap-5">
      {jobs.map((job, idx) => (
        <div key={job.id} className="border border-card-border bg-background-subtle rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Position {idx + 1}</span>
            {jobs.length > 1 && (
              <button onClick={() => onChange(jobs.filter(j => j.id !== job.id))} className="text-foreground-muted hover:text-destructive transition-colors p-1 rounded-md hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput label="Job Title" placeholder="Senior Software Engineer" value={job.jobTitle} onChange={(e) => updateJob(job.id, "jobTitle", e.target.value)} />
            <FormInput label="Company" placeholder="Acme Corp" value={job.company} onChange={(e) => updateJob(job.id, "company", e.target.value)} />
            <FormInput label="Start Date" placeholder="Jan 2022" value={job.startDate} onChange={(e) => updateJob(job.id, "startDate", e.target.value)} />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">End Date</label>
              <div className="flex items-center gap-2">
                <input
                  className={clsx("border border-border rounded-lg px-3 py-2 text-sm bg-background flex-1 focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-foreground-muted/50 transition-colors", job.isPresent && "opacity-40 pointer-events-none")}
                  placeholder="Dec 2023"
                  value={job.isPresent ? "" : job.endDate}
                  disabled={job.isPresent}
                  onChange={(e) => updateJob(job.id, "endDate", e.target.value)}
                />
                <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                  <input type="checkbox" className="accent-primary h-4 w-4" checked={job.isPresent} onChange={(e) => updateJob(job.id, "isPresent", e.target.checked)} />
                  <span className="text-xs text-foreground-muted whitespace-nowrap">Present</span>
                </label>
              </div>
            </div>
          </div>
          <FormTextarea label="Description" placeholder="• Led development of key features…&#10;• Mentored 3 junior engineers" rows={3} value={job.description} onChange={(e) => updateJob(job.id, "description", e.target.value)} />
        </div>
      ))}
      <Button variant="outline" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => onChange([...jobs, emptyJob()])} className="self-start">Add Position</Button>
    </div>
  );
}

// ─── Step: Education ──────────────────────────────────────────────────────────

function StepEducation({ education, onChange }: { education: Education[]; onChange: (u: Education[]) => void }) {
  function updateDegree(id: string, field: keyof Education, value: string) {
    onChange(education.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  }
  return (
    <div className="flex flex-col gap-5">
      {education.map((edu, idx) => (
        <div key={edu.id} className="border border-card-border bg-background-subtle rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Degree {idx + 1}</span>
            {education.length > 1 && (
              <button onClick={() => onChange(education.filter(e => e.id !== edu.id))} className="text-foreground-muted hover:text-destructive transition-colors p-1 rounded-md hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput label="Degree" placeholder="Bachelor of Science" value={edu.degree} onChange={(e) => updateDegree(edu.id, "degree", e.target.value)} />
            <FormInput label="Field of Study" placeholder="Computer Science" value={edu.fieldOfStudy} onChange={(e) => updateDegree(edu.id, "fieldOfStudy", e.target.value)} />
            <FormInput label="School / University" placeholder="State University" value={edu.school} onChange={(e) => updateDegree(edu.id, "school", e.target.value)} />
            <FormInput label="Graduation Year" placeholder="2021" value={edu.graduationYear} onChange={(e) => updateDegree(edu.id, "graduationYear", e.target.value)} />
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => onChange([...education, emptyDegree()])} className="self-start">Add Degree</Button>
    </div>
  );
}

// ─── Step: Projects ───────────────────────────────────────────────────────────

function StepProjects({ projects, onChange }: { projects: Project[]; onChange: (u: Project[]) => void }) {
  function updateProject(id: string, field: keyof Project, value: string) {
    onChange(projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  }
  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs text-foreground-muted">Add projects you have built — personal, academic, or professional.</p>
      {projects.map((proj, idx) => (
        <div key={proj.id} className="border border-card-border bg-background-subtle rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Project {idx + 1}</span>
            {projects.length > 1 && (
              <button onClick={() => onChange(projects.filter(p => p.id !== proj.id))} className="text-foreground-muted hover:text-destructive transition-colors p-1 rounded-md hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput label="Project Name" placeholder="E-commerce Platform" value={proj.name} onChange={(e) => updateProject(proj.id, "name", e.target.value)} />
            <FormInput label="Your Role" placeholder="Lead Developer" value={proj.role} onChange={(e) => updateProject(proj.id, "role", e.target.value)} />
            <FormInput label="Tech Stack" placeholder="React, Node.js, MongoDB" value={proj.techStack} onChange={(e) => updateProject(proj.id, "techStack", e.target.value)} />
            <FormInput label="Project Link (optional)" placeholder="github.com/you/project" value={proj.link} onChange={(e) => updateProject(proj.id, "link", e.target.value)} />
          </div>
          <FormTextarea label="Description" placeholder="Built a full-stack e-commerce platform with cart, checkout, and admin dashboard…" rows={2} value={proj.description} onChange={(e) => updateProject(proj.id, "description", e.target.value)} />
        </div>
      ))}
      <Button variant="outline" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => onChange([...projects, emptyProject()])} className="self-start">Add Project</Button>
    </div>
  );
}

// ─── Step: Skills ─────────────────────────────────────────────────────────────

function StepSkills({ skills, onChange }: { skills: Skills; onChange: (u: Skills) => void }) {
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Technical Skills</h3>
          <p className="text-xs text-foreground-muted mt-0.5">Programming languages, frameworks, tools, platforms</p>
        </div>
        <div className="flex gap-2">
          <input
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background flex-1 focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-foreground-muted/50 transition-colors"
            placeholder="e.g. React, Python, Figma…"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
          />
          <Button variant="secondary" size="md" leftIcon={<Plus className="h-4 w-4" />} onClick={addTech}>Add</Button>
        </div>
        {skills.technical.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.technical.map((skill) => (
              <motion.span key={skill} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                {skill}
                <button onClick={() => onChange({ ...skills, technical: skills.technical.filter(s => s !== skill) })} className="ml-0.5 hover:text-indigo-700 transition-colors"><X className="h-3 w-3" /></button>
              </motion.span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Soft Skills</h3>
          <p className="text-xs text-foreground-muted mt-0.5">Communication, leadership, collaboration, etc.</p>
        </div>
        <div className="flex gap-2">
          <input
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background flex-1 focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-foreground-muted/50 transition-colors"
            placeholder="e.g. Leadership, Communication…"
            value={softInput}
            onChange={(e) => setSoftInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSoft())}
          />
          <Button variant="secondary" size="md" leftIcon={<Plus className="h-4 w-4" />} onClick={addSoft}>Add</Button>
        </div>
        {skills.soft.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.soft.map((skill) => (
              <motion.span key={skill} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-violet-500/10 text-violet-500 border border-violet-500/20">
                {skill}
                <button onClick={() => onChange({ ...skills, soft: skills.soft.filter(s => s !== skill) })} className="ml-0.5 hover:text-violet-700 transition-colors"><X className="h-3 w-3" /></button>
              </motion.span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step: Summary ────────────────────────────────────────────────────────────

function StepSummary({
  data, summary, onSummaryChange, onDownload, downloaded, isGenerating,
  insights, insightsLoading, onGetInsights,
}: {
  data: ResumeData;
  summary: string;
  onSummaryChange: (val: string) => void;
  onDownload: () => void;
  downloaded: boolean;
  isGenerating: boolean;
  insights: CareerInsights | null;
  insightsLoading: boolean;
  onGetInsights: () => void;
}) {
  const { personalInfo: p, workExperience, education, projects, skills } = data;

  return (
    <div className="flex flex-col gap-6">
      <FormTextarea label="Professional Summary" placeholder="Write 2–4 sentences summarising your experience, skills, and what you bring to a new role…" rows={4} value={summary} onChange={(e) => onSummaryChange(e.target.value)} />

      {/* Live preview */}
      <div className="border border-card-border bg-background-subtle rounded-xl p-5 text-sm leading-relaxed flex flex-col gap-4">
        <div className="pb-3 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">{p.fullName || "Your Name"}</h2>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-foreground-muted mt-1">
            {p.email && <span>{p.email}</span>}
            {p.phone && <span>{p.phone}</span>}
            {p.location && <span>{p.location}</span>}
            {p.linkedin && <span>{p.linkedin}</span>}
          </div>
        </div>
        {summary && (
          <div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-1">Summary</h3>
            <p className="text-foreground-muted text-xs">{summary}</p>
          </div>
        )}
        {workExperience.some(j => j.jobTitle || j.company) && (
          <div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-2">Experience</h3>
            {workExperience.filter(j => j.jobTitle || j.company).map(job => (
              <div key={job.id} className="mb-2">
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold text-foreground text-xs">{job.jobTitle}{job.company ? ` — ${job.company}` : ""}</span>
                  <span className="text-foreground-muted text-xs shrink-0 ml-2">{job.startDate}{job.startDate && (job.endDate || job.isPresent) ? " – " : ""}{job.isPresent ? "Present" : job.endDate}</span>
                </div>
                {job.description && <p className="text-foreground-muted text-xs mt-0.5 whitespace-pre-line">{job.description}</p>}
              </div>
            ))}
          </div>
        )}
        {projects.some(p => p.name) && (
          <div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-2">Projects</h3>
            {projects.filter(p => p.name).map(proj => (
              <div key={proj.id} className="mb-1.5">
                <span className="font-semibold text-foreground text-xs">{proj.name}</span>
                {proj.techStack && <span className="text-foreground-muted text-xs"> · {proj.techStack}</span>}
                {proj.description && <p className="text-foreground-muted text-xs mt-0.5">{proj.description}</p>}
              </div>
            ))}
          </div>
        )}
        {education.some(e => e.degree || e.school) && (
          <div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-2">Education</h3>
            {education.filter(e => e.degree || e.school).map(edu => (
              <div key={edu.id} className="flex items-baseline justify-between mb-1">
                <span className="text-xs font-semibold text-foreground">{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}{edu.school ? ` — ${edu.school}` : ""}</span>
                {edu.graduationYear && <span className="text-foreground-muted text-xs shrink-0 ml-2">{edu.graduationYear}</span>}
              </div>
            ))}
          </div>
        )}
        {(skills.technical.length > 0 || skills.soft.length > 0) && (
          <div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-2">Skills</h3>
            {skills.technical.length > 0 && <p className="text-xs text-foreground-muted"><span className="font-medium text-foreground">Technical: </span>{skills.technical.join(" · ")}</p>}
            {skills.soft.length > 0 && <p className="text-xs text-foreground-muted mt-0.5"><span className="font-medium text-foreground">Soft: </span>{skills.soft.join(" · ")}</p>}
          </div>
        )}
      </div>

      {/* Download */}
      <AnimatePresence mode="wait">
        {downloaded ? (
          <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center gap-4 py-6 px-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-500/20 text-center">
            <div className="flex items-center gap-2 text-indigo-500">
              <CheckCircle2 className="h-6 w-6 shrink-0" />
              <span className="font-bold text-base">Your resume is ready!</span>
            </div>
            <p className="text-sm text-foreground-muted max-w-xs">
              PDF saved as <span className="font-medium text-foreground">{p.fullName ? `${p.fullName.replace(/\s+/g, "_")}_Resume.pdf` : "resume.pdf"}</span>
            </p>
            <Button variant="outline" size="sm" onClick={onDownload} isLoading={isGenerating} loadingText="Generating…" leftIcon={<Download className="h-4 w-4" />}>Download Again</Button>
          </motion.div>
        ) : (
          <motion.div key="download" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center gap-3">
            <Button variant="gradient" size="lg" leftIcon={<Download className="h-5 w-5" />} onClick={onDownload} isLoading={isGenerating} loadingText="Generating PDF…" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
              Download PDF
            </Button>
            <p className="text-xs text-foreground-muted">Generates a clean, ATS-optimised PDF</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Career Insights */}
      {downloaded && (
        <div className="flex flex-col gap-4">
          {!insights && !insightsLoading && (
            <button
              type="button"
              onClick={onGetInsights}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/5 font-semibold text-sm transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              Get AI Career Insights
            </button>
          )}

          {insightsLoading && (
            <div className="flex flex-col items-center gap-3 py-6 border border-card-border rounded-2xl bg-card">
              <div className="h-8 w-8 rounded-full border-3 border-indigo-500/30 border-t-indigo-500 animate-spin" />
              <p className="text-sm text-foreground-muted">Analyzing your profile…</p>
            </div>
          )}

          {insights && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="border border-card-border bg-card rounded-2xl p-5 flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <h3 className="font-semibold text-foreground text-sm">AI Career Insights</h3>
              </div>

              {/* Career Paths */}
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <TrendingUp className="h-4 w-4 text-indigo-500" />
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">Career Paths You Can Target</h4>
                </div>
                <div className="flex flex-col gap-2">
                  {insights.careerPaths.map((path, i) => (
                    <div key={i} className="flex items-start gap-2.5 bg-indigo-500/5 border border-indigo-500/20 rounded-lg px-3 py-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white text-[10px] font-bold mt-0.5">{i + 1}</span>
                      <p className="text-xs text-foreground">{path}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills to Learn */}
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">Skills to Learn Next</h4>
                </div>
                <div className="flex flex-col gap-2">
                  {insights.skillsToLearn.map((skill, i) => (
                    <div key={i} className="flex items-start gap-2.5 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold mt-0.5">{i + 1}</span>
                      <p className="text-xs text-foreground">{skill}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Industries */}
              {insights.industries?.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <ExternalLink className="h-4 w-4 text-emerald-500" />
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">Industries to Explore</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {insights.industries.map((ind) => (
                      <span key={ind} className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">{ind}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── PDF Generation ───────────────────────────────────────────────────────────

async function generateResumePDF(data: ResumeData): Promise<Blob> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const pdfDoc = await PDFDocument.create();
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const W = 595, H = 842, MX = 50, CW = W - 2 * MX;
  let page = pdfDoc.addPage([W, H]);
  let y = H - 52;

  function newPage() { page = pdfDoc.addPage([W, H]); y = H - 52; }
  function guard(need: number) { if (y - need < 55) newPage(); }

  function drawWrapped(text: string, x: number, maxW: number, size: number, font: typeof bold, r = 0.15, g = 0.15, b = 0.15) {
    const lh = size * 1.45;
    const words = text.split(" ");
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) > maxW && line) {
        guard(lh);
        page.drawText(line, { x, y, size, font, color: rgb(r, g, b) });
        y -= lh;
        line = word;
      } else {
        line = test;
      }
    }
    if (line) {
      guard(lh);
      page.drawText(line, { x, y, size, font, color: rgb(r, g, b) });
      y -= lh;
    }
  }

  function sectionHead(title: string) {
    y -= 7;
    guard(20);
    page.drawText(title.toUpperCase(), { x: MX, y, size: 8, font: bold, color: rgb(0.3, 0.3, 0.3) });
    y -= 5;
    page.drawLine({ start: { x: MX, y }, end: { x: W - MX, y }, thickness: 0.5, color: rgb(0.65, 0.65, 0.65) });
    y -= 10;
  }

  const { personalInfo: p, workExperience, education, projects, skills, summary } = data;

  // Name
  const name = p.fullName || "Resume";
  const nW = bold.widthOfTextAtSize(name, 20);
  page.drawText(name, { x: (W - nW) / 2, y, size: 20, font: bold, color: rgb(0.05, 0.05, 0.05) });
  y -= 26;

  // Contact
  const contact = [p.email, p.phone, p.location, p.linkedin, p.portfolio].filter(Boolean).join("  |  ");
  if (contact) {
    const cW = regular.widthOfTextAtSize(contact, 9);
    page.drawText(contact, { x: Math.max(MX, (W - cW) / 2), y, size: 9, font: regular, color: rgb(0.4, 0.4, 0.4) });
    y -= 6;
  }
  page.drawLine({ start: { x: MX, y }, end: { x: W - MX, y }, thickness: 1, color: rgb(0.12, 0.12, 0.12) });
  y -= 13;

  // Summary
  if (summary.trim()) {
    sectionHead("Professional Summary");
    drawWrapped(summary.trim(), MX, CW, 10, regular);
    y -= 3;
  }

  // Experience
  const jobs = workExperience.filter(j => j.jobTitle || j.company);
  if (jobs.length) {
    sectionHead("Work Experience");
    for (const job of jobs) {
      guard(26);
      const title = [job.jobTitle, job.company].filter(Boolean).join(" — ");
      const dates = [job.startDate, job.isPresent ? "Present" : job.endDate].filter(Boolean).join(" – ");
      page.drawText(title, { x: MX, y, size: 10, font: bold, color: rgb(0.1, 0.1, 0.1) });
      if (dates) {
        const dW = regular.widthOfTextAtSize(dates, 9);
        page.drawText(dates, { x: W - MX - dW, y, size: 9, font: regular, color: rgb(0.45, 0.45, 0.45) });
      }
      y -= 13;
      if (job.description.trim()) {
        for (const line of job.description.split("\n").filter(Boolean)) {
          const bullet = line.startsWith("•") || line.startsWith("-") ? line : `• ${line}`;
          drawWrapped(bullet, MX + 8, CW - 8, 9.5, regular);
        }
      }
      y -= 5;
    }
  }

  // Projects
  const projs = projects.filter(p => p.name);
  if (projs.length) {
    sectionHead("Projects");
    for (const proj of projs) {
      guard(26);
      const projTitle = proj.role ? `${proj.name} — ${proj.role}` : proj.name;
      page.drawText(projTitle, { x: MX, y, size: 10, font: bold, color: rgb(0.1, 0.1, 0.1) });
      y -= 13;
      if (proj.techStack) {
        drawWrapped(`Tech: ${proj.techStack}`, MX + 8, CW - 8, 9, regular, 0.4, 0.4, 0.4);
      }
      if (proj.description.trim()) {
        drawWrapped(proj.description.trim(), MX + 8, CW - 8, 9.5, regular);
      }
      y -= 4;
    }
  }

  // Education
  const edu = education.filter(e => e.degree || e.school);
  if (edu.length) {
    sectionHead("Education");
    for (const e of edu) {
      guard(18);
      const deg = [e.degree, e.fieldOfStudy && `in ${e.fieldOfStudy}`, e.school && `— ${e.school}`].filter(Boolean).join(" ");
      page.drawText(deg, { x: MX, y, size: 10, font: bold, color: rgb(0.1, 0.1, 0.1) });
      if (e.graduationYear) {
        const yw = regular.widthOfTextAtSize(e.graduationYear, 9);
        page.drawText(e.graduationYear, { x: W - MX - yw, y, size: 9, font: regular, color: rgb(0.45, 0.45, 0.45) });
      }
      y -= 15;
    }
    y -= 3;
  }

  // Skills
  if (skills.technical.length || skills.soft.length) {
    sectionHead("Skills");
    if (skills.technical.length)
      drawWrapped(`Technical:  ${skills.technical.join(" · ")}`, MX, CW, 10, regular);
    if (skills.soft.length)
      drawWrapped(`Soft Skills:  ${skills.soft.join(" · ")}`, MX, CW, 10, regular);
  }

  const bytes = await pdfDoc.save();
  return new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ResumeBuilder() {
  const [step, setStep] = useState(0);
  const [downloaded, setDownloaded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [jdLoading, setJdLoading] = useState(false);
  const [jdFilled, setJdFilled] = useState(false);
  const [insights, setInsights] = useState<CareerInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const [resumeData, setResumeData] = useState<ResumeData>({
    targetRole: { jobTitle: "", company: "", jobDescription: "" },
    personalInfo: { fullName: "", email: "", phone: "", location: "", linkedin: "", portfolio: "" },
    workExperience: [emptyJob()],
    education: [emptyDegree()],
    projects: [emptyProject()],
    skills: { technical: [], soft: [] },
    summary: "",
  });

  // Build from Job Description
  async function handleBuildFromJD() {
    setJdLoading(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          toolSlug: "resume-from-jd",
          jobTitle: resumeData.targetRole.jobTitle,
          company: resumeData.targetRole.company,
          jobDescription: resumeData.targetRole.jobDescription,
        }),
      });
      const data = await res.json() as { output?: string; error?: string };
      if (data.error) throw new Error(data.error);
      const raw = (data.output ?? "").trim();
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid AI response");
      const parsed = JSON.parse(jsonMatch[0]) as {
        skills?: { technical?: string[]; soft?: string[] };
        summary?: string;
      };
      setResumeData((prev) => ({
        ...prev,
        skills: {
          technical: parsed.skills?.technical ?? prev.skills.technical,
          soft: parsed.skills?.soft ?? prev.skills.soft,
        },
        summary: parsed.summary ?? prev.summary,
      }));
      setJdFilled(true);
    } catch {
      // silently fail — user can fill manually
    } finally {
      setJdLoading(false);
    }
  }

  // Get career insights after download
  async function handleGetInsights() {
    setInsightsLoading(true);
    try {
      const expSummary = resumeData.workExperience
        .filter(j => j.jobTitle)
        .map(j => `${j.jobTitle} at ${j.company}`)
        .join(", ");
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          toolSlug: "resume-career-insights",
          jobTitle: resumeData.targetRole.jobTitle || resumeData.workExperience[0]?.jobTitle,
          skills: resumeData.skills,
          experience: expSummary,
        }),
      });
      const data = await res.json() as { output?: string; error?: string };
      if (data.error) throw new Error(data.error);
      const raw = (data.output ?? "").trim();
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid AI response");
      const parsed = JSON.parse(jsonMatch[0]) as CareerInsights;
      setInsights(parsed);
    } catch {
      // silently fail
    } finally {
      setInsightsLoading(false);
    }
  }

  async function handleDownload() {
    setIsGenerating(true);
    try {
      const blob = await generateResumePDF(resumeData);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = resumeData.personalInfo.fullName
        ? `${resumeData.personalInfo.fullName.replace(/\s+/g, "_")}_Resume.pdf`
        : "resume.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setDownloaded(true);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  }

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
          <Badge variant="primary" size="sm"><Sparkles className="h-3 w-3" />AI-Powered</Badge>
        </div>
        <p className="text-sm text-foreground-muted">Build a professional resume — paste a job description to let AI do it for you.</p>
      </div>

      {/* Step progress */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <button key={s.label} onClick={() => setStep(i)} className={clsx("flex flex-col items-center gap-1 transition-opacity", i > step && "opacity-40 pointer-events-none")} aria-label={`Go to ${s.label}`}>
                <div className={clsx("h-8 w-8 rounded-full flex items-center justify-center transition-all", isActive && "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30", isDone && "bg-indigo-500/20 text-indigo-500", !isActive && !isDone && "bg-background-subtle text-foreground-muted")}>
                  {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={clsx("text-xs font-medium hidden sm:block", isActive ? "text-primary" : "text-foreground-muted")}>{s.label}</span>
              </button>
            );
          })}
        </div>
        <div className="h-1.5 bg-background-subtle rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600" animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.4, ease: "easeInOut" }} />
        </div>
        <div className="flex items-center justify-between text-xs text-foreground-muted">
          <span>Step {step + 1} of {STEPS.length}</span>
          <span>{Math.round(progressPercent)}% complete</span>
        </div>
      </div>

      {/* Card */}
      <div className="border border-card-border bg-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          {(() => { const Icon = STEPS[step].icon; return (
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
              <Icon className="h-3.5 w-3.5 text-white" />
            </div>
          ); })()}
          <h2 className="text-base font-semibold text-foreground">{STEPS[step].label}</h2>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22, ease: "easeInOut" }}>
            {step === 0 && (
              <StepTargetRole
                data={resumeData.targetRole}
                onChange={(u) => setResumeData(p => ({ ...p, targetRole: u }))}
                onBuildFromJD={handleBuildFromJD}
                jdLoading={jdLoading}
                jdFilled={jdFilled}
              />
            )}
            {step === 1 && (
              <StepPersonalInfo
                data={resumeData.personalInfo}
                onChange={(u) => setResumeData(p => ({ ...p, personalInfo: u }))}
              />
            )}
            {step === 2 && (
              <StepWorkExperience
                jobs={resumeData.workExperience}
                onChange={(u) => setResumeData(p => ({ ...p, workExperience: u }))}
              />
            )}
            {step === 3 && (
              <StepEducation
                education={resumeData.education}
                onChange={(u) => setResumeData(p => ({ ...p, education: u }))}
              />
            )}
            {step === 4 && (
              <StepProjects
                projects={resumeData.projects}
                onChange={(u) => setResumeData(p => ({ ...p, projects: u }))}
              />
            )}
            {step === 5 && (
              <StepSkills
                skills={resumeData.skills}
                onChange={(u) => setResumeData(p => ({ ...p, skills: u }))}
              />
            )}
            {step === 6 && (
              <StepSummary
                data={resumeData}
                summary={resumeData.summary}
                onSummaryChange={(val) => setResumeData(p => ({ ...p, summary: val }))}
                onDownload={handleDownload}
                downloaded={downloaded}
                isGenerating={isGenerating}
                insights={insights}
                insightsLoading={insightsLoading}
                onGetInsights={handleGetInsights}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" size="md" leftIcon={<ChevronLeft className="h-4 w-4" />} onClick={() => setStep(s => s - 1)} disabled={step === 0}>
          Previous
        </Button>
        {step < STEPS.length - 1 ? (
          <Button variant="primary" size="md" rightIcon={<ChevronRight className="h-4 w-4" />} onClick={() => { setStep(s => s + 1); setDownloaded(false); }} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0">
            Next
          </Button>
        ) : (
          <Button variant="gradient" size="md" leftIcon={<Download className="h-4 w-4" />} onClick={handleDownload} isLoading={isGenerating} loadingText="Generating…" className="bg-gradient-to-r from-indigo-500 to-purple-600">
            Download PDF
          </Button>
        )}
      </div>
    </div>
  );
}
