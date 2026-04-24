import type { Metadata } from "next";
import { AudioTranscriber } from "@/components/features/audio-transcriber/AudioTranscriber";

export const metadata: Metadata = {
  title: "AI Audio Transcriber — Speech to Text Free | ToolHive",
  description:
    "Convert speech to text instantly using NVIDIA Parakeet AI. Upload MP3, WAV, M4A audio or record live from microphone. Free, fast, accurate transcription.",
  keywords: ["audio transcriber", "speech to text", "voice to text", "audio to text", "AI transcription free"],
};

export default function AudioTranscriberPage() {
  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <AudioTranscriber />
    </main>
  );
}
