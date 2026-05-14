import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Auth Callback — ToolHive",
  robots: { index: false, follow: false },
};

export default function AuthCallbackPage() {
  redirect("/");
}