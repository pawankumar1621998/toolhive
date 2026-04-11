import type { Metadata } from "next";
import { BlogPage } from "@/components/features/blog/BlogPage";

export const metadata: Metadata = {
  title: "Blog — ToolHive",
  description: "Tips, tutorials, and updates from the ToolHive team.",
};

export default function BlogRoute() {
  return <BlogPage />;
}
