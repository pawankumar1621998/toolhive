"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { clsx } from "clsx";
import {
  ChevronDown,
  ChevronUp,
  Home,
  Wand2,
  Pencil,
  ArrowRightLeft,
  Wrench,
  Sparkles,
  FileText,
  Repeat2,
  Share2,
  Database,
  BriefcaseBusiness,
  PenLine,
  BookOpen,
  Zap,
} from "lucide-react";
import { TOOL_CATEGORIES } from "@/config/navigation";

// ─────────────────────────────────────────────
// Sub-group definitions per category
// Each group has: id, label, icon, and tool slugs
// ─────────────────────────────────────────────

interface SubGroup {
  id: string;
  label: string;
  Icon: React.FC<{ className?: string }>;
  tools: { slug: string; label: string; href: string }[];
}

type CategoryNav = Record<string, SubGroup[]>;

const CATEGORY_NAV: CategoryNav = {
  pdf: [
    {
      id: "convert",
      label: "Convert",
      Icon: ArrowRightLeft,
      tools: [
        { slug: "pdf-to-word",  label: "PDF to Word",  href: "/tools/pdf/pdf-to-word"  },
        { slug: "pdf-to-jpg",   label: "PDF to JPG",   href: "/tools/pdf/pdf-to-jpg"   },
        { slug: "pdf-to-excel", label: "PDF to Excel", href: "/tools/pdf/pdf-to-excel" },
        { slug: "jpg-to-pdf",   label: "JPG to PDF",   href: "/tools/pdf/jpg-to-pdf"   },
      ],
    },
    {
      id: "edit",
      label: "Edit",
      Icon: Pencil,
      tools: [
        { slug: "rotate",       label: "Rotate PDF",    href: "/tools/pdf/rotate"       },
        { slug: "watermark",    label: "Add Watermark", href: "/tools/pdf/watermark"    },
        { slug: "sign",         label: "Sign PDF",      href: "/tools/pdf/sign"         },
        { slug: "page-numbers", label: "Page Numbers",  href: "/tools/pdf/page-numbers" },
        { slug: "ocr",          label: "PDF OCR",       href: "/tools/pdf/ocr"          },
        { slug: "protect",      label: "Protect PDF",   href: "/tools/pdf/protect"      },
        { slug: "unlock",       label: "Unlock PDF",    href: "/tools/pdf/unlock"       },
      ],
    },
    {
      id: "optimize",
      label: "Optimize",
      Icon: Wand2,
      tools: [
        { slug: "compress", label: "Compress PDF", href: "/tools/pdf/compress" },
        { slug: "merge",    label: "Merge PDF",    href: "/tools/pdf/merge"    },
        { slug: "split",    label: "Split PDF",    href: "/tools/pdf/split"    },
      ],
    },
  ],

  image: [
    {
      id: "effects",
      label: "Effects",
      Icon: Sparkles,
      tools: [
        { slug: "remove-background", label: "Remove Background",   href: "/tools/image/remove-background" },
        { slug: "blur-background",   label: "Blur Background",     href: "/tools/image/blur-background"   },
        { slug: "black-white",       label: "Photo Black & White", href: "/tools/image/black-white"       },
        { slug: "pixelate",          label: "Pixelate Image",      href: "/tools/image/pixelate"          },
        { slug: "upscale",           label: "Upscale an Image",    href: "/tools/image/upscale"           },
        { slug: "color-filter",      label: "Photo Filters",       href: "/tools/image/color-filter"      },
        { slug: "adjust",            label: "Adjust Image",        href: "/tools/image/adjust"            },
      ],
    },
    {
      id: "edit",
      label: "Edit",
      Icon: Pencil,
      tools: [
        { slug: "draw",            label: "Draw on Image",      href: "/tools/image/draw"            },
        { slug: "cleanup",         label: "Cleanup Picture",    href: "/tools/image/cleanup"         },
        { slug: "remove-watermark",label: "Remove Watermark",   href: "/tools/image/remove-watermark"},
        { slug: "collage",         label: "Collage Maker",      href: "/tools/image/collage"         },
        { slug: "combine",         label: "Combine Images",     href: "/tools/image/combine"         },
        { slug: "profile-photo",   label: "Profile Photo",      href: "/tools/image/profile-photo"   },
        { slug: "compress",        label: "Compress Image",     href: "/tools/image/compress"        },
        { slug: "resize",          label: "Resize Image",       href: "/tools/image/resize"          },
        { slug: "crop",            label: "Crop Image",         href: "/tools/image/crop"            },
        { slug: "flip",            label: "Flip Image",         href: "/tools/image/flip"            },
        { slug: "rotate",          label: "Rotate Image",       href: "/tools/image/rotate"          },
        { slug: "watermark",       label: "Add Watermark",      href: "/tools/image/watermark"       },
        { slug: "add-border",      label: "Add Border",         href: "/tools/image/add-border"      },
        { slug: "round-image",     label: "Round Image",        href: "/tools/image/round-image"     },
      ],
    },
    {
      id: "utility",
      label: "Utility",
      Icon: Wrench,
      tools: [
        { slug: "thumbnail-creator", label: "AI Thumbnail",    href: "/tools/image/thumbnail-creator" },
        { slug: "qr-code",           label: "QR Code",         href: "/tools/image/qr-code"           },
        { slug: "meme",              label: "Meme Generator",  href: "/tools/image/meme"              },
        { slug: "image-to-pdf",      label: "Image to PDF",    href: "/tools/image/image-to-pdf"      },
      ],
    },
  ],

  video: [
    {
      id: "utility",
      label: "Download",
      Icon: Wrench,
      tools: [
        { slug: "downloader", label: "Video Downloader", href: "/tools/video/downloader" },
      ],
    },
  ],

  "ai-writing": [
    {
      id: "transform",
      label: "Transform",
      Icon: Repeat2,
      tools: [
        { slug: "summarize",     label: "AI Summarizer",   href: "/tools/ai-writing/summarize"     },
        { slug: "translate",     label: "AI Translator",   href: "/tools/ai-writing/translate"     },
        { slug: "rewrite",       label: "AI Rewriter",     href: "/tools/ai-writing/rewrite"       },
        { slug: "paraphrase",    label: "AI Paraphraser",  href: "/tools/ai-writing/paraphrase"    },
        { slug: "grammar-check", label: "Grammar Checker", href: "/tools/ai-writing/grammar-check" },
      ],
    },
    {
      id: "generate",
      label: "Generate",
      Icon: Sparkles,
      tools: [
        { slug: "blog-writer",   label: "Blog Writer",   href: "/tools/ai-writing/blog-writer"   },
        { slug: "email-writer",  label: "Email Writer",  href: "/tools/ai-writing/email-writer"  },
        { slug: "script-writer", label: "Script Writer", href: "/tools/ai-writing/script-writer" },
      ],
    },
    {
      id: "social",
      label: "Social",
      Icon: Share2,
      tools: [
        { slug: "instagram-bio",  label: "Instagram Bio",      href: "/tools/ai-writing/instagram-bio"  },
        { slug: "social-caption", label: "Social Caption",     href: "/tools/ai-writing/social-caption" },
        { slug: "headline",       label: "Headline Generator", href: "/tools/ai-writing/headline"       },
        { slug: "description",    label: "Description Writer", href: "/tools/ai-writing/description"    },
      ],
    },
  ],

  converter: [
    {
      id: "data",
      label: "Dev Tools",
      Icon: Database,
      tools: [
        { slug: "json-formatter", label: "JSON Formatter",     href: "/tools/converter/json-formatter" },
        { slug: "base64",         label: "Base64 Encode/Dec.", href: "/tools/converter/base64"         },
      ],
    },
  ],

  resume: [
    {
      id: "create",
      label: "Create",
      Icon: BookOpen,
      tools: [
        { slug: "builder",   label: "Resume Builder",   href: "/tools/resume/builder"   },
        { slug: "formatter", label: "Resume Formatter", href: "/tools/resume/formatter" },
      ],
    },
    {
      id: "analyze",
      label: "Analyze",
      Icon: Sparkles,
      tools: [
        { slug: "analyzer",          label: "Resume Analyzer",   href: "/tools/resume/analyzer"          },
        { slug: "ats-checker",       label: "ATS Checker",       href: "/tools/resume/ats-checker"       },
        { slug: "job-match",         label: "Job Match",         href: "/tools/resume/job-match"         },
        { slug: "keyword-optimizer", label: "Keyword Optimizer", href: "/tools/resume/keyword-optimizer" },
      ],
    },
    {
      id: "write",
      label: "Write",
      Icon: PenLine,
      tools: [
        { slug: "cover-letter",   label: "Cover Letter",     href: "/tools/resume/cover-letter"   },
        { slug: "resume-summary", label: "Resume Summary",   href: "/tools/resume/resume-summary" },
        { slug: "skills-suggest", label: "Skills Suggester", href: "/tools/resume/skills-suggest" },
      ],
    },
    {
      id: "career",
      label: "Career",
      Icon: BriefcaseBusiness,
      tools: [
        { slug: "linkedin-writer", label: "LinkedIn Writer", href: "/tools/resume/linkedin-writer" },
        { slug: "interview-prep",  label: "Interview Prep",  href: "/tools/resume/interview-prep"  },
      ],
    },
  ],
};

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface ToolPageSidebarProps {
  currentCategory: string;
  currentSlug: string;
}

// ─────────────────────────────────────────────
// Helper: build initial open state — all groups open by default
// ─────────────────────────────────────────────

function buildInitialOpenState(category: string): Record<string, boolean> {
  const groups = CATEGORY_NAV[category] ?? [];
  return Object.fromEntries(groups.map((g) => [g.id, true]));
}

// ─────────────────────────────────────────────
// Desktop sidebar inner content (TinyWow-style)
// ─────────────────────────────────────────────

function SidebarContent({
  currentCategory,
  currentSlug,
  onLinkClick,
}: {
  currentCategory: string;
  currentSlug: string;
  onLinkClick?: () => void;
}) {
  const groups = CATEGORY_NAV[currentCategory] ?? [];

  // All groups open by default
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    () => buildInitialOpenState(currentCategory)
  );

  function toggleGroup(id: string) {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const isHome = currentSlug === "__home__";

  return (
    <div className="flex flex-col">
      {/* Home link */}
      <Link
        href={`/tools/${currentCategory}`}
        onClick={onLinkClick}
        aria-current={isHome ? "page" : undefined}
        className={clsx(
          "flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors",
          isHome
            ? "bg-primary/10 text-primary"
            : "text-foreground-muted hover:text-foreground"
        )}
      >
        <Home className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>Home</span>
      </Link>

      {/* Sub-groups */}
      {groups.map((group) => {
        const isOpen = openGroups[group.id] ?? true;

        return (
          <div key={group.id}>
            {/* Group header — toggle */}
            <button
              type="button"
              onClick={() => toggleGroup(group.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-foreground-muted hover:text-foreground cursor-pointer transition-colors"
            >
              <group.Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="flex-1 text-left">{group.label}</span>
              {isOpen ? (
                <ChevronUp className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              )}
            </button>

            {/* Tool list */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.ul
                  key={group.id + "-tools"}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  {group.tools.map((tool) => {
                    const isActive = tool.slug === currentSlug;
                    return (
                      <li key={tool.slug}>
                        <Link
                          href={tool.href}
                          onClick={onLinkClick}
                          aria-current={isActive ? "page" : undefined}
                          className={clsx(
                            "text-sm pl-8 py-1 block transition-colors",
                            isActive
                              ? "font-semibold text-primary"
                              : "text-foreground-muted hover:text-primary"
                          )}
                        >
                          {tool.label}
                        </Link>
                      </li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// ToolPageSidebar (main export)
// ─────────────────────────────────────────────

export function ToolPageSidebar({ currentCategory, currentSlug }: ToolPageSidebarProps) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeCategory = TOOL_CATEGORIES.find((c) => c.id === currentCategory);

  return (
    <>
      {/* ── Desktop (lg+) — renders inside the sticky aside from the page ── */}
      <div className="hidden lg:flex flex-col">
        {/* Logo area */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shrink-0">
            <Zap className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-tight">ToolHive</p>
            <p className="text-[10px] text-foreground-muted leading-tight">Free AI Tools</p>
          </div>
        </div>

        {/* Category dropdown */}
        <div className="relative px-3 py-3 border-b border-border">
          <button
            type="button"
            onClick={() => setCategoryOpen((p) => !p)}
            aria-expanded={categoryOpen}
            className="flex items-center w-full gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground hover:bg-background-subtle transition-colors"
          >
            <span className="text-base leading-none shrink-0" aria-hidden="true">
              {activeCategory?.icon ?? "🔧"}
            </span>
            <span className="flex-1 text-left truncate">{activeCategory?.label ?? "Tools"}</span>
            <ChevronDown
              className={clsx(
                "h-3.5 w-3.5 text-foreground-muted transition-transform duration-200 shrink-0",
                categoryOpen && "rotate-180"
              )}
              aria-hidden="true"
            />
          </button>

          <AnimatePresence>
            {categoryOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute top-full left-3 right-3 z-50 mt-1 rounded-xl border border-border bg-background shadow-xl overflow-hidden"
              >
                {TOOL_CATEGORIES.map((cat) => {
                  const isActive = cat.id === currentCategory;
                  return (
                    <Link
                      key={cat.id}
                      href={cat.href}
                      onClick={() => setCategoryOpen(false)}
                      className={clsx(
                        "flex items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-foreground-muted hover:bg-background-subtle hover:text-foreground"
                      )}
                    >
                      <span className="text-base leading-none w-5 text-center" aria-hidden="true">
                        {cat.icon}
                      </span>
                      <span className="flex-1">{cat.label}</span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
                      )}
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sub-group navigation */}
        <div className="py-2">
          <SidebarContent
            currentCategory={currentCategory}
            currentSlug={currentSlug}
          />
        </div>
      </div>

      {/* ── Mobile (<lg) ──────────────────────────────────────────── */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((p) => !p)}
          aria-expanded={mobileOpen}
          className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-border bg-background-subtle text-sm font-medium text-foreground transition-colors hover:bg-border"
        >
          <span className="flex items-center gap-2">
            <span className="text-base leading-none" aria-hidden="true">
              {activeCategory?.icon ?? "🔧"}
            </span>
            <span>{activeCategory?.label ?? "Tools"}</span>
          </span>
          <motion.span
            animate={{ rotate: mobileOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-foreground-muted"
            aria-hidden="true"
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {mobileOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="mt-2 rounded-xl border border-border bg-background p-2">
                {/* Category switcher */}
                <div className="grid grid-cols-2 gap-1 pb-2 mb-2 border-b border-border">
                  {TOOL_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.id}
                      href={cat.href}
                      onClick={() => setMobileOpen(false)}
                      className={clsx(
                        "flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
                        cat.id === currentCategory
                          ? "bg-primary/10 text-primary"
                          : "text-foreground-muted hover:bg-background-subtle hover:text-foreground"
                      )}
                    >
                      <span aria-hidden="true">{cat.icon}</span>
                      <span className="truncate">{cat.label}</span>
                    </Link>
                  ))}
                </div>

                {/* Tool nav for current category */}
                <SidebarContent
                  currentCategory={currentCategory}
                  currentSlug={currentSlug}
                  onLinkClick={() => setMobileOpen(false)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default ToolPageSidebar;
