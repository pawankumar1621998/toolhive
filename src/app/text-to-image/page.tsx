import type { Metadata } from "next";
import { TextToImage } from "@/components/features/text-to-image/TextToImage";

export const metadata: Metadata = {
  title: "AI Image Generator — Text to Image Free | ToolHive",
  description:
    "Generate stunning AI images from text for free using NVIDIA FLUX. No signup required. Supports photorealistic, anime, oil painting, cinematic styles and more.",
  keywords: ["ai image generator", "text to image", "FLUX AI", "free ai art", "AI art generator online"],
};

export default function TextToImagePage() {
  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <TextToImage />
    </main>
  );
}
