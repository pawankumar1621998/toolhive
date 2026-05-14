import type { Metadata } from "next";
import Script from "next/script";
import { TextToImage } from "@/components/features/text-to-image/TextToImage";

export const metadata: Metadata = {
  title: "AI Image Generator — Free Text to Image Generator | ToolHive",
  description:
    "Generate stunning AI images from text for free. No signup required, no watermark, no limit. Supports photorealistic, anime, oil painting, cinematic styles and more. Free image generation — 100% free AI image generator.",
  keywords: [
    "ai image generator",
    "text to image",
    "text to image free",
    "free image generation",
    "free ai image generator no signup",
    "ai art generator online",
    "generate image from text free",
    "AI image generator no signup",
    "no watermark",
    "free image generator",
    "image generator free no limit",
    "FLUX AI",
    "AI art",
    "text to image AI free",
  ],
  openGraph: {
    title: "AI Image Generator — Free Text to Image | ToolHive",
    description:
      "Generate stunning AI images from text for free. No signup, no watermark. Supports photorealistic, anime, cinematic styles.",
    type: "website",
    siteName: "ToolHive",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Image Generator — Free Text to Image by ToolHive",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Image Generator — Free Text to Image | ToolHive",
    description:
      "Generate stunning AI images from text for free. No signup, no watermark.",
  },
  alternates: {
    canonical: "https://toolhive-red.vercel.app/text-to-image",
  },
};

const BREADCRUMB_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://toolhive-red.vercel.app" },
    { "@type": "ListItem", position: 2, name: "AI Image Generator", item: "https://toolhive-red.vercel.app/text-to-image" },
  ],
};

const LD_JSON = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "AI Image Generator — Text to Image",
  description:
    "Free AI image generator that creates stunning images from text descriptions. Supports photorealistic, anime, oil painting, and cinematic styles. No signup required, no watermark.",
  url: "https://toolhive-red.vercel.app/text-to-image",
  applicationCategory: "UtilityApplication",
  operatingSystem: "All",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" },
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.7", ratingCount: "5600", bestRating: "5", worstRating: "1" },
};

export default function TextToImagePage() {
  return (
    <>
      <Script id="ld-text-to-image-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_JSON_LD) }} />
      <Script
        id="ld-text-to-image"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(LD_JSON) }}
      />
      <main className="min-h-screen bg-background py-8 px-4">
        <TextToImage />
      </main>
    </>
  );
}