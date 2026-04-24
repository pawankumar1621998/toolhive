"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { nanoid } from "nanoid";
import {
  Search, Sparkles, ChevronRight, ChevronLeft, Download, Plus, Trash2,
  CheckCircle2, AlertCircle, Lightbulb, Target, Zap, Eye, X,
  TrendingUp, ShieldCheck, FileText, Loader2,
} from "lucide-react";

// ─── Field data ───────────────────────────────────────────────────────────────

const FIELDS = [
  { id: "technology",   name: "Technology",          icon: "💻", color: "#4285F4", bg: "#EEF3FF", category: "Tech",     desc: "Software, IT, AI & Data Science" },
  { id: "healthcare",   name: "Healthcare",           icon: "🏥", color: "#E53E3E", bg: "#FFF5F5", category: "Health",   desc: "Doctors, Nurses, Medical Staff" },
  { id: "finance",      name: "Finance & Banking",    icon: "💳", color: "#1B5299", bg: "#EEF2FF", category: "Finance",  desc: "Banking, Investment, Accounting" },
  { id: "education",    name: "Education",            icon: "🎓", color: "#38A169", bg: "#F0FFF4", category: "Social",   desc: "Teachers, Professors, Trainers" },
  { id: "legal",        name: "Legal",                icon: "⚖️", color: "#744210", bg: "#FFFAF0", category: "Services", desc: "Lawyers, Legal Advisors, Paralegal" },
  { id: "marketing",    name: "Marketing & PR",       icon: "📣", color: "#D53F8C", bg: "#FFF5F7", category: "Business", desc: "Digital Marketing, Brand, SEO" },
  { id: "design",       name: "Design & Creative",    icon: "🎨", color: "#805AD5", bg: "#FAF5FF", category: "Creative", desc: "UI/UX, Graphic, Industrial Design" },
  { id: "engineering",  name: "Engineering",          icon: "⚙️", color: "#C05621", bg: "#FFF8F0", category: "Tech",     desc: "Civil, Mechanical, Electrical Eng." },
  { id: "sales",        name: "Sales & Business Dev", icon: "📈", color: "#2B6CB0", bg: "#EBF8FF", category: "Business", desc: "Sales, BD, Account Management" },
  { id: "hospitality",  name: "Hospitality & Food",   icon: "🍽️", color: "#B7791F", bg: "#FFFFF0", category: "Services", desc: "Hotels, Restaurants, Tourism" },
  { id: "media",        name: "Media & Journalism",   icon: "📰", color: "#C53030", bg: "#FFF5F5", category: "Creative", desc: "Journalism, Content, Broadcasting" },
  { id: "government",   name: "Government & Civil",   icon: "🏛️", color: "#2C5282", bg: "#EBF4FF", category: "Social",   desc: "Civil Services, Public Sector, IAS" },
  { id: "science",      name: "Science & Research",   icon: "🔬", color: "#285E61", bg: "#E6FFFA", category: "Health",   desc: "Research, Pharma, Biotech, Lab" },
  { id: "hr",           name: "Human Resources",      icon: "👥", color: "#553C9A", bg: "#FAF5FF", category: "Business", desc: "HR, Recruitment, L&D, Payroll" },
  { id: "real-estate",  name: "Real Estate",          icon: "🏠", color: "#276749", bg: "#F0FFF4", category: "Finance",  desc: "Property, Construction, Architecture" },
  { id: "logistics",    name: "Logistics & Supply",   icon: "📦", color: "#744210", bg: "#FFF8F0", category: "Business", desc: "Supply Chain, Logistics, Operations" },
  { id: "arts",         name: "Arts & Entertainment", icon: "🎭", color: "#97266D", bg: "#FFF5F7", category: "Creative", desc: "Performing Arts, Film, Music" },
  { id: "agriculture",  name: "Agriculture",          icon: "🌾", color: "#2F855A", bg: "#F0FFF4", category: "Services", desc: "Farming, Agri-business, Veterinary" },
] as const;

const FIELD_CATEGORIES = ["All", "Tech", "Health", "Finance", "Business", "Creative", "Social", "Services"];

const FIELD_TEMPLATE: Record<string, "modern" | "classic" | "minimal" | "sidebar"> = {
  technology: "modern",  healthcare: "classic",  finance: "classic",
  education: "classic",  legal: "classic",       marketing: "modern",
  design: "sidebar",     engineering: "modern",  sales: "modern",
  hospitality: "minimal",media: "modern",        government: "classic",
  science: "classic",    hr: "modern",           "real-estate": "minimal",
  logistics: "modern",   arts: "sidebar",        agriculture: "minimal",
};

interface FieldConfig {
  skillsLabel: string;
  skillsPlaceholder: string;
  softLabel: string;
  projectsLabel: string;
  showProjects: boolean;
}

const FIELD_CONFIG: Record<string, FieldConfig> = {
  technology:   { skillsLabel: "Technical Skills",     skillsPlaceholder: "React, Python, AWS, Docker, Git...",                softLabel: "Soft Skills",          projectsLabel: "Projects",                   showProjects: true  },
  healthcare:   { skillsLabel: "Clinical Skills",      skillsPlaceholder: "Patient Care, Diagnosis, EMR, BLS, Pharmacology...", softLabel: "Professional Skills",  projectsLabel: "Research / Publications",    showProjects: false },
  finance:      { skillsLabel: "Finance Skills",       skillsPlaceholder: "Financial Modeling, Excel, Bloomberg, CFA, SAP...", softLabel: "Soft Skills",          projectsLabel: "Key Transactions / Deals",   showProjects: false },
  education:    { skillsLabel: "Teaching Skills",      skillsPlaceholder: "Lesson Planning, Curriculum, E-learning, LMS...",  softLabel: "Competencies",         projectsLabel: "Research / Publications",    showProjects: false },
  legal:        { skillsLabel: "Practice Areas",       skillsPlaceholder: "Corporate Law, Litigation, Contract Drafting...",  softLabel: "Professional Skills",  projectsLabel: "Notable Cases / Matters",    showProjects: false },
  marketing:    { skillsLabel: "Marketing Skills",     skillsPlaceholder: "SEO, Google Analytics, Meta Ads, Copywriting...",  softLabel: "Soft Skills",          projectsLabel: "Campaigns & Projects",       showProjects: true  },
  design:       { skillsLabel: "Design Tools",         skillsPlaceholder: "Figma, Adobe XD, Photoshop, Illustrator, CSS...",  softLabel: "Creative Skills",      projectsLabel: "Portfolio Projects",         showProjects: true  },
  engineering:  { skillsLabel: "Engineering Skills",   skillsPlaceholder: "AutoCAD, MATLAB, SolidWorks, PLC, ANSYS...",       softLabel: "Soft Skills",          projectsLabel: "Engineering Projects",       showProjects: true  },
  sales:        { skillsLabel: "Sales Skills",         skillsPlaceholder: "CRM, Lead Gen, Negotiation, Salesforce, B2B...",  softLabel: "Interpersonal Skills", projectsLabel: "Key Achievements",           showProjects: false },
  hospitality:  { skillsLabel: "Hospitality Skills",   skillsPlaceholder: "Guest Relations, PMS, Food Safety, HACCP...",      softLabel: "Service Skills",       projectsLabel: "Special Events / Projects",  showProjects: false },
  media:        { skillsLabel: "Media Skills",         skillsPlaceholder: "Writing, Editing, Premiere, Final Cut, SEO...",    softLabel: "Journalism Skills",    projectsLabel: "Published Works / Projects", showProjects: true  },
  government:   { skillsLabel: "Core Competencies",    skillsPlaceholder: "Policy Analysis, Public Admin, Research, RTI...",  softLabel: "Leadership Skills",    projectsLabel: "Key Initiatives",            showProjects: false },
  science:      { skillsLabel: "Research Skills",      skillsPlaceholder: "Lab Techniques, Data Analysis, Python, SPSS...",   softLabel: "Scientific Skills",    projectsLabel: "Research / Publications",    showProjects: true  },
  hr:           { skillsLabel: "HR Skills",            skillsPlaceholder: "HRIS, ATS, Payroll, Talent Acquisition, L&D...",   softLabel: "People Skills",        projectsLabel: "Key HR Initiatives",         showProjects: false },
  "real-estate":{ skillsLabel: "Real Estate Skills",   skillsPlaceholder: "Property Valuation, MLS, CRM, Negotiation...",     softLabel: "Client Skills",        projectsLabel: "Key Transactions",           showProjects: false },
  logistics:    { skillsLabel: "Logistics Skills",     skillsPlaceholder: "SAP, Supply Chain, ERP, Inventory, WMS...",        softLabel: "Operations Skills",    projectsLabel: "Key Projects",               showProjects: false },
  arts:         { skillsLabel: "Creative Skills",      skillsPlaceholder: "Performance, Direction, Editing, Production...",   softLabel: "Professional Skills",  projectsLabel: "Notable Works / Productions", showProjects: true  },
  agriculture:  { skillsLabel: "Agricultural Skills",  skillsPlaceholder: "Crop Management, Irrigation, GIS, Livestock...",   softLabel: "Field Skills",         projectsLabel: "Agricultural Projects",      showProjects: false },
};

const DEFAULT_FIELD_CONFIG: FieldConfig = {
  skillsLabel: "Skills", skillsPlaceholder: "Add your skills...",
  softLabel: "Soft Skills", projectsLabel: "Projects", showProjects: true,
};

function getFieldConf(id: string): FieldConfig {
  return FIELD_CONFIG[id] ?? DEFAULT_FIELD_CONFIG;
}

// ─── Template types ───────────────────────────────────────────────────────────

type TemplateType = "modern" | "classic" | "minimal" | "sidebar";
const TEMPLATES: TemplateType[] = ["modern", "classic", "minimal", "sidebar"];

// ─── Types ────────────────────────────────────────────────────────────────────

interface FieldInsights {
  pageLength: string; format: string; bulletStyle: string;
  keyPrinciples: string[]; mustHaveKeywords: string[]; mustHaveSections: string[];
  avoid: string[]; bulletExample: { bad: string; good: string };
  insiderTip: string; atsScore: string; hiringVolume: string;
}

interface WorkExp { id: string; jobTitle: string; company: string; startDate: string; endDate: string; isPresent: boolean; description: string; }
interface Education { id: string; degree: string; school: string; graduationYear: string; }
interface Project { id: string; name: string; tech: string; description: string; url: string; }
interface Certification { id: string; name: string; issuer: string; year: string; }
interface ResumeForm {
  fullName: string; email: string; phone: string; location: string;
  linkedin: string; jobTitle: string; summary: string;
  workExperience: WorkExp[]; education: Education[];
  technicalSkills: string[]; softSkills: string[];
  projects: Project[]; certifications: Certification[];
  languages: string[]; website: string;
}

function mkJob(): WorkExp { return { id: nanoid(6), jobTitle: "", company: "", startDate: "", endDate: "", isPresent: false, description: "" }; }
function mkEdu(): Education { return { id: nanoid(6), degree: "", school: "", graduationYear: "" }; }
function mkProject(): Project { return { id: nanoid(6), name: "", tech: "", description: "", url: "" }; }
function mkCert(): Certification { return { id: nanoid(6), name: "", issuer: "", year: "" }; }

const BLANK: ResumeForm = {
  fullName: "", email: "", phone: "", location: "", linkedin: "", jobTitle: "", summary: "",
  workExperience: [mkJob()], education: [mkEdu()],
  technicalSkills: [], softSkills: [], projects: [mkProject()],
  certifications: [], languages: [], website: "",
};

// ─── Small UI helpers ─────────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors" />
    </div>
  );
}

function TA({ label, value, onChange, placeholder, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none" />
    </div>
  );
}

// ─── PDF download via html2canvas + jsPDF ─────────────────────────────────────

async function downloadPDFFromPreview(ref: { current: HTMLDivElement | null }, filename: string) {
  if (!ref.current) return;
  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");
  const canvas = await html2canvas(ref.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false });
  const imgData = canvas.toDataURL("image/png");
  const A4_W = 595.28;
  const A4_H = 841.89;
  const imgH = (canvas.height / canvas.width) * A4_W;
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  let yOffset = 0;
  while (yOffset < imgH) {
    if (yOffset > 0) pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, -yOffset, A4_W, imgH);
    yOffset += A4_H;
  }
  pdf.save(filename);
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SmartResumeBuilder() {
  const [phase, setPhase] = useState<"select" | "insights" | "build">("select");
  const [selectedField, setSelectedField] = useState<typeof FIELDS[number] | null>(null);
  const [role, setRole] = useState("");
  const [insights, setInsights] = useState<FieldInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState("");
  const [form, setForm] = useState<ResumeForm>(BLANK);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationNotes, setOptimizationNotes] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [softInput, setSoftInput] = useState("");
  const [langInput, setLangInput] = useState("");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [template, setTemplate] = useState<TemplateType>("modern");
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedField) setTemplate(FIELD_TEMPLATE[selectedField.id] ?? "modern");
  }, [selectedField]);

  const filteredFields = FIELDS.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.desc.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "All" || f.category === filterCategory;
    return matchSearch && matchCategory;
  });

  async function loadInsights() {
    if (!selectedField) return;
    setInsightsLoading(true);
    setInsightsError("");
    try {
      const res = await fetch("/api/resume/company-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: selectedField.name, role, action: "insights" }),
      });
      const d = await res.json() as { insights?: FieldInsights; error?: string };
      if (d.error) throw new Error(d.error);
      setInsights(d.insights!);
      setPhase("insights");
    } catch (e) {
      setInsightsError((e as Error).message);
    } finally {
      setInsightsLoading(false);
    }
  }

  async function optimizeResume() {
    if (!selectedField) return;
    setOptimizing(true);
    try {
      const res = await fetch("/api/resume/company-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: selectedField.name, role, action: "optimize",
          resumeData: { workExperience: form.workExperience, summary: form.summary, technicalSkills: form.technicalSkills, softSkills: form.softSkills },
        }),
      });
      const d = await res.json() as { optimized?: { summary: string; workExperience: Array<{ id: string; description: string }>; skills: { technical: string[]; soft: string[] }; optimizationNotes: string[] }; error?: string };
      if (d.error) throw new Error(d.error);
      const opt = d.optimized!;
      setForm(prev => ({
        ...prev,
        summary: opt.summary || prev.summary,
        technicalSkills: opt.skills?.technical || prev.technicalSkills,
        softSkills: opt.skills?.soft || prev.softSkills,
        workExperience: prev.workExperience.map(job => {
          const updated = opt.workExperience?.find(u => u.id === job.id);
          return updated ? { ...job, description: updated.description } : job;
        }),
      }));
      setOptimizationNotes(opt.optimizationNotes || []);
    } catch { /* silent */ } finally { setOptimizing(false); }
  }

  const upd = (f: keyof ResumeForm, v: unknown) => setForm(prev => ({ ...prev, [f]: v }));
  const updJob = (id: string, f: keyof WorkExp, v: string | boolean) => upd("workExperience", form.workExperience.map(j => j.id === id ? { ...j, [f]: v } : j));
  const updEdu = (id: string, f: keyof Education, v: string) => upd("education", form.education.map(e => e.id === id ? { ...e, [f]: v } : e));
  const updProject = (id: string, f: keyof Project, v: string) => upd("projects", form.projects.map(p => p.id === id ? { ...p, [f]: v } : p));
  const updCert = (id: string, f: keyof Certification, v: string) => upd("certifications", form.certifications.map(c => c.id === id ? { ...c, [f]: v } : c));

  // ── Phase: Select ──────────────────────────────────────────────────────────

  if (phase === "select") {
    return (
      <div className="w-full">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Smart Resume Builder</h1>
              <p className="text-sm text-foreground-muted">AI generates field-specific resume tips — then builds yours the right way</p>
            </div>
          </div>
        </div>

        <div className="mb-5 max-w-md">
          <label className="block text-sm font-medium text-foreground mb-1.5">What role are you applying for?</label>
          <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Software Engineer, Doctor, Marketing Manager…"
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors" />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search field…"
              className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors" />
          </div>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
            {FIELD_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mb-6">
          {filteredFields.map(field => (
            <motion.button key={field.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedField(field)}
              className={`relative flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all ${selectedField?.id === field.id ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10" : "border-border bg-card hover:border-foreground-muted/30 hover:shadow-md"}`}>
              {selectedField?.id === field.id && (
                <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-indigo-500 flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </div>
              )}
              <div className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl shadow-sm" style={{ backgroundColor: field.bg }}>
                {field.icon}
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-foreground leading-tight">{field.name}</p>
                <span className="text-[10px] text-foreground-muted leading-tight">{field.desc}</span>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="flex justify-center">
          <button onClick={loadInsights} disabled={!selectedField || insightsLoading}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none shadow-xl shadow-indigo-500/20">
            {insightsLoading
              ? <><Loader2 className="h-4 w-4 animate-spin" />Analyzing {selectedField?.name} resumes…</>
              : <><Sparkles className="h-4 w-4" />{selectedField ? `Get Field Resume Tips →` : "Select a Field First"}<ChevronRight className="h-4 w-4" /></>}
          </button>
        </div>
        {insightsError && <p className="text-center text-red-400 text-sm mt-3">{insightsError}</p>}
      </div>
    );
  }

  // ── Phase: Insights ────────────────────────────────────────────────────────

  if (phase === "insights" && insights && selectedField) {
    return (
      <div className="w-full">
        <button onClick={() => setPhase("select")} className="flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground mb-5 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back to Fields
        </button>

        <div className="flex items-center gap-4 mb-6 p-5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl">
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg shrink-0" style={{ backgroundColor: selectedField.bg }}>
            {selectedField.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{selectedField.name} Resume Intelligence</h2>
            <p className="text-sm text-foreground-muted">AI analyzed top resume patterns in the {selectedField.name} field</p>
            <div className="flex gap-2 mt-1.5">
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 text-xs font-medium">ATS: {insights.atsScore}</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-xs font-medium">{insights.pageLength}</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-xs font-medium">{insights.hiringVolume}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="border border-card-border bg-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3"><Target className="h-4 w-4 text-indigo-500" /><h3 className="font-semibold text-sm text-foreground">What {selectedField.name} Hiring Looks For</h3></div>
            <ul className="space-y-2">
              {insights.keyPrinciples.map((p, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <span className="text-sm text-foreground">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-card-border bg-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3"><Zap className="h-4 w-4 text-amber-500" /><h3 className="font-semibold text-sm text-foreground">Must-Have Keywords</h3></div>
            <div className="flex flex-wrap gap-1.5">
              {insights.mustHaveKeywords.map(kw => (
                <span key={kw} className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">{kw}</span>
              ))}
            </div>
          </div>

          <div className="border border-card-border bg-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3"><TrendingUp className="h-4 w-4 text-emerald-500" /><h3 className="font-semibold text-sm text-foreground">Bullet Style: {insights.bulletStyle}</h3></div>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                <p className="text-[10px] font-bold text-red-500 uppercase mb-1">❌ Rejected</p>
                <p className="text-xs text-foreground-muted">{insights.bulletExample.bad}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <p className="text-[10px] font-bold text-emerald-500 uppercase mb-1">✅ Selected</p>
                <p className="text-xs text-foreground">{insights.bulletExample.good}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-card-border bg-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3"><AlertCircle className="h-4 w-4 text-red-400" /><h3 className="font-semibold text-sm text-foreground">Avoid These Mistakes</h3></div>
              <ul className="space-y-1.5">
                {insights.avoid.map((a, i) => <li key={i} className="flex items-start gap-2 text-sm text-foreground-muted"><X className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />{a}</li>)}
              </ul>
            </div>
            <div className="border border-amber-500/20 bg-amber-500/5 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2"><Lightbulb className="h-4 w-4 text-amber-500" /><span className="text-xs font-bold text-amber-500 uppercase tracking-wide">Insider Tip</span></div>
              <p className="text-sm text-foreground">{insights.insiderTip}</p>
            </div>
          </div>
        </div>

        <div className="border border-card-border bg-card rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3"><ShieldCheck className="h-4 w-4 text-indigo-500" /><h3 className="font-semibold text-sm text-foreground">Required Sections for {selectedField.name}</h3></div>
          <div className="flex flex-wrap gap-2">
            {insights.mustHaveSections.map(s => (
              <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-xs font-medium">
                <CheckCircle2 className="h-3 w-3" />{s}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <button onClick={() => setPhase("build")}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-indigo-500/20">
            <FileText className="h-4 w-4" /> Build My {selectedField.name}-Optimized Resume <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── Phase: Build ───────────────────────────────────────────────────────────

  if (phase === "build" && selectedField) {
    const accentColor = selectedField.color;
    const fieldConf = getFieldConf(selectedField.id);
    const pdfFilename = `${(form.fullName || "resume").replace(/\s+/g, "_")}_${selectedField.name}_Resume.pdf`;

    return (
      <div className="w-full">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => setPhase("insights")} className="flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <div className="h-8 w-8 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: selectedField.bg }}>{selectedField.icon}</div>
          <h2 className="text-base font-bold text-foreground">{selectedField.name}-Optimized Resume</h2>
          <span className="text-xs text-foreground-muted">· {role || "General"}</span>
        </div>

        <div className="flex flex-col xl:flex-row gap-6">
          {/* ── Form ── */}
          <div className="xl:w-[480px] shrink-0 space-y-4">
            <Section title="Personal Info" color={accentColor}>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Full Name" value={form.fullName} onChange={v => upd("fullName", v)} placeholder="Jane Smith" />
                <Field label="Job Title" value={form.jobTitle} onChange={v => upd("jobTitle", v)} placeholder="Your role / designation" />
                <Field label="Email" type="email" value={form.email} onChange={v => upd("email", v)} placeholder="jane@example.com" />
                <Field label="Phone" value={form.phone} onChange={v => upd("phone", v)} placeholder="+1 555 000 0000" />
                <Field label="Location" value={form.location} onChange={v => upd("location", v)} placeholder="New York, NY" />
                <Field label="LinkedIn" value={form.linkedin} onChange={v => upd("linkedin", v)} placeholder="linkedin.com/in/jane" />
                <Field label="Website / Portfolio" value={form.website} onChange={v => upd("website", v)} placeholder="myportfolio.com" />
              </div>
            </Section>

            <Section title="Professional Summary" color={accentColor}>
              <TA label="Summary" value={form.summary} onChange={v => upd("summary", v)} placeholder="Results-driven professional with 5+ years of experience…" rows={4} />
              {insights && <p className="text-[11px] text-foreground-muted mt-1.5">💡 {insights.insiderTip.slice(0, 100)}…</p>}
            </Section>

            <Section title="Work Experience" color={accentColor}>
              {form.workExperience.map((job, idx) => (
                <div key={job.id} className="mb-4 p-3.5 bg-slate-800/40 rounded-xl border border-slate-700 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Position {idx + 1}</span>
                    {form.workExperience.length > 1 && <button onClick={() => upd("workExperience", form.workExperience.filter(j => j.id !== job.id))} className="text-slate-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Job Title" value={job.jobTitle} onChange={v => updJob(job.id, "jobTitle", v)} placeholder="Sr. Engineer" />
                    <Field label="Company / Organization" value={job.company} onChange={v => updJob(job.id, "company", v)} placeholder="Company Name" />
                    <Field label="Start" value={job.startDate} onChange={v => updJob(job.id, "startDate", v)} placeholder="Jan 2022" />
                    <Field label="End" value={job.isPresent ? "Present" : job.endDate} onChange={v => updJob(job.id, "endDate", v)} placeholder="Dec 2024" />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="accent-indigo-500" checked={job.isPresent} onChange={e => updJob(job.id, "isPresent", e.target.checked)} /><span className="text-xs text-slate-400">Currently working here</span></label>
                  <TA label="Description (use • for bullets)" value={job.description} onChange={v => updJob(job.id, "description", v)} placeholder={"• Achieved...\n• Improved..."} rows={4} />
                </div>
              ))}
              <button onClick={() => upd("workExperience", [...form.workExperience, mkJob()])} className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                <Plus className="h-3.5 w-3.5" /> Add Position
              </button>
            </Section>

            <Section title="Education" color={accentColor}>
              {form.education.map((edu, idx) => (
                <div key={edu.id} className="mb-3 p-3.5 bg-slate-800/40 rounded-xl border border-slate-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Degree {idx + 1}</span>
                    {form.education.length > 1 && <button onClick={() => upd("education", form.education.filter(e => e.id !== edu.id))} className="text-slate-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Degree" value={edu.degree} onChange={v => updEdu(edu.id, "degree", v)} placeholder="B.S. Computer Science" />
                    <Field label="School / Institution" value={edu.school} onChange={v => updEdu(edu.id, "school", v)} placeholder="University Name" />
                    <Field label="Year" value={edu.graduationYear} onChange={v => updEdu(edu.id, "graduationYear", v)} placeholder="2022" />
                  </div>
                </div>
              ))}
              <button onClick={() => upd("education", [...form.education, mkEdu()])} className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                <Plus className="h-3.5 w-3.5" /> Add Degree
              </button>
            </Section>

            <Section title="Skills" color={accentColor}>
              {insights && (
                <div className="mb-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                  <p className="text-[11px] text-amber-500 font-semibold mb-1.5">⚡ Recommended for {selectedField.name}:</p>
                  <div className="flex flex-wrap gap-1">
                    {insights.mustHaveKeywords.filter(k => !form.technicalSkills.includes(k)).slice(0, 6).map(kw => (
                      <button key={kw} onClick={() => upd("technicalSkills", [...form.technicalSkills, kw])} className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[11px] hover:bg-amber-500/20 transition-colors">+ {kw}</button>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-[11px] text-slate-400 mb-1">{fieldConf.skillsLabel}</p>
              <div className="flex gap-2 mb-2">
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && skillInput.trim()) { upd("technicalSkills", [...form.technicalSkills, skillInput.trim()]); setSkillInput(""); } }}
                  placeholder={fieldConf.skillsPlaceholder}
                  className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors" />
              </div>
              {form.technicalSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {form.technicalSkills.map(s => (
                    <span key={s} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {s}<button onClick={() => upd("technicalSkills", form.technicalSkills.filter(x => x !== s))}><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[11px] text-slate-400 mb-1">{fieldConf.softLabel}</p>
              <div className="flex gap-2">
                <input value={softInput} onChange={e => setSoftInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && softInput.trim()) { upd("softSkills", [...form.softSkills, softInput.trim()]); setSoftInput(""); } }}
                  placeholder="Add soft skill (Enter)" className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors" />
              </div>
              {form.softSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.softSkills.map(s => (
                    <span key={s} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20">
                      {s}<button onClick={() => upd("softSkills", form.softSkills.filter(x => x !== s))}><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3">
                <p className="text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Languages</p>
                <input value={langInput} onChange={e => setLangInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && langInput.trim()) { upd("languages", [...form.languages, langInput.trim()]); setLangInput(""); } }}
                  placeholder="Add language (Enter)" className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors" />
                {form.languages.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.languages.map(l => (
                      <span key={l} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-teal-500/10 text-teal-400 border border-teal-500/20">
                        {l}<button onClick={() => upd("languages", form.languages.filter(x => x !== l))}><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Section>

            {fieldConf.showProjects && (
              <Section title={fieldConf.projectsLabel} color={accentColor}>
                {form.projects.map((proj, idx) => (
                  <div key={proj.id} className="mb-4 p-3.5 bg-slate-800/40 rounded-xl border border-slate-700 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Entry {idx + 1}</span>
                      <button onClick={() => upd("projects", form.projects.filter(p => p.id !== proj.id))} className="text-slate-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Title" value={proj.name} onChange={v => updProject(proj.id, "name", v)} placeholder="Project / Work Name" />
                      <Field label="Tech / Tools" value={proj.tech} onChange={v => updProject(proj.id, "tech", v)} placeholder="Tools used" />
                    </div>
                    <Field label="URL / Link" value={proj.url} onChange={v => updProject(proj.id, "url", v)} placeholder="github.com/user/project" />
                    <TA label="Description" value={proj.description} onChange={v => updProject(proj.id, "description", v)} placeholder="Built / achieved…" rows={2} />
                  </div>
                ))}
                <button onClick={() => upd("projects", [...form.projects, mkProject()])} className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                  <Plus className="h-3.5 w-3.5" /> Add Entry
                </button>
              </Section>
            )}

            <Section title="Certifications & Awards" color={accentColor}>
              {form.certifications.map((cert, idx) => (
                <div key={cert.id} className="mb-3 p-3 bg-slate-800/40 rounded-xl border border-slate-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Cert {idx + 1}</span>
                    <button onClick={() => upd("certifications", form.certifications.filter(c => c.id !== cert.id))} className="text-slate-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Certificate Name" value={cert.name} onChange={v => updCert(cert.id, "name", v)} placeholder="AWS Solutions Architect" />
                    <Field label="Issuer" value={cert.issuer} onChange={v => updCert(cert.id, "issuer", v)} placeholder="Issuing Organization" />
                  </div>
                  <Field label="Year" value={cert.year} onChange={v => updCert(cert.id, "year", v)} placeholder="2024" />
                </div>
              ))}
              <button onClick={() => upd("certifications", [...form.certifications, mkCert()])} className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors mt-2">
                <Plus className="h-3.5 w-3.5" /> Add Certification
              </button>
            </Section>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button onClick={optimizeResume} disabled={optimizing}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20">
                {optimizing ? <><Loader2 className="h-4 w-4 animate-spin" />AI is optimizing for {selectedField.name}…</> : <><Sparkles className="h-4 w-4" />AI Optimize for {selectedField.name}</>}
              </button>
              {optimizationNotes.length > 0 && (
                <AnimatePresence>
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                    <p className="text-xs font-bold text-emerald-500 mb-2">✅ Optimization Applied</p>
                    <ul className="space-y-1">{optimizationNotes.map((n, i) => <li key={i} className="text-xs text-foreground-muted flex items-start gap-1.5"><span className="text-emerald-400 shrink-0">•</span>{n}</li>)}</ul>
                  </motion.div>
                </AnimatePresence>
              )}
              <button
                onClick={async () => { setDownloading(true); try { await downloadPDFFromPreview(previewRef, pdfFilename); } finally { setDownloading(false); } }}
                disabled={downloading}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                {downloading ? <><Loader2 className="h-4 w-4 animate-spin" />Generating PDF…</> : <><Download className="h-4 w-4" />Download {selectedField.name}-Optimized PDF</>}
              </button>
            </div>
          </div>

          {/* ── Live Preview ── */}
          <div className="flex-1 min-w-0">
            <div className="border border-card-border rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 sticky top-4">
              {/* Preview header with template selector */}
              <div className="px-3 py-2 bg-card border-b border-card-border flex items-center gap-2 flex-wrap">
                <Eye className="h-3.5 w-3.5 text-foreground-muted shrink-0" />
                <span className="text-xs text-foreground-muted">Live Preview</span>
                <div className="flex items-center gap-1 ml-auto mr-1">
                  {TEMPLATES.map(t => (
                    <button key={t} onClick={() => setTemplate(t)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${template === t ? "text-white shadow-sm" : "bg-slate-700/50 text-slate-400 hover:bg-slate-700"}`}
                      style={template === t ? { backgroundColor: accentColor } : undefined}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              </div>
              <div className="overflow-auto p-4" style={{ maxHeight: "780px" }}>
                <div ref={previewRef} className="bg-white shadow-lg mx-auto" style={{ width: "595px", minHeight: "842px", maxWidth: "100%" }}>
                  <LivePreview form={form} template={template} company={selectedField.name} color={accentColor} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="border border-slate-700/50 bg-slate-900/50 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-1.5 w-5 rounded-full" style={{ backgroundColor: color }} />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── Preview dispatcher ───────────────────────────────────────────────────────

function LivePreview({ form, template, color, company }: { form: ResumeForm; template: TemplateType; color: string; company: string }) {
  if (template === "classic") return <ClassicPreview form={form} color={color} company={company} />;
  if (template === "minimal") return <MinimalPreview form={form} color={color} company={company} />;
  if (template === "sidebar") return <SidebarPreview form={form} color={color} company={company} />;
  return <ModernPreview form={form} color={color} company={company} />;
}

// ─── Modern Template ──────────────────────────────────────────────────────────

function ModernPreview({ form, color, company }: { form: ResumeForm; color: string; company: string }) {
  const contacts = [form.email, form.phone, form.location, form.linkedin, form.website].filter(Boolean).join("  ·  ");
  const jobs = form.workExperience.filter(j => j.jobTitle || j.company);
  const edus = form.education.filter(e => e.degree || e.school);
  const projs = form.projects.filter(p => p.name);
  const certs = form.certifications.filter(c => c.name);

  function SH({ title }: { title: string }) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "14px 0 7px" }}>
        <div style={{ width: "3px", height: "13px", backgroundColor: color, borderRadius: "2px", flexShrink: 0 }} />
        <span style={{ fontSize: "7.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#555" }}>{title}</span>
        <div style={{ flex: 1, height: "0.5px", backgroundColor: "#e0e0e0" }} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "10px", lineHeight: 1.55, color: "#111" }}>
      {/* Colored header bar */}
      <div style={{ backgroundColor: color, padding: "22px 28px 18px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0, color: "#fff", letterSpacing: "-0.02em" }}>{form.fullName || "Your Name"}</h1>
        {form.jobTitle && <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.9)", margin: "4px 0 0", fontWeight: 500 }}>{form.jobTitle}</p>}
        {contacts && <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.75)", margin: "7px 0 0" }}>{contacts}</p>}
      </div>

      <div style={{ padding: "8px 28px 24px" }}>
        {form.summary && (
          <>
            <SH title="Professional Summary" />
            <p style={{ color: "#444", fontSize: "10px" }}>{form.summary}</p>
          </>
        )}

        {jobs.length > 0 && (
          <>
            <SH title="Work Experience" />
            {jobs.map(job => (
              <div key={job.id} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div><b style={{ color: "#111" }}>{job.jobTitle}</b>{job.company && <span style={{ color: "#555" }}> — {job.company}</span>}</div>
                  <span style={{ fontSize: "8.5px", color: "#888", whiteSpace: "nowrap", marginLeft: "8px" }}>{job.startDate}{job.startDate && " – "}{job.isPresent ? "Present" : job.endDate}</span>
                </div>
                {job.description && (
                  <ul style={{ margin: "3px 0 0 12px", padding: 0, color: "#444" }}>
                    {job.description.split("\n").filter(Boolean).map((l, i) => <li key={i} style={{ listStyle: "disc", marginBottom: "1px", fontSize: "9.5px" }}>{l.replace(/^[•\-]\s*/, "")}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </>
        )}

        {edus.length > 0 && (
          <>
            <SH title="Education" />
            {edus.map(e => (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <div><b>{e.degree}</b>{e.school && <span style={{ color: "#555" }}> — {e.school}</span>}</div>
                {e.graduationYear && <span style={{ fontSize: "9px", color: "#888" }}>{e.graduationYear}</span>}
              </div>
            ))}
          </>
        )}

        {(form.technicalSkills.length > 0 || form.softSkills.length > 0) && (
          <>
            <SH title="Skills" />
            {form.technicalSkills.length > 0 && <p style={{ marginBottom: "3px" }}><b>Technical: </b><span style={{ color: "#444" }}>{form.technicalSkills.join("  ·  ")}</span></p>}
            {form.softSkills.length > 0 && <p><b>Soft Skills: </b><span style={{ color: "#444" }}>{form.softSkills.join("  ·  ")}</span></p>}
          </>
        )}

        {projs.length > 0 && (
          <>
            <SH title="Projects" />
            {projs.map(proj => (
              <div key={proj.id} style={{ marginBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <b style={{ color: "#111" }}>{proj.name}</b>
                  {proj.tech && <span style={{ fontSize: "8.5px", color: "#888" }}>{proj.tech}</span>}
                </div>
                {proj.url && <p style={{ fontSize: "8.5px", color: "#4a90d9", margin: "1px 0" }}>{proj.url}</p>}
                {proj.description && (
                  <ul style={{ margin: "2px 0 0 12px", padding: 0, color: "#444" }}>
                    {proj.description.split("\n").filter(Boolean).map((l, i) => <li key={i} style={{ listStyle: "disc", marginBottom: "1px", fontSize: "9.5px" }}>{l.replace(/^[•\-]\s*/, "")}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </>
        )}

        {certs.length > 0 && (
          <>
            <SH title="Certifications & Awards" />
            {certs.map(cert => (
              <div key={cert.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <div><b>{cert.name}</b>{cert.issuer && <span style={{ color: "#555" }}> — {cert.issuer}</span>}</div>
                {cert.year && <span style={{ fontSize: "9px", color: "#888" }}>{cert.year}</span>}
              </div>
            ))}
          </>
        )}

        {form.languages.length > 0 && (
          <>
            <SH title="Languages" />
            <p style={{ color: "#444" }}>{form.languages.join("  ·  ")}</p>
          </>
        )}

        <p style={{ fontSize: "7px", color: "#ccc", marginTop: "20px", textAlign: "center" }}>Optimized for {company} · ToolHive</p>
      </div>
    </div>
  );
}

// ─── Classic Template ─────────────────────────────────────────────────────────

function ClassicPreview({ form, color, company }: { form: ResumeForm; color: string; company: string }) {
  const contacts = [form.email, form.phone, form.location, form.linkedin, form.website].filter(Boolean).join("  |  ");
  const jobs = form.workExperience.filter(j => j.jobTitle || j.company);
  const edus = form.education.filter(e => e.degree || e.school);
  const projs = form.projects.filter(p => p.name);
  const certs = form.certifications.filter(c => c.name);

  function SH({ title }: { title: string }) {
    return (
      <div style={{ margin: "16px 0 8px" }}>
        <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#1a1a1a", margin: 0, fontFamily: "Georgia, 'Times New Roman', serif" }}>{title}</p>
        <div style={{ height: "2px", width: "36px", backgroundColor: color, marginTop: "3px" }} />
        <div style={{ height: "0.5px", backgroundColor: "#d0d0d0", marginTop: "4px" }} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "10.5px", lineHeight: 1.6, color: "#1a1a1a", padding: "36px 40px" }}>
      {/* Centered header */}
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px", letterSpacing: "0.04em" }}>{form.fullName || "Your Name"}</h1>
        {form.jobTitle && <p style={{ fontSize: "12px", color: "#555", margin: "0 0 6px", fontStyle: "italic" }}>{form.jobTitle}</p>}
        {contacts && <p style={{ fontSize: "9px", color: "#777", margin: 0 }}>{contacts}</p>}
        <div style={{ height: "1.5px", backgroundColor: color, marginTop: "12px" }} />
      </div>

      {form.summary && (
        <>
          <SH title="Professional Summary" />
          <p style={{ color: "#333", textAlign: "justify" }}>{form.summary}</p>
        </>
      )}

      {jobs.length > 0 && (
        <>
          <SH title="Work Experience" />
          {jobs.map(job => (
            <div key={job.id} style={{ marginBottom: "11px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div>
                  <b style={{ fontSize: "10.5px" }}>{job.jobTitle}</b>
                  {job.company && <span style={{ color: "#555", fontStyle: "italic" }}> · {job.company}</span>}
                </div>
                <span style={{ fontSize: "9px", color: "#777", whiteSpace: "nowrap", marginLeft: "8px" }}>{job.startDate}{job.startDate && " – "}{job.isPresent ? "Present" : job.endDate}</span>
              </div>
              {job.description && (
                <ul style={{ margin: "3px 0 0 14px", padding: 0, color: "#444" }}>
                  {job.description.split("\n").filter(Boolean).map((l, i) => <li key={i} style={{ listStyle: "disc", marginBottom: "2px", fontSize: "10px" }}>{l.replace(/^[•\-]\s*/, "")}</li>)}
                </ul>
              )}
            </div>
          ))}
        </>
      )}

      {edus.length > 0 && (
        <>
          <SH title="Education" />
          {edus.map(e => (
            <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <div><b>{e.degree}</b>{e.school && <span style={{ color: "#555", fontStyle: "italic" }}> · {e.school}</span>}</div>
              {e.graduationYear && <span style={{ fontSize: "9px", color: "#777" }}>{e.graduationYear}</span>}
            </div>
          ))}
        </>
      )}

      {(form.technicalSkills.length > 0 || form.softSkills.length > 0) && (
        <>
          <SH title="Skills" />
          {form.technicalSkills.length > 0 && <p style={{ marginBottom: "3px" }}><b>Technical:</b> <span style={{ color: "#555" }}>{form.technicalSkills.join(", ")}</span></p>}
          {form.softSkills.length > 0 && <p><b>Soft Skills:</b> <span style={{ color: "#555" }}>{form.softSkills.join(", ")}</span></p>}
        </>
      )}

      {projs.length > 0 && (
        <>
          <SH title="Projects" />
          {projs.map(proj => (
            <div key={proj.id} style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <b>{proj.name}</b>
                {proj.tech && <span style={{ fontSize: "9px", color: "#777", fontStyle: "italic" }}>{proj.tech}</span>}
              </div>
              {proj.url && <p style={{ fontSize: "8.5px", color: "#4a7db5", margin: "1px 0" }}>{proj.url}</p>}
              {proj.description && (
                <ul style={{ margin: "2px 0 0 14px", padding: 0, color: "#444" }}>
                  {proj.description.split("\n").filter(Boolean).map((l, i) => <li key={i} style={{ listStyle: "disc", marginBottom: "1px", fontSize: "10px" }}>{l.replace(/^[•\-]\s*/, "")}</li>)}
                </ul>
              )}
            </div>
          ))}
        </>
      )}

      {certs.length > 0 && (
        <>
          <SH title="Certifications & Awards" />
          {certs.map(cert => (
            <div key={cert.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <div><b>{cert.name}</b>{cert.issuer && <span style={{ color: "#555", fontStyle: "italic" }}> · {cert.issuer}</span>}</div>
              {cert.year && <span style={{ fontSize: "9px", color: "#777" }}>{cert.year}</span>}
            </div>
          ))}
        </>
      )}

      {form.languages.length > 0 && (
        <>
          <SH title="Languages" />
          <p style={{ color: "#555" }}>{form.languages.join("  ·  ")}</p>
        </>
      )}

      <p style={{ fontSize: "7px", color: "#bbb", marginTop: "24px", textAlign: "center" }}>Optimized for {company} · ToolHive</p>
    </div>
  );
}

// ─── Minimal Template ─────────────────────────────────────────────────────────

function MinimalPreview({ form, color, company }: { form: ResumeForm; color: string; company: string }) {
  const contacts = [form.email, form.phone, form.location, form.linkedin, form.website].filter(Boolean).join("  ·  ");
  const jobs = form.workExperience.filter(j => j.jobTitle || j.company);
  const edus = form.education.filter(e => e.degree || e.school);
  const projs = form.projects.filter(p => p.name);
  const certs = form.certifications.filter(c => c.name);

  function SH({ title }: { title: string }) {
    return (
      <div style={{ margin: "16px 0 6px" }}>
        <p style={{ fontSize: "7px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.2em", color: "#aaa", margin: "0 0 4px" }}>{title}</p>
        <div style={{ height: "0.5px", backgroundColor: "#ebebeb" }} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "10px", lineHeight: 1.6, color: "#1a1a1a", padding: "36px 40px" }}>
      {/* Clean header */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 300, margin: "0 0 4px", color: "#111", letterSpacing: "-0.01em" }}>{form.fullName || "Your Name"}</h1>
        {form.jobTitle && <p style={{ fontSize: "13px", color: "#777", margin: "0 0 8px", fontWeight: 400 }}>{form.jobTitle}</p>}
        {contacts && <p style={{ fontSize: "9px", color: "#999", margin: 0 }}>{contacts}</p>}
      </div>

      {form.summary && (
        <>
          <SH title="Summary" />
          <p style={{ color: "#555", lineHeight: 1.65 }}>{form.summary}</p>
        </>
      )}

      {jobs.length > 0 && (
        <>
          <SH title="Experience" />
          {jobs.map(job => (
            <div key={job.id} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{job.jobTitle}</span>
                  {job.company && <span style={{ color: "#888" }}> · {job.company}</span>}
                </div>
                <span style={{ fontSize: "8.5px", color: "#bbb", whiteSpace: "nowrap", marginLeft: "8px" }}>{job.startDate}{job.startDate && " – "}{job.isPresent ? "Present" : job.endDate}</span>
              </div>
              {job.description && (
                <div style={{ marginTop: "3px", paddingLeft: "12px", color: "#666" }}>
                  {job.description.split("\n").filter(Boolean).map((l, i) => (
                    <p key={i} style={{ margin: "1px 0", fontSize: "9.5px" }}>– {l.replace(/^[•\-]\s*/, "")}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {edus.length > 0 && (
        <>
          <SH title="Education" />
          {edus.map(e => (
            <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <div><span style={{ fontWeight: 600 }}>{e.degree}</span>{e.school && <span style={{ color: "#888" }}> · {e.school}</span>}</div>
              {e.graduationYear && <span style={{ fontSize: "9px", color: "#bbb" }}>{e.graduationYear}</span>}
            </div>
          ))}
        </>
      )}

      {(form.technicalSkills.length > 0 || form.softSkills.length > 0) && (
        <>
          <SH title="Skills" />
          {form.technicalSkills.length > 0 && <p style={{ color: "#555", marginBottom: "3px" }}>{form.technicalSkills.join("  ·  ")}</p>}
          {form.softSkills.length > 0 && <p style={{ color: "#888", fontSize: "9px" }}>{form.softSkills.join("  ·  ")}</p>}
        </>
      )}

      {projs.length > 0 && (
        <>
          <SH title="Projects" />
          {projs.map(proj => (
            <div key={proj.id} style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600 }}>{proj.name}</span>
                {proj.tech && <span style={{ fontSize: "8.5px", color: "#aaa" }}>{proj.tech}</span>}
              </div>
              {proj.url && <p style={{ fontSize: "8px", color: "#7aaedb", margin: "1px 0" }}>{proj.url}</p>}
              {proj.description && (
                <div style={{ marginTop: "2px", paddingLeft: "12px", color: "#666" }}>
                  {proj.description.split("\n").filter(Boolean).map((l, i) => (
                    <p key={i} style={{ margin: "1px 0", fontSize: "9.5px" }}>– {l.replace(/^[•\-]\s*/, "")}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {certs.length > 0 && (
        <>
          <SH title="Certifications" />
          {certs.map(cert => (
            <div key={cert.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
              <div><span style={{ fontWeight: 600 }}>{cert.name}</span>{cert.issuer && <span style={{ color: "#888" }}> · {cert.issuer}</span>}</div>
              {cert.year && <span style={{ fontSize: "9px", color: "#bbb" }}>{cert.year}</span>}
            </div>
          ))}
        </>
      )}

      {form.languages.length > 0 && (
        <>
          <SH title="Languages" />
          <p style={{ color: "#666" }}>{form.languages.join("  ·  ")}</p>
        </>
      )}

      <p style={{ fontSize: "7px", color: "#ddd", marginTop: "24px" }}>Optimized for {company} · ToolHive</p>
    </div>
  );
}

// ─── Sidebar Template ─────────────────────────────────────────────────────────

function SidebarPreview({ form, color, company }: { form: ResumeForm; color: string; company: string }) {
  const jobs = form.workExperience.filter(j => j.jobTitle || j.company);
  const edus = form.education.filter(e => e.degree || e.school);
  const projs = form.projects.filter(p => p.name);
  const certs = form.certifications.filter(c => c.name);

  const sideSecStyle: React.CSSProperties = {
    fontSize: "7px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em",
    color: "rgba(255,255,255,0.6)", margin: "0 0 5px", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "3px",
  };

  function RightSH({ title }: { title: string }) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "6px", margin: "14px 0 7px" }}>
        <div style={{ width: "16px", height: "2px", backgroundColor: color, flexShrink: 0 }} />
        <span style={{ fontSize: "7.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.13em", color: color }}>{title}</span>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "10px", lineHeight: 1.55, color: "#111", display: "flex", minHeight: "842px" }}>
      {/* Left sidebar */}
      <div style={{ width: "168px", backgroundColor: color, padding: "24px 14px", color: "#fff", flexShrink: 0 }}>
        <h1 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 3px", color: "#fff", lineHeight: 1.2 }}>{form.fullName || "Your Name"}</h1>
        {form.jobTitle && <p style={{ fontSize: "9.5px", color: "rgba(255,255,255,0.85)", margin: "0 0 18px", fontWeight: 500 }}>{form.jobTitle}</p>}

        {/* Contact */}
        <div style={{ marginBottom: "16px" }}>
          <p style={sideSecStyle}>Contact</p>
          {[form.email, form.phone, form.location, form.linkedin, form.website].filter(Boolean).map((c, i) => (
            <p key={i} style={{ fontSize: "8.5px", color: "rgba(255,255,255,0.85)", margin: "0 0 3px", wordBreak: "break-all" }}>{c}</p>
          ))}
        </div>

        {/* Skills */}
        {(form.technicalSkills.length > 0 || form.softSkills.length > 0) && (
          <div style={{ marginBottom: "16px" }}>
            <p style={sideSecStyle}>Skills</p>
            {form.technicalSkills.map((s, i) => <p key={i} style={{ fontSize: "8.5px", color: "rgba(255,255,255,0.85)", margin: "0 0 2px" }}>• {s}</p>)}
            {form.softSkills.length > 0 && (
              <>
                <p style={{ fontSize: "7px", color: "rgba(255,255,255,0.5)", margin: "6px 0 3px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Soft</p>
                {form.softSkills.map((s, i) => <p key={i} style={{ fontSize: "8.5px", color: "rgba(255,255,255,0.75)", margin: "0 0 2px" }}>• {s}</p>)}
              </>
            )}
          </div>
        )}

        {/* Languages */}
        {form.languages.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <p style={sideSecStyle}>Languages</p>
            {form.languages.map((l, i) => <p key={i} style={{ fontSize: "8.5px", color: "rgba(255,255,255,0.85)", margin: "0 0 2px" }}>• {l}</p>)}
          </div>
        )}

        {/* Certifications */}
        {certs.length > 0 && (
          <div>
            <p style={sideSecStyle}>Certifications</p>
            {certs.map(cert => (
              <div key={cert.id} style={{ marginBottom: "6px" }}>
                <p style={{ fontSize: "8.5px", color: "rgba(255,255,255,0.9)", margin: 0, fontWeight: 600 }}>{cert.name}</p>
                {cert.issuer && <p style={{ fontSize: "8px", color: "rgba(255,255,255,0.6)", margin: "1px 0 0" }}>{cert.issuer}</p>}
                {cert.year && <p style={{ fontSize: "7.5px", color: "rgba(255,255,255,0.45)", margin: "1px 0 0" }}>{cert.year}</p>}
              </div>
            ))}
          </div>
        )}

        <p style={{ fontSize: "6.5px", color: "rgba(255,255,255,0.3)", marginTop: "24px" }}>ToolHive · {company}</p>
      </div>

      {/* Right content */}
      <div style={{ flex: 1, padding: "24px 20px" }}>
        {form.summary && (
          <>
            <RightSH title="Professional Summary" />
            <p style={{ color: "#444", fontSize: "10px" }}>{form.summary}</p>
          </>
        )}

        {jobs.length > 0 && (
          <>
            <RightSH title="Work Experience" />
            {jobs.map(job => (
              <div key={job.id} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div><b style={{ color: "#111" }}>{job.jobTitle}</b>{job.company && <span style={{ color: "#555" }}> — {job.company}</span>}</div>
                  <span style={{ fontSize: "8.5px", color: "#888", whiteSpace: "nowrap", marginLeft: "8px" }}>{job.startDate}{job.startDate && " – "}{job.isPresent ? "Present" : job.endDate}</span>
                </div>
                {job.description && (
                  <ul style={{ margin: "3px 0 0 12px", padding: 0, color: "#444" }}>
                    {job.description.split("\n").filter(Boolean).map((l, i) => <li key={i} style={{ listStyle: "disc", marginBottom: "1px", fontSize: "9.5px" }}>{l.replace(/^[•\-]\s*/, "")}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </>
        )}

        {projs.length > 0 && (
          <>
            <RightSH title="Projects" />
            {projs.map(proj => (
              <div key={proj.id} style={{ marginBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <b style={{ color: "#111" }}>{proj.name}</b>
                  {proj.tech && <span style={{ fontSize: "8.5px", color: "#888" }}>{proj.tech}</span>}
                </div>
                {proj.url && <p style={{ fontSize: "8.5px", color: "#4a90d9", margin: "1px 0" }}>{proj.url}</p>}
                {proj.description && (
                  <ul style={{ margin: "2px 0 0 12px", padding: 0, color: "#444" }}>
                    {proj.description.split("\n").filter(Boolean).map((l, i) => <li key={i} style={{ listStyle: "disc", marginBottom: "1px", fontSize: "9.5px" }}>{l.replace(/^[•\-]\s*/, "")}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </>
        )}

        {edus.length > 0 && (
          <>
            <RightSH title="Education" />
            {edus.map(e => (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <div><b style={{ color: "#111" }}>{e.degree}</b>{e.school && <span style={{ color: "#555" }}> — {e.school}</span>}</div>
                {e.graduationYear && <span style={{ fontSize: "9px", color: "#888" }}>{e.graduationYear}</span>}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
