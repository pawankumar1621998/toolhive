"use client";

import React, { useRef, useState } from "react";
import { clsx } from "clsx";
import { Upload, FileText, CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Tool } from "@/types";

import { ResumeBuilder } from "./ResumeBuilder";
import { ResumeAnalyzerUI } from "./ResumeAnalyzerUI";
import { SkillsSuggester } from "./SkillsSuggester";
import { CoverLetterGen } from "./CoverLetterGen";
import { ATSCheckerUI } from "./ATSCheckerUI";
import { JobMatchUI } from "./JobMatchUI";
import { ResumeSummaryGen } from "./ResumeSummaryGen";
import { LinkedInWriter } from "./LinkedInWriter";
import { InterviewPrepUI } from "./InterviewPrepUI";
import { KeywordOptimizer } from "./KeywordOptimizer";

// ─── Inline Formatter Component ───────────────────────────────────────────────

function ResumeFormatter() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fontFamily, setFontFamily] = useState("inter");
  const [fontSize, setFontSize] = useState("11");
  const [margin, setMargin] = useState("normal");
  const [spacing, setSpacing] = useState("1.15");
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  function handleFile(file: File) {
    setSelectedFile(file);
    setIsDone(false);
  }

  function handleFormat() {
    if (!selectedFile) return;
    setIsLoading(true);
    setIsDone(false);
    setTimeout(() => {
      setIsLoading(false);
      setIsDone(true);
    }, 2000);
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Upload */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        onClick={() => inputRef.current?.click()}
        className={clsx(
          "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.doc"
          className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        {selectedFile ? (
          <div className="flex flex-col items-center gap-2">
            <FileText className="h-10 w-10 text-primary" />
            <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
            <p className="text-xs text-foreground-muted">Click to change file</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-10 w-10 text-foreground-muted" />
            <p className="text-sm font-medium text-foreground">Drop your resume here</p>
            <p className="text-xs text-foreground-muted">PDF or DOCX · Max 10 MB</p>
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
              Browse Files
            </Button>
          </div>
        )}
      </div>

      {/* Format Options */}
      <div className="border border-card-border bg-card rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground-muted">Font Family</label>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
          >
            <option value="inter">Inter (Modern)</option>
            <option value="georgia">Georgia (Classic)</option>
            <option value="garamond">Garamond (Elegant)</option>
            <option value="helvetica">Helvetica (Clean)</option>
            <option value="times">Times New Roman (Traditional)</option>
            <option value="calibri">Calibri (Professional)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground-muted">Font Size</label>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
          >
            <option value="10">10 pt</option>
            <option value="10.5">10.5 pt</option>
            <option value="11">11 pt (Recommended)</option>
            <option value="11.5">11.5 pt</option>
            <option value="12">12 pt</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground-muted">Margin</label>
          <select
            value={margin}
            onChange={(e) => setMargin(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
          >
            <option value="narrow">Narrow (0.5 in)</option>
            <option value="normal">Normal (1 in)</option>
            <option value="wide">Wide (1.25 in)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground-muted">Line Spacing</label>
          <select
            value={spacing}
            onChange={(e) => setSpacing(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
          >
            <option value="1.0">Single (1.0)</option>
            <option value="1.15">1.15 (Recommended)</option>
            <option value="1.5">1.5</option>
            <option value="2.0">Double (2.0)</option>
          </select>
        </div>
      </div>

      {/* Action */}
      <Button
        variant="primary"
        fullWidth
        isLoading={isLoading}
        loadingText="Formatting resume…"
        disabled={!selectedFile}
        onClick={handleFormat}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 hover:opacity-90"
      >
        Format Resume
      </Button>

      {/* Success */}
      {isDone && (
        <div className="border border-card-border bg-card rounded-2xl p-6 flex flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-7 w-7 text-emerald-500" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">Resume formatted successfully!</p>
            <p className="text-sm text-foreground-muted mt-1">
              Applied: {fontFamily} {fontSize}pt · {margin} margins · {spacing} spacing
            </p>
          </div>
          <Button
            variant="primary"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 hover:opacity-90"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={() => {
              const link = document.createElement("a");
              link.href = "#";
              link.download = selectedFile?.name.replace(/\.[^.]+$/, "_formatted.pdf") ?? "resume_formatted.pdf";
              link.click();
            }}
          >
            Download Formatted Resume
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Fallback ─────────────────────────────────────────────────────────────────

function ComingSoon({ slug }: { slug: string }) {
  return (
    <div className="border border-card-border bg-card rounded-2xl p-12 flex flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl font-bold">
        ?
      </div>
      <div>
        <p className="text-base font-semibold text-foreground">Tool coming soon</p>
        <p className="text-sm text-foreground-muted mt-1">
          The <span className="font-medium text-foreground">{slug}</span> tool is currently under development.
        </p>
      </div>
    </div>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────

export function ResumeToolWorkspace({ tool }: { tool: Tool }) {
  switch (tool.slug) {
    case "builder":
      return <ResumeBuilder />;
    case "analyzer":
      return <ResumeAnalyzerUI />;
    case "skills-suggest":
      return <SkillsSuggester />;
    case "cover-letter":
      return <CoverLetterGen />;
    case "formatter":
      return <ResumeFormatter />;
    case "ats-checker":
      return <ATSCheckerUI />;
    case "job-match":
      return <JobMatchUI />;
    case "summary":
      return <ResumeSummaryGen />;
    case "linkedin":
      return <LinkedInWriter />;
    case "interview-prep":
      return <InterviewPrepUI />;
    case "keywords":
      return <KeywordOptimizer />;
    default:
      return <ComingSoon slug={tool.slug} />;
  }
}
