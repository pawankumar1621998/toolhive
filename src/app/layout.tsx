import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Script from "next/script";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/Toaster";
import { ChatBotWrapper } from "@/components/features/chat/ChatBotWrapper";
import "./globals.css";

// ─────────────────────────────────────────────
// JSON-LD Structured Data
// ─────────────────────────────────────────────

const LD_JSON_WEBSITE = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ToolHive",
  description: "200+ free AI-powered tools for PDF, image, video, and writing — no signup required",
  url: "https://toolhive.co.in",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://toolhive.co.in/search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
  publisher: {
    "@type": "Organization",
    name: "ToolHive",
    url: "https://toolhive.co.in",
  },
};

const LD_JSON_ORG = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ToolHive",
  url: "https://toolhive.co.in",
  logo: {
    "@type": "ImageObject",
    url: "https://toolhive.co.in/favicon.ico",
  },
  description:
    "ToolHive provides 200+ free AI-powered online tools for PDF, image, video, and writing tasks. No signup required, works instantly in your browser. Founded by Pawan Kumar from Haryana, India.",
  founder: {
    "@type": "Person",
    name: "Pawan Kumar",
    jobTitle: "Founder",
    homeLocation: {
      "@type": "Place",
      name: "Haryana, India",
    },
  },
  areaServed: {
    "@type": "Place",
    name: "Worldwide",
  },
  sameAs: [
    "https://twitter.com/toolhive",
    "https://linkedin.com/company/toolhive",
    "https://github.com/toolhive",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "support@toolhive.app",
  },
};

const LD_JSON_SOFTWARE = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ToolHive",
  description:
    "Free online AI tools including PDF compressor, background remover, AI writer, grammar checker, paraphrasing tool, Twitter thread generator, LinkedIn post generator, YouTube script generator, image generator, and more — all free, no signup required.",
  url: "https://toolhive.co.in",
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
    ratingCount: "12500",
    bestRating: "5",
    worstRating: "1",
  },
  areaServed: {
    "@type": "Place",
    name: "Worldwide",
  },
};

// ─────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: "ToolHive — AI-Powered Tools for Everyone",
    template: "%s | ToolHive",
  },
  description:
    "200+ free online AI tools for PDF, image, video, and writing. No signup required. Available instantly. AI PDF summarizer, background remover, compress PDF, grammar checker, paraphrasing tool, Twitter thread generator, LinkedIn post generator, YouTube script generator, image generator — all free.",
  keywords: [
    "AI tools",
    "free AI tools",
    "PDF tools",
    "compress PDF",
    "compress PDF online free no limit",
    "compress PDF online free no signup",
    "image tools",
    "remove background from image",
    "remove background from image free no watermark",
    "resize image",
    "resize image free",
    "free image resize",
    "compress image",
    "video tools",
    "online tools",
    "free tools",
    "AI writing",
    "grammar checker",
    "grammar checker free no signup",
    "paraphrasing tool",
    "paraphrasing tool free no signup",
    "twitter thread generator",
    "twitter thread generator AI free",
    "linkedin post generator",
    "linkedin post generator AI free",
    "youtube script generator",
    "youtube script generator AI free",
    "file converter",
    "image generator free",
    "free image generation",
    "ai image generator",
    "text to image free",
    "free resume builder",
  ],
  authors: [{ name: "ToolHive" }],
  creator: "ToolHive",
  metadataBase: new URL("https://toolhive.co.in"),
  alternates: {
    canonical: "https://toolhive.co.in",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://toolhive.co.in",
    siteName: "ToolHive",
    title: "ToolHive — AI-Powered Tools for Everyone",
    description:
      "200+ free AI tools for PDF, image, video, and writing. No signup required.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ToolHive - 200+ Free AI Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ToolHive — AI-Powered Tools for Everyone",
    description: "200+ free AI tools for PDF, image, video, and writing. No signup required.",
    images: ["/og-image.png"],
    creator: "@toolhive",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
};

// ─────────────────────────────────────────────
// Viewport
// ─────────────────────────────────────────────

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0e14" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// ─────────────────────────────────────────────
// Root Layout
// ─────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      /*
       * GeistSans.variable / GeistMono.variable inject CSS custom properties
       * (--font-geist-sans, --font-geist-mono) consumed by globals.css @theme.
       * suppressHydrationWarning is required because ThemeProvider adds/removes
       * the .dark class on <html> client-side.
       */
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to critical external origins */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />

        {/* JSON-LD Structured Data for SEO */}
        <Script
          id="ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(LD_JSON_WEBSITE) }}
        />
        <Script
          id="ld-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(LD_JSON_ORG) }}
        />
        <Script
          id="ld-software"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(LD_JSON_SOFTWARE) }}
        />

        {/*
         * Critical inline script: apply the correct theme class BEFORE the
         * first paint to prevent a flash of wrong theme (FOWT).
         * This runs synchronously in the <head> — no flicker possible.
         */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  try {
    var s = localStorage.getItem('toolhive-theme');
    var resolved = s === 'dark'
      ? 'dark'
      : s === 'light'
      ? 'light'
      : window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
    if (resolved === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {})
})();`,
          }}
        />
      </head>
      <body
        className="min-h-screen bg-background font-sans antialiased"
        /*
         * Suppress hydration warning on body so server/client mismatch from
         * browser extensions adding attributes doesn't cause an error.
         */
        suppressHydrationWarning
      >
        <ThemeProvider defaultTheme="system">
          <AuthProvider>
            {/* Skip-to-content link for keyboard/screen-reader users */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-[var(--tw-primary-fg)] focus:shadow-lg focus:outline-none"
            >
              Skip to content
            </a>

            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main
                id="main-content"
                className="flex-1"
                tabIndex={-1}
                style={{ outline: "none" }}
              >
                {children}
              </main>
              <Footer />
            </div>

            {/* Toast notifications — rendered outside the main flow */}
            <Toaster />

            {/* Floating AI Chat Assistant — visible on all pages */}
            {/* Lazy-loaded via dynamic import in ChatBotWrapper */}
            <ChatBotWrapper />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}