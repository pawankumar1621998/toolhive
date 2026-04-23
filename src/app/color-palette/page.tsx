import type { Metadata } from "next";
import { ColorPalette } from "@/components/features/color-palette/ColorPalette";

export const metadata: Metadata = {
  title: "Color Palette Generator — Free Color Scheme Tool | ToolHive",
  description: "Generate beautiful color palettes from any base color. Get complementary, analogous, triadic, and monochromatic schemes. Copy HEX, RGB, or HSL values instantly.",
};

export default function ColorPalettePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ColorPalette />
      </div>
    </main>
  );
}
