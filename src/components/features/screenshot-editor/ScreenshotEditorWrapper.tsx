"use client";

import dynamic from "next/dynamic";
import type { Tool } from "@/types";

const ScreenshotEditorWorkspace = dynamic(
  () => import("./ScreenshotEditorWorkspace").then((mod) => mod.default),
  { ssr: false, loading: () => <div className="p-8 text-center">Loading Screenshot Editor...</div> }
);

export function ScreenshotEditorWrapper({ tool }: { tool: Tool }) {
  return <ScreenshotEditorWorkspace tool={tool} />;
}
