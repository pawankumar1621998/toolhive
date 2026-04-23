import type { Metadata } from "next";
import { Stopwatch } from "@/components/features/stopwatch/Stopwatch";

export const metadata: Metadata = {
  title: "Stopwatch — Online Timer with Laps | ToolHive",
  description: "Free online stopwatch with millisecond precision, lap recording, and split times. Start, pause, reset, and track laps instantly.",
};

export default function StopwatchPage() {
  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Stopwatch />
      </div>
    </main>
  );
}
