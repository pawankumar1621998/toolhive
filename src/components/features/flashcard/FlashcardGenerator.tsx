"use client";

import { useState, useCallback, useEffect } from "react";
import { useAIGenerate } from "@/hooks/useAIGenerate";

/* ─── Inline styles for 3-D card flip ─────────────────────────────────────── */
const FLIP_STYLES = `
.fc-scene { perspective: 1000px; }
.fc-card {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.55s cubic-bezier(0.4, 0.2, 0.2, 1);
  cursor: pointer;
}
.fc-card.flipped { transform: rotateY(180deg); }
.fc-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}
.fc-back { transform: rotateY(180deg); }
`;

interface Card { q: string; a: string; }

const COUNT_OPTIONS = [5, 10, 15, 20];

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function parseCards(raw: string): Card[] {
  // Strip markdown code fences
  const cleaned = raw.replace(/```[a-z]*\n?/gi, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((item): item is Card => typeof item === "object" && item !== null && "q" in item && "a" in item)
        .map(item => ({ q: String(item.q), a: String(item.a) }));
    }
  } catch { /* fall through */ }

  // Best-effort line parsing: "Q: ... A: ..."
  const lines = cleaned.split("\n").filter(Boolean);
  const cards: Card[] = [];
  let current: Partial<Card> = {};
  for (const line of lines) {
    const qMatch = line.match(/^[Qq]:?\s*(.+)/);
    const aMatch = line.match(/^[Aa]:?\s*(.+)/);
    if (qMatch) {
      if (current.q && current.a) cards.push(current as Card);
      current = { q: qMatch[1].trim() };
    } else if (aMatch && current.q) {
      current.a = aMatch[1].trim();
    }
  }
  if (current.q && current.a) cards.push(current as Card);
  return cards;
}

/* ─── Single flip card ─────────────────────────────────────────────────────── */
function FlipCard({ card, index }: { card: Card; index: number }) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => { setFlipped(false); }, [index]);

  return (
    <div className="fc-scene w-full" style={{ height: "260px" }}>
      <div
        className={`fc-card ${flipped ? "flipped" : ""}`}
        onClick={() => setFlipped(f => !f)}
      >
        {/* Front — Question */}
        <div className="fc-face border border-card-border bg-card">
          <span className="text-xs font-semibold text-orange-500 uppercase tracking-widest mb-4">Question</span>
          <p className="text-lg font-semibold text-foreground leading-relaxed">{card.q}</p>
          <p className="text-xs text-foreground-muted mt-6">Click to reveal answer</p>
        </div>
        {/* Back — Answer */}
        <div className="fc-back fc-face bg-gradient-to-br from-orange-500/10 to-amber-400/10 border border-orange-500/30">
          <span className="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-4">Answer</span>
          <p className="text-base text-foreground leading-relaxed">{card.a}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────────────────── */
export function FlashcardGenerator() {
  const [topic,    setTopic]    = useState("");
  const [count,    setCount]    = useState(10);
  const [cards,    setCards]    = useState<Card[]>([]);
  const [current,  setCurrent]  = useState(0);
  const [showAll,  setShowAll]  = useState(false);
  const [parseErr, setParseErr] = useState("");

  const { output, loading, streaming, error, generate, clear } = useAIGenerate("flashcard-generator");

  // Inject 3-D flip styles once
  useEffect(() => {
    const id = "fc-styles";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = FLIP_STYLES;
      document.head.appendChild(s);
    }
  }, []);

  // Parse cards whenever output changes and streaming ends
  useEffect(() => {
    if (!output || streaming) return;
    setParseErr("");
    const parsed = parseCards(output);
    if (parsed.length > 0) {
      setCards(parsed);
      setCurrent(0);
      setShowAll(false);
    } else {
      setParseErr("Could not parse flashcards from the AI response. Try again or adjust your topic.");
    }
  }, [output, streaming]);

  const handleGenerate = useCallback(() => {
    if (!topic.trim()) return;
    setCards([]);
    setParseErr("");
    clear();
    generate({
      text: topic,
      options: {
        task: `Generate ${count} flashcard Q&A pairs for: ${topic}. Format as JSON array: [{"q":"question","a":"answer"}]. Return ONLY valid JSON array, no markdown.`,
      },
    });
  }, [topic, count, generate, clear]);

  const shuffle = useCallback(() => {
    setCards(prev => shuffleArray(prev));
    setCurrent(0);
  }, []);

  const prev = () => setCurrent(c => Math.max(0, c - 1));
  const next = () => setCurrent(c => Math.min(cards.length - 1, c + 1));

  const isGenerating = loading || streaming;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Flashcard Generator</h1>
        <p className="text-sm text-foreground-muted mt-0.5">Enter a topic and generate interactive flashcards powered by AI.</p>
      </div>

      {/* Input */}
      <div className="rounded-2xl border border-card-border bg-card p-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide block mb-1.5">Topic or Text</label>
          <textarea
            className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none"
            rows={3}
            placeholder="e.g. Photosynthesis, World War 2, Python basics, Calculus derivatives…"
            value={topic}
            onChange={e => setTopic(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide block mb-2">Number of Cards</label>
          <div className="flex gap-2">
            {COUNT_OPTIONS.map(n => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  count === n
                    ? "border-orange-500 bg-orange-500/10 text-orange-500"
                    : "border-border text-foreground-muted hover:border-orange-400"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!topic.trim() || isGenerating}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Generating {count} cards…
            </span>
          ) : "Generate Flashcards"}
        </button>
      </div>

      {/* Loading raw output while streaming */}
      {streaming && output && (
        <div className="rounded-2xl border border-card-border bg-card p-5">
          <p className="text-xs text-foreground-muted mb-2 font-semibold uppercase tracking-wide">Receiving…</p>
          <pre className="text-xs text-foreground-muted font-mono whitespace-pre-wrap break-all max-h-32 overflow-auto">{output}</pre>
        </div>
      )}

      {/* Error */}
      {(error || parseErr) && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-500">{error || parseErr}</p>
        </div>
      )}

      {/* Flashcard deck */}
      {cards.length > 0 && (
        <>
          {/* Mode toggle */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">
              {cards.length} card{cards.length !== 1 ? "s" : ""} generated
            </p>
            <div className="flex gap-2">
              <button
                onClick={shuffle}
                className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-foreground-muted hover:border-orange-400 hover:text-foreground transition-colors"
              >
                Shuffle
              </button>
              <button
                onClick={() => setShowAll(v => !v)}
                className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-foreground-muted hover:border-orange-400 hover:text-foreground transition-colors"
              >
                {showAll ? "Card View" : "Show All"}
              </button>
            </div>
          </div>

          {showAll ? (
            /* Show All mode */
            <div className="space-y-3">
              {cards.map((c, i) => (
                <div key={i} className="rounded-2xl border border-card-border bg-card p-4 space-y-2">
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                    <div className="flex-1 space-y-2">
                      <div>
                        <span className="text-xs text-orange-500 font-semibold uppercase tracking-wide">Q</span>
                        <p className="text-sm text-foreground mt-0.5">{c.q}</p>
                      </div>
                      <div className="border-t border-border/50 pt-2">
                        <span className="text-xs text-amber-500 font-semibold uppercase tracking-wide">A</span>
                        <p className="text-sm text-foreground-muted mt-0.5">{c.a}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Card flip view */
            <div className="space-y-4">
              {/* Progress */}
              <div className="flex items-center justify-between text-xs text-foreground-muted">
                <span>Card {current + 1} of {cards.length}</span>
                <span>{Math.round(((current + 1) / cards.length) * 100)}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300"
                  style={{ width: `${((current + 1) / cards.length) * 100}%` }}
                />
              </div>

              {/* Flip card */}
              <FlipCard card={cards[current]} index={current} />

              {/* Navigation */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={prev}
                  disabled={current === 0}
                  className="flex-1 h-11 rounded-xl border border-border text-sm font-semibold text-foreground-muted hover:border-orange-400 hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <button
                  onClick={next}
                  disabled={current === cards.length - 1}
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
