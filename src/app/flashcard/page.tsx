import type { Metadata } from "next";
import { FlashcardGenerator } from "@/components/features/flashcard/FlashcardGenerator";

export const metadata: Metadata = {
  title: "Flashcard Generator — AI-Powered Study Cards | ToolHive",
  description: "Generate interactive flashcards on any topic using AI. Flip cards, shuffle, navigate, and study with Q&A pairs generated instantly.",
};

export default function FlashcardPage() {
  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <FlashcardGenerator />
      </div>
    </main>
  );
}
