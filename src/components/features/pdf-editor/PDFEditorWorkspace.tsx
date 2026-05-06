"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import {
  Upload, FileText, Download, Type, Square, Circle, PenTool,
  Trash2, X, Plus, Minus, Undo2, Redo2, ZoomIn, ZoomOut,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic,
  Palette, Move, MousePointer, Highlighter, Eraser, Save,
  ChevronRight, ChevronLeft, Check, UploadCloud, Image, Star
} from "lucide-react";
import type { Tool } from "@/types";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const cardClass = "rounded-xl border border-card-border bg-background-subtle p-4";
const primaryBtn = "h-11 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed";
const secondaryBtn = "h-11 px-6 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-background-subtle transition-colors";
const inputClass = "w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-orange-500/30";
const toolbarBtn = "p-2.5 rounded-lg hover:bg-background-subtle transition-colors text-foreground-muted hover:text-foreground disabled:opacity-50";
const activeToolBtn = "p-2.5 rounded-lg bg-orange-500 text-white transition-colors";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Annotation {
  id: string;
  type: "text" | "rect" | "circle" | "line" | "highlight";
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  color: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: string;
  pageIndex: number;
}

interface CVData {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: Array<{ title: string; company: string; duration: string; description: string }>;
  education: Array<{ degree: string; school: string; year: string; grade: string }>;
  skills: string[];
  languages: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF Upload Component
// ─────────────────────────────────────────────────────────────────────────────

function PDFUpload({ onFile }: { onFile: (file: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div
        className={clsx(
          "border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer",
          dragging ? "border-orange-500 bg-orange-50/50 dark:bg-orange-900/20" : "border-border hover:border-orange-400"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file && file.type === "application/pdf") onFile(file);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
          <UploadCloud className="h-10 w-10 text-orange-500" />
        </div>
        <h3 className="text-xl font-bold mb-2">Upload PDF to Edit</h3>
        <p className="text-sm text-foreground-muted mb-4">Drag & drop your PDF here or click to browse</p>
        <p className="text-xs text-foreground-subtle">Supports PDF files up to 50MB</p>
        <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF Editor Canvas Component
// ─────────────────────────────────────────────────────────────────────────────

function PDFCanvasEditor({
  pdfDoc,
  pageCount,
  currentPage,
  setCurrentPage,
  annotations,
  setAnnotations,
  selectedTool,
  color,
  fontSize,
  fontWeight,
  textAlign,
  scale,
  onDownload,
}: {
  pdfDoc: any;
  pageCount: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  annotations: Annotation[];
  setAnnotations: (ann: Annotation[]) => void;
  selectedTool: string;
  color: string;
  fontSize: number;
  fontWeight: string;
  textAlign: string;
  scale: number;
  onDownload: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [tempRect, setTempRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [history, setHistory] = useState<Annotation[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Render PDF page
  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;

      const page = await pdfDoc.getPage(currentPage + 1);
      const viewport = page.getViewport({ scale });

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;

      // Draw annotations for current page
      drawAnnotations(viewport);
    };

    renderPage();
  }, [pdfDoc, currentPage, scale]);

  function drawAnnotations(viewport: any) {
    if (!overlayRef.current) return;
    const canvas = overlayRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pageAnnotations = annotations.filter(a => a.pageIndex === currentPage);

    pageAnnotations.forEach(ann => {
      ctx.strokeStyle = ann.color;
      ctx.fillStyle = ann.color;
      ctx.lineWidth = 2;

      switch (ann.type) {
        case "rect":
          ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);
          break;
        case "circle":
          ctx.beginPath();
          ctx.ellipse(
            ann.x + ann.width / 2,
            ann.y + ann.height / 2,
            ann.width / 2,
            ann.height / 2,
            0, 0, 2 * Math.PI
          );
          ctx.stroke();
          break;
        case "line":
          if (ann.content) {
            const path = JSON.parse(ann.content);
            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);
            path.forEach((p: { x: number; y: number }) => ctx.lineTo(p.x, p.y));
            ctx.stroke();
          }
          break;
        case "highlight":
          ctx.globalAlpha = 0.3;
          ctx.fillRect(ann.x, ann.y, ann.width, ann.height);
          ctx.globalAlpha = 1;
          break;
        case "text":
          ctx.font = `${ann.fontWeight || "normal"} ${ann.fontSize || 14}px Arial`;
          ctx.fillText(ann.content || "", ann.x, ann.y);
          break;
      }
    });
  }

  function addToHistory(newAnnotations: Annotation[]) {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newAnnotations);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }

  function undo() {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setAnnotations(history[historyIndex - 1]);
    }
  }

  function redo() {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setAnnotations(history[historyIndex + 1]);
    }
  }

  function getCanvasCoords(e: React.MouseEvent) {
    const canvas = overlayRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function handleMouseDown(e: React.MouseEvent) {
    const pos = getCanvasCoords(e);
    setStartPos(pos);
    setIsDrawing(true);

    if (selectedTool === "pen") {
      setCurrentPath([pos]);
    }
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDrawing) return;
    const pos = getCanvasCoords(e);

    if (selectedTool === "pen") {
      setCurrentPath(prev => [...prev, pos]);
    } else if (selectedTool === "rect" || selectedTool === "circle" || selectedTool === "highlight") {
      setTempRect({
        x: Math.min(startPos.x, pos.x),
        y: Math.min(startPos.y, pos.y),
        w: Math.abs(pos.x - startPos.x),
        h: Math.abs(pos.y - startPos.y),
      });
    }
  }

  function handleMouseUp(e: React.MouseEvent) {
    if (!isDrawing) return;
    const pos = getCanvasCoords(e);
    setIsDrawing(false);

    if (selectedTool === "text") {
      const text = prompt("Enter text:");
      if (text) {
        const newAnn: Annotation = {
          id: Date.now().toString(),
          type: "text",
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          content: text,
          color,
          fontSize,
          fontWeight,
          textAlign,
          pageIndex: currentPage,
        };
        const newAnnotations = [...annotations, newAnn];
        setAnnotations(newAnnotations);
        addToHistory(newAnnotations);
      }
    } else if (selectedTool === "rect") {
      const newAnn: Annotation = {
        id: Date.now().toString(),
        type: "rect",
        x: Math.min(startPos.x, pos.x),
        y: Math.min(startPos.y, pos.y),
        width: Math.abs(pos.x - startPos.x),
        height: Math.abs(pos.y - startPos.y),
        color,
        pageIndex: currentPage,
      };
      const newAnnotations = [...annotations, newAnn];
      setAnnotations(newAnnotations);
      addToHistory(newAnnotations);
    } else if (selectedTool === "circle") {
      const newAnn: Annotation = {
        id: Date.now().toString(),
        type: "circle",
        x: Math.min(startPos.x, pos.x),
        y: Math.min(startPos.y, pos.y),
        width: Math.abs(pos.x - startPos.x),
        height: Math.abs(pos.y - startPos.y),
        color,
        pageIndex: currentPage,
      };
      const newAnnotations = [...annotations, newAnn];
      setAnnotations(newAnnotations);
      addToHistory(newAnnotations);
    } else if (selectedTool === "highlight") {
      const newAnn: Annotation = {
        id: Date.now().toString(),
        type: "highlight",
        x: Math.min(startPos.x, pos.x),
        y: Math.min(startPos.y, pos.y),
        width: Math.abs(pos.x - startPos.x),
        height: Math.abs(pos.y - startPos.y),
        color,
        pageIndex: currentPage,
      };
      const newAnnotations = [...annotations, newAnn];
      setAnnotations(newAnnotations);
      addToHistory(newAnnotations);
    } else if (selectedTool === "pen" && currentPath.length > 1) {
      const newAnn: Annotation = {
        id: Date.now().toString(),
        type: "line",
        x: currentPath[0].x,
        y: currentPath[0].y,
        width: 0,
        height: 0,
        content: JSON.stringify(currentPath),
        color,
        pageIndex: currentPage,
      };
      const newAnnotations = [...annotations, newAnn];
      setAnnotations(newAnnotations);
      addToHistory(newAnnotations);
    }

    setTempRect(null);
    setCurrentPath([]);
  }

  return (
    <div className="space-y-4">
      {/* Page Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className={toolbarBtn}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium px-3 py-1.5 rounded-lg bg-background-subtle">
            Page {currentPage + 1} of {pageCount}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(pageCount - 1, currentPage + 1))}
            disabled={currentPage === pageCount - 1}
            className={toolbarBtn}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <button onClick={onDownload} className={primaryBtn + " flex items-center gap-2"}>
          <Download className="h-4 w-4" /> Download PDF
        </button>
      </div>

      {/* Canvas Container */}
      <div className="relative border border-border rounded-xl overflow-auto bg-gray-100 dark:bg-gray-800 p-4">
        <div className="relative inline-block shadow-lg">
          <canvas ref={canvasRef} className="block" />
          <canvas
            ref={overlayRef}
            className={clsx(
              "absolute top-0 left-0 cursor-crosshair",
              selectedTool === "select" && "cursor-default"
            )}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              setIsDrawing(false);
              setTempRect(null);
            }}
          />

          {/* Temp rectangle preview */}
          {tempRect && (
            <svg
              className="absolute top-0 left-0 pointer-events-none"
              width={overlayRef.current?.width || 0}
              height={overlayRef.current?.height || 0}
            >
              {selectedTool === "rect" && (
                <rect
                  x={tempRect.x}
                  y={tempRect.y}
                  width={tempRect.w}
                  height={tempRect.h}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  strokeDasharray="5,5"
                />
              )}
              {selectedTool === "circle" && (
                <ellipse
                  cx={tempRect.x + tempRect.w / 2}
                  cy={tempRect.y + tempRect.h / 2}
                  rx={tempRect.w / 2}
                  ry={tempRect.h / 2}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  strokeDasharray="5,5"
                />
              )}
              {selectedTool === "highlight" && (
                <rect
                  x={tempRect.x}
                  y={tempRect.y}
                  width={tempRect.w}
                  height={tempRect.h}
                  fill={color}
                  fillOpacity={0.3}
                />
              )}
            </svg>
          )}

          {/* Pen drawing preview */}
          {isDrawing && selectedTool === "pen" && currentPath.length > 0 && (
            <svg
              className="absolute top-0 left-0 pointer-events-none"
              width={overlayRef.current?.width || 0}
              height={overlayRef.current?.height || 0}
            >
              <path
                d={`M ${currentPath.map(p => `${p.x} ${p.y}`).join(" L ")}`}
                fill="none"
                stroke={color}
                strokeWidth={2}
              />
            </svg>
          )}
        </div>
      </div>

      {/* Undo/Redo */}
      <div className="flex items-center gap-2 justify-end">
        <span className="text-xs text-foreground-muted mr-2">{annotations.filter(a => a.pageIndex === currentPage).length} annotations</span>
        <button onClick={undo} disabled={historyIndex === 0} className={toolbarBtn} title="Undo">
          <Undo2 className="h-4 w-4" />
        </button>
        <button onClick={redo} disabled={historyIndex === history.length - 1} className={toolbarBtn} title="Redo">
          <Redo2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CV Builder Component
// ─────────────────────────────────────────────────────────────────────────────

function CVBuilder({ onGenerate }: { onGenerate: (data: CVData) => void }) {
  const [step, setStep] = useState(1);
  const [cvData, setCVData] = useState<CVData>({
    name: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
    experience: [{ title: "", company: "", duration: "", description: "" }],
    education: [{ degree: "", school: "", year: "", grade: "" }],
    skills: [],
    languages: [],
  });
  const [skillInput, setSkillInput] = useState("");
  const [langInput, setLangInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  function updateCV(field: keyof CVData, value: any) {
    setCVData({ ...cvData, [field]: value });
  }

  function addExperience() {
    setCVData({ ...cvData, experience: [...cvData.experience, { title: "", company: "", duration: "", description: "" }] });
  }

  function updateExperience(i: number, field: string, value: string) {
    const updated = [...cvData.experience];
    updated[i] = { ...updated[i], [field]: value };
    setCVData({ ...cvData, experience: updated });
  }

  function removeExperience(i: number) {
    setCVData({ ...cvData, experience: cvData.experience.filter((_, idx) => idx !== i) });
  }

  function addEducation() {
    setCVData({ ...cvData, education: [...cvData.education, { degree: "", school: "", year: "", grade: "" }] });
  }

  function updateEducation(i: number, field: string, value: string) {
    const updated = [...cvData.education];
    updated[i] = { ...updated[i], [field]: value };
    setCVData({ ...cvData, education: updated });
  }

  function removeEducation(i: number) {
    setCVData({ ...cvData, education: cvData.education.filter((_, idx) => idx !== i) });
  }

  function addSkill() {
    if (skillInput.trim() && !cvData.skills.includes(skillInput.trim())) {
      setCVData({ ...cvData, skills: [...cvData.skills, skillInput.trim()] });
      setSkillInput("");
    }
  }

  function removeSkill(i: number) {
    setCVData({ ...cvData, skills: cvData.skills.filter((_, idx) => idx !== i) });
  }

  function addLanguage() {
    if (langInput.trim() && !cvData.languages.includes(langInput.trim())) {
      setCVData({ ...cvData, languages: [...cvData.languages, langInput.trim()] });
      setLangInput("");
    }
  }

  function removeLanguage(i: number) {
    setCVData({ ...cvData, languages: cvData.languages.filter((_, idx) => idx !== i) });
  }

  async function handleGenerate() {
    setIsGenerating(true);
    await onGenerate(cvData);
    setIsGenerating(false);
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <button
              onClick={() => setStep(s)}
              className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                step === s ? "bg-orange-500 text-white ring-4 ring-orange-200" :
                step > s ? "bg-green-500 text-white" : "bg-border text-foreground-muted"
              )}
            >
              {step > s ? <Check className="h-5 w-5" /> : s}
            </button>
            {s < 3 && (
              <div className={clsx("w-16 h-1 mx-2 rounded", step > s ? "bg-green-500" : "bg-border")} />
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-6 text-sm">
        <span className={step >= 1 ? "text-foreground font-medium" : "text-foreground-muted"}>Personal Info</span>
        <span className={step >= 2 ? "text-foreground font-medium" : "text-foreground-muted"}>Experience</span>
        <span className={step >= 3 ? "text-foreground font-medium" : "text-foreground-muted"}>Skills & Education</span>
      </div>

      {/* Step 1: Personal Info */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
          <h3 className="text-lg font-bold">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Full Name *</label>
              <input className={inputClass} placeholder="Rahul Sharma" value={cvData.name}
                onChange={(e) => updateCV("name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email *</label>
              <input className={inputClass} placeholder="rahul@email.com" type="email" value={cvData.email}
                onChange={(e) => updateCV("email", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phone</label>
              <input className={inputClass} placeholder="+91 98765 43210" value={cvData.phone}
                onChange={(e) => updateCV("phone", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Location</label>
              <input className={inputClass} placeholder="Mumbai, India" value={cvData.location}
                onChange={(e) => updateCV("location", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Professional Summary</label>
            <textarea className={inputClass} rows={4} placeholder="Brief overview of your professional background, key skills, and career goals..."
              value={cvData.summary} onChange={(e) => updateCV("summary", e.target.value)} />
          </div>
          <button onClick={() => setStep(2)} className={primaryBtn + " flex items-center gap-2"}>
            Next: Experience <ChevronRight className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      {/* Step 2: Experience */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
          <h3 className="text-lg font-bold">Work Experience</h3>
          {cvData.experience.map((exp, i) => (
            <div key={i} className={cardClass + " space-y-3"}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground-muted">Position {i + 1}</span>
                {cvData.experience.length > 1 && (
                  <button onClick={() => removeExperience(i)} className="text-red-500 hover:text-red-600 p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input className={inputClass} placeholder="Job Title" value={exp.title}
                  onChange={(e) => updateExperience(i, "title", e.target.value)} />
                <input className={inputClass} placeholder="Company Name" value={exp.company}
                  onChange={(e) => updateExperience(i, "company", e.target.value)} />
              </div>
              <input className={inputClass} placeholder="Duration (e.g. Jan 2020 - Present)" value={exp.duration}
                onChange={(e) => updateExperience(i, "duration", e.target.value)} />
              <textarea className={inputClass} rows={3} placeholder="Key responsibilities and achievements..."
                value={exp.description} onChange={(e) => updateExperience(i, "description", e.target.value)} />
            </div>
          ))}
          <button onClick={addExperience} className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add Another Position
          </button>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className={secondaryBtn}>Back</button>
            <button onClick={() => setStep(3)} className={primaryBtn + " flex items-center gap-2"}>
              Next: Skills <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Education & Skills */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
          <h3 className="text-lg font-bold">Education</h3>
          {cvData.education.map((edu, i) => (
            <div key={i} className={cardClass + " space-y-3"}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground-muted">Education {i + 1}</span>
                {cvData.education.length > 1 && (
                  <button onClick={() => removeEducation(i)} className="text-red-500 hover:text-red-600 p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input className={inputClass} placeholder="Degree / Course" value={edu.degree}
                  onChange={(e) => updateEducation(i, "degree", e.target.value)} />
                <input className={inputClass} placeholder="School / University" value={edu.school}
                  onChange={(e) => updateEducation(i, "school", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input className={inputClass} placeholder="Year (e.g. 2020)" value={edu.year}
                  onChange={(e) => updateEducation(i, "year", e.target.value)} />
                <input className={inputClass} placeholder="Grade / GPA" value={edu.grade}
                  onChange={(e) => updateEducation(i, "grade", e.target.value)} />
              </div>
            </div>
          ))}
          <button onClick={addEducation} className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add Education
          </button>

          <h3 className="text-lg font-bold mt-6">Skills</h3>
          <div className="flex gap-2">
            <input className={inputClass + " flex-1"} placeholder="Type a skill and press Enter" value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} />
            <button onClick={addSkill} className="px-4 py-2.5 rounded-xl border border-border hover:bg-background-subtle font-medium text-sm">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {cvData.skills.map((skill, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium flex items-center gap-2">
                {skill}
                <button onClick={() => removeSkill(i)} className="hover:text-orange-900"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>

          <h3 className="text-lg font-bold mt-6">Languages (Optional)</h3>
          <div className="flex gap-2">
            <input className={inputClass + " flex-1"} placeholder="Type a language and press Enter" value={langInput}
              onChange={(e) => setLangInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLanguage())} />
            <button onClick={addLanguage} className="px-4 py-2.5 rounded-xl border border-border hover:bg-background-subtle font-medium text-sm">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {cvData.languages.map((lang, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium flex items-center gap-2">
                {lang}
                <button onClick={() => removeLanguage(i)} className="hover:text-blue-900"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={() => setStep(2)} className={secondaryBtn}>Back</button>
            <button onClick={handleGenerate} disabled={isGenerating || !cvData.name} className={primaryBtn + " flex items-center gap-2"}>
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" /> Generate CV PDF
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CV from Reference Component
// ─────────────────────────────────────────────────────────────────────────────

function CVFromReference({ onGenerate }: { onGenerate: (data: CVData) => void }) {
  const [step, setStep] = useState<"select" | "upload" | "form">("select");
  const [referenceName, setReferenceName] = useState("");
  const [template, setTemplate] = useState<string>("professional");
  const fileRef = useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [cvData, setCVData] = useState<CVData>({
    name: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
    experience: [{ title: "", company: "", duration: "", description: "" }],
    education: [{ degree: "", school: "", year: "", grade: "" }],
    skills: [],
    languages: [],
  });
  const [skillInput, setSkillInput] = useState("");

  function updateCV(field: keyof CVData, value: any) {
    setCVData({ ...cvData, [field]: value });
  }

  function addExperience() {
    setCVData({ ...cvData, experience: [...cvData.experience, { title: "", company: "", duration: "", description: "" }] });
  }

  function updateExperience(i: number, field: string, value: string) {
    const updated = [...cvData.experience];
    updated[i] = { ...updated[i], [field]: value };
    setCVData({ ...cvData, experience: updated });
  }

  function removeExperience(i: number) {
    setCVData({ ...cvData, experience: cvData.experience.filter((_, idx) => idx !== i) });
  }

  function addEducation() {
    setCVData({ ...cvData, education: [...cvData.education, { degree: "", school: "", year: "", grade: "" }] });
  }

  function updateEducation(i: number, field: string, value: string) {
    const updated = [...cvData.education];
    updated[i] = { ...updated[i], [field]: value };
    setCVData({ ...cvData, education: updated });
  }

  function removeEducation(i: number) {
    setCVData({ ...cvData, education: cvData.education.filter((_, idx) => idx !== i) });
  }

  function addSkill() {
    if (skillInput.trim() && !cvData.skills.includes(skillInput.trim())) {
      setCVData({ ...cvData, skills: [...cvData.skills, skillInput.trim()] });
      setSkillInput("");
    }
  }

  function removeSkill(i: number) {
    setCVData({ ...cvData, skills: cvData.skills.filter((_, idx) => idx !== i) });
  }

  function handleFile(file: File) {
    // Use file name as reference
    const name = file.name.replace(".pdf", "").replace(/-/g, " ").replace(/_/g, " ");
    setReferenceName(name);
    setStep("form");
  }

  function useTemplate(name: string) {
    setReferenceName(name);
    setStep("form");
  }

  async function handleGenerate() {
    setIsGenerating(true);
    await onGenerate(cvData);
    setIsGenerating(false);
  }

  return (
    <div className="space-y-6">
      {step === "select" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Choose a CV Template</h3>
            <p className="text-foreground-muted">Select a professional template format to create your CV</p>
          </div>

          {/* Template Options */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: "professional", name: "Professional", desc: "Clean & corporate", color: "from-blue-500 to-blue-600" },
              { id: "modern", name: "Modern", desc: "Sleek & bold", color: "from-purple-500 to-pink-500" },
              { id: "simple", name: "Simple", desc: "Minimal & classic", color: "from-gray-500 to-gray-600" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => useTemplate(t.id)}
                className={clsx(
                  "p-4 rounded-xl border-2 border-border hover:border-orange-400 transition-all text-left",
                  template === t.id && "border-orange-500 ring-2 ring-orange-200"
                )}
              >
                <div className={clsx("w-12 h-16 rounded mb-3 bg-gradient-to-br", t.color)} />
                <h4 className="font-bold">{t.name}</h4>
                <p className="text-xs text-foreground-muted">{t.desc}</p>
              </button>
            ))}
          </div>

          <div className="text-center text-foreground-muted">or</div>

          {/* Upload Reference */}
          <div
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-orange-400 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-12 w-12 mx-auto mb-3 text-foreground-muted" />
            <p className="text-sm font-medium">Upload Reference CV (PDF)</p>
            <p className="text-xs text-foreground-muted mt-1">We'll match the format while you fill in your details</p>
            <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }} />
          </div>
        </motion.div>
      )}

      {step === "form" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Fill Your Details</h3>
              <p className="text-sm text-foreground-muted">Template: <span className="font-medium capitalize">{referenceName}</span></p>
            </div>
            <button onClick={() => setStep("select")} className="text-sm text-orange-500 hover:text-orange-600">
              Change Template
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Full Name *</label>
              <input className={inputClass} placeholder="Your Full Name" value={cvData.name}
                onChange={(e) => updateCV("name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email *</label>
              <input className={inputClass} placeholder="your@email.com" value={cvData.email}
                onChange={(e) => updateCV("email", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phone</label>
              <input className={inputClass} placeholder="+91 98765 43210" value={cvData.phone}
                onChange={(e) => updateCV("phone", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Location</label>
              <input className={inputClass} placeholder="City, Country" value={cvData.location}
                onChange={(e) => updateCV("location", e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Professional Summary</label>
            <textarea className={inputClass} rows={3} placeholder="Brief overview of your background..."
              value={cvData.summary} onChange={(e) => updateCV("summary", e.target.value)} />
          </div>

          <h4 className="font-bold">Work Experience</h4>
          {cvData.experience.map((exp, i) => (
            <div key={i} className={cardClass + " space-y-3"}>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-foreground-muted">Position {i + 1}</span>
                {cvData.experience.length > 1 && (
                  <button onClick={() => removeExperience(i)} className="text-red-500"><Trash2 className="h-4 w-4" /></button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input className={inputClass} placeholder="Job Title" value={exp.title}
                  onChange={(e) => updateExperience(i, "title", e.target.value)} />
                <input className={inputClass} placeholder="Company" value={exp.company}
                  onChange={(e) => updateExperience(i, "company", e.target.value)} />
              </div>
              <input className={inputClass} placeholder="Duration" value={exp.duration}
                onChange={(e) => updateExperience(i, "duration", e.target.value)} />
              <textarea className={inputClass} rows={2} placeholder="Description" value={exp.description}
                onChange={(e) => updateExperience(i, "description", e.target.value)} />
            </div>
          ))}
          <button onClick={addExperience} className="text-sm text-orange-500 flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add Experience
          </button>

          <h4 className="font-bold">Education</h4>
          {cvData.education.map((edu, i) => (
            <div key={i} className={cardClass + " space-y-3"}>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-foreground-muted">Education {i + 1}</span>
                {cvData.education.length > 1 && (
                  <button onClick={() => removeEducation(i)} className="text-red-500"><Trash2 className="h-4 w-4" /></button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input className={inputClass} placeholder="Degree" value={edu.degree}
                  onChange={(e) => updateEducation(i, "degree", e.target.value)} />
                <input className={inputClass} placeholder="School" value={edu.school}
                  onChange={(e) => updateEducation(i, "school", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input className={inputClass} placeholder="Year" value={edu.year}
                  onChange={(e) => updateEducation(i, "year", e.target.value)} />
                <input className={inputClass} placeholder="Grade" value={edu.grade}
                  onChange={(e) => updateEducation(i, "grade", e.target.value)} />
              </div>
            </div>
          ))}
          <button onClick={addEducation} className="text-sm text-orange-500 flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add Education
          </button>

          <h4 className="font-bold">Skills</h4>
          <div className="flex gap-2">
            <input className={inputClass + " flex-1"} placeholder="Type skill and press Enter" value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} />
            <button onClick={addSkill} className="px-4 py-2.5 rounded-xl border border-border">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {cvData.skills.map((skill, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium flex items-center gap-2">
                {skill}
                <button onClick={() => removeSkill(i)}><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>

          <button onClick={handleGenerate} disabled={isGenerating || !cvData.name} className={primaryBtn + " w-full flex items-center justify-center gap-2"}>
            {isGenerating ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating CV...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" /> Generate CV with Template
              </>
            )}
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main PDF Editor Workspace
// ─────────────────────────────────────────────────────────────────────────────

export default function PDFEditorWorkspace({ tool }: { tool: Tool }) {
  const [activeTab, setActiveTab] = useState<"edit" | "cv-builder" | "cv-reference">("edit");

  // PDF Editor State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  // Tool State
  const [selectedTool, setSelectedTool] = useState("select");
  const [color, setColor] = useState("#FF6B6B");
  const [fontSize, setFontSize] = useState(14);
  const [fontWeight, setFontWeight] = useState("normal");
  const [textAlign, setTextAlign] = useState("left");

  const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F", "#FF8C42", "#2C3E50"];
  const tools = [
    { id: "select", icon: MousePointer, label: "Select" },
    { id: "text", icon: Type, label: "Text" },
    { id: "rect", icon: Square, label: "Rectangle" },
    { id: "circle", icon: Circle, label: "Circle" },
    { id: "highlight", icon: Highlighter, label: "Highlight" },
    { id: "pen", icon: PenTool, label: "Draw" },
  ];

  async function handleFileUpload(file: File) {
    setPdfFile(file);

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    setPdfDoc(pdf);
    setPageCount(pdf.numPages);
    setCurrentPage(0);
    setAnnotations([]);
  }

  async function generateCVDocument(cvData: CVData): Promise<PDFDocument> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4

    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let y = 800;
    const margin = 50;
    const contentWidth = 495;

    // Header with gradient effect
    page.drawRectangle({
      x: 0, y: y - 30, width: 595.28, height: 80,
      color: rgb(0.98, 0.98, 0.98),
    });

    // Name
    page.drawText(cvData.name || "Your Name", {
      x: margin, y, size: 28, font: boldFont, color: rgb(0.2, 0.2, 0.2),
    });
    y -= 30;

    // Contact
    const contacts = [cvData.email, cvData.phone, cvData.location].filter(Boolean);
    if (contacts.length > 0) {
      page.drawText(contacts.join("  |  "), {
        x: margin, y, size: 10, font: regularFont, color: rgb(0.5, 0.5, 0.5),
      });
      y -= 25;
    }

    // Divider
    page.drawLine({
      start: { x: margin, y }, end: { x: 545, y },
      thickness: 2, color: rgb(1, 0.4, 0.2),
    });
    y -= 20;

    // Summary
    if (cvData.summary) {
      page.drawText("Professional Summary", {
        x: margin, y, size: 14, font: boldFont, color: rgb(1, 0.4, 0.2),
      });
      y -= 18;
      page.drawText(cvData.summary, {
        x: margin, y, size: 10, font: regularFont, color: rgb(0.3, 0.3, 0.3),
        maxWidth: contentWidth, lineHeight: 16,
      });
      y -= 45;
    }

    // Experience
    const filledExp = cvData.experience.filter(e => e.title);
    if (filledExp.length > 0) {
      page.drawText("Work Experience", {
        x: margin, y, size: 14, font: boldFont, color: rgb(1, 0.4, 0.2),
      });
      y -= 18;

      filledExp.forEach(exp => {
        page.drawText(`${exp.title}${exp.company ? ` at ${exp.company}` : ""}`, {
          x: margin, y, size: 12, font: boldFont, color: rgb(0.2, 0.2, 0.2),
        });
        y -= 14;

        if (exp.duration) {
          page.drawText(exp.duration, {
            x: margin, y, size: 9, font: regularFont, color: rgb(0.5, 0.5, 0.5),
          });
          y -= 14;
        }

        if (exp.description) {
          page.drawText(exp.description, {
            x: margin, y, size: 10, font: regularFont, color: rgb(0.3, 0.3, 0.3),
            maxWidth: contentWidth, lineHeight: 14,
          });
          y -= 30;
        }
      });
    }

    // Education
    const filledEdu = cvData.education.filter(e => e.degree);
    if (filledEdu.length > 0) {
      page.drawText("Education", {
        x: margin, y, size: 14, font: boldFont, color: rgb(1, 0.4, 0.2),
      });
      y -= 18;

      filledEdu.forEach(edu => {
        const eduLine = `${edu.degree}${edu.school ? ` - ${edu.school}` : ""}`;
        page.drawText(eduLine, {
          x: margin, y, size: 11, font: boldFont, color: rgb(0.2, 0.2, 0.2),
        });
        y -= 14;

        const eduDetails = [edu.year, edu.grade].filter(Boolean).join(", ");
        if (eduDetails) {
          page.drawText(eduDetails, {
            x: margin, y, size: 9, font: regularFont, color: rgb(0.5, 0.5, 0.5),
          });
          y -= 20;
        }
      });
    }

    // Skills
    if (cvData.skills.length > 0) {
      page.drawText("Skills", {
        x: margin, y, size: 14, font: boldFont, color: rgb(1, 0.4, 0.2),
      });
      y -= 18;

      // Skills in multiple columns
      const skillsPerRow = 3;
      const skillWidth = contentWidth / skillsPerRow;
      cvData.skills.forEach((skill, i) => {
        const col = i % skillsPerRow;
        const row = Math.floor(i / skillsPerRow);
        page.drawText(`• ${skill}`, {
          x: margin + col * skillWidth, y: y - row * 14, size: 10, font: regularFont, color: rgb(0.3, 0.3, 0.3),
        });
      });
    }

    return pdfDoc;
  }

  async function handleCVDownload(cvData: CVData) {
    const pdfDoc = await generateCVDocument(cvData);
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cvData.name || "CV"}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadEditedPDF() {
    if (!pdfDoc) return;

    // Create new PDF with annotations
    const newPdfDoc = await PDFDocument.create();
    const font = await newPdfDoc.embedFont(StandardFonts.Helvetica);

    for (let i = 0; i < pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i + 1);
      const viewport = page.getViewport({ scale: 1.5 });

      // Create new page with same size
      const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);

      // Copy original content (simplified - would need more complex handling for real PDF)
      const embedded = await newPdfDoc.embedPage(page);
      newPage.drawPage(embedded, {
        x: 0, y: 0, width: viewport.width, height: viewport.height,
      });

      // Draw annotations for this page
      const pageAnnotations = annotations.filter(a => a.pageIndex === i);
      pageAnnotations.forEach(ann => {
        switch (ann.type) {
          case "text":
            newPage.drawText(ann.content || "", {
              x: ann.x, y: viewport.height - ann.y,
              size: ann.fontSize || 12, font, color: rgb(0, 0, 0),
            });
            break;
          case "rect":
            newPage.drawRectangle({
              x: ann.x, y: viewport.height - ann.y - ann.height,
              width: ann.width, height: ann.height,
              borderColor: rgb(1, 0, 0), borderWidth: 1,
            });
            break;
          case "circle":
            newPage.drawEllipse({
              x: ann.x + ann.width / 2, y: viewport.height - ann.y - ann.height / 2,
              xScale: ann.width / 2, yScale: ann.height / 2,
              borderColor: rgb(0, 0, 1), borderWidth: 1,
            });
            break;
          case "line":
            if (ann.content) {
              const path = JSON.parse(ann.content);
              for (let j = 0; j < path.length - 1; j++) {
                newPage.drawLine({
                  start: { x: path[j].x, y: viewport.height - path[j].y },
                  end: { x: path[j + 1].x, y: viewport.height - path[j + 1].y },
                  thickness: 2, color: rgb(0, 0, 0),
                });
              }
            }
            break;
          case "highlight":
            newPage.drawRectangle({
              x: ann.x, y: viewport.height - ann.y - ann.height,
              width: ann.width, height: ann.height,
              color: rgb(1, 1, 0), opacity: 0.3,
            });
            break;
        }
      });
    }

    const pdfBytes = await newPdfDoc.save();
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = pdfFile?.name || "edited.pdf";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border pb-2">
        {[
          { id: "edit" as const, label: "PDF Editor", icon: EditIcon },
          { id: "cv-builder" as const, label: "CV Builder", icon: FileTextIcon },
          { id: "cv-reference" as const, label: "CV from Reference", icon: StarIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-orange-500 text-white"
                : "text-foreground-muted hover:bg-background-subtle"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* PDF Editor Tab */}
      {activeTab === "edit" && (
        <>
          {!pdfDoc ? (
            <PDFUpload onFile={handleFileUpload} />
          ) : (
            <>
              {/* Toolbar */}
              <div className={clsx(cardClass, "flex items-center gap-3 flex-wrap")}>
                {/* Tools */}
                <div className="flex items-center gap-1">
                  {tools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => setSelectedTool(tool.id)}
                      className={selectedTool === tool.id ? activeToolBtn : toolbarBtn}
                      title={tool.label}
                    >
                      <tool.icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>

                <div className="w-px h-6 bg-border" />

                {/* Color Picker */}
                <div className="flex items-center gap-1">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={clsx(
                        "w-6 h-6 rounded-full border-2 transition-all",
                        color === c ? "border-foreground scale-110" : "border-transparent"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                <div className="w-px h-6 bg-border" />

                {/* Font Size */}
                <div className="flex items-center gap-1">
                  <button onClick={() => setFontSize(Math.max(8, fontSize - 2))} className={toolbarBtn}>
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-medium w-8 text-center">{fontSize}</span>
                  <button onClick={() => setFontSize(Math.min(48, fontSize + 2))} className={toolbarBtn}>
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Font Style */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setFontWeight(fontWeight === "bold" ? "normal" : "bold")}
                    className={clsx(fontWeight === "bold" ? activeToolBtn : toolbarBtn)}
                  >
                    <Bold className="h-4 w-4" />
                  </button>
                </div>

                <div className="w-px h-6 bg-border" />

                {/* Zoom */}
                <div className="flex items-center gap-1">
                  <button onClick={() => setScale(Math.max(0.5, scale - 0.2))} className={toolbarBtn}>
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-medium w-12 text-center">{Math.round(scale * 100)}%</span>
                  <button onClick={() => setScale(Math.min(3, scale + 0.2))} className={toolbarBtn}>
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>

                {/* Clear All */}
                <div className="ml-auto">
                  <button
                    onClick={() => {
                      setAnnotations([]);
                      setPdfDoc(null);
                      setPdfFile(null);
                      setPageCount(0);
                    }}
                    className={toolbarBtn}
                    title="Upload New PDF"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* PDF Canvas */}
              <PDFCanvasEditor
                pdfDoc={pdfDoc}
                pageCount={pageCount}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                annotations={annotations}
                setAnnotations={setAnnotations}
                selectedTool={selectedTool}
                color={color}
                fontSize={fontSize}
                fontWeight={fontWeight}
                textAlign={textAlign}
                scale={scale}
                onDownload={downloadEditedPDF}
              />
            </>
          )}
        </>
      )}

      {/* CV Builder Tab */}
      {activeTab === "cv-builder" && (
        <CVBuilder onGenerate={handleCVDownload} />
      )}

      {/* CV from Reference Tab */}
      {activeTab === "cv-reference" && (
        <CVFromReference onGenerate={handleCVDownload} />
      )}
    </div>
  );
}

// Inline Icons
function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
