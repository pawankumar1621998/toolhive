"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import {
  Upload, FileText, Save, Download, Eye, Edit3, Type, Image,
  Square, Circle, AlignLeft, Minus, Plus, Trash2, RotateCcw, Undo2,
  Palette, Bold, Italic, Underline, AlignCenter, AlignLeft as AlignLeftIcon, AlignRight,
  UploadCloud, X, Check, Layers, PenTool, Move, ZoomIn, ZoomOut,
  Copy, Clipboard, User, Briefcase, GraduationCap, Award, Phone, Mail, MapPin
} from "lucide-react";
import type { Tool } from "@/types";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";

const cardClass = "rounded-xl border border-card-border bg-background-subtle p-4";
const primaryBtn = "h-11 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed";
const inputClass = "w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-orange-500/30";
const toolbarBtn = "p-2 rounded-lg hover:bg-background-subtle transition-colors text-foreground-muted hover:text-foreground disabled:opacity-50";
const activeToolBtn = "p-2 rounded-lg bg-orange-500 text-white transition-colors";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Annotation {
  id: string;
  type: "text" | "rect" | "circle" | "line" | "image";
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string;
  color: string;
  fontSize?: number;
  fontStyle?: string;
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

interface PageData {
  annotations: Annotation[];
  backgroundColor: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF Upload Section
// ─────────────────────────────────────────────────────────────────────────────

function PDFUpload({ onFile }: { onFile: (file: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div
        className={clsx(
          "border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer",
          dragging ? "border-orange-500 bg-orange-50" : "border-border hover:border-orange-400"
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
        <UploadCloud className="h-16 w-16 mx-auto mb-4 text-foreground-muted" />
        <h3 className="text-lg font-semibold mb-2">Upload PDF to Edit</h3>
        <p className="text-sm text-foreground-muted mb-4">Drag & drop or click to browse</p>
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
// CV Builder Section
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

  function addExperience() {
    setCVData({ ...cvData, experience: [...cvData.experience, { title: "", company: "", duration: "", description: "" }] });
  }

  function updateExperience(i: number, field: string, value: string) {
    const updated = [...cvData.experience];
    updated[i] = { ...updated[i], [field]: value };
    setCVData({ ...cvData, experience: updated });
  }

  function addEducation() {
    setCVData({ ...cvData, education: [...cvData.education, { degree: "", school: "", year: "", grade: "" }] });
  }

  function updateEducation(i: number, field: string, value: string) {
    const updated = [...cvData.education];
    updated[i] = { ...updated[i], [field]: value };
    setCVData({ ...cvData, education: updated });
  }

  function addSkill() {
    if (skillInput.trim()) {
      setCVData({ ...cvData, skills: [...cvData.skills, skillInput.trim()] });
      setSkillInput("");
    }
  }

  function removeSkill(i: number) {
    setCVData({ ...cvData, skills: cvData.skills.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={clsx(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all",
              step === s ? "bg-orange-500 text-white" : step > s ? "bg-green-500 text-white" : "bg-border text-foreground-muted"
            )}
          >
            {step > s ? <Check className="h-5 w-5" /> : s}
          </button>
        ))}
        <div className="flex gap-4 ml-4 text-sm">
          <span className={step >= 1 ? "text-foreground font-medium" : "text-foreground-muted"}>Personal</span>
          <span className={step >= 2 ? "text-foreground font-medium" : "text-foreground-muted"}>Experience</span>
          <span className={step >= 3 ? "text-foreground font-medium" : "text-foreground-muted"}>Skills</span>
        </div>
      </div>

      {/* Step 1: Personal Info */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <h3 className="text-lg font-semibold">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Full Name</label>
              <input className={inputClass} placeholder="John Doe" value={cvData.name}
                onChange={(e) => setCVData({ ...cvData, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <input className={inputClass} placeholder="john@example.com" type="email" value={cvData.email}
                onChange={(e) => setCVData({ ...cvData, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phone</label>
              <input className={inputClass} placeholder="+91 98765 43210" value={cvData.phone}
                onChange={(e) => setCVData({ ...cvData, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Location</label>
              <input className={inputClass} placeholder="Mumbai, India" value={cvData.location}
                onChange={(e) => setCVData({ ...cvData, location: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Professional Summary</label>
            <textarea className={inputClass} rows={4} placeholder="A brief summary of your professional background..."
              value={cvData.summary} onChange={(e) => setCVData({ ...cvData, summary: e.target.value })} />
          </div>
          <button onClick={() => setStep(2)} className={primaryBtn + " flex items-center gap-2"}>
            Next: Experience <ChevronRight className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      {/* Step 2: Experience */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <h3 className="text-lg font-semibold">Work Experience</h3>
          {cvData.experience.map((exp, i) => (
            <div key={i} className={cardClass + " space-y-3"}>
              <div className="grid grid-cols-2 gap-3">
                <input className={inputClass} placeholder="Job Title" value={exp.title}
                  onChange={(e) => updateExperience(i, "title", e.target.value)} />
                <input className={inputClass} placeholder="Company Name" value={exp.company}
                  onChange={(e) => updateExperience(i, "company", e.target.value)} />
                <input className={inputClass + " col-span-2"} placeholder="Duration (e.g. Jan 2020 - Present)" value={exp.duration}
                  onChange={(e) => updateExperience(i, "duration", e.target.value)} />
              </div>
              <textarea className={inputClass} rows={2} placeholder="Key responsibilities and achievements..."
                value={exp.description} onChange={(e) => updateExperience(i, "description", e.target.value)} />
            </div>
          ))}
          <button onClick={addExperience} className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add Experience
          </button>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="px-6 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-background-subtle">Back</button>
            <button onClick={() => setStep(3)} className={primaryBtn + " flex items-center gap-2"}>
              Next: Skills <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Education & Skills */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <h3 className="text-lg font-semibold">Education</h3>
          {cvData.education.map((edu, i) => (
            <div key={i} className="grid grid-cols-4 gap-3">
              <input className={inputClass} placeholder="Degree" value={edu.degree}
                onChange={(e) => updateEducation(i, "degree", e.target.value)} />
              <input className={inputClass} placeholder="School/University" value={edu.school}
                onChange={(e) => updateEducation(i, "school", e.target.value)} />
              <input className={inputClass} placeholder="Year" value={edu.year}
                onChange={(e) => updateEducation(i, "year", e.target.value)} />
              <input className={inputClass} placeholder="Grade/GPA" value={edu.grade}
                onChange={(e) => updateEducation(i, "grade", e.target.value)} />
            </div>
          ))}
          <button onClick={addEducation} className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add Education
          </button>

          <h3 className="text-lg font-semibold mt-6">Skills</h3>
          <div className="flex gap-2">
            <input className={inputClass + " flex-1"} placeholder="Type a skill and press Enter" value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill()} />
            <button onClick={addSkill} className="px-4 py-2.5 rounded-xl border border-border hover:bg-background-subtle font-medium text-sm">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {cvData.skills.map((skill, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 text-sm font-medium flex items-center gap-1">
                {skill}
                <button onClick={() => removeSkill(i)} className="hover:text-orange-900"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={() => setStep(2)} className="px-6 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-background-subtle">Back</button>
            <button onClick={() => onGenerate(cvData)} className={primaryBtn + " flex items-center gap-2"}>
              Generate CV <FileText className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CV from Reference (Fill from another CV)
// ─────────────────────────────────────────────────────────────────────────────

function CVFromReference({ onGenerate }: { onGenerate: (data: CVData) => void }) {
  const [step, setStep] = useState<"upload" | "edit">("upload");
  const [referenceCV, setReferenceCV] = useState<CVData | null>(null);
  const [userCV, setUserCV] = useState<CVData>({
    name: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
    experience: [],
    education: [],
    skills: [],
    languages: [],
  });
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    // For demo, we'll just parse the file name as a placeholder
    // In production, you'd use pdf.js to extract text from the PDF
    const reader = new FileReader();
    reader.onload = async () => {
      // Simulate extracting CV data from reference
      setReferenceCV({
        name: "Reference Person",
        email: "reference@email.com",
        phone: "+91 00000 00000",
        location: "City, Country",
        summary: "Experienced professional with skills in various domains.",
        experience: [
          { title: "Senior Developer", company: "Tech Corp", duration: "2020 - Present", description: "Led development team" },
          { title: "Developer", company: "StartUp Inc", duration: "2018 - 2020", description: "Built web applications" },
        ],
        education: [
          { degree: "B.Tech Computer Science", school: "ABC University", year: "2018", grade: "8.5 CGPA" },
        ],
        skills: ["JavaScript", "React", "Node.js", "Python", "SQL"],
        languages: ["English", "Hindi"],
      });
      setStep("edit");
    };
    reader.readAsArrayBuffer(file);
  }

  function fillFromReference() {
    if (referenceCV) {
      setUserCV({
        ...userCV,
        experience: referenceCV.experience.map(e => ({ ...e, title: "", company: "", duration: "", description: "" })),
        education: referenceCV.education.map(e => ({ ...e, degree: "", school: "", year: "", grade: "" })),
        skills: [...referenceCV.skills],
      });
    }
  }

  return (
    <div className="space-y-4">
      {step === "upload" && (
        <>
          <h3 className="text-lg font-semibold">Upload Reference CV</h3>
          <p className="text-sm text-foreground-muted">Upload another person's CV to use as a template for format and styling</p>
          <div
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-orange-400 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-12 w-12 mx-auto mb-3 text-foreground-muted" />
            <p className="text-sm font-medium">Click to upload PDF</p>
            <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }} />
          </div>
          <div className="text-center text-foreground-muted text-sm">or</div>
          <button onClick={fillFromReference} className="w-full py-3 rounded-xl border border-border text-sm font-medium hover:bg-background-subtle">
            Use Sample Template Instead
          </button>
        </>
      )}

      {step === "edit" && referenceCV && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Fill Your Details</h3>
            <button onClick={() => setStep("upload")} className="text-sm text-orange-500 hover:text-orange-600">
              Change Reference
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Your Name</label>
              <input className={inputClass} placeholder="Your Full Name" value={userCV.name}
                onChange={(e) => setUserCV({ ...userCV, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Your Email</label>
              <input className={inputClass} placeholder="your@email.com" value={userCV.email}
                onChange={(e) => setUserCV({ ...userCV, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Your Phone</label>
              <input className={inputClass} placeholder="+91 00000 00000" value={userCV.phone}
                onChange={(e) => setUserCV({ ...userCV, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Your Location</label>
              <input className={inputClass} placeholder="City, Country" value={userCV.location}
                onChange={(e) => setUserCV({ ...userCV, location: e.target.value })} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Professional Summary</label>
            <textarea className={inputClass} rows={3} placeholder="Your professional summary..."
              value={userCV.summary} onChange={(e) => setUserCV({ ...userCV, summary: e.target.value })} />
          </div>

          <div className={cardClass}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Experience (Reference Format)</h4>
              <span className="text-xs text-foreground-muted">Based on reference CV</span>
            </div>
            {referenceCV.experience.map((ref, i) => (
              <div key={i} className="mb-4 p-3 bg-background rounded-lg">
                <p className="text-sm font-medium text-foreground-muted mb-2">{ref.title} at {ref.company}</p>
                <input className={inputClass + " mb-2"} placeholder="Your job title" value={userCV.experience[i]?.title || ""}
                  onChange={(e) => {
                    const updated = [...userCV.experience];
                    updated[i] = { ...updated[i] || ref, title: e.target.value };
                    setUserCV({ ...userCV, experience: updated });
                  }} />
                <input className={inputClass} placeholder="Your company name" value={userCV.experience[i]?.company || ""}
                  onChange={(e) => {
                    const updated = [...userCV.experience];
                    updated[i] = { ...updated[i] || ref, company: e.target.value };
                    setUserCV({ ...userCV, experience: updated });
                  }} />
              </div>
            ))}
          </div>

          <button onClick={() => onGenerate(userCV)} className={primaryBtn + " w-full flex items-center justify-center gap-2"}>
            Generate Your CV <FileText className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main PDF Editor
// ─────────────────────────────────────────────────────────────────────────────

export default function PDFEditorWorkspace({ tool }: { tool: Tool }) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [mode, setMode] = useState<"blank" | "upload" | "edit" | "cv">("blank");
  const [activeTab, setActiveTab] = useState<"edit" | "cv-builder" | "cv-reference">("edit");
  const [selectedTool, setSelectedTool] = useState<string>("select");
  const [color, setColor] = useState("#FF6B6B");
  const [fontSize, setFontSize] = useState(14);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  async function handleFileUpload(file: File) {
    setPdfFile(file);
    const arrayBuffer = await file.arrayBuffer();
    setPdfBytes(new Uint8Array(arrayBuffer));

    // Load with pdf-lib
    const doc = await PDFDocument.load(arrayBuffer);
    setPdfDoc(doc);
    setPageCount(doc.getPageCount());
    setMode("edit");
  }

  async function handleCVDownload(cvData: CVData) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = 800;
    const margin = 50;
    const lineHeight = 20;

    // Name
    page.drawText(cvData.name || "Your Name", {
      x: margin, y, size: 24, font: helveticaBold, color: rgb(0.2, 0.2, 0.2),
    });
    y -= 25;

    // Contact info
    const contactInfo = [cvData.email, cvData.phone, cvData.location].filter(Boolean).join(" | ");
    if (contactInfo) {
      page.drawText(contactInfo, {
        x: margin, y, size: 10, font: helvetica, color: rgb(0.5, 0.5, 0.5),
      });
      y -= 20;
    }

    // Divider
    page.drawLine({ start: { x: margin, y }, end: { x: 545, y }, thickness: 1, color: rgb(0.9, 0.9, 0.9) });
    y -= 20;

    // Summary
    if (cvData.summary) {
      page.drawText("Professional Summary", {
        x: margin, y, size: 12, font: helveticaBold, color: rgb(0.2, 0.2, 0.2),
      });
      y -= 15;
      page.drawText(cvData.summary, {
        x: margin, y, size: 10, font: helvetica, color: rgb(0.3, 0.3, 0.3), maxWidth: 495,
      });
      y -= 30;
    }

    // Experience
    if (cvData.experience.some(e => e.title)) {
      page.drawText("Work Experience", {
        x: margin, y, size: 12, font: helveticaBold, color: rgb(0.2, 0.2, 0.2),
      });
      y -= 15;
      cvData.experience.forEach(exp => {
        if (exp.title) {
          page.drawText(`${exp.title}${exp.company ? ` at ${exp.company}` : ""}`, {
            x: margin, y, size: 11, font: helveticaBold, color: rgb(0.2, 0.2, 0.2),
          });
          y -= 12;
          if (exp.duration) {
            page.drawText(exp.duration, {
              x: margin, y, size: 9, font: helvetica, color: rgb(0.5, 0.5, 0.5),
            });
            y -= 12;
          }
          if (exp.description) {
            page.drawText(exp.description, {
              x: margin, y, size: 10, font: helvetica, color: rgb(0.3, 0.3, 0.3), maxWidth: 495,
            });
            y -= 25;
          }
        }
      });
    }

    // Education
    if (cvData.education.some(e => e.degree)) {
      page.drawText("Education", {
        x: margin, y, size: 12, font: helveticaBold, color: rgb(0.2, 0.2, 0.2),
      });
      y -= 15;
      cvData.education.forEach(edu => {
        if (edu.degree) {
          page.drawText(`${edu.degree}${edu.school ? ` - ${edu.school}` : ""}`, {
            x: margin, y, size: 11, font: helveticaBold, color: rgb(0.2, 0.2, 0.2),
          });
          y -= 12;
          const eduInfo = [edu.year, edu.grade].filter(Boolean).join(", ");
          if (eduInfo) {
            page.drawText(eduInfo, {
              x: margin, y, size: 9, font: helvetica, color: rgb(0.5, 0.5, 0.5),
            });
            y -= 20;
          }
        }
      });
    }

    // Skills
    if (cvData.skills.length > 0) {
      page.drawText("Skills", {
        x: margin, y, size: 12, font: helveticaBold, color: rgb(0.2, 0.2, 0.2),
      });
      y -= 15;
      page.drawText(cvData.skills.join(", "), {
        x: margin, y, size: 10, font: helvetica, color: rgb(0.3, 0.3, 0.3), maxWidth: 495,
      });
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cvData.name || "CV"}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (selectedTool === "text") {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const text = prompt("Enter text:");
      if (text) {
        setAnnotations([...annotations, {
          id: Date.now().toString(),
          type: "text",
          x, y,
          content: text,
          color,
          fontSize,
          pageIndex: currentPage,
        }]);
      }
    } else if (selectedTool === "rect") {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setAnnotations([...annotations, {
        id: Date.now().toString(),
        type: "rect",
        x, y,
        width: 100,
        height: 60,
        color,
        pageIndex: currentPage,
      }]);
    } else if (selectedTool === "circle") {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setAnnotations([...annotations, {
        id: Date.now().toString(),
        type: "circle",
        x, y,
        width: 80,
        height: 80,
        color,
        pageIndex: currentPage,
      }]);
    }
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (selectedTool === "pen") {
      setIsDrawing(true);
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      setCurrentPath([{ x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    }
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (isDrawing && selectedTool === "pen") {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      setCurrentPath([...currentPath, { x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    }
  }

  function handleMouseUp() {
    if (isDrawing && currentPath.length > 1) {
      setAnnotations([...annotations, {
        id: Date.now().toString(),
        type: "line",
        x: currentPath[0].x,
        y: currentPath[0].y,
        content: JSON.stringify(currentPath),
        color,
        pageIndex: currentPage,
      }]);
    }
    setIsDrawing(false);
    setCurrentPath([]);
  }

  function downloadEditedPDF() {
    if (!pdfBytes) return;
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "edited.pdf";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      {/* Tab Switcher */}
      <div className="flex gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("edit")}
          className={clsx("px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            activeTab === "edit" ? "bg-orange-500 text-white" : "text-foreground-muted hover:bg-background-subtle")}
        >
          PDF Editor
        </button>
        <button
          onClick={() => setActiveTab("cv-builder")}
          className={clsx("px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            activeTab === "cv-builder" ? "bg-orange-500 text-white" : "text-foreground-muted hover:bg-background-subtle")}
        >
          CV Builder
        </button>
        <button
          onClick={() => setActiveTab("cv-reference")}
          className={clsx("px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            activeTab === "cv-reference" ? "bg-orange-500 text-white" : "text-foreground-muted hover:bg-background-subtle")}
        >
          CV from Reference
        </button>
      </div>

      {/* PDF Editor Tab */}
      {activeTab === "edit" && (
        <>
          {mode === "blank" || mode === "upload" ? (
            <PDFUpload onFile={handleFileUpload} />
          ) : (
            <div className="space-y-4">
              {/* Toolbar */}
              <div className={clsx(cardClass, "flex items-center gap-2 flex-wrap")}>
                <button onClick={() => setSelectedTool("select")} className={selectedTool === "select" ? activeToolBtn : toolbarBtn} title="Select">
                  <Move className="h-4 w-4" />
                </button>
                <button onClick={() => setSelectedTool("text")} className={selectedTool === "text" ? activeToolBtn : toolbarBtn} title="Add Text">
                  <Type className="h-4 w-4" />
                </button>
                <button onClick={() => setSelectedTool("rect")} className={selectedTool === "rect" ? activeToolBtn : toolbarBtn} title="Rectangle">
                  <Square className="h-4 w-4" />
                </button>
                <button onClick={() => setSelectedTool("circle")} className={selectedTool === "circle" ? activeToolBtn : toolbarBtn} title="Circle">
                  <Circle className="h-4 w-4" />
                </button>
                <button onClick={() => setSelectedTool("pen")} className={selectedTool === "pen" ? activeToolBtn : toolbarBtn} title="Draw">
                  <PenTool className="h-4 w-4" />
                </button>
                <div className="w-px h-6 bg-border mx-1" />
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                <div className="w-px h-6 bg-border mx-1" />
                <button onClick={() => setAnnotations(annotations.filter(a => a.pageIndex !== currentPage))} className={toolbarBtn} title="Clear Page">
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="ml-auto flex gap-2">
                  {pageCount > 1 && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} className={toolbarBtn} disabled={currentPage === 0}>
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-sm font-medium px-2">{currentPage + 1} / {pageCount}</span>
                      <button onClick={() => setCurrentPage(Math.min(pageCount - 1, currentPage + 1))} className={toolbarBtn} disabled={currentPage === pageCount - 1}>
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <button onClick={downloadEditedPDF} className={primaryBtn + " flex items-center gap-2"}>
                    <Download className="h-4 w-4" /> Download PDF
                  </button>
                </div>
              </div>

              {/* Canvas Area */}
              <div className="border border-border rounded-xl overflow-hidden bg-white">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={1100}
                  className="w-full max-w-2xl mx-auto cursor-crosshair"
                  onClick={handleCanvasClick}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
              </div>

              {/* Annotations List */}
              {annotations.length > 0 && (
                <div className={cardClass}>
                  <h4 className="text-sm font-medium mb-2">Annotations ({annotations.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {annotations.map((ann) => (
                      <div key={ann.id} className="flex items-center gap-1 px-2 py-1 rounded bg-background-subtle text-xs">
                        <span style={{ color: ann.color }}>{ann.type}</span>
                        <button onClick={() => setAnnotations(annotations.filter(a => a.id !== ann.id))} className="text-foreground-muted hover:text-foreground">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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

// ChevronRight icon inline
function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}