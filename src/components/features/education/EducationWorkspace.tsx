"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import type { Tool } from "@/types";
import { useAIGenerate } from "@/hooks/useAIGenerate";
import {
  BookOpen,
  Sparkles,
  GraduationCap,
  Clock,
  CalendarDays,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Shared styles
// ─────────────────────────────────────────────────────────────────────────────

const inputClass =
  "w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-orange-500/30";

const resultCard =
  "rounded-xl border border-card-border bg-background-subtle p-4";

const primaryBtn =
  "h-11 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed";

const secondaryBtn =
  "h-11 px-6 rounded-xl border border-border bg-background text-foreground font-medium text-sm hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

// ─────────────────────────────────────────────────────────────────────────────
// Flashcard Generator
// ─────────────────────────────────────────────────────────────────────────────

function FlashcardGenerator() {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState("10");
  const [cards, setCards] = useState<Array<{ front: string; back: string }>>([]);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const { output, loading, generate, clear } = useAIGenerate("flashcard-generator");

  function handleGenerate() {
    if (!topic.trim()) return;
    generate({ topic, count: parseInt(count) || 10 });
  }

  function parseOutput(text: string) {
    // Try to parse as JSON array first
    try {
      const match = text.match(/\[[\s\S]*?\]/);
      if (match) {
        const parsed = JSON.parse(match[0]) as Array<{ front: string; back: string; question?: string; answer?: string }>;
        return parsed.map((c) => ({ front: c.front || c.question || "", back: c.back || c.answer || "" }));
      }
    } catch {}

    // Try to parse line-by-line format (Front: ... | Back: ...)
    const lines = text.split("\n").filter((l) => l.trim());
    const parsed: Array<{ front: string; back: string }> = [];
    for (const line of lines) {
      const parts = line.split("|").map((p) => p.replace(/^\d+[\.\)]\s*/, "").trim());
      if (parts.length >= 2) {
        parsed.push({ front: parts[0], back: parts[1] });
      } else if (parts.length === 1 && parts[0]) {
        parsed.push({ front: parts[0], back: "" });
      }
    }
    return parsed;
  }

  function handleUseResult() {
    const parsed = parseOutput(output);
    if (parsed.length > 0) {
      setCards(parsed);
      setFlipped({});
      clear();
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Topic</label>
        <input
          type="text"
          className={inputClass}
          placeholder="e.g. World War II, Photosynthesis, JavaScript Arrays"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Number of Flashcards</label>
        <input
          type="number"
          className={inputClass}
          placeholder="e.g. 10"
          value={count}
          onChange={(e) => setCount(e.target.value)}
        />
      </div>
      <button className={primaryBtn} onClick={handleGenerate} disabled={loading || !topic.trim()}>
        <Sparkles className="inline h-4 w-4 mr-2" />
        {loading ? "Generating..." : "Generate Flashcards"}
      </button>

      {output && (
        <div className="space-y-3">
          <div className={clsx(resultCard, "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200")}>
            <pre className="text-sm text-foreground whitespace-pre-wrap font-sans max-h-64 overflow-y-auto">{output}</pre>
          </div>
          <button className={secondaryBtn} onClick={handleUseResult}>Use This for Flashcards</button>
        </div>
      )}

      {cards.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-foreground-muted">
            <RotateCcw className="h-4 w-4" />
            Click a card to flip
          </div>
          {cards.map((card, i) => (
            <div
              key={i}
              onClick={() => setFlipped((prev) => ({ ...prev, [i]: !prev[i] }))}
              className={clsx(
                "cursor-pointer rounded-xl border p-4 transition-all duration-300",
                flipped[i]
                  ? "border-orange-400 bg-gradient-to-r from-orange-50 to-amber-50"
                  : "border-card-border bg-background-subtle hover:border-primary/50"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-1">
                    {flipped[i] ? "Answer" : "Question"} #{i + 1}
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    {flipped[i] ? card.back : card.front}
                  </div>
                </div>
                <div className="text-foreground-muted">
                  {flipped[i] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Vocabulary Builder
// ─────────────────────────────────────────────────────────────────────────────

interface VocabWord {
  word: string;
  definition: string;
  partOfSpeech?: string;
}

function VocabularyBuilder() {
  const [text, setText] = useState("");
  const [words, setWords] = useState<VocabWord[]>([]);
  const { output, loading, generate, clear } = useAIGenerate("vocabulary-builder");

  function handleGenerate() {
    if (!text.trim()) return;
    generate({ text });
  }

  function parseOutput(text: string) {
    try {
      const match = text.match(/\[[\s\S]*?\]\}/);
      if (match) {
        const parsed = JSON.parse(match[0].replace(/,?\s*\}$/, "]")) as Array<{ word: string; definition: string; part?: string }>;
        return parsed.map((w) => ({ word: w.word, definition: w.definition, partOfSpeech: w.part }));
      }
    } catch {}

    const lines = text.split("\n").filter((l) => l.trim());
    const parsed: VocabWord[] = [];
    for (const line of lines) {
      const colonIdx = line.indexOf(":");
      if (colonIdx > 0) {
        parsed.push({ word: line.slice(0, colonIdx).replace(/^\d+[\.\)]\s*/, "").trim(), definition: line.slice(colonIdx + 1).trim() });
      }
    }
    return parsed;
  }

  function handleUseResult() {
    const parsed = parseOutput(output);
    if (parsed.length > 0) {
      setWords(parsed);
      clear();
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Paste Text or Passage</label>
        <textarea
          className={clsx(inputClass, "min-h-[120px] resize-y")}
          placeholder="Paste any text here — the AI will extract key vocabulary words with definitions..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <button className={primaryBtn} onClick={handleGenerate} disabled={loading || !text.trim()}>
        <Sparkles className="inline h-4 w-4 mr-2" />
        {loading ? "Extracting Vocabulary..." : "Extract Vocabulary"}
      </button>

      {output && (
        <div className="space-y-3">
          <div className={clsx(resultCard, "bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200")}>
            <pre className="text-sm text-foreground whitespace-pre-wrap font-sans max-h-64 overflow-y-auto">{output}</pre>
          </div>
          <button className={secondaryBtn} onClick={handleUseResult}>Use This Vocabulary List</button>
        </div>
      )}

      {words.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="text-sm font-semibold text-foreground">Extracted Words ({words.length})</div>
          {words.map((w, i) => (
            <div key={i} className={clsx(resultCard, "flex items-start gap-3")}>
              <div className="min-w-0 flex-1">
                <div className="text-base font-bold text-foreground">{w.word}</div>
                {w.partOfSpeech && <div className="text-xs text-foreground-muted italic">{w.partOfSpeech}</div>}
                <div className="text-sm text-foreground-muted mt-1">{w.definition}</div>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quiz Generator
// ─────────────────────────────────────────────────────────────────────────────

interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
}

function QuizGenerator() {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState("5");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [revealed, setRevealed] = useState<Record<number, number>>({});
  const { output, loading, generate, clear } = useAIGenerate("quiz-generator");

  function handleGenerate() {
    if (!topic.trim()) return;
    generate({ topic, count: parseInt(count) || 5 });
  }

  function parseOutput(text: string) {
    try {
      const match = text.match(/\[[\s\S]*?\]\s*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]) as Array<{ question: string; options: string[]; answer?: number }>;
        return parsed.map((q, i) => ({ question: q.question, options: q.options, answer: q.answer ?? i }));
      }
    } catch {}

    // Parse line-by-line format
    const lines = text.split("\n").filter((l) => l.trim());
    const parsed: QuizQuestion[] = [];
    let currentQ: Partial<QuizQuestion> = {};
    let optIdx = 0;
    for (const line of lines) {
      if (line.match(/^[\d]+\.\s+\*/) || line.match(/\?\s*$/)) {
        if (currentQ.question) parsed.push(currentQ as QuizQuestion);
        currentQ = { question: line.replace(/^\d+[\.\)\*]+\s*/, "").trim(), options: [], answer: 0 };
        optIdx = 0;
      } else if (line.match(/^[A-D][\.\)]\s+/)) {
        if (!currentQ.options) currentQ.options = [];
        currentQ.options.push(line.replace(/^[A-D][\.\)]\s+/, "").trim());
        if (line.includes("*") || line.includes("(Correct)") || line.includes("✓")) {
          currentQ.answer = optIdx;
        }
        optIdx++;
      }
    }
    if (currentQ.question) parsed.push(currentQ as QuizQuestion);
    return parsed;
  }

  function handleUseResult() {
    const parsed = parseOutput(output);
    if (parsed.length > 0) {
      setQuestions(parsed);
      setRevealed({});
      clear();
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Topic</label>
        <input type="text" className={inputClass} placeholder="e.g. Indian History, Python Programming, Biology" value={topic} onChange={(e) => setTopic(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Number of Questions</label>
          <input type="number" className={inputClass} placeholder="e.g. 5" value={count} onChange={(e) => setCount(e.target.value)} />
        </div>
      </div>
      <button className={primaryBtn} onClick={handleGenerate} disabled={loading || !topic.trim()}>
        <Sparkles className="inline h-4 w-4 mr-2" />
        {loading ? "Generating Quiz..." : "Generate Quiz"}
      </button>

      {output && (
        <div className="space-y-3">
          <div className={clsx(resultCard, "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200")}>
            <pre className="text-sm text-foreground whitespace-pre-wrap font-sans max-h-64 overflow-y-auto">{output}</pre>
          </div>
          <button className={secondaryBtn} onClick={handleUseResult}>Use This Quiz</button>
        </div>
      )}

      {questions.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {questions.map((q, i) => (
            <div key={i} className={clsx(resultCard)}>
              <div className="text-sm font-medium text-foreground mb-3">Q{i + 1}. {q.question}</div>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const isCorrect = oi === q.answer;
                  const isRevealed = revealed[i] !== undefined;
                  return (
                    <div
                      key={oi}
                      onClick={() => !isRevealed && setRevealed((prev) => ({ ...prev, [i]: oi }))}
                      className={clsx(
                        "rounded-lg px-4 py-2.5 text-sm cursor-pointer transition-colors",
                        isRevealed
                          ? isCorrect
                            ? "bg-emerald-100 border border-emerald-300 text-emerald-700 font-medium"
                            : "bg-background border border-border text-foreground-muted"
                          : "bg-background border border-border text-foreground hover:border-primary"
                      )}
                    >
                      {String.fromCharCode(65 + oi)}. {opt}
                      {isRevealed && isCorrect && <span className="ml-2 text-emerald-500">✓</span>}
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => setRevealed((prev) => ({ ...prev, [i]: q.answer }))}
                className="mt-3 text-xs text-primary hover:underline"
              >
                Show correct answer
              </button>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// History Timeline Generator
// ─────────────────────────────────────────────────────────────────────────────

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

function TimelineGenerator() {
  const [topic, setTopic] = useState("");
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const { output, loading, generate, clear } = useAIGenerate("timeline-generator");

  function handleGenerate() {
    if (!topic.trim()) return;
    generate({ topic });
  }

  function parseOutput(text: string) {
    try {
      const match = text.match(/\[[\s\S]*?\]\s*\]/);
      if (match) {
        return JSON.parse(match[0]) as TimelineEvent[];
      }
    } catch {}

    const lines = text.split("\n").filter((l) => l.trim());
    const parsed: TimelineEvent[] = [];
    for (const line of lines) {
      const yearMatch = line.match(/^(\d{3,4}[a-z]?|\[?[A-Z][a-z]+ [A-Z][a-z]+\]?)/);
      if (yearMatch) {
        const parts = line.split(/[-–:]/).map((p) => p.trim());
        if (parts.length >= 2) {
          parsed.push({
            year: parts[0].replace(/^\d+[\.\)]\s*/, ""),
            title: parts[1],
            description: parts.slice(2).join(" - "),
          });
        }
      }
    }
    return parsed;
  }

  function handleUseResult() {
    const parsed = parseOutput(output);
    if (parsed.length > 0) {
      setEvents(parsed);
      clear();
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Topic</label>
        <input
          type="text"
          className={inputClass}
          placeholder="e.g. Mughal Empire, Space Exploration, French Revolution"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>
      <button className={primaryBtn} onClick={handleGenerate} disabled={loading || !topic.trim()}>
        <Sparkles className="inline h-4 w-4 mr-2" />
        {loading ? "Generating Timeline..." : "Generate Timeline"}
      </button>

      {output && (
        <div className="space-y-3">
          <div className={clsx(resultCard, "bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200")}>
            <pre className="text-sm text-foreground whitespace-pre-wrap font-sans max-h-64 overflow-y-auto">{output}</pre>
          </div>
          <button className={secondaryBtn} onClick={handleUseResult}>Use This Timeline</button>
        </div>
      )}

      {events.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-400 via-amber-300 to-teal-400" />
          <div className="space-y-4 pl-12">
            {events.map((event, i) => (
              <div key={i} className={clsx(resultCard, "relative")}>
                <div className="absolute -left-12 top-4 w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 border-2 border-background flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div className="text-xs font-bold text-orange-500 mb-1">{event.year}</div>
                <div className="text-sm font-semibold text-foreground mb-1">{event.title}</div>
                <div className="text-xs text-foreground-muted">{event.description}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Study Planner
// ─────────────────────────────────────────────────────────────────────────────

interface StudyBlock {
  day: string;
  subject: string;
  hours: string;
  topic?: string;
}

function StudyPlanner() {
  const [subjects, setSubjects] = useState("");
  const [examDate, setExamDate] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState("3");
  const [schedule, setSchedule] = useState<string>("");
  const { output, loading, generate, clear } = useAIGenerate("study-planner");

  function handleGenerate() {
    if (!subjects.trim() || !examDate) return;
    generate({ subjects: subjects.split(",").map((s) => s.trim()), examDate, hoursPerDay: parseInt(hoursPerDay) || 3 });
  }

  function handleUseResult() {
    if (output.trim()) {
      setSchedule(output);
      clear();
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Subjects (comma-separated)</label>
        <input
          type="text"
          className={inputClass}
          placeholder="e.g. Mathematics, Physics, Chemistry, English"
          value={subjects}
          onChange={(e) => setSubjects(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Exam Date</label>
          <input type="date" className={inputClass} value={examDate} onChange={(e) => setExamDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Hours/Day</label>
          <input type="number" className={inputClass} placeholder="e.g. 3" value={hoursPerDay} onChange={(e) => setHoursPerDay(e.target.value)} />
        </div>
      </div>
      <button className={primaryBtn} onClick={handleGenerate} disabled={loading || !subjects.trim() || !examDate}>
        <Sparkles className="inline h-4 w-4 mr-2" />
        {loading ? "Generating Schedule..." : "Generate Study Plan"}
      </button>

      {output && (
        <div className="space-y-3">
          <div className={clsx(resultCard, "bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-200")}>
            <pre className="text-sm text-foreground whitespace-pre-wrap font-sans max-h-80 overflow-y-auto">{output}</pre>
          </div>
          <button className={secondaryBtn} onClick={handleUseResult}>Use This Plan</button>
        </div>
      )}

      {schedule && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className={clsx(resultCard, "bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-200")}>
            <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">{schedule}</pre>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Workspace
// ─────────────────────────────────────────────────────────────────────────────

export default function EducationWorkspace({ tool }: { tool: Tool }) {
  switch (tool.slug) {
    case "flashcard-generator":
      return <FlashcardGenerator />;
    case "vocabulary-builder":
      return <VocabularyBuilder />;
    case "quiz-generator":
      return <QuizGenerator />;
    case "timeline-generator":
      return <TimelineGenerator />;
    case "study-planner":
      return <StudyPlanner />;
    default:
      return (
        <div className="text-center py-12 text-foreground-muted">
          <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Tool <code className="bg-background-subtle px-1.5 py-0.5 rounded">{tool.slug}</code> not yet implemented.</p>
        </div>
      );
  }
}