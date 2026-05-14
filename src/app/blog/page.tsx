import type { Metadata } from "next";
import { BlogPage } from "@/components/features/blog/BlogPage";

export const metadata: Metadata = {
  title: "ToolHive Blog — AI Tools Tutorials, Tips & Free Guides",
  description: "Tips, tutorials, and guides for using AI tools. Learn how to compress PDFs, remove backgrounds, write Twitter threads, and more free AI tools tips.",
  keywords: ["AI tools blog", "PDF tools tutorial", "image tools guide", "free AI writing tips", "ToolHive blog", "AI tools tutorials"],
  alternates: { canonical: "https://toolhive-red.vercel.app/blog" },
  openGraph: {
    title: "ToolHive Blog",
    description: "Tips, tutorials, and guides for using free AI tools. Compress PDFs, remove backgrounds, write viral posts.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ToolHive Blog" }],
  },
};

export default function BlogRoute() {
  return <BlogPage />;
}
