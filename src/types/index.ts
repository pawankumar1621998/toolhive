// ─────────────────────────────────────────────
// TOOLHIVE — Shared TypeScript Type Definitions
// ─────────────────────────────────────────────

// ─── Tool & Category ─────────────────────────────────────────────────────────

export type ToolCategory =
  | "pdf"
  | "image"
  | "video"
  | "ai-writing"
  | "converter"
  | "resume"
  | "calculator"
  | "contact-creator";

export type ToolStatus = "idle" | "uploading" | "processing" | "done" | "error";

export interface Tool {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  category: ToolCategory;
  icon: string;              // lucide-react icon name (PascalCase)
  tags: string[];
  isNew?: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  isPremium?: boolean;
  usageCount?: number;
  estimatedTime?: string;    // e.g. "~5s", "~30s"
  acceptedFileTypes: string[]; // e.g. [".pdf", ".docx"] or ["image/*"]
  maxFileSizeMB: number;
  maxFiles: number;
  /** Optional how-it-works steps — overrides ToolInfoPanel defaults */
  howItWorks?: Array<{ title: string; description: string }>;
  /** Optional FAQ items — merged with defaults in ToolInfoPanel */
  faq?: Array<{ question: string; answer: string }>;
}

export interface ToolCategoryConfig {
  id: ToolCategory;
  label: string;
  description: string;
  /** emoji shortcode */
  icon: string;
  /** lucide-react icon name (PascalCase) */
  iconName: string;
  /** tailwind color suffix, e.g. "violet" */
  color: string;
  /** tailwind gradient classes, e.g. "from-violet-500 to-purple-400" */
  gradient: string;
  toolCount: number;
  href: string;
}

// Keep old name as alias so existing imports don't break
export type { ToolCategoryConfig as ToolCategory_Config };

// ─── File Upload & Processing ─────────────────────────────────────────────────

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  /** Object URL for image previews. Must be revoked on cleanup. */
  preview?: string;
  status: ToolStatus;
  /** 0–100 */
  progress: number;
  error?: string;
  /** Download URL set after processing this individual file */
  result?: string;
}

export interface ProcessingResult {
  id: string;
  toolId: string;
  toolName: string;
  inputFiles: string[];
  outputFiles: OutputFile[];
  createdAt: Date;
  /** Processing duration in ms */
  duration: number;
  status: "success" | "error";
  error?: string;
}

export interface OutputFile {
  id: string;
  name: string;
  size: number;
  type: string;
  downloadUrl: string;
  expiresAt: Date;
}

// ─── Tool Options (workspace right panel) ────────────────────────────────────

export interface ToolOption {
  id: string;
  label: string;
  description?: string;
  type: "select" | "range" | "toggle" | "radio";
  defaultValue: string | number | boolean;
  options?: Array<{ label: string; value: string | number }>;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

// ─── User & Auth ──────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  plan: "free" | "pro" | "enterprise";
  createdAt: Date;
  usageThisMonth: number;
  usageLimit: number;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export type LoginCredentials = {
  email: string;
  password: string;
};

export type SignupCredentials = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface HistoryItem {
  id: string;
  tool: Pick<Tool, "id" | "name" | "slug" | "category" | "icon">;
  inputFiles: string[];
  outputFiles: OutputFile[];
  createdAt: Date;
  status: "success" | "error";
}

export interface FavoriteItem {
  id: string;
  tool: Pick<Tool, "id" | "name" | "slug" | "category" | "icon" | "description">;
  addedAt: Date;
}

// ─── Theme ───────────────────────────────────────────────────────────────────

export type Theme = "light" | "dark" | "system";

export interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string | number;
  isExternal?: boolean;
  children?: NavItem[];
}

/** @deprecated Use NavItem */
export type NavLink = NavItem;

export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export interface SidebarItem {
  label: string;
  href: string;
  icon: string;
  badge?: string | number;
  isActive?: boolean;
}

// ─── Search ──────────────────────────────────────────────────────────────────

export interface SearchResult {
  type: "tool" | "category";
  id: string;
  name: string;
  description: string;
  href: string;
  category?: ToolCategory;
  icon?: string;
}

// ─── API Responses ───────────────────────────────────────────────────────────

export type ApiResponse<T> =
  | { data: T; error: null; message?: string }
  | { data: null; error: string; message: string };

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

// ─── Component Prop Utilities ─────────────────────────────────────────────────

export interface WithClassName {
  className?: string;
}

export interface WithChildren {
  children: React.ReactNode;
}

export interface WithOptionalChildren {
  children?: React.ReactNode;
}

// Re-export commonly used types
export type { VariantProps } from "class-variance-authority";
