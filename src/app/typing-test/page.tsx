import type { Metadata } from "next";
import { TypingTest } from "@/components/features/typing-test/TypingTest";

export const metadata: Metadata = {
  title: "Typing Speed Test — WPM Test Online | ToolHive",
  description: "Test your typing speed and accuracy for free. Get your WPM (words per minute) score and accuracy percentage in 30, 60, or 120 second tests.",
};

export default function TypingTestPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <TypingTest />
      </div>
    </main>
  );
}
