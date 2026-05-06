"use client";

import dynamic from "next/dynamic";
import type { Tool } from "@/types";

const PDFEditorWorkspace = dynamic(
  () => import("./PDFEditorWorkspace").then((mod) => mod.default),
  { ssr: false, loading: () => <div className="p-8 text-center">Loading PDF Editor...</div> }
);

export function PDFEditorWrapper({ tool }: { tool: Tool }) {
  return <PDFEditorWorkspace tool={tool} />;
}
