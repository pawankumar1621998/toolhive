import type { Metadata } from "next";
import { TextToAudio } from "@/components/features/text-to-audio/TextToAudio";

export const metadata: Metadata = {
  title: "Text to Audio — Free Text to Speech Online | ToolHive",
  description:
    "Convert any text to natural speech for free. Supports 13 languages, multiple voices, adjustable speed and pitch. No signup, works in your browser.",
  keywords: ["text to speech", "text to audio", "free tts online", "text to voice", "speech synthesizer"],
};

export default function TextToAudioPage() {
  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <TextToAudio />
    </main>
  );
}
