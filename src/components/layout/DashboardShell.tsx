"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  Clock,
  Heart,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  FileText,
  Image,
  Video,
  Pen,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

// ─────────────────────────────────────────────
// Nav config
// ─────────────────────────────────────────────

interface NavItemConfig {
  href: string;
  icon: React.FC<{ className?: string }>;
  label: string;
  exact?: boolean;
  badge?: string;
}

interface NavSectionConfig {
  title: string;
  items: NavItemConfig[];
}

const NAV_SECTIONS: NavSectionConfig[] = [
  {
    title: "Dashboard",
    items: [
      { href: "/dashboard",          icon: LayoutDashboard, label: "Overview",  exact: true },
      { href: "/dashboard/history",  icon: Clock,           label: "History"               },
      { href: "/dashboard/favorites",icon: Heart,           label: "Favorites"             },
      { href: "/dashboard/profile",  icon: User,            label: "Profile"               },
      { href: "/dashboard/settings", icon: Settings,        label: "Settings"              },
    ],
  },
  {
    title: "Quick Tools",
    items: [
      { href: "/tools/pdf",        icon: FileText, label: "PDF Tools"   },
      { href: "/tools/image",      icon: Image,    label: "Image Tools" },
      { href: "/tools/video",      icon: Video,    label: "Video Tools" },
      { href: "/tools/ai-writing", icon: Pen,      label: "AI Writing"  },
    ],
  },
];

// Bottom nav — exactly 5 items (all Dashboard section items)
const MOBILE_NAV_ITEMS = NAV_SECTIONS[0].items.slice(0, 5);

// ─────────────────────────────────────────────
// NavItem component (sidebar)
// ─────────────────────────────────────────────

interface NavItemProps {
  item: NavItemConfig;
  isActive: boolean;
  collapsed: boolean;
}

function SidebarNavItem({ item, isActive, collapsed }: NavItemProps) {
  const { icon: Icon, label, href, badge } = item;

  return (
    <li>
      <Link
        href={href}
        title={collapsed ? label : undefined}
        aria-current={isActive ? "page" : undefined}
        className={clsx(
          "group relative flex items-center gap-3 rounded-xl mx-2 transition-all duration-200",
          collapsed ? "justify-center px-0 py-2.5 w-10 mx-auto" : "px-3 py-2.5",
          isActive
            ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary font-semibold shadow-sm border border-primary/20"
            : "text-foreground-muted hover:bg-sidebar-item-hover hover:text-foreground"
        )}
      >
        {/* Active indicator bar */}
        {isActive && (
          <span
            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full"
            aria-hidden="true"
          />
        )}

        <Icon
          className={clsx(
            "h-4 w-4 shrink-0 transition-colors",
            isActive ? "text-primary" : "text-foreground-muted group-hover:text-foreground"
          )}
          aria-hidden="true"
        />

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              key="label"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="text-sm truncate overflow-hidden whitespace-nowrap"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>

        {!collapsed && badge && (
          <Badge variant="primary" size="sm" className="ml-auto shrink-0">
            {badge}
          </Badge>
        )}

        {/* Tooltip on collapsed */}
        {collapsed && (
          <span
            className={clsx(
              "pointer-events-none absolute left-full ml-3 z-tooltip",
              "whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-lg",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            )}
            role="tooltip"
          >
            {label}
          </span>
        )}
      </Link>
    </li>
  );
}

// ─────────────────────────────────────────────
// Guest section (sidebar bottom)
// ─────────────────────────────────────────────

function SidebarGuestSection({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={clsx(
        "flex items-center border-t border-sidebar-border mt-auto",
        collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3"
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background-muted border border-border">
        <User className="h-4 w-4 text-foreground-muted" aria-hidden="true" />
      </div>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="guest-info"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex-1 min-w-0 overflow-hidden"
          >
            <p className="text-sm font-semibold text-foreground truncate leading-tight">Guest</p>
            <p className="text-[10px] text-foreground-muted truncate">Free forever</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className={clsx(
        "hidden md:flex flex-col shrink-0 overflow-hidden",
        "bg-sidebar-background border-r border-sidebar-border",
        "relative z-sidebar"
      )}
      aria-label="Dashboard navigation"
    >
      {/* Logo + toggle */}
      <div
        className={clsx(
          "flex h-14 items-center border-b border-sidebar-border",
          collapsed ? "justify-center px-2" : "px-4 justify-between"
        )}
      >
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-brand shadow-sm">
                <Zap className="h-4 w-4 text-white" aria-hidden="true" />
              </div>
              <span className="text-sm font-bold text-foreground">ToolHive</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={onToggle}
          className={clsx(
            "flex h-7 w-7 items-center justify-center rounded-lg",
            "text-foreground-muted hover:text-foreground hover:bg-background-muted",
            "transition-colors duration-150 shrink-0"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-hide">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-5">
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.p
                  key={`title-${section.title}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="px-4 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-foreground-subtle"
                >
                  {section.title}
                </motion.p>
              )}
            </AnimatePresence>

            <ul role="list" className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <SidebarNavItem
                    key={item.href}
                    item={item}
                    isActive={isActive}
                    collapsed={collapsed}
                  />
                );
              })}
            </ul>
          </div>
        ))}

        {/* Browse all tools link */}
        <div className="mt-2 mx-2">
          <Link
            href="/tools"
            className={clsx(
              "flex items-center gap-2.5 rounded-xl px-3 py-2",
              "text-foreground-muted hover:text-primary transition-colors text-xs font-medium",
              collapsed && "justify-center px-0"
            )}
            title={collapsed ? "Browse all tools" : undefined}
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span
                  key="all-tools"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Browse all tools
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </nav>

      {/* Guest section */}
      <SidebarGuestSection collapsed={collapsed} />
    </motion.aside>
  );
}

// ─────────────────────────────────────────────
// Mobile bottom nav
// ─────────────────────────────────────────────

function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      // 56px height + safe-area-bottom padding for notched devices
      className="fixed bottom-0 left-0 right-0 z-sidebar md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Mobile navigation"
    >
      <div className="glass border-t border-border h-14">
        <ul className="flex h-full" role="list">
          {MOBILE_NAV_ITEMS.map(({ href, icon: Icon, label, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  // 56px minimum height, full-height tap zone
                  className={clsx(
                    "flex flex-col items-center justify-center gap-0.5",
                    "h-full w-full px-1 py-2",
                    "text-[10px] font-medium transition-colors duration-150",
                    isActive ? "text-primary" : "text-foreground-muted hover:text-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {/* Icon with gradient underline active indicator */}
                  <div className="relative flex flex-col items-center gap-0.5">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    {/* Gradient underline replaces the dot */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.span
                          layoutId="mobile-nav-active-bar"
                          initial={{ scaleX: 0, opacity: 0 }}
                          animate={{ scaleX: 1, opacity: 1 }}
                          exit={{ scaleX: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 35 }}
                          className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-gradient-brand origin-center"
                          aria-hidden="true"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                  <span className="leading-none">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────
// Mobile top header — shows page title on mobile
// ─────────────────────────────────────────────

function MobilePageHeader() {
  const pathname = usePathname();

  // Derive a human-readable title from the current path
  const pageTitle = React.useMemo(() => {
    // Walk nav items first for an exact match
    for (const section of NAV_SECTIONS) {
      for (const item of section.items) {
        if (item.exact ? pathname === item.href : pathname.startsWith(item.href)) {
          return item.label;
        }
      }
    }
    // Fallback: capitalise last path segment
    const segments = pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1] ?? "Dashboard";
    return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, " ");
  }, [pathname]);

  return (
    <div className="md:hidden flex h-12 items-center border-b border-border bg-background px-3 shrink-0">
      {/* Logo mark */}
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-brand shadow-sm mr-3">
        <Zap className="h-3.5 w-3.5 text-white" aria-hidden="true" />
      </div>
      {/* Animated page title — smooth swap on route change */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.h1
          key={pageTitle}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="text-sm font-semibold text-foreground flex-1 truncate"
        >
          {pageTitle}
        </motion.h1>
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// DashboardShell
// ─────────────────────────────────────────────

interface DashboardShellProps {
  children: React.ReactNode;
}

/**
 * DashboardShell — authenticated layout wrapper.
 *
 * Mobile-first improvements:
 * - Mobile top header bar shows animated page title
 * - Page content padding reduced on mobile: px-3 sm:px-6
 * - Bottom nav: 56px (h-14) with safe-area-inset-bottom for notches
 * - Bottom nav active state uses gradient underline (layoutId spring animation)
 * - Tab switch: content fades in/out via AnimatePresence + pathname key
 * - Extra bottom padding on mobile accounts for 56px bottom nav + safe area
 */
export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = useCallback(() => setCollapsed((c) => !c), []);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={handleToggle}
      />

      {/* Main content column */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* Mobile top bar — shows page title, hidden on md+ */}
        <MobilePageHeader />

        <main
          id="main-content"
          className={clsx(
            "flex-1",
            // Reduced padding on mobile, steps up on larger screens
            "px-3 py-5 sm:px-6 md:px-6 lg:px-8 md:py-6",
            // Extra bottom padding on mobile: 56px nav + safe area buffer
            "pb-24 md:pb-8"
          )}
          tabIndex={-1}
        >
          {/* Smooth tab-switch animation keyed on pathname */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav />
    </div>
  );
}
