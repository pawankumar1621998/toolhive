"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale, Sparkles, ChevronRight, AlertTriangle, CheckCircle2,
  XCircle, Clock, DollarSign, HelpCircle, Loader2, ArrowLeft,
  FileText, Shield, ShieldAlert, ShieldCheck, Copy, Check, Download,
  RefreshCw, Info,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

const DOC_TYPES = [
  { id: "Employment Contract",    icon: "💼", desc: "Job offer, work agreement" },
  { id: "Rental Agreement",       icon: "🏠", desc: "House / apartment lease" },
  { id: "NDA",                    icon: "🔒", desc: "Non-disclosure agreement" },
  { id: "Terms of Service",       icon: "📱", desc: "App / website T&C" },
  { id: "Loan Agreement",         icon: "💰", desc: "Personal / home / car loan" },
  { id: "Service Agreement",      icon: "🤝", desc: "Freelance / vendor contract" },
  { id: "Partnership Deed",       icon: "👥", desc: "Business partnership" },
  { id: "Other",                  icon: "📄", desc: "Any other legal document" },
];

interface RedFlag { clause: string; explanation: string; severity: "Low" | "Medium" | "High"; }
interface Analysis {
  summary: string; riskScore: number; riskLevel: "Low" | "Medium" | "High";
  riskExplanation: string; verdict: string;
  rights: string[]; obligations: string[]; redFlags: RedFlag[];
  financialTerms: string[]; importantDates: string[];
  questionsToAsk: string[]; actionItems: string[];
}

type TabId = "summary" | "rights" | "obligations" | "redflags" | "financial" | "questions";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function riskColor(level: string) {
  if (level === "High") return "#ef4444";
  if (level === "Medium") return "#f59e0b";
  return "#22c55e";
}

function RiskCircle({ score, level }: { score: number; level: string }) {
  const color = riskColor(level);
  const r = 42;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - score / 100);
  return (
    <div className="relative flex items-center justify-center" style={{ width: 108, height: 108 }}>
      <svg width="108" height="108" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="54" cy="54" r={r} fill="none" stroke="#334155" strokeWidth="8" />
        <motion.circle cx="54" cy="54" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: dash }}
          transition={{ duration: 1.2, ease: "easeOut" }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-black" style={{ color }}>{score}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">RISK</span>
      </div>
    </div>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-slate-700 shrink-0">
      {copied ? <><Check className="h-3 w-3 text-emerald-400" />Copied</> : <><Copy className="h-3 w-3" />Copy</>}
    </button>
  );
}

async function downloadReport(ref: { current: HTMLDivElement | null }, filename: string) {
  if (!ref.current) return;
  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");
  const canvas = await html2canvas(ref.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false });
  const imgData = canvas.toDataURL("image/png");
  const A4_W = 595.28, A4_H = 841.89;
  const imgH = (canvas.height / canvas.width) * A4_W;
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  let y = 0;
  while (y < imgH) { if (y > 0) pdf.addPage(); pdf.addImage(imgData, "PNG", 0, -y, A4_W, imgH); y += A4_H; }
  pdf.save(filename);
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LegalAnalyzer() {
  const [phase, setPhase] = useState<"input" | "results">("input");
  const [docType, setDocType] = useState("Employment Contract");
  const [docText, setDocText] = useState("");
  const [docName, setDocName] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("summary");
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const wordCount = docText.trim().split(/\s+/).filter(Boolean).length;

  async function analyze() {
    if (docText.trim().length < 50) { setError("Please paste the document text (at least 50 characters)."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/legal-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentType: docType, documentText: docText }),
      });
      const d = await res.json() as { analysis?: Analysis; error?: string };
      if (d.error) throw new Error(d.error);
      setAnalysis(d.analysis!);
      setPhase("results");
      setActiveTab("summary");
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }

  // ── Phase: Input ───────────────────────────────────────────────────────────

  if (phase === "input") {
    return (
      <div className="w-full max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-violet-500/20">
            <Scale className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">AI Legal Document Analyzer</h1>
          <p className="text-foreground-muted max-w-xl mx-auto">
            Paste any contract, agreement, or terms of service. AI explains it in plain language, flags risky clauses, and tells you what to watch out for — <span className="text-violet-400 font-medium">before you sign</span>.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 mb-6">
          <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-600 dark:text-amber-400">
            <strong>Disclaimer:</strong> This tool provides general information only and does not constitute legal advice. Always consult a qualified lawyer for important decisions.
          </p>
        </div>

        {/* Document type */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-foreground mb-3">Document Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DOC_TYPES.map(dt => (
              <button key={dt.id} onClick={() => setDocType(dt.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all ${docType === dt.id ? "border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/10" : "border-border bg-card hover:border-violet-500/30"}`}>
                <span className="text-xl">{dt.icon}</span>
                <span className={`text-xs font-semibold ${docType === dt.id ? "text-violet-400" : "text-foreground"}`}>{dt.id}</span>
                <span className="text-[10px] text-foreground-muted leading-tight">{dt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Document name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-1.5">Document Name <span className="text-foreground-muted">(optional)</span></label>
          <input value={docName} onChange={e => setDocName(e.target.value)} placeholder="e.g. Apartment Rental Agreement — Jan 2025"
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-colors" />
        </div>

        {/* Document text */}
        <div className="mb-2">
          <label className="block text-sm font-medium text-foreground mb-1.5">Paste Document Text</label>
          <textarea value={docText} onChange={e => setDocText(e.target.value)} rows={12}
            placeholder={`Paste the full text of your ${docType} here...\n\nExample:\n"This Employment Agreement is entered into as of January 1, 2025, between Acme Corp ("Employer") and Jane Smith ("Employee")..."`}
            className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground placeholder:text-foreground-muted/40 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-colors resize-none font-mono" />
        </div>
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs text-foreground-muted">{wordCount} words · {docText.length} characters{docText.length > 6000 ? <span className="text-amber-500 ml-1">(only first 6,000 chars will be analyzed)</span> : ""}</span>
          {docText.length > 0 && <button onClick={() => setDocText("")} className="text-xs text-foreground-muted hover:text-red-400 transition-colors">Clear</button>}
        </div>

        {error && <p className="text-red-400 text-sm mb-4 p-3 bg-red-500/5 border border-red-500/20 rounded-xl">{error}</p>}

        <button onClick={analyze} disabled={loading || docText.trim().length < 50}
          className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none shadow-xl shadow-violet-500/20"
          style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
          {loading
            ? <><Loader2 className="h-5 w-5 animate-spin" />Analyzing your {docType}…</>
            : <><Scale className="h-5 w-5" />Analyze This Document<ChevronRight className="h-5 w-5" /></>}
        </button>
      </div>
    );
  }

  // ── Phase: Results ─────────────────────────────────────────────────────────

  if (phase === "results" && analysis) {
    const rc = riskColor(analysis.riskLevel);

    const TABS: { id: TabId; label: string; icon: React.ElementType; count?: number; color?: string }[] = [
      { id: "summary",     label: "Summary",     icon: FileText },
      { id: "rights",      label: "Your Rights",  icon: ShieldCheck, count: analysis.rights.length,      color: "#22c55e" },
      { id: "obligations", label: "Obligations",  icon: Shield,      count: analysis.obligations.length, color: "#60a5fa" },
      { id: "redflags",    label: "Red Flags",    icon: ShieldAlert, count: analysis.redFlags.length,    color: "#ef4444" },
      { id: "financial",   label: "Financial",    icon: DollarSign,  count: analysis.financialTerms.length },
      { id: "questions",   label: "Questions",    icon: HelpCircle,  count: analysis.questionsToAsk.length, color: "#a78bfa" },
    ];

    return (
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <button onClick={() => setPhase("input")} className="flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">{docName || docType} — Analysis Complete</h2>
            <p className="text-sm text-foreground-muted mt-0.5">{wordCount} words analyzed · Powered by AI</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setPhase("input"); setAnalysis(null); setDocText(""); }}
              className="flex items-center gap-1.5 text-xs border border-border rounded-lg px-3 py-2 text-foreground-muted hover:text-foreground transition-colors">
              <RefreshCw className="h-3.5 w-3.5" /> New Document
            </button>
            <button
              onClick={async () => { setDownloading(true); try { await downloadReport(reportRef, `${(docName || docType).replace(/\s+/g, "_")}_Analysis.pdf`); } finally { setDownloading(false); } }}
              disabled={downloading}
              className="flex items-center gap-1.5 text-xs text-white rounded-lg px-3 py-2 transition-colors disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
              {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              {downloading ? "Saving…" : "Download PDF"}
            </button>
          </div>
        </div>

        {/* Risk overview row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="border border-card-border bg-card rounded-2xl p-5 flex items-center gap-4">
            <RiskCircle score={analysis.riskScore} level={analysis.riskLevel} />
            <div>
              <p className="text-xs text-foreground-muted uppercase tracking-wide mb-1">Risk Level</p>
              <p className="text-xl font-black" style={{ color: rc }}>{analysis.riskLevel}</p>
              <p className="text-xs text-foreground-muted mt-1 leading-snug">{analysis.riskExplanation}</p>
            </div>
          </div>

          <div className="sm:col-span-2 border border-card-border bg-card rounded-2xl p-5">
            <div className="flex items-start gap-2 mb-3">
              {analysis.riskLevel === "High" ? <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" /> :
               analysis.riskLevel === "Medium" ? <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" /> :
               <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: rc }}>Verdict</p>
                <p className="text-sm text-foreground font-medium">{analysis.verdict}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: "Rights",    val: analysis.rights.length,       color: "#22c55e" },
                { label: "Red Flags", val: analysis.redFlags.length,      color: "#ef4444" },
                { label: "Actions",   val: analysis.actionItems.length,   color: "#a78bfa" },
              ].map(({ label, val, color }) => (
                <div key={label} className="text-center p-2 rounded-xl bg-slate-800/40">
                  <p className="text-2xl font-black" style={{ color }}>{val}</p>
                  <p className="text-[10px] text-foreground-muted uppercase tracking-wide">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main analysis area */}
        <div ref={reportRef} className="border border-card-border bg-card rounded-2xl overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-card-border overflow-x-auto bg-card">
            {TABS.map(({ id, label, icon: Icon, count, color }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${activeTab === id ? "text-foreground" : "border-transparent text-foreground-muted hover:text-foreground"}`}
                style={activeTab === id ? { borderBottomColor: color ?? "#7c3aed" } : undefined}>
                <Icon className="h-3.5 w-3.5" />
                {label}
                {count !== undefined && count > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: color ?? "#7c3aed" }}>{count}</span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

                {/* Summary */}
                {activeTab === "summary" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2"><FileText className="h-4 w-4 text-violet-400" />Plain Language Summary</h3>
                      <p className="text-sm text-foreground leading-relaxed bg-violet-500/5 border border-violet-500/20 rounded-xl p-4">{analysis.summary}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" />Action Items</h3>
                      <ul className="space-y-2">
                        {analysis.actionItems.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                            <span className="h-5 w-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                            <span className="text-sm text-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {analysis.importantDates.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Clock className="h-4 w-4 text-amber-400" />Important Dates & Deadlines</h3>
                        <ul className="space-y-2">
                          {analysis.importantDates.map((d, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-foreground p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
                              <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />{d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Rights */}
                {activeTab === "rights" && (
                  <div>
                    <p className="text-xs text-foreground-muted mb-4">What this document gives you — your protections and entitlements.</p>
                    <ul className="space-y-3">
                      {analysis.rights.map((right, i) => (
                        <li key={i} className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">{right}</span>
                          <CopyBtn text={right} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Obligations */}
                {activeTab === "obligations" && (
                  <div>
                    <p className="text-xs text-foreground-muted mb-4">What you must do, provide, or comply with under this agreement.</p>
                    <ul className="space-y-3">
                      {analysis.obligations.map((ob, i) => (
                        <li key={i} className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                          <Shield className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">{ob}</span>
                          <CopyBtn text={ob} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Red Flags */}
                {activeTab === "redflags" && (
                  <div>
                    <p className="text-xs text-foreground-muted mb-4">Clauses that could be unfair, risky, or need negotiation before signing.</p>
                    {analysis.redFlags.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                        <p className="text-sm text-foreground font-medium">No major red flags detected</p>
                        <p className="text-xs text-foreground-muted mt-1">This document appears relatively standard.</p>
                      </div>
                    ) : (
                      <ul className="space-y-3">
                        {analysis.redFlags.map((flag, i) => {
                          const sc = flag.severity === "High" ? "#ef4444" : flag.severity === "Medium" ? "#f59e0b" : "#94a3b8";
                          return (
                            <li key={i} className="p-4 rounded-xl border" style={{ backgroundColor: `${sc}08`, borderColor: `${sc}30` }}>
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: sc }} />
                                <span className="text-sm font-bold text-foreground">{flag.clause}</span>
                                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: sc }}>{flag.severity}</span>
                              </div>
                              <p className="text-sm text-foreground-muted leading-relaxed">{flag.explanation}</p>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}

                {/* Financial */}
                {activeTab === "financial" && (
                  <div>
                    <p className="text-xs text-foreground-muted mb-4">All monetary terms, fees, penalties, and financial obligations in plain language.</p>
                    {analysis.financialTerms.length === 0 ? (
                      <p className="text-sm text-foreground-muted text-center py-8">No financial terms detected in this document.</p>
                    ) : (
                      <ul className="space-y-3">
                        {analysis.financialTerms.map((term, i) => (
                          <li key={i} className="flex items-start gap-3 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                            <DollarSign className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                            <span className="text-sm text-foreground">{term}</span>
                            <CopyBtn text={term} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Questions */}
                {activeTab === "questions" && (
                  <div>
                    <p className="text-xs text-foreground-muted mb-4">Ask these questions to the other party before signing — protect yourself.</p>
                    <ul className="space-y-3">
                      {analysis.questionsToAsk.map((q, i) => (
                        <li key={i} className="flex items-start gap-3 p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
                          <span className="h-6 w-6 rounded-full bg-violet-500 text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                          <span className="text-sm text-foreground">{q}</span>
                          <CopyBtn text={q} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
