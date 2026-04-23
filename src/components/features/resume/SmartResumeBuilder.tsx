"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { nanoid } from "nanoid";
import {
  Search, Sparkles, ChevronRight, ChevronLeft, Download, Plus, Trash2,
  CheckCircle2, AlertCircle, Lightbulb, Target, Zap, Eye, X,
  TrendingUp, ShieldCheck, FileText, Loader2,
} from "lucide-react";

// ─── Company data ──────────────────────────────────────────────────────────────

const COMPANIES = [
  { id: "google",     name: "Google",         logo: "G",  color: "#4285F4", bg: "#EEF3FF", industry: "Tech",       tier: "FAANG" },
  { id: "amazon",     name: "Amazon",         logo: "A",  color: "#FF9900", bg: "#FFF7ED", industry: "Tech",       tier: "FAANG" },
  { id: "microsoft",  name: "Microsoft",      logo: "M",  color: "#00A4EF", bg: "#EFF9FF", industry: "Tech",       tier: "FAANG" },
  { id: "meta",       name: "Meta",           logo: "f",  color: "#0866FF", bg: "#EEF3FF", industry: "Tech",       tier: "FAANG" },
  { id: "apple",      name: "Apple",          logo: "",  color: "#000000", bg: "#F3F3F3", industry: "Tech",       tier: "FAANG" },
  { id: "netflix",    name: "Netflix",        logo: "N",  color: "#E50914", bg: "#FFF0F0", industry: "Tech",       tier: "Top-10" },
  { id: "uber",       name: "Uber",           logo: "U",  color: "#000000", bg: "#F3F3F3", industry: "Tech",       tier: "Top-10" },
  { id: "airbnb",     name: "Airbnb",         logo: "A",  color: "#FF5A5F", bg: "#FFF0F0", industry: "Tech",       tier: "Top-10" },
  { id: "linkedin",   name: "LinkedIn",       logo: "in", color: "#0077B5", bg: "#EEF6FF", industry: "Tech",       tier: "Top-10" },
  { id: "salesforce", name: "Salesforce",     logo: "S",  color: "#00A1E0", bg: "#EFF9FF", industry: "Tech",       tier: "Top-10" },
  { id: "goldman",    name: "Goldman Sachs",  logo: "GS", color: "#1B5299", bg: "#EEF2FF", industry: "Finance",    tier: "Top-10" },
  { id: "jpmorgan",   name: "JP Morgan",      logo: "JP", color: "#003087", bg: "#EEF2FF", industry: "Finance",    tier: "Top-10" },
  { id: "mckinsey",   name: "McKinsey",       logo: "Mc", color: "#1B1B1B", bg: "#F5F5F5", industry: "Consulting", tier: "Top-10" },
  { id: "bcg",        name: "BCG",            logo: "B",  color: "#009F6B", bg: "#EEFBF5", industry: "Consulting", tier: "Top-10" },
  { id: "deloitte",   name: "Deloitte",       logo: "D",  color: "#86BC25", bg: "#F4FAEE", industry: "Consulting", tier: "Big-4" },
  { id: "tcs",        name: "TCS",            logo: "T",  color: "#1C4F9C", bg: "#EEF2FF", industry: "IT",         tier: "India" },
  { id: "infosys",    name: "Infosys",        logo: "i",  color: "#007CC3", bg: "#EEF7FF", industry: "IT",         tier: "India" },
  { id: "wipro",      name: "Wipro",          logo: "W",  color: "#341F6A", bg: "#F2EEFF", industry: "IT",         tier: "India" },
  { id: "accenture",  name: "Accenture",      logo: ">",  color: "#A100FF", bg: "#F7EEFF", industry: "Consulting", tier: "Global" },
  { id: "ibm",        name: "IBM",            logo: "I",  color: "#0530AD", bg: "#EEF2FF", industry: "Tech",       tier: "Global" },
  { id: "adobe",      name: "Adobe",          logo: "Ai", color: "#FF0000", bg: "#FFF0F0", industry: "Tech",       tier: "Top-25" },
  { id: "twitter",    name: "X (Twitter)",    logo: "X",  color: "#000000", bg: "#F3F3F3", industry: "Tech",       tier: "Top-25" },
];

const INDUSTRIES = ["All", "Tech", "Finance", "Consulting", "IT"];
const TIERS = ["All", "FAANG", "Top-10", "India", "Global", "Big-4", "Top-25"];

// ─── Types ────────────────────────────────────────────────────────────────────

interface CompanyInsights {
  pageLength: string;
  format: string;
  bulletStyle: string;
  keyPrinciples: string[];
  mustHaveKeywords: string[];
  mustHaveSections: string[];
  avoid: string[];
  bulletExample: { bad: string; good: string };
  insiderTip: string;
  atsScore: string;
  hiringVolume: string;
}

interface WorkExp { id: string; jobTitle: string; company: string; startDate: string; endDate: string; isPresent: boolean; description: string; }
interface Education { id: string; degree: string; school: string; graduationYear: string; }
interface Project {
  id: string;
  name: string;
  tech: string;
  description: string;
  url: string;
}
interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
}
interface ResumeForm {
  fullName: string; email: string; phone: string; location: string;
  linkedin: string; jobTitle: string; summary: string;
  workExperience: WorkExp[]; education: Education[];
  technicalSkills: string[]; softSkills: string[];
  projects: Project[];
  certifications: Certification[];
  languages: string[];
  website: string;
}

function mkJob(): WorkExp { return { id: nanoid(6), jobTitle: "", company: "", startDate: "", endDate: "", isPresent: false, description: "" }; }
function mkEdu(): Education { return { id: nanoid(6), degree: "", school: "", graduationYear: "" }; }
function mkProject(): Project { return { id: nanoid(6), name: "", tech: "", description: "", url: "" }; }
function mkCert(): Certification { return { id: nanoid(6), name: "", issuer: "", year: "" }; }

const BLANK: ResumeForm = {
  fullName: "", email: "", phone: "", location: "", linkedin: "", jobTitle: "", summary: "",
  workExperience: [mkJob()], education: [mkEdu()],
  technicalSkills: [], softSkills: [],
  projects: [mkProject()],
  certifications: [],
  languages: [],
  website: "",
};

// ─── Small helpers ─────────────────────────────────────────────────────────────

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

// ─── Resume PDF generator ──────────────────────────────────────────────────────

async function downloadPDF(form: ResumeForm, company: string) {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const reg  = await doc.embedFont(StandardFonts.Helvetica);
  const W = 595, H = 842, MX = 48, CW = W - MX * 2;
  let page = doc.addPage([W, H]);
  let y = H - 50;

  function newPage() { page = doc.addPage([W, H]); y = H - 50; }
  function need(n: number) { if (y - n < 50) newPage(); }
  function wrap(text: string, x: number, mw: number, sz: number, font: typeof bold, clr: [number,number,number] = [0.12,0.12,0.12]) {
    const lh = sz * 1.5;
    let line = "";
    for (const w of text.split(" ")) {
      const test = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(test, sz) > mw && line) {
        need(lh); page.drawText(line, { x, y, size: sz, font, color: rgb(...clr) }); y -= lh; line = w;
      } else line = test;
    }
    if (line) { need(lh); page.drawText(line, { x, y, size: sz, font, color: rgb(...clr) }); y -= lh; }
  }
  function secHead(title: string) {
    y -= 8; need(18);
    page.drawText(title.toUpperCase(), { x: MX, y, size: 8, font: bold, color: rgb(0.28,0.28,0.28) });
    y -= 5;
    page.drawLine({ start: { x: MX, y }, end: { x: W - MX, y }, thickness: 0.5, color: rgb(0.6,0.6,0.6) });
    y -= 10;
  }

  // Name
  const nw = bold.widthOfTextAtSize(form.fullName || "Resume", 20);
  page.drawText(form.fullName || "Resume", { x: (W - nw) / 2, y, size: 20, font: bold, color: rgb(0.05,0.05,0.05) });
  y -= 26;
  if (form.jobTitle) {
    const tw = reg.widthOfTextAtSize(form.jobTitle, 11);
    page.drawText(form.jobTitle, { x: (W - tw) / 2, y, size: 11, font: reg, color: rgb(0.3,0.3,0.3) });
    y -= 16;
  }
  const contact = [form.email, form.phone, form.location, form.linkedin, form.website].filter(Boolean).join("  |  ");
  if (contact) {
    const cw = reg.widthOfTextAtSize(contact, 8.5);
    page.drawText(contact, { x: Math.max(MX, (W - cw) / 2), y, size: 8.5, font: reg, color: rgb(0.4,0.4,0.4) });
    y -= 6;
  }
  page.drawLine({ start: { x: MX, y }, end: { x: W - MX, y }, thickness: 1, color: rgb(0.1,0.1,0.1) });
  y -= 12;

  if (form.summary.trim()) { secHead("Professional Summary"); wrap(form.summary, MX, CW, 10, reg); y -= 3; }

  const jobs = form.workExperience.filter(j => j.jobTitle || j.company);
  if (jobs.length) {
    secHead("Work Experience");
    for (const job of jobs) {
      need(24);
      const title = [job.jobTitle, job.company].filter(Boolean).join(" — ");
      const dates = [job.startDate, job.isPresent ? "Present" : job.endDate].filter(Boolean).join(" – ");
      page.drawText(title, { x: MX, y, size: 10, font: bold, color: rgb(0.08,0.08,0.08) });
      if (dates) { const dw = reg.widthOfTextAtSize(dates, 9); page.drawText(dates, { x: W - MX - dw, y, size: 9, font: reg, color: rgb(0.45,0.45,0.45) }); }
      y -= 13;
      for (const line of job.description.split("\n").filter(Boolean)) wrap(line.startsWith("•") ? line : `• ${line}`, MX + 8, CW - 8, 9.5, reg);
      y -= 5;
    }
  }

  const edus = form.education.filter(e => e.degree || e.school);
  if (edus.length) {
    secHead("Education");
    for (const e of edus) {
      need(16);
      page.drawText([e.degree, e.school && `— ${e.school}`].filter(Boolean).join(" "), { x: MX, y, size: 10, font: bold, color: rgb(0.08,0.08,0.08) });
      if (e.graduationYear) { const gw = reg.widthOfTextAtSize(e.graduationYear, 9); page.drawText(e.graduationYear, { x: W - MX - gw, y, size: 9, font: reg, color: rgb(0.45,0.45,0.45) }); }
      y -= 15;
    }
  }

  if (form.technicalSkills.length || form.softSkills.length) {
    secHead("Skills");
    if (form.technicalSkills.length) wrap(`Technical: ${form.technicalSkills.join("  ·  ")}`, MX, CW, 10, reg);
    if (form.softSkills.length) wrap(`Soft Skills: ${form.softSkills.join("  ·  ")}`, MX, CW, 10, reg);
  }

  // Projects
  const projects = form.projects.filter(p => p.name);
  if (projects.length) {
    secHead("Projects");
    for (const proj of projects) {
      need(20);
      const projTitle = proj.tech ? `${proj.name} — ${proj.tech}` : proj.name;
      page.drawText(projTitle, { x: MX, y, size: 10, font: bold, color: rgb(0.08,0.08,0.08) });
      if (proj.url) { const uw = reg.widthOfTextAtSize(proj.url, 8); page.drawText(proj.url, { x: W - MX - uw, y, size: 8, font: reg, color: rgb(0.3,0.5,0.9) }); }
      y -= 13;
      if (proj.description) {
        for (const line of proj.description.split("\n").filter(Boolean)) wrap(line.startsWith("•") ? line : `• ${line}`, MX + 8, CW - 8, 9.5, reg);
      }
      y -= 4;
    }
  }

  // Certifications
  const certs = form.certifications.filter(c => c.name);
  if (certs.length) {
    secHead("Certifications & Awards");
    for (const cert of certs) {
      need(16);
      const certTitle = cert.issuer ? `${cert.name} — ${cert.issuer}` : cert.name;
      page.drawText(certTitle, { x: MX, y, size: 10, font: bold, color: rgb(0.08,0.08,0.08) });
      if (cert.year) { const yw = reg.widthOfTextAtSize(cert.year, 9); page.drawText(cert.year, { x: W - MX - yw, y, size: 9, font: reg, color: rgb(0.45,0.45,0.45) }); }
      y -= 15;
    }
  }

  // Languages
  if (form.languages.length) {
    secHead("Languages");
    wrap(form.languages.join("  ·  "), MX, CW, 10, reg);
  }

  // Footer
  const footerText = `Optimized for ${company} | Generated by ToolHive`;
  const fw = reg.widthOfTextAtSize(footerText, 7);
  page.drawText(footerText, { x: (W - fw) / 2, y: 30, size: 7, font: reg, color: rgb(0.6,0.6,0.6) });

  const bytes = await doc.save();
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(form.fullName || "resume").replace(/\s+/g, "_")}_${company}_Resume.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

// ─── Main component ────────────────────────────────────────────────────────────

export function SmartResumeBuilder() {
  const [phase, setPhase] = useState<"select" | "insights" | "build">("select");
  const [selectedCompany, setSelectedCompany] = useState<typeof COMPANIES[0] | null>(null);
  const [role, setRole] = useState("");
  const [insights, setInsights] = useState<CompanyInsights | null>(null);
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
  const [filterIndustry, setFilterIndustry] = useState("All");
  const [filterTier, setFilterTier] = useState("All");

  const filteredCompanies = COMPANIES.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchIndustry = filterIndustry === "All" || c.industry === filterIndustry;
    const matchTier = filterTier === "All" || c.tier === filterTier;
    return matchSearch && matchIndustry && matchTier;
  });

  async function loadInsights() {
    if (!selectedCompany) return;
    setInsightsLoading(true);
    setInsightsError("");
    try {
      const res = await fetch("/api/resume/company-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: selectedCompany.name, role, action: "insights" }),
      });
      const d = await res.json() as { insights?: CompanyInsights; error?: string };
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
    if (!selectedCompany) return;
    setOptimizing(true);
    try {
      const res = await fetch("/api/resume/company-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: selectedCompany.name, role, action: "optimize",
          resumeData: { workExperience: form.workExperience, summary: form.summary, technicalSkills: form.technicalSkills, softSkills: form.softSkills },
        }),
      });
      const d = await res.json() as { optimized?: { summary: string; workExperience: Array<{id:string;description:string}>; skills: {technical:string[];soft:string[]}; optimizationNotes: string[] }; error?: string };
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

  // ── Phase: Select company ──

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
              <p className="text-sm text-foreground-muted">AI analyzes selected resumes at top companies — then builds yours the same way</p>
            </div>
          </div>
        </div>

        {/* Role input */}
        <div className="mb-5 max-w-md">
          <label className="block text-sm font-medium text-foreground mb-1.5">What role are you applying for?</label>
          <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Software Engineer, Data Scientist, Product Manager…"
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors" />
        </div>

        {/* Search + Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search company…"
              className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors" />
          </div>
          <select value={filterIndustry} onChange={e => setFilterIndustry(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
            {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
          </select>
          <select value={filterTier} onChange={e => setFilterTier(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
            {TIERS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Company grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mb-6">
          {filteredCompanies.map(company => (
            <motion.button key={company.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedCompany(company)}
              className={`relative flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all ${selectedCompany?.id === company.id ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10" : "border-border bg-card hover:border-foreground-muted/30 hover:shadow-md"}`}>
              {selectedCompany?.id === company.id && (
                <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-indigo-500 flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </div>
              )}
              <div className="h-12 w-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-sm" style={{ backgroundColor: company.bg, color: company.color }}>
                {company.logo}
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-foreground leading-tight">{company.name}</p>
                <span className="text-[10px] text-foreground-muted">{company.industry}</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold" style={{ backgroundColor: `${company.color}15`, color: company.color }}>{company.tier}</span>
            </motion.button>
          ))}
        </div>

        {/* Continue button */}
        <div className="flex justify-center">
          <button onClick={loadInsights} disabled={!selectedCompany || insightsLoading}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none shadow-xl shadow-indigo-500/20">
            {insightsLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Analyzing {selectedCompany?.name} resumes…</> : <><Sparkles className="h-4 w-4" />{selectedCompany ? `Analyze ${selectedCompany.name} Resumes` : "Select a Company First"}<ChevronRight className="h-4 w-4" /></>}
          </button>
        </div>
        {insightsError && <p className="text-center text-red-400 text-sm mt-3">{insightsError}</p>}
      </div>
    );
  }

  // ── Phase: Insights ──

  if (phase === "insights" && insights && selectedCompany) {
    return (
      <div className="w-full">
        <button onClick={() => setPhase("select")} className="flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground mb-5 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back to Companies
        </button>

        {/* Company header */}
        <div className="flex items-center gap-4 mb-6 p-5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl">
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg" style={{ backgroundColor: selectedCompany.bg, color: selectedCompany.color }}>
            {selectedCompany.logo}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{selectedCompany.name} Resume Intelligence</h2>
            <p className="text-sm text-foreground-muted">AI analyzed hundreds of accepted resumes at {selectedCompany.name}</p>
            <div className="flex gap-2 mt-1.5">
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 text-xs font-medium">ATS: {insights.atsScore}</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-xs font-medium">{insights.pageLength}</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-xs font-medium">{insights.hiringVolume}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Key Principles */}
          <div className="border border-card-border bg-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3"><Target className="h-4 w-4 text-indigo-500" /><h3 className="font-semibold text-sm text-foreground">What {selectedCompany.name} Looks For</h3></div>
            <ul className="space-y-2">
              {insights.keyPrinciples.map((p, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
                  <span className="text-sm text-foreground">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Must-have keywords */}
          <div className="border border-card-border bg-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3"><Zap className="h-4 w-4 text-amber-500" /><h3 className="font-semibold text-sm text-foreground">Must-Have Keywords</h3></div>
            <div className="flex flex-wrap gap-1.5">
              {insights.mustHaveKeywords.map(kw => (
                <span key={kw} className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">{kw}</span>
              ))}
            </div>
          </div>

          {/* Bullet example */}
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

          {/* Avoid + Insider tip */}
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

        {/* Sections */}
        <div className="border border-card-border bg-card rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3"><ShieldCheck className="h-4 w-4 text-indigo-500" /><h3 className="font-semibold text-sm text-foreground">Required Sections for {selectedCompany.name}</h3></div>
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
            <FileText className="h-4 w-4" /> Build My {selectedCompany.name}-Optimized Resume <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── Phase: Build ──

  if (phase === "build" && selectedCompany) {
    const accentColor = selectedCompany.color;
    return (
      <div className="w-full">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => setPhase("insights")} className="flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <div className="h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: selectedCompany.bg, color: selectedCompany.color }}>{selectedCompany.logo}</div>
          <h2 className="text-base font-bold text-foreground">{selectedCompany.name}-Optimized Resume</h2>
          <span className="text-xs text-foreground-muted">· {role || "General"}</span>
        </div>

        <div className="flex flex-col xl:flex-row gap-6">
          {/* Form */}
          <div className="xl:w-[480px] shrink-0 space-y-4">
            {/* Personal */}
            <Section title="Personal Info" color={accentColor}>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Full Name" value={form.fullName} onChange={v => upd("fullName", v)} placeholder="Jane Smith" />
                <Field label="Job Title" value={form.jobTitle} onChange={v => upd("jobTitle", v)} placeholder="Software Engineer" />
                <Field label="Email" type="email" value={form.email} onChange={v => upd("email", v)} placeholder="jane@example.com" />
                <Field label="Phone" value={form.phone} onChange={v => upd("phone", v)} placeholder="+1 555 000 0000" />
                <Field label="Location" value={form.location} onChange={v => upd("location", v)} placeholder="New York, NY" />
                <Field label="LinkedIn" value={form.linkedin} onChange={v => upd("linkedin", v)} placeholder="linkedin.com/in/jane" />
                <Field label="Website / Portfolio" value={form.website} onChange={v => upd("website", v)} placeholder="myportfolio.com" />
              </div>
            </Section>

            {/* Summary */}
            <Section title="Professional Summary" color={accentColor}>
              <TA label="Summary" value={form.summary} onChange={v => upd("summary", v)} placeholder="Results-driven engineer with 5+ years building scalable systems…" rows={4} />
              {insights && <p className="text-[11px] text-foreground-muted mt-1.5">💡 Tip: {insights.insiderTip.slice(0, 100)}…</p>}
            </Section>

            {/* Experience */}
            <Section title="Work Experience" color={accentColor}>
              {form.workExperience.map((job, idx) => (
                <div key={job.id} className="mb-4 p-3.5 bg-slate-800/40 rounded-xl border border-slate-700 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Position {idx + 1}</span>
                    {form.workExperience.length > 1 && <button onClick={() => upd("workExperience", form.workExperience.filter(j => j.id !== job.id))} className="text-slate-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Job Title" value={job.jobTitle} onChange={v => updJob(job.id, "jobTitle", v)} placeholder="Sr. Engineer" />
                    <Field label="Company" value={job.company} onChange={v => updJob(job.id, "company", v)} placeholder="Acme Inc." />
                    <Field label="Start" value={job.startDate} onChange={v => updJob(job.id, "startDate", v)} placeholder="Jan 2022" />
                    <Field label="End" value={job.isPresent ? "Present" : job.endDate} onChange={v => updJob(job.id, "endDate", v)} placeholder="Dec 2024" />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="accent-indigo-500" checked={job.isPresent} onChange={e => updJob(job.id, "isPresent", e.target.checked)} /><span className="text-xs text-slate-400">Currently working here</span></label>
                  <TA label="Description (use • for bullets)" value={job.description} onChange={v => updJob(job.id, "description", v)} placeholder={"• Developed...\n• Improved..."} rows={4} />
                </div>
              ))}
              <button onClick={() => upd("workExperience", [...form.workExperience, mkJob()])} className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                <Plus className="h-3.5 w-3.5" /> Add Position
              </button>
            </Section>

            {/* Education */}
            <Section title="Education" color={accentColor}>
              {form.education.map((edu, idx) => (
                <div key={edu.id} className="mb-3 p-3.5 bg-slate-800/40 rounded-xl border border-slate-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Degree {idx + 1}</span>
                    {form.education.length > 1 && <button onClick={() => upd("education", form.education.filter(e => e.id !== edu.id))} className="text-slate-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Degree" value={edu.degree} onChange={v => updEdu(edu.id, "degree", v)} placeholder="B.S. Computer Science" />
                    <Field label="School" value={edu.school} onChange={v => updEdu(edu.id, "school", v)} placeholder="MIT" />
                    <Field label="Year" value={edu.graduationYear} onChange={v => updEdu(edu.id, "graduationYear", v)} placeholder="2022" />
                  </div>
                </div>
              ))}
              <button onClick={() => upd("education", [...form.education, mkEdu()])} className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                <Plus className="h-3.5 w-3.5" /> Add Degree
              </button>
            </Section>

            {/* Skills */}
            <Section title="Skills" color={accentColor}>
              {insights && (
                <div className="mb-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                  <p className="text-[11px] text-amber-500 font-semibold mb-1.5">⚡ Add These for {selectedCompany.name}:</p>
                  <div className="flex flex-wrap gap-1">
                    {insights.mustHaveKeywords.filter(k => !form.technicalSkills.includes(k)).slice(0, 6).map(kw => (
                      <button key={kw} onClick={() => upd("technicalSkills", [...form.technicalSkills, kw])} className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[11px] hover:bg-amber-500/20 transition-colors">+ {kw}</button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 mb-2">
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && skillInput.trim()) { upd("technicalSkills", [...form.technicalSkills, skillInput.trim()]); setSkillInput(""); } }} placeholder="Add technical skill (Enter)" className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors" />
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
              <div className="flex gap-2">
                <input value={softInput} onChange={e => setSoftInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && softInput.trim()) { upd("softSkills", [...form.softSkills, softInput.trim()]); setSoftInput(""); } }} placeholder="Add soft skill (Enter)" className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors" />
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
              {/* Languages */}
              <div className="mt-3">
                <p className="text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Languages</p>
                <div className="flex gap-2">
                  <input value={langInput} onChange={e => setLangInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && langInput.trim()) { upd("languages", [...form.languages, langInput.trim()]); setLangInput(""); }}}
                    placeholder="Add language (Enter)" className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>
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

            {/* Projects */}
            <Section title="Projects" color={accentColor}>
              {form.projects.map((proj, idx) => (
                <div key={proj.id} className="mb-4 p-3.5 bg-slate-800/40 rounded-xl border border-slate-700 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Project {idx + 1}</span>
                    <button onClick={() => upd("projects", form.projects.filter(p => p.id !== proj.id))} className="text-slate-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Project Name" value={proj.name} onChange={v => updProject(proj.id, "name", v)} placeholder="e.g. E-Commerce Platform" />
                    <Field label="Tech Stack" value={proj.tech} onChange={v => updProject(proj.id, "tech", v)} placeholder="React, Node.js, MongoDB" />
                  </div>
                  <Field label="Live URL / GitHub" value={proj.url} onChange={v => updProject(proj.id, "url", v)} placeholder="github.com/user/project" />
                  <TA label="Description" value={proj.description} onChange={v => updProject(proj.id, "description", v)} placeholder="Built a full-stack app that..." rows={2} />
                </div>
              ))}
              <button onClick={() => upd("projects", [...form.projects, mkProject()])}
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                <Plus className="h-3.5 w-3.5" /> Add Project
              </button>
            </Section>

            {/* Certifications */}
            <Section title="Certifications & Awards" color={accentColor}>
              {form.certifications.map((cert, idx) => (
                <div key={cert.id} className="mb-3 p-3 bg-slate-800/40 rounded-xl border border-slate-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Cert {idx + 1}</span>
                    <button onClick={() => upd("certifications", form.certifications.filter(c => c.id !== cert.id))} className="text-slate-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Certificate Name" value={cert.name} onChange={v => updCert(cert.id, "name", v)} placeholder="AWS Solutions Architect" />
                    <Field label="Issuer" value={cert.issuer} onChange={v => updCert(cert.id, "issuer", v)} placeholder="Amazon Web Services" />
                  </div>
                  <Field label="Year" value={cert.year} onChange={v => updCert(cert.id, "year", v)} placeholder="2024" />
                </div>
              ))}
              <button onClick={() => upd("certifications", [...form.certifications, mkCert()])}
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors mt-2">
                <Plus className="h-3.5 w-3.5" /> Add Certification
              </button>
            </Section>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button onClick={optimizeResume} disabled={optimizing}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20">
                {optimizing ? <><Loader2 className="h-4 w-4 animate-spin" />AI is optimizing for {selectedCompany.name}…</> : <><Sparkles className="h-4 w-4" />AI Optimize for {selectedCompany.name}</>}
              </button>
              {optimizationNotes.length > 0 && (
                <AnimatePresence>
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                    <p className="text-xs font-bold text-emerald-500 mb-2">✅ Optimization Applied</p>
                    <ul className="space-y-1">{optimizationNotes.map((n, i) => <li key={i} className="text-xs text-foreground-muted flex items-start gap-1.5"><span className="text-emerald-400 shrink-0">•</span>{n}</li>)}</ul>
                  </motion.div>
                </AnimatePresence>
              )}
              <button onClick={async () => { setDownloading(true); try { await downloadPDF(form, selectedCompany.name); } finally { setDownloading(false); } }} disabled={downloading}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                {downloading ? <><Loader2 className="h-4 w-4 animate-spin" />Generating PDF…</> : <><Download className="h-4 w-4" />Download {selectedCompany.name}-Optimized PDF</>}
              </button>
            </div>
          </div>

          {/* Live Preview */}
          <div className="flex-1 min-w-0">
            <div className="border border-card-border rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 sticky top-4">
              <div className="px-3 py-2 bg-card border-b border-card-border flex items-center gap-2">
                <Eye className="h-3.5 w-3.5 text-foreground-muted" />
                <span className="text-xs text-foreground-muted">Live Preview — {selectedCompany.name} Style</span>
                <div className="ml-auto h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="overflow-auto p-4" style={{ maxHeight: "780px" }}>
                <div className="bg-white shadow-lg mx-auto" style={{ width: "595px", minHeight: "842px", maxWidth: "100%" }}>
                  <LivePreview form={form} company={selectedCompany.name} color={accentColor} />
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

// ─── Live preview component ───────────────────────────────────────────────────

function LivePreview({ form, company, color }: { form: ResumeForm; company: string; color: string }) {
  const contacts = [form.email, form.phone, form.location, form.linkedin, form.website].filter(Boolean).join("  ·  ");
  const jobs = form.workExperience.filter(j => j.jobTitle || j.company);
  const edus = form.education.filter(e => e.degree || e.school);
  return (
    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "10.5px", lineHeight: 1.55, color: "#111", padding: "32px 36px" }}>
      {/* Header */}
      <div style={{ borderBottom: `3px solid ${color}`, paddingBottom: "14px", marginBottom: "16px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0, color: "#0a0a0a" }}>{form.fullName || "Your Name"}</h1>
        {form.jobTitle && <p style={{ fontSize: "12px", color, margin: "3px 0 0", fontWeight: 500 }}>{form.jobTitle}</p>}
        {contacts && <p style={{ fontSize: "9.5px", color: "#666", margin: "6px 0 0" }}>{contacts}</p>}
        <p style={{ fontSize: "8.5px", color: "#aaa", margin: "4px 0 0", fontStyle: "italic" }}>Optimized for {company}</p>
      </div>

      {form.summary && (
        <div style={{ marginBottom: "14px" }}>
          <h2 style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color, marginBottom: "5px" }}>Professional Summary</h2>
          <p style={{ color: "#444" }}>{form.summary}</p>
        </div>
      )}

      {jobs.length > 0 && (
        <div style={{ marginBottom: "14px" }}>
          <h2 style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color, marginBottom: "8px" }}>Work Experience</h2>
          {jobs.map(job => (
            <div key={job.id} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div><b style={{ color: "#111" }}>{job.jobTitle}</b>{job.company && <span style={{ color: "#555" }}> — {job.company}</span>}</div>
                <span style={{ fontSize: "9px", color: "#888", whiteSpace: "nowrap", marginLeft: "8px" }}>{job.startDate}{job.startDate && " – "}{job.isPresent ? "Present" : job.endDate}</span>
              </div>
              {job.description && (
                <ul style={{ margin: "3px 0 0 12px", padding: 0, color: "#444" }}>
                  {job.description.split("\n").filter(Boolean).map((l, i) => <li key={i} style={{ listStyle: "disc", marginBottom: "1px" }}>{l.replace(/^[•\-]\s*/, "")}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {edus.length > 0 && (
        <div style={{ marginBottom: "14px" }}>
          <h2 style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color, marginBottom: "8px" }}>Education</h2>
          {edus.map(e => (
            <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <div><b>{e.degree}</b>{e.school && <span style={{ color: "#555" }}> — {e.school}</span>}</div>
              {e.graduationYear && <span style={{ fontSize: "9px", color: "#888" }}>{e.graduationYear}</span>}
            </div>
          ))}
        </div>
      )}

      {(form.technicalSkills.length > 0 || form.softSkills.length > 0) && (
        <div style={{ marginBottom: "14px" }}>
          <h2 style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color, marginBottom: "7px" }}>Skills</h2>
          {form.technicalSkills.length > 0 && <p style={{ marginBottom: "4px" }}><b>Technical: </b><span style={{ color: "#444" }}>{form.technicalSkills.join("  ·  ")}</span></p>}
          {form.softSkills.length > 0 && <p><b>Soft Skills: </b><span style={{ color: "#444" }}>{form.softSkills.join("  ·  ")}</span></p>}
        </div>
      )}

      {form.projects?.filter(p => p.name).length > 0 && (
        <div style={{ marginBottom: "14px" }}>
          <h2 style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color, marginBottom: "8px" }}>Projects</h2>
          {form.projects.filter(p => p.name).map(proj => (
            <div key={proj.id} style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <b style={{ color: "#111" }}>{proj.name}</b>
                {proj.tech && <span style={{ fontSize: "8.5px", color: "#888", marginLeft: "8px" }}>{proj.tech}</span>}
              </div>
              {proj.url && <p style={{ fontSize: "8.5px", color: "#4a90d9", margin: "1px 0" }}>{proj.url}</p>}
              {proj.description && (
                <ul style={{ margin: "2px 0 0 12px", padding: 0, color: "#444" }}>
                  {proj.description.split("\n").filter(Boolean).map((l, i) => <li key={i} style={{ listStyle: "disc", marginBottom: "1px" }}>{l.replace(/^[•\-]\s*/, "")}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {form.certifications?.filter(c => c.name).length > 0 && (
        <div style={{ marginBottom: "14px" }}>
          <h2 style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color, marginBottom: "8px" }}>Certifications & Awards</h2>
          {form.certifications.filter(c => c.name).map(cert => (
            <div key={cert.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <div><b>{cert.name}</b>{cert.issuer && <span style={{ color: "#555" }}> — {cert.issuer}</span>}</div>
              {cert.year && <span style={{ fontSize: "9px", color: "#888" }}>{cert.year}</span>}
            </div>
          ))}
        </div>
      )}

      {form.languages?.length > 0 && (
        <div>
          <h2 style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color, marginBottom: "5px" }}>Languages</h2>
          <p style={{ color: "#444" }}>{form.languages.join("  ·  ")}</p>
        </div>
      )}
    </div>
  );
}
