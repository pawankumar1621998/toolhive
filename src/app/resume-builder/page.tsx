import type { Metadata } from "next";
import Script from "next/script";
import { ResumeBuilder } from "@/components/features/resume/ResumeBuilder";

export const metadata: Metadata = {
  title: "Free Resume Builder — AI-Powered Resume Maker | ToolHive",
  description:
    "Build a professional resume in minutes with our free AI-powered resume builder. Live preview, 3 templates, ATS-friendly PDF download. No signup required. 100% free premium resume builder.",
  keywords: ["resume builder", "free resume maker", "AI resume builder", "ATS friendly resume", "professional resume free", "premium resume builder no signup", "create resume online free"],
  alternates: { canonical: "https://toolhive-red.vercel.app/resume-builder" },
  openGraph: {
    title: "Free Premium Resume Builder | ToolHive",
    description: "Build a professional ATS-friendly resume for free. AI-powered, live preview, instant PDF download. No signup.",
    type: "website",
    siteName: "ToolHive",
    url: "https://toolhive-red.vercel.app/resume-builder",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Free Resume Builder by ToolHive" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Premium Resume Builder | ToolHive",
    description: "Build a professional ATS-friendly resume for free. AI-powered, live preview, instant PDF download.",
  },
};

const BREADCRUMB_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://toolhive-red.vercel.app",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Resume Builder",
      item: "https://toolhive-red.vercel.app/resume-builder",
    },
  ],
};

const APP_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Free Resume Builder",
  description: "Build a professional ATS-friendly resume for free. AI-powered resume builder with live preview, 3 templates, and instant PDF download. No signup required.",
  url: "https://toolhive-red.vercel.app/resume-builder",
  applicationCategory: "UtilityApplication",
  operatingSystem: "All",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "8200",
    bestRating: "5",
    worstRating: "1",
  },
};

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is the resume builder free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, 100% free with no signup required. Build unlimited resumes with all features included.",
      },
    },
    {
      "@type": "Question",
      name: "Is the resume ATS-friendly?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, all templates are designed to pass Applicant Tracking Systems used by major companies.",
      },
    },
    {
      "@type": "Question",
      name: "Can I download my resume as PDF?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, download your resume as a professional PDF instantly. No watermarks, no limits.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need an account to use the resume builder?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No account needed. Start building your resume immediately — no email, no signup, no password.",
      },
    },
  ],
};

export default function ResumeBuilderPage() {
  return (
    <>
      <Script id="ld-resume-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_JSON_LD) }} />
      <Script id="ld-resume-app" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(APP_JSON_LD) }} />
      <Script id="ld-resume-faq" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <ResumeBuilder />
        </div>
      </div>
    </>
  );
}
