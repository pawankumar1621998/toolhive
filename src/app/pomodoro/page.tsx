import type { Metadata } from "next";
import { PomodoroTimer } from "@/components/features/pomodoro/PomodoroTimer";

export const metadata: Metadata = {
  title: "Pomodoro Timer — Free Focus Timer for Work & Study | ToolHive",
  description: "Boost your productivity with the Pomodoro Technique. 25-minute work sessions, short and long breaks. Customizable timer with sounds and task tracking.",
};

export default function PomodoroPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <PomodoroTimer />
      </div>
    </main>
  );
}
