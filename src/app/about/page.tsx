import type { Metadata } from "next";
import { AboutPage } from "@/components/features/about/AboutPage";

export const metadata: Metadata = {
  title: "About — ToolHive",
  description:
    "Learn about ToolHive — our mission to make powerful AI tools free and accessible to everyone, with no signup required.",
  alternates: { canonical: "https://toolhive-red.vercel.app/about" },
  openGraph: {
    title: "About ToolHive",
    description: "Learn about ToolHive's mission to make AI tools free for everyone.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ToolHive About" }],
  },
};

export default function AboutRoute() {
  return <AboutPage />;
}
