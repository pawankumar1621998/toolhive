import type { NavItem } from "@/types";

/**
 * Top-level nav links for the Navbar.
 * Keep this list short (5 max) — secondary links live in the sidebar/footer.
 */
export const NAV_LINKS: NavItem[] = [
  { label: "PDF Tools", href: "/tools/pdf" },
  { label: "Image Tools", href: "/tools/image" },
  { label: "AI Writing", href: "/tools/ai-writing" },
  { label: "Calculators", href: "/tools/calculator" },
  { label: "Instagram Automation", href: "/instagram-automation" },
  { label: "All Tools", href: "/tools" },
];

/**
 * Category config used in the mobile menu and category grid.
 * icon is a string emoji for simplicity — components render lucide icons
 * by looking up the `iconName` field.
 */
export const TOOL_CATEGORIES = [
  {
    id: "pdf",
    label: "PDF Tools",
    description: "Compress, merge, split, convert, and sign PDF files.",
    icon: "📄",
    iconName: "FileText",
    color: "rose",
    gradient: "from-rose-500 to-orange-400",
    toolCount: 26,
    href: "/tools/pdf",
  },
  {
    id: "image",
    label: "Image Tools",
    description: "Resize, compress, convert, and enhance images with AI.",
    icon: "🖼️",
    iconName: "Image",
    color: "violet",
    gradient: "from-violet-500 to-purple-400",
    toolCount: 57,
    href: "/tools/image",
  },
  {
    id: "video",
    label: "Video Downloader",
    description: "Download videos from YouTube, Instagram, TikTok, Facebook, Twitter/X, and Vimeo in HD.",
    icon: "🎬",
    iconName: "Video",
    color: "blue",
    gradient: "from-blue-500 to-cyan-400",
    toolCount: 6,
    href: "/tools/video/youtube",
  },
  {
    id: "ai-writing",
    label: "AI Writing",
    description: "Rewrite, summarize, translate, and improve any text with AI.",
    icon: "✍️",
    iconName: "Pen",
    color: "emerald",
    gradient: "from-emerald-500 to-teal-400",
    toolCount: 39,
    href: "/tools/ai-writing",
  },
  {
    id: "converter",
    label: "Converter",
    description: "Currency, timezone, code formatter, diff checker, regex, fancy text, TTS, hash, morse — 25+ tools.",
    icon: "🔄",
    iconName: "ArrowRightLeft",
    color: "sky",
    gradient: "from-sky-500 to-indigo-400",
    toolCount: 31,
    href: "/tools/converter",
  },
  {
    id: "resume",
    label: "Resume Tools",
    description: "Build, analyze, and optimize professional resumes with AI.",
    icon: "📋",
    iconName: "FileText",
    color: "indigo",
    gradient: "from-indigo-500 to-purple-600",
    toolCount: 12,
    href: "/tools/resume",
  },
  {
    id: "calculator",
    label: "Calculators",
    description: "EMI, SIP, GST, Income Tax, FD, Scientific, Calorie, Tip, Discount — 28 practical calculators.",
    icon: "🧮",
    iconName: "Calculator",
    color: "orange",
    gradient: "from-orange-500 to-amber-400",
    toolCount: 28,
    href: "/tools/calculator",
  },
  {
    id: "contact-creator",
    label: "Contact & Creator",
    description: "Link in bio, social bios, auto-reply templates, email signatures, WhatsApp links, vCards and more.",
    icon: "📱",
    iconName: "Smartphone",
    color: "pink",
    gradient: "from-pink-500 to-rose-400",
    toolCount: 12,
    href: "/tools/contact-creator",
  },
] as const;

export type ToolCategoryConfig = (typeof TOOL_CATEGORIES)[number];
