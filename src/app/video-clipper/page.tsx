import type { Metadata } from "next";
import { VideoClipper } from "@/components/features/video-clipper/VideoClipper";

export const metadata: Metadata = {
  title: "AI Video Clipper — Extract Best Clips | ToolHive",
  description:
    "Upload any video and let AI find the best clip moments, or mark your own time segments. Extract short clips directly in your browser — no upload to any server.",
};

export default function VideoClipperPage() {
  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <VideoClipper />
      </div>
    </main>
  );
}
