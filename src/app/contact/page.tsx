import type { Metadata } from "next";
import { ContactPage } from "@/components/features/contact/ContactPage";

export const metadata: Metadata = {
  title: "Contact — ToolHive",
  description: "Get in touch with the ToolHive team.",
};

export default function ContactRoute() {
  return <ContactPage />;
}
