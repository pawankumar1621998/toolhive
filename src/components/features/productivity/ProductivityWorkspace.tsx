"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import type { Tool } from "@/types";
import { useAIGenerate } from "@/hooks/useAIGenerate";
import { ClipboardList, CalendarDays, CheckSquare, Briefcase, Users, Megaphone } from "lucide-react";

// ─── Shared Styles ───────────────────────────────────────────────────────────

const inputClass =
  "w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-orange-500/30";

const cardClass =
  "rounded-xl border border-card-border bg-background-subtle p-4";

const primaryBtn =
  "h-11 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed";

// ─── Shared Output Card ───────────────────────────────────────────────────────

function OutputCard({
  text,
  onClear,
  label = "Generated Template",
}: {
  text: string;
  onClear: () => void;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cardClass}
    >
      {label && (
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="w-4 h-4 text-orange-500" />
          <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
            {label}
          </p>
        </div>
      )}
      <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-sans">
        {text}
      </pre>
      {text && (
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <button
            onClick={handleCopy}
            className={clsx(
              "text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium",
              copied
                ? "bg-orange-500/10 border-orange-500/30 text-orange-600"
                : "bg-background border-border text-foreground-muted hover:text-foreground hover:border-border-strong"
            )}
          >
            {copied ? "Copied!" : "Copy to Clipboard"}
          </button>
          <button
            onClick={onClear}
            className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground-muted hover:text-foreground hover:border-border-strong transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ─── 1. Daily Planner Template ──────────────────────────────────────────────

function DailyPlannerTemplate() {
  const [date, setDate] = useState("");
  const [focus, setFocus] = useState("");
  const { output, loading, error, generate, clear } = useAIGenerate("daily-planner");

  async function handleGenerate() {
    await generate({ date: date || undefined, focus });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Date (optional)
          </label>
          <input
            type="date"
            className={inputClass}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Focus Area
          </label>
          <input
            className={inputClass}
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="e.g., Work, Study, Health"
          />
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className={primaryBtn}
      >
        {loading ? "Generating..." : "Generate Daily Planner"}
      </button>

      {error && (
        <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      <AnimatePresence>
        {output && <OutputCard text={output} onClear={clear} label="Daily Planner" />}
      </AnimatePresence>
    </div>
  );
}

// ─── 2. Weekly Planner Template ──────────────────────────────────────────────

function WeeklyPlannerTemplate() {
  const [startDate, setStartDate] = useState("");
  const [goals, setGoals] = useState("");
  const { output, loading, error, generate, clear } = useAIGenerate("weekly-planner");

  async function handleGenerate() {
    await generate({
      startDate: startDate || undefined,
      goals: goals || undefined,
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-medium text-foreground-muted block mb-1">
          Week Starting Date (optional)
        </label>
        <input
          type="date"
          className={inputClass}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div>
        <label className="text-xs font-medium text-foreground-muted block mb-1">
          Weekly Goals (optional)
        </label>
        <textarea
          className={inputClass}
          rows={3}
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          placeholder="List your main goals for the week..."
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className={primaryBtn}
      >
        {loading ? "Generating..." : "Generate Weekly Planner"}
      </button>

      {error && (
        <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      <AnimatePresence>
        {output && <OutputCard text={output} onClear={clear} label="Weekly Planner" />}
      </AnimatePresence>
    </div>
  );
}

// ─── 3. Task Checklist Generator ─────────────────────────────────────────────

function TaskChecklistGenerator() {
  const [topic, setTopic] = useState("");
  const [taskType, setTaskType] = useState("General");
  const [count, setCount] = useState("10");

  const taskTypes = [
    "General",
    "Project Management",
    "Event Planning",
    "Home Renovation",
    "Travel Planning",
    "Wedding Checklist",
  ];

  const { output, loading, error, generate, clear } = useAIGenerate("task-checklist");

  async function handleGenerate() {
    await generate({ topic, taskType, count: parseInt(count) || 10 });
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-medium text-foreground-muted block mb-1">
          Topic / Project Name
        </label>
        <input
          className={inputClass}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="What is this checklist for?"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Checklist Type
          </label>
          <select
            className={inputClass}
            value={taskType}
            onChange={(e) => setTaskType(e.target.value)}
          >
            {taskTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Number of Tasks
          </label>
          <input
            type="number"
            className={inputClass}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            min={5}
            max={50}
          />
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className={primaryBtn}
      >
        {loading ? "Generating..." : "Generate Checklist"}
      </button>

      {error && (
        <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      <AnimatePresence>
        {output && <OutputCard text={output} onClear={clear} label="Task Checklist" />}
      </AnimatePresence>
    </div>
  );
}

// ─── 4. Packing List Generator ──────────────────────────────────────────────

function PackingListGenerator() {
  const [tripType, setTripType] = useState("Vacation");
  const [duration, setDuration] = useState("1 week");
  const [destination, setDestination] = useState("");
  const [travelers, setTravelers] = useState("1");

  const tripTypes = [
    "Vacation",
    "Business Trip",
    "Camping",
    "Beach Holiday",
    "Mountain Trek",
    "Road Trip",
    "City Break",
    "Backpacking",
  ];

  const durations = [
    "Weekend (2-3 days)",
    "1 week",
    "2 weeks",
    "1 month",
    "Long term",
  ];

  const { output, loading, error, generate, clear } = useAIGenerate("packing-list");

  async function handleGenerate() {
    await generate({
      tripType,
      duration,
      destination: destination || undefined,
      travelers: parseInt(travelers) || 1,
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Trip Type
          </label>
          <select
            className={inputClass}
            value={tripType}
            onChange={(e) => setTripType(e.target.value)}
          >
            {tripTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Duration
          </label>
          <select
            className={inputClass}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          >
            {durations.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Destination (optional)
          </label>
          <input
            className={inputClass}
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g., Paris, Tokyo"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Number of Travelers
          </label>
          <input
            type="number"
            className={inputClass}
            value={travelers}
            onChange={(e) => setTravelers(e.target.value)}
            min={1}
            max={20}
          />
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className={primaryBtn}
      >
        {loading ? "Generating..." : "Generate Packing List"}
      </button>

      {error && (
        <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      <AnimatePresence>
        {output && <OutputCard text={output} onClear={clear} label="Packing List" />}
      </AnimatePresence>
    </div>
  );
}

// ─── 5. Meeting Minutes Template ─────────────────────────────────────────────

function MeetingMinutesTemplate() {
  const [meetingTitle, setMeetingTitle] = useState("");
  const [attendees, setAttendees] = useState("");
  const [agenda, setAgenda] = useState("");
  const { output, loading, error, generate, clear } = useAIGenerate("meeting-minutes");

  async function handleGenerate() {
    await generate({
      meetingTitle: meetingTitle || undefined,
      attendees: attendees || undefined,
      agenda: agenda || undefined,
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-medium text-foreground-muted block mb-1">
          Meeting Title
        </label>
        <input
          className={inputClass}
          value={meetingTitle}
          onChange={(e) => setMeetingTitle(e.target.value)}
          placeholder="e.g., Q3 Planning Session"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-foreground-muted block mb-1">
          Attendees (one per line)
        </label>
        <textarea
          className={inputClass}
          rows={3}
          value={attendees}
          onChange={(e) => setAttendees(e.target.value)}
          placeholder="John Smith&#10;Jane Doe&#10;..."
        />
      </div>

      <div>
        <label className="text-xs font-medium text-foreground-muted block mb-1">
          Agenda / Discussion Points (optional)
        </label>
        <textarea
          className={inputClass}
          rows={4}
          value={agenda}
          onChange={(e) => setAgenda(e.target.value)}
          placeholder="1. Review Q2 results&#10;2. Discuss new strategy&#10;3. Action items..."
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className={primaryBtn}
      >
        {loading ? "Generating..." : "Generate Meeting Minutes"}
      </button>

      {error && (
        <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      <AnimatePresence>
        {output && <OutputCard text={output} onClear={clear} label="Meeting Minutes" />}
      </AnimatePresence>
    </div>
  );
}

// ─── 6. Content Calendar Generator ──────────────────────────────────────────

function ContentCalendarGenerator() {
  const [month, setMonth] = useState("");
  const [platform, setPlatform] = useState("All Platforms");
  const [topics, setTopics] = useState("");
  const { output, loading, error, generate, clear } = useAIGenerate("content-calendar");

  const platforms = [
    "All Platforms",
    "Blog",
    "Instagram",
    "Twitter / X",
    "LinkedIn",
    "YouTube",
    "TikTok",
    "Facebook",
  ];

  async function handleGenerate() {
    await generate({
      month: month || undefined,
      platform: platform === "All Platforms" ? undefined : platform,
      topics: topics || undefined,
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Month / Period
          </label>
          <input
            className={inputClass}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="e.g., June 2024"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Platform
          </label>
          <select
            className={inputClass}
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            {platforms.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-foreground-muted block mb-1">
          Content Topics (optional)
        </label>
        <textarea
          className={inputClass}
          rows={4}
          value={topics}
          onChange={(e) => setTopics(e.target.value)}
          placeholder="List the main topics or themes you want to cover...&#10;&#10;e.g.,&#10;- Product launches&#10;- Industry tips&#10;- Behind the scenes"
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className={primaryBtn}
      >
        {loading ? "Generating..." : "Generate Content Calendar"}
      </button>

      {error && (
        <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      <AnimatePresence>
        {output && <OutputCard text={output} onClear={clear} label="Content Calendar" />}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function ProductivityWorkspace({ tool }: { tool: Tool }) {
  switch (tool.slug) {
    case "daily-planner":
      return <DailyPlannerTemplate />;
    case "weekly-planner":
      return <WeeklyPlannerTemplate />;
    case "task-checklist":
      return <TaskChecklistGenerator />;
    case "packing-list":
      return <PackingListGenerator />;
    case "meeting-minutes":
      return <MeetingMinutesTemplate />;
    case "content-calendar":
      return <ContentCalendarGenerator />;
    default:
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-foreground-muted">Tool not found: {tool.slug}</p>
        </div>
      );
  }
}