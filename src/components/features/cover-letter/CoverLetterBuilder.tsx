"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Sparkles, ChevronRight, ChevronLeft, Download, Copy, Check,
  CheckCircle2, AlertCircle, Lightbulb, Target, Zap, Loader2, X,
  FileText, Mail,
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

const TONES = ["Professional", "Warm", "Enthusiastic", "Confident"] as const;
type ToneType = typeof TONES[number];

interface CoverLetterInsights {
  tonePreference: string;
  format: string;
  keyPrinciples: string[];
  mustMention: string[];
  avoid: string[];
  openingExample: string;
  insiderTip: string;
}

interface LetterForm {
  fullName: string; email: string; phone: string; location: string; linkedin: string;
  currentRole: string; achievement: string; whyField: string; targetCompany: string; additionalNotes: string;
  tone: ToneType;
}

const BLANK: LetterForm = {
  fullName: "", email: "", phone: "", location: "", linkedin: "",
  currentRole: "", achievement: "", whyField: "", targetCompany: "", additionalNotes: "",
  tone: "Professional",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

async function downloadLetterPDF(ref: { current: HTMLDivElement | null }, filename: string) {
  if (!ref.current) return;
  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");
  const canvas = await html2canvas(ref.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false });
  const imgData = canvas.toDataURL("image/png");
  const A4_W = 595.28, A4_H = 841.89;
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

export function CoverLetterBuilder() {
  const [phase, setPhase] = useState<"select" | "insights" | "build">("select");
  const [selectedField, setSelectedField] = useState<typeof FIELDS[number] | null>(null);
  const [role, setRole] = useState("");
  const [insights, setInsights] = useState<CoverLetterInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState("");
  const [form, setForm] = useState<LetterForm>(BLANK);
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const previewRef = useRef<HTMLDivElement>(null);

  // suppress unused import warning for AnimatePresence
  void AnimatePresence;

  const upd = (f: keyof LetterForm, v: string) => setForm(prev => ({ ...prev, [f]: v }));

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
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: selectedField.name, role, action: "insights" }),
      });
      const d = await res.json() as { insights?: CoverLetterInsights; error?: string };
      if (d.error) throw new Error(d.error);
      setInsights(d.insights!);
      setPhase("insights");
    } catch (e) {
      setInsightsError((e as Error).message);
    } finally {
      setInsightsLoading(false);
    }
  }

  async function generateLetter() {
    if (!selectedField) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: selectedField.name, role, action: "generate", form }),
      });
      const d = await res.json() as { letter?: string; error?: string };
      if (d.error) throw new Error(d.error);
      setGeneratedLetter(d.letter ?? "");
    } catch {
      setGeneratedLetter("Error generating letter. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  function copyLetter() {
    if (!generatedLetter) return;
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Phase: Select ──────────────────────────────────────────────────────────

  if (phase === "select") {
    return (
      <div className="w-full">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Cover Letter Builder</h1>
            <p className="text-sm text-foreground-muted">Field-specific cover letters tailored to your industry and role</p>
          </div>
        </div>

        <div className="mb-5 max-w-md">
          <label className="block text-sm font-medium text-foreground mb-1.5">Role you&apos;re applying for</label>
          <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Software Engineer, Doctor, Marketing Manager…"
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors" />
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
              className={`relative flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all ${selectedField?.id === field.id ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10" : "border-border bg-card hover:border-foreground-muted/30 hover:shadow-md"}`}>
              {selectedField?.id === field.id && (
                <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
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
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none shadow-xl shadow-blue-500/20">
            {insightsLoading
              ? <><Loader2 className="h-4 w-4 animate-spin" />Analyzing {selectedField?.name}…</>
              : <><Sparkles className="h-4 w-4" />{selectedField ? `Get ${selectedField.name} Cover Letter Tips` : "Select a Field First"}<ChevronRight className="h-4 w-4" /></>}
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

        <div className="flex items-center gap-4 mb-6 p-5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl">
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg shrink-0" style={{ backgroundColor: selectedField.bg }}>
            {selectedField.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{selectedField.name} Cover Letter Guide</h2>
            <p className="text-sm text-foreground-muted">What hiring managers in {selectedField.name} look for in cover letters</p>
            <div className="flex gap-2 mt-1.5">
              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 text-xs font-medium">{insights.format}</span>
              <span className="px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-500 text-xs font-medium">{insights.tonePreference.slice(0, 30)}…</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="border border-card-border bg-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3"><Target className="h-4 w-4 text-blue-500" /><h3 className="font-semibold text-sm text-foreground">Key Principles</h3></div>
            <ul className="space-y-2">
              {insights.keyPrinciples.map((p, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <span className="text-sm text-foreground">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-card-border bg-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3"><Zap className="h-4 w-4 text-amber-500" /><h3 className="font-semibold text-sm text-foreground">Must Mention</h3></div>
            <div className="flex flex-wrap gap-1.5">
              {insights.mustMention.map(kw => (
                <span key={kw} className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">{kw}</span>
              ))}
            </div>
          </div>

          <div className="border border-card-border bg-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /><h3 className="font-semibold text-sm text-foreground">Strong Opening Example</h3></div>
            <p className="text-sm text-foreground italic border-l-2 border-emerald-500 pl-3">&ldquo;{insights.openingExample}&rdquo;</p>
          </div>

          <div className="space-y-3">
            <div className="border border-card-border bg-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3"><AlertCircle className="h-4 w-4 text-red-400" /><h3 className="font-semibold text-sm text-foreground">Avoid These</h3></div>
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

        <div className="flex justify-center">
          <button onClick={() => setPhase("build")}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-blue-500/20">
            <FileText className="h-4 w-4" /> Write My {selectedField.name} Cover Letter <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── Phase: Build ───────────────────────────────────────────────────────────

  if (phase === "build" && selectedField) {
    const accent = selectedField.color;
    const displayCompany = form.targetCompany || selectedField.name;
    const filename = `${(form.fullName || "cover-letter").replace(/\s+/g, "_")}_${selectedField.name}.pdf`;

    return (
      <div className="w-full">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => setPhase("insights")} className="flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <div className="h-8 w-8 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: selectedField.bg }}>{selectedField.icon}</div>
          <h2 className="text-base font-bold text-foreground">{selectedField.name} Cover Letter</h2>
          <span className="text-xs text-foreground-muted">· {role || "General"}</span>
        </div>

        <div className="flex flex-col xl:flex-row gap-6">
          {/* Form */}
          <div className="xl:w-[420px] shrink-0 space-y-4">
            <FormSection title="Your Details" color={accent}>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Full Name" value={form.fullName} onChange={v => upd("fullName", v)} placeholder="Jane Smith" />
                <Field label="Current Role" value={form.currentRole} onChange={v => upd("currentRole", v)} placeholder="Current designation" />
                <Field label="Email" value={form.email} onChange={v => upd("email", v)} placeholder="jane@email.com" />
                <Field label="Phone" value={form.phone} onChange={v => upd("phone", v)} placeholder="+1 555 000 0000" />
                <Field label="Location" value={form.location} onChange={v => upd("location", v)} placeholder="New York, NY" />
                <Field label="LinkedIn" value={form.linkedin} onChange={v => upd("linkedin", v)} placeholder="linkedin.com/in/jane" />
              </div>
              <div className="mt-3">
                <Field label="Target Company (optional)" value={form.targetCompany} onChange={v => upd("targetCompany", v)} placeholder="e.g. Apollo Hospitals, Deloitte…" />
              </div>
            </FormSection>

            <FormSection title="Your Story" color={accent}>
              <TA label="Your Biggest Achievement" value={form.achievement} onChange={v => upd("achievement", v)}
                placeholder="Describe a key accomplishment relevant to this field…" rows={3} />
              <div className="mt-3">
                <TA label={`Why ${selectedField.name}? Why this role?`} value={form.whyField} onChange={v => upd("whyField", v)}
                  placeholder={`I'm drawn to ${selectedField.name} because…`} rows={3} />
              </div>
              {insights && (
                <div className="mt-2 p-2.5 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                  <p className="text-[11px] text-amber-500 font-semibold">💡 Mention: {insights.mustMention.slice(0, 3).join(", ")}</p>
                </div>
              )}
            </FormSection>

            <FormSection title="Additional Notes" color={accent}>
              <TA label="Anything else to include" value={form.additionalNotes} onChange={v => upd("additionalNotes", v)}
                placeholder="Referral name, specific project you admire, availability…" rows={2} />
            </FormSection>

            <FormSection title="Tone" color={accent}>
              <div className="flex flex-wrap gap-2">
                {TONES.map(t => (
                  <button key={t} onClick={() => upd("tone", t)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${form.tone === t ? "text-white shadow-sm" : "bg-slate-700/50 text-slate-400 hover:bg-slate-700"}`}
                    style={form.tone === t ? { backgroundColor: accent } : undefined}>
                    {t}
                  </button>
                ))}
              </div>
            </FormSection>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button onClick={generateLetter} disabled={generating}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-blue-600 text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 shadow-lg">
                {generating ? <><Loader2 className="h-4 w-4 animate-spin" />Writing your letter…</> : <><Sparkles className="h-4 w-4" />{generatedLetter ? "Regenerate Letter" : `Generate ${selectedField.name} Cover Letter`}</>}
              </button>

              {generatedLetter && (
                <>
                  <button onClick={copyLetter}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl bg-slate-700 text-white font-semibold text-sm hover:bg-slate-600 active:scale-95 transition-all">
                    {copied ? <><Check className="h-4 w-4 text-emerald-400" />Copied!</> : <><Copy className="h-4 w-4" />Copy to Clipboard</>}
                  </button>
                  <button
                    onClick={async () => { setDownloading(true); try { await downloadLetterPDF(previewRef, filename); } finally { setDownloading(false); } }}
                    disabled={downloading}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                    {downloading ? <><Loader2 className="h-4 w-4 animate-spin" />Generating PDF…</> : <><Download className="h-4 w-4" />Download as PDF</>}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Live Preview */}
          <div className="flex-1 min-w-0">
            <div className="border border-card-border rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 sticky top-4">
              <div className="px-3 py-2 bg-card border-b border-card-border flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-foreground-muted" />
                <span className="text-xs text-foreground-muted">Cover Letter Preview</span>
                {generatedLetter && <div className="ml-auto h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />}
              </div>
              <div className="overflow-auto p-4" style={{ maxHeight: "780px" }}>
                <div ref={previewRef} className="bg-white shadow-lg mx-auto" style={{ width: "595px", minHeight: "842px", maxWidth: "100%" }}>
                  <LetterPreview form={form} letter={generatedLetter} company={displayCompany} fieldName={selectedField.name} role={role} color={accent} />
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

// ─── Form section ─────────────────────────────────────────────────────────────

function FormSection({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
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

// ─── Letter preview ───────────────────────────────────────────────────────────

function LetterPreview({ form, letter, company, fieldName, role, color }: {
  form: LetterForm; letter: string; company: string; fieldName: string; role: string; color: string;
}) {
  const [today, setToday] = useState("");
  useEffect(() => {
    setToday(new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
  }, []);
  const contacts = [form.email, form.phone, form.location, form.linkedin].filter(Boolean).join("  ·  ");

  return (
    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "10.5px", lineHeight: 1.7, color: "#1a1a1a", padding: "40px 44px" }}>
      {/* Header */}
      <div style={{ borderBottom: `2px solid ${color}`, paddingBottom: "16px", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 3px", color: "#0a0a0a" }}>{form.fullName || "Your Name"}</h1>
        {form.currentRole && <p style={{ fontSize: "11px", color, margin: "0 0 5px", fontWeight: 500 }}>{form.currentRole}</p>}
        {contacts && <p style={{ fontSize: "9px", color: "#777", margin: 0 }}>{contacts}</p>}
      </div>

      {/* Date */}
      <p style={{ fontSize: "10px", color: "#888", marginBottom: "20px" }}>{today}</p>

      {/* Recipient */}
      <div style={{ marginBottom: "20px" }}>
        <p style={{ fontWeight: 600, margin: "0 0 2px" }}>Hiring Team</p>
        <p style={{ color: "#555", margin: 0 }}>{company}{role && ` — ${role}`}</p>
      </div>

      {/* Letter body */}
      {letter ? (
        <div style={{ color: "#333" }}>
          {letter.split("\n").filter(Boolean).map((para, i) => (
            <p key={i} style={{ marginBottom: "12px" }}>{para}</p>
          ))}
        </div>
      ) : (
        <div style={{ color: "#bbb" }}>
          <p style={{ marginBottom: "12px" }}>Your generated cover letter will appear here after you click &quot;Generate Letter&quot;.</p>
          <p style={{ marginBottom: "12px" }}>Fill in your details on the left, add your key achievement and why you want to work in {fieldName}, then let AI craft a tailored letter.</p>
          <p>The letter will be formatted professionally and ready to download as a PDF.</p>
        </div>
      )}

      {/* Footer */}
      <p style={{ fontSize: "7px", color: "#ddd", marginTop: "32px", textAlign: "center" }}>
        Generated for {fieldName} · ToolHive AI Cover Letter Builder
      </p>
    </div>
  );
}
