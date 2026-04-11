"use client";

import React, { useState } from "react";
import { clsx } from "clsx";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Check, Copy, Download, Loader2 } from "lucide-react";
import { apiPost } from "@/lib/api";
import { AxiosError } from "axios";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tone = "Professional" | "Enthusiastic" | "Formal" | "Concise";

interface FormState {
  fullName: string;
  email: string;
  jobTitle: string;
  companyName: string;
  hiringManager: string;
  jobDescription: string;
  tone: Tone;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CoverLetterGen() {
  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    jobTitle: "",
    companyName: "",
    hiringManager: "",
    jobDescription: "",
    tone: "Professional",
  });
  const [loading, setLoading] = useState(false);
  const [letter, setLetter] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const isValid = form.fullName && form.email && form.jobTitle && form.companyName && form.jobDescription;

  const handleGenerate = async () => {
    if (!isValid) return;
    setLoading(true);
    setLetter(null);
    setError(null);
    try {
      const res = await apiPost<{ result: string }>("/tools/ai/cover-letter", {
        name: form.fullName,
        jobTitle: form.jobTitle,
        company: form.companyName,
        experience: form.jobDescription,
        skills: form.hiringManager
          ? `Tone: ${form.tone}. Addressed to: ${form.hiringManager}`
          : `Tone: ${form.tone}`,
        options: { tone: form.tone },
      });
      setLetter(res.data.result);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(axiosErr.response?.data?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!letter) return;
    navigator.clipboard.writeText(letter).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    if (!letter) return;
    const blob = new Blob([letter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cover-letter.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputClass = "border border-border rounded-lg px-3 py-2 text-sm bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground";
  const textareaClass = clsx(inputClass, "resize-none");
  const labelClass = "text-sm font-medium text-foreground mb-1 block";
  const cardClass = "border border-card-border bg-card rounded-2xl p-6";
  const tones: Tone[] = ["Professional", "Enthusiastic", "Formal", "Concise"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ── Left: Form ── */}
      <div className={cardClass}>
        <h2 className="text-lg font-semibold text-foreground mb-1">Cover Letter Generator</h2>
        <p className="text-sm text-foreground-muted mb-6">Fill in your details and generate a personalized cover letter instantly.</p>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Your Full Name</label>
              <input type="text" value={form.fullName} onChange={set("fullName")} placeholder="Jane Smith" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Your Email</label>
              <input type="email" value={form.email} onChange={set("email")} placeholder="jane@example.com" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Job Title Applying For</label>
              <input type="text" value={form.jobTitle} onChange={set("jobTitle")} placeholder="Product Manager" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Company Name</label>
              <input type="text" value={form.companyName} onChange={set("companyName")} placeholder="Acme Corp" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Hiring Manager Name <span className="text-foreground-muted font-normal">(optional)</span></label>
            <input type="text" value={form.hiringManager} onChange={set("hiringManager")} placeholder="Hiring Manager" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Paste Job Description</label>
            <textarea
              value={form.jobDescription}
              onChange={set("jobDescription")}
              placeholder="Paste the full job description here…"
              rows={6}
              className={textareaClass}
            />
          </div>

          {/* Tone */}
          <div>
            <label className={labelClass}>Tone</label>
            <div className="flex flex-wrap gap-2">
              {tones.map((t) => (
                <label
                  key={t}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-all",
                    form.tone === t
                      ? "border-indigo-400 bg-indigo-50 text-indigo-700 font-medium"
                      : "border-border bg-background text-foreground-muted hover:border-border-strong"
                  )}
                >
                  <input
                    type="radio"
                    name="tone"
                    value={t}
                    checked={form.tone === t}
                    onChange={() => setForm((p) => ({ ...p, tone: t }))}
                    className="sr-only"
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>

          <Button
            variant="gradient"
            fullWidth
            isLoading={loading}
            loadingText="Generating…"
            onClick={handleGenerate}
            disabled={!isValid}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 mt-2"
          >
            Generate Cover Letter
          </Button>
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
      </div>

      {/* ── Right: Output ── */}
      <div className={clsx(cardClass, "flex flex-col")}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Your Cover Letter</h3>
          {letter && <Badge variant="success" dot>Ready</Badge>}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center flex-1 min-h-[300px] gap-3">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            <p className="text-sm text-foreground-muted">Crafting your cover letter…</p>
          </div>
        )}

        {!loading && !letter && (
          <div className="flex flex-col items-center justify-center flex-1 min-h-[300px] text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm text-foreground-muted">Your cover letter will appear here after generation.</p>
          </div>
        )}

        {!loading && letter && (
          <div className="flex flex-col flex-1 gap-4">
            <div className="flex-1 bg-background rounded-xl border border-border p-5 overflow-y-auto max-h-[460px]">
              <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">{letter}</pre>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                leftIcon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              >
                {copied ? "Copied!" : "Copy to Clipboard"}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownload}
                leftIcon={<Download className="h-3.5 w-3.5" />}
              >
                Download as PDF
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
