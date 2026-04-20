"use client";

import { LANGUAGES, useLanguageStore } from "@/stores/languageStore";
import { Globe } from "lucide-react";

interface LanguageSelectorProps {
  className?: string;
}

export function LanguageSelector({ className }: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguageStore();
  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className ?? ""}`}>
      <Globe className="w-3.5 h-3.5 text-foreground-muted shrink-0" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="text-xs bg-transparent border border-border rounded-lg pl-1.5 pr-6 py-1 text-foreground-muted hover:text-foreground hover:border-border-hover focus:outline-none focus:ring-1 focus:ring-emerald-500/30 cursor-pointer appearance-none transition-colors"
        title="Output language"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-1.5 text-[10px] text-foreground-muted">▾</span>
    </div>
  );
}
