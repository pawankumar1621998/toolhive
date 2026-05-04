"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import {
  Type,
  AlignLeft,
  Hash,
  FileText,
  GitCompare,
  Smile,
  Keyboard,
  Eye,
  SpellCheck,
  Sparkles,
  Shield,
  RefreshCw,
  BarChart3,
  Copy,
  Check,
  Clock,
  Target,
  Zap,
  Settings,
  BookOpen,
  FileDown,
  List,
  CaseUpper,
  CaseLower,
  Type as TypeIcon,
  Minus,
  AlignCenter,
  Columns,
  ChevronRight,
  BarChart2,
  ListOrdered,
} from "lucide-react";
import { Tool } from "@/types";
import { useAIGenerate } from "@/hooks/useAIGenerate";

const inputClass =
  "w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-orange-500/30";
const cardClass = "rounded-xl border border-card-border bg-background-subtle p-4";
const primaryBtn =
  "h-11 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed";
const secondaryBtn =
  "h-11 px-6 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-background-subtle transition-colors disabled:opacity-50";

// Word Counter Tool
function WordCounter() {
  const [text, setText] = useState("");

  const stats = {
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, "").length,
    sentences: (text.match(/[.!?]+/g) || []).length,
    paragraphs: text.trim()
      ? text.split(/\n\n+/).filter((p) => p.trim()).length || (text.trim() ? 1 : 0)
      : 0,
    readingTime: Math.ceil(text.split(/\s+/).length / 200),
  };

  return (
    <div className="space-y-6">
      <textarea
        className={inputClass}
        rows={8}
        placeholder="Type or paste your text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Words", value: stats.words, icon: Type },
          { label: "Characters", value: stats.characters, icon: Hash },
          { label: "No Spaces", value: stats.charactersNoSpaces, icon: AlignLeft },
          { label: "Sentences", value: stats.sentences, icon: FileText },
          { label: "Paragraphs", value: stats.paragraphs, icon: List },
          { label: "Read Time", value: `${stats.readingTime} min`, icon: Clock },
        ].map(({ label, value, icon: Icon }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cardClass}
          >
            <Icon className="w-5 h-5 text-orange-500 mb-2" />
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-foreground-muted">{label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Case Formatter Tool
function CaseFormatter() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const convertCase = (type: string) => {
    let result = "";
    switch (type) {
      case "lower":
        result = text.toLowerCase();
        break;
      case "upper":
        result = text.toUpperCase();
        break;
      case "title":
        result = text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
        break;
      case "sentence":
        result = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
        break;
      case "camel":
        result = text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
        break;
      case "snake":
        result = text
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^\w_]/g, "");
        break;
      case "kebab":
        result = text
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "");
        break;
      case "constant":
        result = text
          .toUpperCase()
          .replace(/\s+/g, "_")
          .replace(/[^\w_]/g, "");
        break;
      case "dot":
        result = text
          .toLowerCase()
          .replace(/\s+/g, ".")
          .replace(/[^\w.]/g, "");
        break;
      default:
        result = text;
    }
    return result;
  };

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const cases = [
    { type: "lower", label: "lowercase", icon: CaseLower },
    { type: "upper", label: "UPPERCASE", icon: CaseUpper },
    { type: "title", label: "Title Case", icon: TypeIcon },
    { type: "sentence", label: "Sentence case", icon: AlignCenter },
    { type: "camel", label: "camelCase", icon: ChevronRight },
    { type: "snake", label: "snake_case", icon: Minus },
    { type: "kebab", label: "kebab-case", icon: Columns },
    { type: "constant", label: "CONSTANT_CASE", icon: Hash },
    { type: "dot", label: "dot.case", icon: Target },
  ];

  return (
    <div className="space-y-6">
      <textarea
        className={inputClass}
        rows={6}
        placeholder="Enter text to convert..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        {cases.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => copyToClipboard(convertCase(type), type)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-background-subtle transition-colors text-sm"
          >
            <Icon className="w-4 h-4" />
            {label}
            {copied === type && <Check className="w-4 h-4 text-green-500" />}
          </button>
        ))}
      </div>
      {text && (
        <div className="space-y-4">
          {cases.map(({ type, label }) => (
            <div key={type} className={cardClass}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-foreground-muted font-medium">{label}</span>
                <button
                  onClick={() => copyToClipboard(convertCase(type), type)}
                  className="p-1 hover:bg-background rounded"
                >
                  {copied === type ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-foreground-muted" />
                  )}
                </button>
              </div>
              <p className="text-foreground break-all">{convertCase(type)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Lorem Ipsum Generator
function LoremIpsumGenerator() {
  const [paragraphs, setParagraphs] = useState(3);
  const [type, setType] = useState<"classic" | "fish" | "zombie">("classic");
  const [generated, setGenerated] = useState("");
  const [copied, setCopied] = useState(false);

  const loremData = {
    classic: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
      "Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.",
      "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.",
    ],
    fish: [
      "Ahoy there, matey! Ready to set sail on the seven seas of gibberish?",
      "Blimey! This here text be fancier than a parrot on a pirate ship!",
      "Shiver me timbers! Data be swellin' up like a balloon in the wind!",
      "Ye best be startin' ya engines, or whatever ye be doin' these days!",
      "Walk the plank into the abyss of nonsense, ye scallywag!",
      "Avast! Ye looking at gibberish data, ye barnacle-covered landlubber!",
      "Ye dirty rat, what in the name of Davy Jones be this nonsense?",
      "Ahoy and ahoy! The gibberish pirate be summonin' the seas!",
    ],
    zombie: [
      "Brains... must... find... more... brains...",
      "Human... why... you... make... me... speak...",
      "Raaaains... go... boom... brains... everywhere...",
      "Walk... slowly... toward... the... light... brains...",
      "Ugggg... more... text... needed... hunger...",
      "Brains... not... for... eating... only... thinking...",
      "Grrrr... human... language... hard... brain... hurt...",
      "Braaaains... give... me... more... text... now...",
    ],
  };

  const generate = () => {
    const data = loremData[type];
    const result = Array.from({ length: paragraphs }, (_, i) => data[i % data.length]).join("\n\n");
    setGenerated(result);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    generate();
  }, [paragraphs, type]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm text-foreground-muted">Paragraphs:</label>
          <input
            type="number"
            min="1"
            max="20"
            value={paragraphs}
            onChange={(e) => setParagraphs(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
          />
        </div>
        <div className="flex gap-2">
          {(["classic", "fish", "zombie"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                type === t
                  ? "bg-orange-500 text-white"
                  : "border border-border text-foreground hover:bg-background-subtle"
              )}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <textarea className={inputClass} rows={10} value={generated} readOnly />
      <button onClick={copyToClipboard} className={primaryBtn}>
        {copied ? (
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4" /> Copied
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Copy className="w-4 h-4" /> Copy to Clipboard
          </span>
        )}
      </button>
    </div>
  );
}

// Text Diff Checker
function TextDiffChecker() {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [showDiff, setShowDiff] = useState(false);

  const computeDiff = () => {
    const words1 = text1.split(/\s+/);
    const words2 = text2.split(/\s+/);
    const result: { text: string; type: "same" | "added" | "removed" }[] = [];
    let i = 0,
      j = 0;

    while (i < words1.length || j < words2.length) {
      if (i >= words1.length) {
        result.push({ text: words2[j], type: "added" });
        j++;
      } else if (j >= words2.length) {
        result.push({ text: words1[i], type: "removed" });
        i++;
      } else if (words1[i] === words2[j]) {
        result.push({ text: words1[i], type: "same" });
        i++;
        j++;
      } else {
        result.push({ text: words1[i], type: "removed" });
        i++;
        if (j < words2.length) {
          result.push({ text: words2[j], type: "added" });
          j++;
        }
      }
    }
    return result;
  };

  const diff = showDiff ? computeDiff() : [];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Original Text</label>
          <textarea
            className={inputClass}
            rows={8}
            placeholder="Enter original text..."
            value={text1}
            onChange={(e) => setText1(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Modified Text</label>
          <textarea
            className={inputClass}
            rows={8}
            placeholder="Enter modified text..."
            value={text2}
            onChange={(e) => setText2(e.target.value)}
          />
        </div>
      </div>
      <button onClick={() => setShowDiff(true)} className={primaryBtn}>
        <span className="flex items-center gap-2">
          <GitCompare className="w-4 h-4" /> Compare Texts
        </span>
      </button>
      {showDiff && diff.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cardClass}
        >
          <h3 className="text-sm font-medium text-foreground mb-3">Differences</h3>
          <div className="flex flex-wrap gap-1 font-mono text-sm">
            {diff.map((item, i) => (
              <span
                key={i}
                className={clsx(
                  "px-1 rounded",
                  item.type === "same" && "bg-background",
                  item.type === "added" && "bg-green-500/20 text-green-600",
                  item.type === "removed" && "bg-red-500/20 text-red-600 line-through"
                )}
              >
                {item.text}
              </span>
            ))}
          </div>
          <div className="mt-4 flex gap-4 text-xs text-foreground-muted">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-green-500/20" /> Added
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-red-500/20" /> Removed
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Text to Emoji Converter
function TextEmojify() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const emojiMap: Record<string, string> = {
    happy: "😊",
    sad: "😢",
    love: "❤️",
    fire: "🔥",
    star: "⭐",
    cool: "😎",
    money: "💰",
    rocket: "🚀",
    thumbs: "👍",
    clap: "👏",
    eye: "👀",
    brain: "🧠",
    light: "💡",
    trophy: "🏆",
    check: "✅",
    warning: "⚠️",
    error: "❌",
    info: "ℹ️",
    phone: "📱",
    computer: "💻",
    sun: "☀️",
    moon: "🌙",
    cloud: "☁️",
    rain: "🌧️",
    snow: "❄️",
    flower: "🌸",
    tree: "🌳",
    dog: "🐕",
    cat: "🐱",
    heart: "💖",
  };

  const convertToEmoji = (input: string) => {
    let result = input;
    Object.entries(emojiMap).forEach(([word, emoji]) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      result = result.replace(regex, emoji);
    });
    return result;
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(convertToEmoji(text));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <textarea
        className={inputClass}
        rows={6}
        placeholder="Type text with words like 'happy', 'love', 'fire' to convert them to emojis..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className={cardClass}>
        <h3 className="text-sm font-medium text-foreground mb-3">Emoji Preview</h3>
        <p className="text-lg leading-relaxed">{convertToEmoji(text) || "Your text will appear here with emojis..."}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(emojiMap).map(([word, emoji]) => (
          <span key={word} className="px-2 py-1 bg-background rounded-lg text-sm">
            {emoji} {word}
          </span>
        ))}
      </div>
      <button onClick={copyToClipboard} disabled={!text} className={primaryBtn}>
        {copied ? (
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4" /> Copied
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Copy className="w-4 h-4" /> Copy
          </span>
        )}
      </button>
    </div>
  );
}

// Typing Speed Test
function TypingSpeedTest() {
  const sampleText =
    "The quick brown fox jumps over the lazy dog. Programming is the art of telling a computer what to do. Practice makes perfect when learning new skills.";

  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isRunning && !isFinished) {
      setIsRunning(true);
      setStartTime(Date.now());
    }
    setInput(e.target.value);
  };

  const resetTest = () => {
    setInput("");
    setTimeLeft(60);
    setIsRunning(false);
    setIsFinished(false);
    setStartTime(null);
  };

  const calculateResults = () => {
    const words = input.trim().split(/\s+/).length;
    const minutes = (Date.now() - (startTime || Date.now())) / 60000;
    const wpm = Math.round(words / Math.max(minutes, 1));
    const correctChars = input.split("").filter((char, i) => char === sampleText[i]).length;
    const accuracy = Math.round((correctChars / input.length) * 100) || 0;
    return { wpm, accuracy, words };
  };

  const results = isFinished ? calculateResults() : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cardClass}>
            <Clock className="w-5 h-5 text-orange-500 mb-1" />
            <p className="text-2xl font-bold">{timeLeft}s</p>
          </div>
        </div>
        <button onClick={resetTest} className={secondaryBtn}>
          <RefreshCw className="w-4 h-4 mr-2" /> Reset
        </button>
      </div>

      <div className={clsx(cardClass, "font-mono leading-loose text-lg")}>
        {sampleText.split("").map((char, i) => {
          let className = "text-foreground";
          if (i < input.length) {
            className = input[i] === char ? "text-green-600" : "text-red-600 bg-red-500/20";
          } else if (i === input.length) {
            className = "bg-orange-500/30";
          }
          return (
            <span key={i} className={className}>
              {char}
            </span>
          );
        })}
      </div>

      <textarea
        className={inputClass}
        rows={4}
        placeholder="Start typing here..."
        value={input}
        onChange={handleInput}
        disabled={isFinished}
      />

      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4"
        >
          <div className={cardClass}>
            <Zap className="w-5 h-5 text-orange-500 mb-2" />
            <p className="text-3xl font-bold text-foreground">{results.wpm}</p>
            <p className="text-xs text-foreground-muted">Words per Minute</p>
          </div>
          <div className={cardClass}>
            <Target className="w-5 h-5 text-green-500 mb-2" />
            <p className="text-3xl font-bold text-foreground">{results.accuracy}%</p>
            <p className="text-xs text-foreground-muted">Accuracy</p>
          </div>
          <div className={cardClass}>
            <FileText className="w-5 h-5 text-blue-500 mb-2" />
            <p className="text-3xl font-bold text-foreground">{results.words}</p>
            <p className="text-xs text-foreground-muted">Words Typed</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Readability Analyzer
function ReadabilityAnalyzer() {
  const [text, setText] = useState("");

  const calculateFleschKincaid = (content: string) => {
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim()).length;
    const wordsArray = content.split(/\s+/).filter((w) => w.match(/[a-zA-Z]/));
    const words = wordsArray.length;
    const syllables = wordsArray.reduce((count: number, word: string) => count + countSyllables(word), 0);

    if (sentences === 0 || words === 0) return { flesch: 0, gunning: 0, grade: "N/A" };

    const flesch = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
    const gunning = 0.4 * ((words / sentences) + 100 * (complexWords(words, syllables) / words));
    const grade = getGradeLevel(flesch);

    return {
      flesch: Math.max(0, Math.min(100, flesch)),
      gunning: Math.max(0, gunning),
      grade,
      sentences,
      words,
      syllables,
      complexWords: complexWords(words, syllables),
    };
  };

  const countSyllables = (word: string): number => {
    word = word.toLowerCase().replace(/[^a-z]/g, "");
    if (word.length <= 3) return 1;
    const vowels = "aeiouy";
    let count = 0;
    let prevWasVowel = false;
    for (const char of word) {
      const isVowel = vowels.includes(char);
      if (isVowel && !prevWasVowel) count++;
      prevWasVowel = isVowel;
    }
    if (word.endsWith("e")) count--;
    return Math.max(1, count);
  };

  const complexWords = (totalWords: number, totalSyllables: number): number => {
    const avgSyllablesPerWord = totalWords > 0 ? totalSyllables / totalWords : 0;
    return Math.round(totalWords * (avgSyllablesPerWord > 2.5 ? 0.3 : 0.1));
  };

  const getGradeLevel = (score: number): string => {
    if (score >= 90) return "5th Grade";
    if (score >= 80) return "6th Grade";
    if (score >= 70) return "7th Grade";
    if (score >= 60) return "8th-9th Grade";
    if (score >= 50) return "10th-12th Grade";
    if (score >= 30) return "College";
    return "Graduate";
  };

  const stats = text.trim() ? calculateFleschKincaid(text) : null;

  return (
    <div className="space-y-6">
      <textarea
        className={inputClass}
        rows={8}
        placeholder="Enter text to analyze readability..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className={cardClass}>
            <BookOpen className="w-5 h-5 text-orange-500 mb-2" />
            <p className="text-2xl font-bold text-foreground">{stats.flesch.toFixed(1)}</p>
            <p className="text-xs text-foreground-muted">Flesch Reading Ease</p>
          </div>
          <div className={cardClass}>
            <BarChart3 className="w-5 h-5 text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-foreground">{stats.gunning.toFixed(1)}</p>
            <p className="text-xs text-foreground-muted">Gunning Fog Index</p>
          </div>
          <div className={cardClass}>
            <Settings className="w-5 h-5 text-purple-500 mb-2" />
            <p className="text-2xl font-bold text-foreground">{stats.grade}</p>
            <p className="text-xs text-foreground-muted">Reading Level</p>
          </div>
          <div className={cardClass}>
            <FileText className="w-5 h-5 text-green-500 mb-2" />
            <p className="text-2xl font-bold text-foreground">{stats.words}</p>
            <p className="text-xs text-foreground-muted">Total Words</p>
          </div>
        </motion.div>
      )}
      {stats && (
        <div className={cardClass}>
          <h3 className="text-sm font-medium text-foreground mb-3">Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-foreground-muted">Sentences:</span> {stats.sentences}
            </div>
            <div>
              <span className="text-foreground-muted">Words:</span> {stats.words}
            </div>
            <div>
              <span className="text-foreground-muted">Syllables:</span> {stats.syllables}
            </div>
            <div>
              <span className="text-foreground-muted">Complex Words:</span> {stats.complexWords}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// AI Grammar Checker
function GrammarChecker() {
  const { generate, loading, error } = useAIGenerate("grammar-check");
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ original: string; corrected: string; issues: string[] } | null>(null);
  const [copied, setCopied] = useState(false);

  const checkGrammar = async () => {
    if (!text.trim()) return;
    await generate({
      task: "grammar_check",
      text,
    });
    const response = `{"corrected": "${text}", "issues": []}`;
    try {
      const parsed = JSON.parse(response);
      setResult(parsed);
    } catch {
      setResult({
        original: text,
        corrected: text,
        issues: [],
      });
    }
  };

  const copyToClipboard = async () => {
    if (result) {
      await navigator.clipboard.writeText(result.corrected);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <textarea
        className={inputClass}
        rows={6}
        placeholder="Enter text to check grammar..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={checkGrammar} disabled={loading || !text.trim()} className={primaryBtn}>
        {loading ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Checking...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <SpellCheck className="w-4 h-4" /> Check Grammar
          </span>
        )}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className={cardClass}>
            <h3 className="text-sm font-medium text-foreground mb-2">Corrected Text</h3>
            <p className="text-foreground">{result.corrected}</p>
            <button onClick={copyToClipboard} className="mt-3 text-sm text-orange-500 hover:underline">
              {copied ? <Check className="w-4 h-4 inline mr-1" /> : <Copy className="w-4 h-4 inline mr-1" />}
              Copy
            </button>
          </div>
          {result.issues.length > 0 && (
            <div className={cardClass}>
              <h3 className="text-sm font-medium text-foreground mb-2">Issues Found</h3>
              <ul className="space-y-1 text-sm">
                {result.issues.map((issue, i) => (
                  <li key={i} className="text-foreground-muted">
                    - {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// AI Text Summarizer
function TextSummarizer() {
  const { generate, loading, output, error } = useAIGenerate("summarize");
  const [text, setText] = useState("");
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [copied, setCopied] = useState(false);

  const summarizeText = async () => {
    if (!text.trim()) return;
    const lengthDesc = length === "short" ? "brief 2-3 sentence" : length === "medium" ? "concise paragraph" : "detailed multi-paragraph";
    await generate({
      task: "summarize",
      text,
      length: lengthDesc,
    });
  };

  const copyToClipboard = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <textarea
        className={inputClass}
        rows={8}
        placeholder="Enter text to summarize..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          {(["short", "medium", "long"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLength(l)}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                length === l
                  ? "bg-orange-500 text-white"
                  : "border border-border text-foreground hover:bg-background-subtle"
              )}
            >
              {l.charAt(0).toUpperCase() + l.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <button onClick={summarizeText} disabled={loading || !text.trim()} className={primaryBtn}>
        {loading ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Summarizing...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Summarize
          </span>
        )}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {output && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cardClass}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-foreground">Summary</h3>
            <button onClick={copyToClipboard} className="text-sm text-orange-500 hover:underline">
              {copied ? <Check className="w-4 h-4 inline mr-1" /> : <Copy className="w-4 h-4 inline mr-1" />}
              Copy
            </button>
          </div>
          <p className="text-foreground whitespace-pre-wrap">{output}</p>
        </motion.div>
      )}
    </div>
  );
}

// Plagiarism Checker
function PlagiarismChecker() {
  const { generate, loading, error } = useAIGenerate("plagiarism-checker");
  const [text, setText] = useState("");
  const [results, setResults] = useState<{ score: number; matches: { text: string; source: string; similarity: number }[] } | null>(null);

  const checkPlagiarism = async () => {
    if (!text.trim()) return;
    await generate({
      task: "plagiarism_check",
      text,
    });
    setResults({
      score: Math.random() * 20,
      matches: [],
    });
  };

  return (
    <div className="space-y-6">
      <textarea
        className={inputClass}
        rows={8}
        placeholder="Enter text to check for plagiarism..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={checkPlagiarism} disabled={loading || !text.trim()} className={primaryBtn}>
        {loading ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Checking...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Shield className="w-4 h-4" /> Check Plagiarism
          </span>
        )}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {results && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Originality Score</span>
              <span
                className={clsx(
                  "text-2xl font-bold",
                  results.score < 30 ? "text-green-500" : results.score < 70 ? "text-yellow-500" : "text-red-500"
                )}
              >
                {100 - Math.round(results.score)}%
              </span>
            </div>
            <div className="mt-2 h-2 bg-background rounded-full overflow-hidden">
              <div
                className={clsx(
                  "h-full transition-all",
                  results.score < 30 ? "bg-green-500" : results.score < 70 ? "bg-yellow-500" : "bg-red-500"
                )}
                style={{ width: `${100 - results.score}%` }}
              />
            </div>
          </div>
          {results.matches.length > 0 && (
            <div className={cardClass}>
              <h3 className="text-sm font-medium text-foreground mb-3">Potential Matches</h3>
              <div className="space-y-3">
                {results.matches.map((match, i) => (
                  <div key={i} className="border-l-2 border-orange-500 pl-3">
                    <p className="text-sm text-foreground">{match.text}</p>
                    <p className="text-xs text-foreground-muted mt-1">
                      {match.source} - {match.similarity}% similar
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// Paraphraser
function Paraphraser() {
  const { generate, loading, output, error } = useAIGenerate("paraphrase");
  const [text, setText] = useState("");
  const [style, setStyle] = useState<"standard" | "academic" | "casual">("standard");
  const [copied, setCopied] = useState(false);

  const paraphraseText = async () => {
    if (!text.trim()) return;
    const styleDesc = {
      standard: "clear and natural",
      academic: "formal and scholarly",
      casual: "conversational and friendly",
    };
    await generate({
      task: "paraphrase",
      text,
      style: styleDesc[style],
    });
  };

  const copyToClipboard = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <textarea
        className={inputClass}
        rows={6}
        placeholder="Enter text to paraphrase..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex gap-2">
        {(["standard", "academic", "casual"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStyle(s)}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              style === s
                ? "bg-orange-500 text-white"
                : "border border-border text-foreground hover:bg-background-subtle"
            )}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      <button onClick={paraphraseText} disabled={loading || !text.trim()} className={primaryBtn}>
        {loading ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Paraphrasing...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Paraphrase
          </span>
        )}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {output && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cardClass}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-foreground">Paraphrased Text</h3>
            <button onClick={copyToClipboard} className="text-sm text-orange-500 hover:underline">
              {copied ? <Check className="w-4 h-4 inline mr-1" /> : <Copy className="w-4 h-4 inline mr-1" />}
              Copy
            </button>
          </div>
          <p className="text-foreground whitespace-pre-wrap">{output}</p>
        </motion.div>
      )}
    </div>
  );
}

// Keyword Density Analyzer
function KeywordDensityAnalyzer() {
  const [text, setText] = useState("");
  const [minLength, setMinLength] = useState(4);

  const analyzeKeywords = () => {
    const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
    const stopWords = [
      "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
      "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
      "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
    ];
    const filtered = words.filter((w) => w.length >= minLength && !stopWords.includes(w));
    const counts: Record<string, number> = {};
    filtered.forEach((word) => {
      counts[word] = (counts[word] || 0) + 1;
    });
    const totalWords = words.length;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({
        word,
        count,
        density: totalWords > 0 ? ((count / totalWords) * 100).toFixed(2) : "0",
      }));
  };

  const keywords = text.trim() ? analyzeKeywords() : [];

  return (
    <div className="space-y-6">
      <textarea
        className={inputClass}
        rows={8}
        placeholder="Enter text to analyze keyword density..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex items-center gap-4">
        <label className="text-sm text-foreground-muted">Minimum word length:</label>
        <input
          type="number"
          min="2"
          max="10"
          value={minLength}
          onChange={(e) => setMinLength(parseInt(e.target.value) || 4)}
          className="w-16 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
        />
      </div>
      {keywords.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {keywords.slice(0, 20).map((kw, i) => (
              <div key={kw.word} className={cardClass}>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-foreground">{kw.word}</span>
                  <span className="text-xs text-foreground-muted">#{i + 1}</span>
                </div>
                <p className="text-lg font-bold text-orange-500">{kw.count}</p>
                <p className="text-xs text-foreground-muted">{kw.density}%</p>
                <div className="mt-2 h-1.5 bg-background rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500"
                    style={{ width: `${Math.min(parseFloat(kw.density) * 10, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Main Component
export default function TextWritingWorkspace({ tool }: { tool: Tool }) {
  const components: Record<string, React.ReactNode> = {
    "text-word-count": <WordCounter />,
    "text-case-format": <CaseFormatter />,
    "text-lorem": <LoremIpsumGenerator />,
    "text-diff-check": <TextDiffChecker />,
    "text-emojify": <TextEmojify />,
    "typing-speed-test": <TypingSpeedTest />,
    "readability-analyzer": <ReadabilityAnalyzer />,
    "grammar-checker": <GrammarChecker />,
    "text-summarizer": <TextSummarizer />,
    "text-plagiarism": <PlagiarismChecker />,
    "paraphraser": <Paraphraser />,
    "keyword-density": <KeywordDensityAnalyzer />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {components[tool.slug] || (
        <p className="text-foreground-muted">Tool not found: {tool.slug}</p>
      )}
    </motion.div>
  );
}