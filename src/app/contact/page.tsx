import type { Metadata } from "next";
import { ContactPage } from "@/components/features/contact/ContactPage";

export const metadata: Metadata = {
  title: "Contact — ToolHive",
  description: "Get in touch with the ToolHive team.",
  alternates: { canonical: "https://toolhive.app/contact" },
  openGraph: {
    title: "Contact ToolHive",
    description: "Get in touch with the ToolHive team.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ToolHive Contact" }],
  },
};

export default function ContactRoute() {
  return <ContactPage />;
}
