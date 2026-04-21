"use client";

import React, { useState, useEffect } from "react";
import { clsx } from "clsx";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Check, Copy, Download, Loader2 } from "lucide-react";
import { useAIGenerate } from "@/hooks/useAIGenerate";

type Tone = "Professional" | "Grateful" | "Formal" | "Brief";

interface FormState {
  name: string;
  position: string;
  company: string;
  manager: string;
  lastDay: string;
  reason: string;
  tone: Tone;
}

export function ResignationLetterWriter() {
  const [form, setForm] = useState<FormState>({
    name: "", position: "", company: "", manager: "",
    lastDay: "", reason: "", tone: "Professional",
  });
  const [letter, setLetter] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { generate, loading, error, output } = useAIGenerate("resignation-letter");

  useEffect(() => { if (output) setLetter(output); }, [output]);

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));

  const isValid = form.name && form.position && form.company;

  const handleGenerate = () =>
    generate({
      name: form.name, position: form.position, company: form.company,
      ...(form.manager && { manager: form.manager }),
      ...(form.lastDay && { lastDay: form.lastDay }),
      ...(form.reason && { reason: form.reason }),
      tone: form.tone,
    });

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
    a.href = url; a.download = "resignation-letter.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  const inputClass = "border border-border rounded-lg px-3 py-2 text-sm bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground";
  const labelClass = "text-sm font-medium text-foreground mb-1 block";
  const cardClass  = "border border-card-border bg-card rounded-2xl p-6";
  const tones: Tone[] = ["Professional", "Grateful", "Formal", "Brief"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Form */}
      <div className={cardClass}>
        <h2 className="text-lg font-semibold text-foreground mb-1">Resignation Letter Writer</h2>
        <p className="text-sm text-foreground-muted mb-6">Fill in your details and get a professional resignation letter instantly.</p>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>Your Full Name</label><input type="text" value={form.name} onChange={set("name")} placeholder="Jane Smith" className={inputClass} /></div>
            <div><label className={labelClass}>Your Position</label><input type="text" value={form.position} onChange={set("position")} placeholder="Software Engineer" className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>Company Name</label><input type="text" value={form.company} onChange={set("company")} placeholder="Acme Corp" className={inputClass} /></div>
            <div><label className={labelClass}>Manager&apos;s Name <span className="text-foreground-muted font-normal">(optional)</span></label><input type="text" value={form.manager} onChange={set("manager")} placeholder="John Doe" className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>Last Working Day <span className="text-foreground-muted font-normal">(optional)</span></label><input type="text" value={form.lastDay} onChange={set("lastDay")} placeholder="e.g. 5th May 2025" className={inputClass} /></div>
            <div><label className={labelClass}>Reason for Leaving <span className="text-foreground-muted font-normal">(optional)</span></label><input type="text" value={form.reason} onChange={set("reason")} placeholder="Pursuing new opportunities" className={inputClass} /></div>
          </div>
          <div>
            <label className={labelClass}>Tone</label>
            <div className="flex flex-wrap gap-2">
              {tones.map((t) => (
                <label key={t} className={clsx("flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-all", form.tone === t ? "border-indigo-400 bg-indigo-50 text-indigo-700 font-medium" : "border-border bg-background text-foreground-muted hover:border-border-strong")}>
                  <input type="radio" name="tone" value={t} checked={form.tone === t} onChange={() => setForm((p) => ({ ...p, tone: t }))} className="sr-only" />{t}
                </label>
              ))}
            </div>
          </div>
          <Button variant="gradient" fullWidth isLoading={loading} loadingText="Generating…" onClick={handleGenerate} disabled={!isValid} className="bg-gradient-to-r from-indigo-500 to-purple-600 mt-2">Generate Resignation Letter</Button>
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
      </div>

      {/* Right: Output */}
      <div className={clsx(cardClass, "flex flex-col")}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Your Resignation Letter</h3>
          {letter && <Badge variant="success" dot>Ready</Badge>}
        </div>
        {loading && (
          <div className="flex flex-col items-center justify-center flex-1 min-h-[300px] gap-3">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            <p className="text-sm text-foreground-muted">Writing your resignation letter…</p>
          </div>
        )}
        {!loading && !letter && (
          <div className="flex flex-col items-center justify-center flex-1 min-h-[300px] text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <p className="text-sm text-foreground-muted">Your resignation letter will appear here after generation.</p>
          </div>
        )}
        {!loading && letter && (
          <div className="flex flex-col flex-1 gap-4">
            <div className="flex-1 bg-background rounded-xl border border-border p-5 overflow-y-auto max-h-[460px]">
              <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">{letter}</pre>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={handleCopy} leftIcon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}>{copied ? "Copied!" : "Copy to Clipboard"}</Button>
              <Button variant="secondary" size="sm" onClick={handleDownload} leftIcon={<Download className="h-3.5 w-3.5" />}>Download (.txt)</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
