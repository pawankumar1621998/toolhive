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
  Pen,
  Repeat2,
  Share2,
  Database,
  BriefcaseBusiness,
  PenLine,
  BookOpen,
  Zap,
  Calculator,
  Search,
  X,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { TOOL_CATEGORIES } from "@/config/navigation";
import * as LucideIcons from "lucide-react";
import { useRouter } from "next/navigation";
import { useSearch } from "@/hooks/useSearch";
import type { ToolCategory } from "@/types";

// Category gradients map
const CAT_ICONS_MAP: Record<string, React.FC<{ className?: string }>> = {
  FileText,
  Image: LucideIcons.Image,
  Video: LucideIcons.Video,
  Pen,
  ArrowRightLeft,
  Sparkles,
  Repeat2,
  Share2,
  Database,
  BriefcaseBusiness,
  PenLine,
  BookOpen,
  Zap,
  Calculator,
  Wrench,
};

// ─────────────────────────────────────────────
// Sub-group definitions per category
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
    { id: "convert", label: "Convert", Icon: ArrowRightLeft, tools: [
      { slug: "pdf-to-word",  label: "PDF to Word",  href: "/tools/pdf/pdf-to-word"  },
      { slug: "pdf-to-jpg",   label: "PDF to JPG",   href: "/tools/pdf/pdf-to-jpg"   },
      { slug: "pdf-to-excel", label: "PDF to Excel", href: "/tools/pdf/pdf-to-excel" },
      { slug: "jpg-to-pdf",   label: "JPG to PDF",   href: "/tools/pdf/jpg-to-pdf"   },
    ]},
    { id: "edit", label: "Edit", Icon: Pencil, tools: [
      { slug: "rotate",        label: "Rotate PDF",     href: "/tools/pdf/rotate"       },
      { slug: "watermark",     label: "Add Watermark",  href: "/tools/pdf/watermark"    },
      { slug: "sign",          label: "Sign PDF",       href: "/tools/pdf/sign"         },
      { slug: "page-numbers",  label: "Page Numbers",    href: "/tools/pdf/page-numbers" },
      { slug: "ocr",           label: "PDF OCR",        href: "/tools/pdf/ocr"          },
      { slug: "protect",       label: "Protect PDF",     href: "/tools/pdf/protect"      },
      { slug: "unlock",        label: "Unlock PDF",      href: "/tools/pdf/unlock"       },
    ]},
    { id: "optimize", label: "Optimize", Icon: Wand2, tools: [
      { slug: "compress", label: "Compress PDF", href: "/tools/pdf/compress" },
      { slug: "merge",    label: "Merge PDF",    href: "/tools/pdf/merge"    },
      { slug: "split",   label: "Split PDF",    href: "/tools/pdf/split"   },
    ]},
  ],
  image: [
    { id: "effects", label: "Effects", Icon: Sparkles, tools: [
      { slug: "remove-background", label: "Remove Background",  href: "/tools/image/remove-background" },
      { slug: "blur-background",   label: "Blur Background",    href: "/tools/image/blur-background"   },
      { slug: "black-white",      label: "Photo B&W",           href: "/tools/image/black-white"       },
      { slug: "pixelate",         label: "Pixelate Image",      href: "/tools/image/pixelate"          },
      { slug: "upscale",          label: "Upscale an Image",     href: "/tools/image/upscale"           },
      { slug: "color-filter",     label: "Photo Filters",       href: "/tools/image/color-filter"      },
      { slug: "adjust",           label: "Adjust Image",         href: "/tools/image/adjust"            },
    ]},
    { id: "edit", label: "Edit", Icon: Pencil, tools: [
      { slug: "draw",             label: "Draw on Image",      href: "/tools/image/draw"            },
      { slug: "cleanup",          label: "Cleanup Picture",     href: "/tools/image/cleanup"         },
      { slug: "remove-watermark",  label: "Remove Watermark",   href: "/tools/image/remove-watermark"},
      { slug: "collage",           label: "Collage Maker",      href: "/tools/image/collage"         },
      { slug: "combine",           label: "Combine Images",     href: "/tools/image/combine"         },
      { slug: "profile-photo",     label: "Profile Photo",       href: "/tools/image/profile-photo"   },
      { slug: "compress",          label: "Compress Image",     href: "/tools/image/compress"        },
      { slug: "resize",            label: "Resize Image",       href: "/tools/image/resize"          },
      { slug: "crop",              label: "Crop Image",          href: "/tools/image/crop"            },
      { slug: "flip",              label: "Flip Image",          href: "/tools/image/flip"            },
      { slug: "rotate",            label: "Rotate Image",        href: "/tools/image/rotate"          },
      { slug: "watermark",         label: "Add Watermark",       href: "/tools/image/watermark"       },
      { slug: "add-border",        label: "Add Border",          href: "/tools/image/add-border"      },
      { slug: "round-image",       label: "Round Image",         href: "/tools/image/round-image"     },
    ]},
    { id: "utility", label: "Utility", Icon: Wrench, tools: [
      { slug: "thumbnail-creator", label: "AI Thumbnail",    href: "/tools/image/thumbnail-creator" },
      { slug: "qr-code",          label: "QR Code",         href: "/tools/image/qr-code"           },
      { slug: "meme",             label: "Meme Generator",  href: "/tools/image/meme"              },
      { slug: "image-to-pdf",     label: "Image to PDF",    href: "/tools/image/image-to-pdf"      },
    ]},
  ],
  "ai-writing": [
    { id: "transform", label: "Transform", Icon: Repeat2, tools: [
      { slug: "summarize",     label: "AI Summarizer",   href: "/tools/ai-writing/summarize"     },
      { slug: "translate",     label: "AI Translator",   href: "/tools/ai-writing/translate"     },
      { slug: "rewrite",       label: "AI Rewriter",     href: "/tools/ai-writing/rewrite"       },
      { slug: "paraphrase",     label: "AI Paraphraser",  href: "/tools/ai-writing/paraphrase"    },
      { slug: "grammar-check",  label: "Grammar Checker", href: "/tools/ai-writing/grammar-check" },
    ]},
    { id: "generate", label: "Generate", Icon: Sparkles, tools: [
      { slug: "blog-writer",    label: "Blog Writer",    href: "/tools/ai-writing/blog-writer"   },
      { slug: "email-writer",  label: "Email Writer",    href: "/tools/ai-writing/email-writer"  },
      { slug: "script-writer", label: "Script Writer",  href: "/tools/ai-writing/script-writer" },
    ]},
    { id: "social", label: "Social", Icon: Share2, tools: [
      { slug: "instagram-bio",   label: "Instagram Bio",      href: "/tools/ai-writing/instagram-bio"  },
      { slug: "social-caption",   label: "Social Caption",     href: "/tools/ai-writing/social-caption" },
      { slug: "headline",         label: "Headline Generator", href: "/tools/ai-writing/headline"       },
      { slug: "description",       label: "Description Writer",  href: "/tools/ai-writing/description"    },
    ]},
  ],
  converter: [
    { id: "data", label: "Dev Tools", Icon: Database, tools: [
      { slug: "json-formatter", label: "JSON Formatter",      href: "/tools/converter/json-formatter" },
      { slug: "base64",         label: "Base64 Encode/Dec.", href: "/tools/converter/base64"         },
    ]},
  ],
  resume: [
    { id: "create", label: "Create", Icon: BookOpen, tools: [
      { slug: "builder",    label: "Resume Builder",   href: "/tools/resume/builder"   },
      { slug: "formatter",  label: "Resume Formatter",  href: "/tools/resume/formatter" },
    ]},
    { id: "analyze", label: "Analyze", Icon: Sparkles, tools: [
      { slug: "analyzer",           label: "Resume Analyzer",    href: "/tools/resume/analyzer"          },
      { slug: "ats-checker",         label: "ATS Checker",         href: "/tools/resume/ats-checker"       },
      { slug: "job-match",           label: "Job Match",           href: "/tools/resume/job-match"         },
      { slug: "keyword-optimizer",  label: "Keyword Optimizer",   href: "/tools/resume/keyword-optimizer" },
    ]},
    { id: "write", label: "Write", Icon: PenLine, tools: [
      { slug: "cover-letter",   label: "Cover Letter",     href: "/tools/resume/cover-letter"   },
      { slug: "resume-summary", label: "Resume Summary",   href: "/tools/resume/resume-summary" },
      { slug: "skills-suggest", label: "Skills Suggester",  href: "/tools/resume/skills-suggest" },
    ]},
    { id: "career", label: "Career", Icon: BriefcaseBusiness, tools: [
      { slug: "linkedin-writer", label: "LinkedIn Writer", href: "/tools/resume/linkedin-writer" },
      { slug: "interview-prep",  label: "Interview Prep",  href: "/tools/resume/interview-prep"  },
    ]},
  ],
  calculator: [
    { id: "health", label: "Health", Icon: Sparkles, tools: [
      { slug: "age",  label: "Age Calculator", href: "/tools/calculator/age"  },
      { slug: "bmi",  label: "BMI Calculator", href: "/tools/calculator/bmi"  },
    ]},
    { id: "finance", label: "Finance", Icon: Calculator, tools: [
      { slug: "percentage", label: "Percentage",     href: "/tools/calculator/percentage" },
      { slug: "emi",        label: "EMI Calculator", href: "/tools/calculator/emi"        },
      { slug: "tip",        label: "Tip Calculator", href: "/tools/calculator/tip"        },
      { slug: "discount",   label: "Discount Calc.", href: "/tools/calculator/discount"   },
    ]},
    { id: "date", label: "Date & Time", Icon: FileText, tools: [
      { slug: "date-diff", label: "Date Difference", href: "/tools/calculator/date-diff" },
    ]},
  ],
};

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface ToolPageSidebarProps {
  currentCategory: string;
  currentSlug: string;
}

function buildInitialOpenState(category: string): Record<string, boolean> {
  const groups = CATEGORY_NAV[category] ?? [];
  return Object.fromEntries(groups.map((g) => [g.id, true]));
}

// ─────────────────────────────────────────────
// Desktop sidebar inner content
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
          "flex items-center gap-2 px-3 py-2 mx-2 rounded-xl text-sm font-medium transition-all duration-200",
          isHome
            ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/30"
            : "text-foreground-muted hover:bg-background-subtle hover:text-foreground"
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
            {/* Group header */}
            <button
              type="button"
              onClick={() => toggleGroup(group.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-2 px-3 py-2 mx-2 rounded-xl text-sm font-medium text-foreground-muted hover:bg-background-subtle hover:text-foreground cursor-pointer transition-all duration-200"
            >
              <group.Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="flex-1 text-left">{group.label}</span>
              {isOpen ? (
                <ChevronUp className="h-3.5 w-3.5 shrink-0 text-foreground-subtle" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-foreground-subtle" aria-hidden="true" />
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
                            "text-sm pl-10 pr-3 py-1.5 mx-2 rounded-xl block transition-all duration-200",
                            isActive
                              ? "font-semibold text-violet-600 dark:text-violet-400 bg-violet-500/10 border border-violet-500/30"
                              : "text-foreground-muted hover:bg-background-subtle hover:text-primary"
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
// ToolPageSidebar
// ─────────────────────────────────────────────

export function ToolPageSidebar({ currentCategory, currentSlug }: ToolPageSidebarProps) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeCategory = TOOL_CATEGORIES.find((c) => c.id === currentCategory);

  // Resolve category icon
  const Icon = (LucideIcons as unknown as Record<string, React.FC<{ className?: string }>>)[activeCategory?.iconName ?? "FileText"] ?? LucideIcons.Wrench;

  return (
    <>
      {/* Desktop (lg+) */}
      <div className="hidden lg:flex flex-col">
        {/* Logo area */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border/60">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg shadow-violet-500/20 shrink-0">
            <Zap className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-black text-foreground leading-tight tracking-tight">ToolHive</p>
            <p className="text-[10px] text-foreground-muted leading-tight">Free AI Tools</p>
          </div>
        </div>

        {/* Category dropdown */}
        <div className="relative px-3 py-3 border-b border-border/60">
          <button
            type="button"
            onClick={() => setCategoryOpen((p) => !p)}
            aria-expanded={categoryOpen}
            className={clsx(
              "flex items-center w-full gap-2.5 rounded-xl border",
              "px-3 py-2.5 text-sm font-semibold text-foreground",
              "transition-all duration-200",
              categoryOpen
                ? "border-violet-500/30 bg-violet-500/5"
                : "border-border/60 bg-card/80 hover:border-violet-500/30 hover:bg-card"
            )}
          >
            <div className={clsx(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
              `bg-gradient-to-br ${activeCategory?.gradient ?? "from-violet-600 to-purple-500"}`
            )}>
              <Icon className="h-4 w-4 text-white" />
            </div>
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
                className="absolute top-full left-3 right-3 z-50 mt-2 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/15 overflow-hidden max-h-80 overflow-y-auto scrollbar-thin"
              >
                {TOOL_CATEGORIES.map((cat) => {
                  const CatIcon = (LucideIcons as unknown as Record<string, React.FC<{ className?: string }>>)[cat.iconName] ?? LucideIcons.Wrench;
                  const isActive = cat.id === currentCategory;
                  return (
                    <Link
                      key={cat.id}
                      href={cat.href}
                      onClick={() => setCategoryOpen(false)}
                      className={clsx(
                        "flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-l-2 border-violet-500"
                          : "text-foreground hover:bg-background-subtle hover:text-foreground"
                      )}
                    >
                      <div className={clsx(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                        `bg-gradient-to-br ${cat.gradient}`
                      )}>
                        <CatIcon className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span className="flex-1">{cat.label}</span>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0" aria-hidden="true" />
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

      {/* Mobile (<lg) */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((p) => !p)}
          aria-expanded={mobileOpen}
          className={clsx(
            "flex items-center justify-between w-full px-4 py-2.5 rounded-xl border",
            "text-sm font-semibold text-foreground transition-all duration-200",
            mobileOpen
              ? "border-violet-500/30 bg-violet-500/5"
              : "border-border/60 bg-card/80 hover:border-violet-500/30"
          )}
        >
          <span className="flex items-center gap-2">
            <div className={clsx(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
              `bg-gradient-to-br ${activeCategory?.gradient ?? "from-violet-600 to-purple-500"}`
            )}>
              <Icon className="h-4 w-4 text-white" />
            </div>
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
              className="overflow-hidden mt-2"
            >
              <div className="rounded-2xl border border-border/60 bg-card/90 backdrop-blur-sm p-3">
                {/* Category switcher */}
                <div className="grid grid-cols-2 gap-1.5 pb-2 mb-2 border-b border-border/60">
                  {TOOL_CATEGORIES.map((cat) => {
                    const CatIcon = (LucideIcons as unknown as Record<string, React.FC<{ className?: string }>>)[cat.iconName] ?? LucideIcons.Wrench;
                    return (
                      <Link
                        key={cat.id}
                        href={cat.href}
                        onClick={() => setMobileOpen(false)}
                        className={clsx(
                          "flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-all duration-200 border",
                          cat.id === currentCategory
                            ? "border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400"
                            : "border-border/50 bg-card/80 text-foreground-muted hover:border-violet-500/30 hover:text-foreground"
                        )}
                      >
                        <div className={clsx(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                          `bg-gradient-to-br ${cat.gradient}`
                        )}>
                          <CatIcon className="h-3 w-3 text-white" />
                        </div>
                        <span className="truncate">{cat.label}</span>
                      </Link>
                    );
                  })}
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