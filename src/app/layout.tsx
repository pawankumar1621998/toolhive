import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/Toaster";
import "./globals.css";

// ─────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default:  "ToolHive — AI-Powered Tools for Everyone",
    template: "%s | ToolHive",
  },
  description:
    "200+ free online AI tools for PDF, image, video, and writing. No signup required. Available instantly.",
  keywords: [
    "AI tools",
    "PDF tools",
    "image tools",
    "video tools",
    "online tools",
    "free tools",
    "AI writing",
    "file converter",
  ],
  authors:  [{ name: "ToolHive" }],
  creator:  "ToolHive",
  metadataBase: new URL("https://toolhive.app"),
  openGraph: {
    type:      "website",
    locale:    "en_US",
    url:       "https://toolhive.app",
    siteName:  "ToolHive",
    title:     "ToolHive — AI-Powered Tools for Everyone",
    description: "200+ free AI tools for PDF, image, video, and writing.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ToolHive" }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "ToolHive — AI-Powered Tools for Everyone",
    description: "200+ free AI tools for PDF, image, video, and writing.",
    images:      ["/og-image.png"],
    creator:     "@toolhive",
  },
  robots: { index: true, follow: true },
  icons: {
    icon:     "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple:    "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

// ─────────────────────────────────────────────
// Viewport
// ─────────────────────────────────────────────

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff"  },
    { media: "(prefers-color-scheme: dark)",  color: "#0f0e14" },
  ],
  width:        "device-width",
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
  } catch (e) {}
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
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
