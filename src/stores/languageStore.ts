"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Language {
  code: string;
  label: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: "English",    label: "English",         flag: "🇺🇸" },
  { code: "Hindi",      label: "Hindi (हिंदी)",   flag: "🇮🇳" },
  { code: "Hinglish",   label: "Hinglish",         flag: "🇮🇳" },
  { code: "Spanish",    label: "Spanish",          flag: "🇪🇸" },
  { code: "French",     label: "French",           flag: "🇫🇷" },
  { code: "German",     label: "German",           flag: "🇩🇪" },
  { code: "Arabic",     label: "Arabic",           flag: "🇸🇦" },
  { code: "Portuguese", label: "Portuguese",       flag: "🇧🇷" },
  { code: "Bengali",    label: "Bengali",          flag: "🇧🇩" },
  { code: "Urdu",       label: "Urdu (اردو)",      flag: "🇵🇰" },
];

interface LanguageStore {
  language: string;
  setLanguage: (lang: string) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: "English",
      setLanguage: (lang) => set({ language: lang }),
    }),
    { name: "toolhive-language" }
  )
);
