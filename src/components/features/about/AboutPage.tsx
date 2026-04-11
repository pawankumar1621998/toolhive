"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  ShieldCheck,
  Infinity as InfinityIcon,
  Zap,
  ArrowRight,
  Globe,
  FileStack,
  Wrench,
  UserCheck,
  Briefcase,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

// ─────────────────────────────────────────────
// Shared constants
// ─────────────────────────────────────────────

const EASE_OUT: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

// ─────────────────────────────────────────────
// Animation variants
// ─────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.52, ease: EASE_OUT },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.48, ease: EASE_OUT },
  },
};

// ─────────────────────────────────────────────
// Mesh orbs background
// ─────────────────────────────────────────────

function MeshBackground({ shouldReduce }: { shouldReduce: boolean }) {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-background" />
      <motion.div
        className="absolute -top-40 -left-40 h-[640px] w-[640px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(55% 0.22 285 / 0.1) 0%, transparent 70%)",
        }}
        animate={
          shouldReduce
            ? { opacity: 0.8 }
            : {
                scale: [1, 1.08, 1] as number[],
                opacity: [0.8, 1, 0.8] as number[],
              }
        }
        transition={{ duration: 8, repeat: shouldReduce ? 0 : Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -top-20 right-0 h-[520px] w-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(62% 0.18 195 / 0.08) 0%, transparent 70%)",
        }}
        animate={
          shouldReduce
            ? { opacity: 0.6 }
            : {
                scale: [1, 1.12, 1] as number[],
                opacity: [0.6, 0.9, 0.6] as number[],
              }
        }
        transition={{ duration: 10, repeat: shouldReduce ? 0 : Infinity, ease: "easeInOut", delay: 1.5 }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// Section label
// ─────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Badge variant="primary" size="md" className="mb-4">
      {children}
    </Badge>
  );
}

// ─────────────────────────────────────────────
// Section heading
// ─────────────────────────────────────────────

function SectionHeading({
  id,
  children,
  className,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      id={id}
      className={clsx(
        "text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground text-balance",
        "leading-[1.1]",
        className
      )}
    >
      {children}
    </h2>
  );
}

// ─────────────────────────────────────────────
// Hero section
// ─────────────────────────────────────────────

function HeroSection({ shouldReduce }: { shouldReduce: boolean }) {
  return (
    <section
      className="relative isolate overflow-hidden pt-20 pb-20 sm:pt-28 sm:pb-28 lg:pt-36 lg:pb-36"
      aria-labelledby="about-hero-heading"
    >
      <MeshBackground shouldReduce={shouldReduce} />

      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto"
        >
          <motion.div variants={fadeUpVariant}>
            <Badge variant="primary" size="lg">
              Our Story
            </Badge>
          </motion.div>

          <motion.h1
            id="about-hero-heading"
            variants={fadeUpVariant}
            className={clsx(
              "text-4xl sm:text-5xl md:text-6xl lg:text-7xl",
              "font-extrabold tracking-tight text-foreground text-balance",
              "leading-[1.08]"
            )}
          >
            Built to{" "}
            <span className="bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">
              Empower
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUpVariant}
            className="text-base sm:text-lg text-foreground-muted max-w-xl leading-relaxed text-pretty"
          >
            We believe powerful tools should be free, private, and instant.
            ToolHive was built to give everyone — from freelancers to Fortune 500
            teams — access to the best AI-powered utilities without barriers,
            subscriptions, or sign-up forms.
          </motion.p>

          <motion.div
            variants={fadeUpVariant}
            className="flex flex-col sm:flex-row items-center gap-3 mt-2"
          >
            <Button
              variant="gradient"
              size="lg"
              asChild
              rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
            >
              <Link href="/tools">Explore Our Tools</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/careers">Join the Team</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Values / Mission section
// ─────────────────────────────────────────────

interface ValueItem {
  icon: React.FC<{ className?: string }>;
  gradient: string;
  title: string;
  description: string;
}

const VALUES: ValueItem[] = [
  {
    icon: ShieldCheck,
    gradient: "from-violet-500 to-blue-500",
    title: "Privacy First",
    description:
      "Your files are processed in-memory and never stored on our servers. We don't track what you do, who you are, or what you create. Full stop.",
  },
  {
    icon: InfinityIcon,
    gradient: "from-emerald-500 to-teal-400",
    title: "Always Free",
    description:
      "Every tool on ToolHive is free to use, forever. No freemium tiers, no usage caps, no credit card required — just open the page and go.",
  },
  {
    icon: Zap,
    gradient: "from-orange-400 to-rose-500",
    title: "Blazing Fast",
    description:
      "Built on edge infrastructure that processes files in seconds, not minutes. We obsess over performance so you never sit staring at a spinner.",
  },
];

function ValuesSection({ shouldReduce }: { shouldReduce: boolean }) {
  return (
    <section
      className="py-16 sm:py-20 lg:py-24 bg-background-subtle"
      aria-labelledby="values-heading"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={shouldReduce ? undefined : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="text-center mb-12"
        >
          <SectionLabel>Our Values</SectionLabel>
          <SectionHeading id="values-heading">
            What we stand for
          </SectionHeading>
          <p className="mt-3 text-foreground-muted max-w-xl mx-auto text-pretty">
            Three principles guide every decision we make — from architecture
            to product design.
          </p>
        </motion.div>

        <motion.div
          variants={shouldReduce ? undefined : containerVariants}
          initial={shouldReduce ? undefined : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
        >
          {VALUES.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                variants={shouldReduce ? undefined : cardVariants}
                className={clsx(
                  "border border-card-border bg-card rounded-2xl p-6",
                  "flex flex-col gap-4",
                  "transition-all duration-250 hover:-translate-y-1 hover:shadow-xl"
                )}
              >
                <div
                  className={clsx(
                    "flex h-12 w-12 items-center justify-center rounded-xl",
                    `bg-gradient-to-br ${item.gradient}`,
                    "shadow-md"
                  )}
                  aria-hidden="true"
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                  <p className="mt-1.5 text-sm text-foreground-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Animated counter hook (viewport-triggered)
// ─────────────────────────────────────────────

function useAnimatedCounter(
  target: number,
  duration = 1800,
  active = false,
  disabled = false
): number {
  const [current, setCurrent] = useState(disabled ? target : 0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (disabled) {
      setCurrent(target);
      return;
    }
    if (!active) return;

    startRef.current = null;

    function step(timestamp: number) {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = eased * target;
      setCurrent(Number.isInteger(target) ? Math.floor(next) : Math.round(next * 10) / 10);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setCurrent(target);
      }
    }

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, active, disabled]);

  return current;
}

// ─────────────────────────────────────────────
// Stats section
// ─────────────────────────────────────────────

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  gradient: string;
}

const ABOUT_STATS: StatItem[] = [
  {
    value: 200,
    suffix: "+",
    label: "Tools",
    description: "Free AI tools and growing",
    icon: Wrench,
    gradient: "from-violet-500 to-blue-500",
  },
  {
    value: 1,
    suffix: "M+",
    label: "Files Processed",
    description: "Documents handled every month",
    icon: FileStack,
    gradient: "from-orange-400 to-rose-500",
  },
  {
    value: 150,
    suffix: "+",
    label: "Countries",
    description: "Users across the globe",
    icon: Globe,
    gradient: "from-emerald-500 to-teal-400",
  },
  {
    value: 0,
    suffix: "",
    label: "Signups Required",
    description: "Open your browser and start",
    icon: UserCheck,
    gradient: "from-sky-500 to-cyan-400",
  },
];

function AboutStatCard({
  item,
  active,
  shouldReduce,
  index,
}: {
  item: StatItem;
  active: boolean;
  shouldReduce: boolean;
  index: number;
}) {
  const count = useAnimatedCounter(item.value, 1800, active, shouldReduce);
  const displayValue = Number.isInteger(item.value)
    ? Math.floor(count).toString()
    : count.toFixed(1);

  const Icon = item.icon;

  return (
    <motion.div
      initial={shouldReduce ? undefined : { opacity: 0, y: 24 }}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={
        shouldReduce
          ? undefined
          : { duration: 0.5, delay: index * 0.1, ease: EASE_OUT }
      }
      className={clsx(
        "border border-card-border bg-card rounded-2xl p-6",
        "flex flex-col items-center gap-4 text-center",
        "transition-all duration-250 hover:-translate-y-1 hover:shadow-xl"
      )}
    >
      <div
        className={clsx(
          "flex h-12 w-12 items-center justify-center rounded-xl",
          `bg-gradient-to-br ${item.gradient}`,
          "shadow-md"
        )}
        aria-hidden="true"
      >
        <Icon className="h-6 w-6 text-white" />
      </div>

      <div>
        <p
          className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent tabular-nums leading-none"
          aria-label={`${item.value}${item.suffix} ${item.label}`}
        >
          {displayValue}
          <span className="text-3xl sm:text-4xl">{item.suffix}</span>
        </p>
        <p className="mt-2.5 text-base font-semibold text-foreground">{item.label}</p>
        <p className="mt-1 text-sm text-foreground-muted leading-snug">
          {item.description}
        </p>
      </div>
    </motion.div>
  );
}

function StatsSection({ shouldReduce }: { shouldReduce: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (shouldReduce) { setActive(true); return; }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setActive(true); observer.disconnect(); }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldReduce]);

  return (
    <section
      ref={sectionRef}
      className="relative py-16 sm:py-20 lg:py-24 overflow-hidden"
      aria-labelledby="about-stats-heading"
    >
      {/* Subtle tinted background */}
      <div className="absolute inset-0 bg-background-subtle -z-10" aria-hidden="true" />
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: [
            "radial-gradient(ellipse at 15% 50%, oklch(55% 0.22 285 / 0.07) 0%, transparent 60%)",
            "radial-gradient(ellipse at 85% 50%, oklch(62% 0.18 195 / 0.06) 0%, transparent 60%)",
          ].join(", "),
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-violet-500 to-cyan-500 opacity-20" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-violet-500 to-cyan-500 opacity-20" aria-hidden="true" />

      <div className="container mx-auto px-4">
        <motion.div
          initial={shouldReduce ? undefined : { opacity: 0, y: 16 }}
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="text-center mb-12"
        >
          <SectionLabel>By the Numbers</SectionLabel>
          <SectionHeading id="about-stats-heading">
            Impact at a glance
          </SectionHeading>
          <p className="mt-3 text-foreground-muted max-w-md mx-auto text-pretty">
            Real numbers from real users who rely on ToolHive every day.
          </p>
        </motion.div>

        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          role="list"
          aria-label="About statistics"
        >
          {ABOUT_STATS.map((item, index) => (
            <div key={item.label} role="listitem">
              <AboutStatCard
                item={item}
                active={active}
                shouldReduce={shouldReduce}
                index={index}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Story section
// ─────────────────────────────────────────────

function StorySection({ shouldReduce }: { shouldReduce: boolean }) {
  const paragraphs = [
    "ToolHive was born in 2025 from a simple frustration: every useful online tool either demanded a signup, slapped a paywall on the features you actually needed, or quietly kept your files on their servers. Pawan Kumar — a frontend developer from Haryana, India — decided to build something better.",
    "Starting as a solo project, ToolHive quickly grew beyond PDF tools into a full suite covering images, video, AI writing, resume building, and developer utilities. Every tool was designed with the same rule: free by default, private by design, and fast enough that waiting feels wrong.",
    "Today ToolHive ships new tools every week. The goal hasn't changed — build innovative, useful digital products that solve real-world problems and improve productivity. No dark patterns, no paywalls, no compromises.",
  ];

  return (
    <section
      className="py-16 sm:py-20 lg:py-24"
      aria-labelledby="story-heading"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-5xl mx-auto">
          {/* Text */}
          <motion.div
            initial={shouldReduce ? undefined : { opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: EASE_OUT }}
            className="flex flex-col gap-5"
          >
            <div>
              <SectionLabel>How it started</SectionLabel>
              <SectionHeading id="story-heading">Our Story</SectionHeading>
            </div>
            {paragraphs.map((text, i) => (
              <p key={i} className="text-foreground-muted leading-relaxed text-pretty">
                {text}
              </p>
            ))}
          </motion.div>

          {/* Decorative graphic */}
          <motion.div
            initial={shouldReduce ? undefined : { opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: EASE_OUT, delay: 0.1 }}
            aria-hidden="true"
          >
            <div
              className={clsx(
                "relative rounded-2xl overflow-hidden",
                "border border-card-border bg-card",
                "aspect-[4/3] flex items-center justify-center",
                "shadow-xl"
              )}
            >
              {/* Gradient fill */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10" />

              {/* Grid pattern */}
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
                  backgroundSize: "48px 48px",
                }}
              />

              {/* Icon composition */}
              <div className="relative flex flex-col items-center gap-4">
                <div className="flex items-center gap-4">
                  {[
                    { Icon: ShieldCheck, g: "from-violet-500 to-blue-500" },
                    { Icon: Zap, g: "from-orange-400 to-rose-500" },
                    { Icon: Globe, g: "from-emerald-500 to-teal-400" },
                  ].map(({ Icon, g }) => (
                    <div
                      key={g}
                      className={clsx(
                        "flex h-14 w-14 items-center justify-center rounded-2xl",
                        `bg-gradient-to-br ${g}`,
                        "shadow-lg"
                      )}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                  ))}
                </div>
                <p className="text-sm font-semibold text-foreground-muted tracking-wide uppercase">
                  Built with purpose
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Social icon SVGs (brand icons)
// ─────────────────────────────────────────────

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function GithubIconSm({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"/>
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Team section
// ─────────────────────────────────────────────

const FOUNDER = {
  name: "Pawan Kumar",
  role: "Founder & Frontend Developer",
  location: "Haryana, India",
  bio: "Hi, I'm Pawan Kumar, a passionate frontend developer and aspiring tech entrepreneur. I focus on building modern, user-friendly web applications and AI-powered platforms. Currently learning DevOps and advanced technologies, I aim to create impactful digital products that solve real-world problems and improve productivity.",
  initials: "PK",
  avatarGradient: "from-violet-500 to-cyan-500",
  skills: ["React / Next.js", "TypeScript", "Tailwind CSS", "DevOps", "AI Integration"],
  socials: [
    { href: "https://www.linkedin.com/in/pawan-kumar-b354a1287", label: "LinkedIn",  Icon: LinkedInIcon,   color: "hover:text-blue-500"   },
    { href: "https://github.com/pawankumar1621998",              label: "GitHub",    Icon: GithubIconSm,   color: "hover:text-foreground" },
    { href: "https://www.instagram.com/pawankumar849494",        label: "Instagram", Icon: InstagramIcon,  color: "hover:text-pink-500"   },
    { href: "https://myportfilio-one.vercel.app/",               label: "Portfolio", Icon: ExternalLink,   color: "hover:text-violet-500" },
  ],
};

function TeamSection({ shouldReduce }: { shouldReduce: boolean }) {
  return (
    <section
      className="py-16 sm:py-20 lg:py-24 bg-background-subtle"
      aria-labelledby="team-heading"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={shouldReduce ? undefined : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="text-center mb-12"
        >
          <SectionLabel>The Builder</SectionLabel>
          <SectionHeading id="team-heading">Person behind ToolHive</SectionHeading>
          <p className="mt-3 text-foreground-muted max-w-xl mx-auto text-pretty">
            ToolHive is an independent project — built and maintained by one passionate developer.
          </p>
        </motion.div>

        {/* Founder card — centered, wider */}
        <motion.div
          variants={shouldReduce ? undefined : cardVariants}
          initial={shouldReduce ? undefined : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="max-w-2xl mx-auto"
        >
          <div
            className={clsx(
              "border border-card-border bg-card rounded-2xl p-8",
              "flex flex-col sm:flex-row gap-7 items-start",
              "shadow-lg hover:-translate-y-1 hover:shadow-2xl transition-all duration-250"
            )}
          >
            {/* Avatar */}
            <div className="shrink-0 flex flex-col items-center gap-3">
              <div
                className={clsx(
                  "flex h-20 w-20 items-center justify-center rounded-2xl",
                  "bg-gradient-to-br from-violet-500 to-cyan-500",
                  "shadow-lg"
                )}
                aria-hidden="true"
              >
                <span className="text-2xl font-extrabold text-white select-none">PK</span>
              </div>
              {/* Social links */}
              <div className="flex items-center gap-1">
                {FOUNDER.socials.map(({ href, label, Icon, color }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={clsx(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      "text-foreground-subtle transition-colors duration-150",
                      "hover:bg-background-muted",
                      color
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-xl font-extrabold text-foreground">{FOUNDER.name}</h3>
                <Badge variant="primary" size="sm">Founder</Badge>
              </div>
              <p className="text-sm font-semibold text-primary mb-1">{FOUNDER.role}</p>
              <p className="text-xs text-foreground-muted flex items-center gap-1 mb-4">
                <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                {FOUNDER.location}
              </p>
              <p className="text-sm text-foreground-muted leading-relaxed mb-5">
                {FOUNDER.bio}
              </p>
              {/* Skill chips */}
              <div className="flex flex-wrap gap-2">
                {FOUNDER.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground-muted"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Join us CTA section
// ─────────────────────────────────────────────

function JoinUsSection({ shouldReduce }: { shouldReduce: boolean }) {
  return (
    <section
      className="relative py-20 lg:py-28 overflow-hidden"
      aria-labelledby="join-us-heading"
    >
      {/* Gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-cyan-500 -z-10" aria-hidden="true" />

      {/* Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white/15 blur-3xl"
          animate={
            shouldReduce
              ? { opacity: 0.6 }
              : { scale: [1, 1.15, 1] as number[], opacity: [0.6, 1, 0.6] as number[] }
          }
          transition={{ duration: 8, repeat: shouldReduce ? 0 : Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          animate={
            shouldReduce
              ? { opacity: 0.4 }
              : { scale: [1, 1.12, 1] as number[], opacity: [0.4, 0.7, 0.4] as number[] }
          }
          transition={{ duration: 10, repeat: shouldReduce ? 0 : Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center gap-6 max-w-2xl mx-auto">
          {/* Icon */}
          <motion.div
            initial={shouldReduce ? undefined : { opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            className={clsx(
              "flex h-16 w-16 items-center justify-center rounded-2xl",
              "bg-white/20 shadow-xl backdrop-blur-sm border border-white/30"
            )}
            aria-hidden="true"
          >
            <Briefcase className="h-8 w-8 text-white" />
          </motion.div>

          <motion.h2
            id="join-us-heading"
            initial={shouldReduce ? undefined : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05, ease: EASE_OUT }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white text-balance leading-[1.1] tracking-tight"
          >
            Want to work with us?
          </motion.h2>

          <motion.p
            initial={shouldReduce ? undefined : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: EASE_OUT }}
            className="text-lg text-white/80 max-w-md text-pretty"
          >
            We&apos;re a remote-first team that moves fast and ships often. If
            you care deeply about craft, privacy, and making tools that genuinely
            help people, we&apos;d love to meet you.
          </motion.p>

          <motion.div
            initial={shouldReduce ? undefined : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.18, ease: EASE_OUT }}
            className="flex flex-col sm:flex-row items-center gap-3"
          >
            <Link
              href="/careers"
              className={clsx(
                "inline-flex items-center justify-center gap-2",
                "rounded-xl bg-white px-8 py-3.5",
                "text-base font-bold text-violet-600",
                "shadow-xl hover:bg-white/90 hover:shadow-2xl",
                "transition-all duration-200 active:scale-[0.98]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              )}
            >
              View Open Roles
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>

            <Link
              href="/contact"
              className={clsx(
                "inline-flex items-center justify-center gap-2",
                "rounded-xl border border-white/40 bg-white/10 px-8 py-3.5",
                "text-base font-semibold text-white",
                "hover:bg-white/20 hover:border-white/60",
                "backdrop-blur-sm",
                "transition-all duration-200 active:scale-[0.98]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              )}
            >
              Say Hello
            </Link>
          </motion.div>

          <motion.p
            initial={shouldReduce ? undefined : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="text-xs text-white/55"
          >
            Fully remote &middot; Async-first &middot; Meaningful equity
          </motion.p>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Root AboutPage component
// ─────────────────────────────────────────────

/**
 * AboutPage — Client Component
 *
 * Section breakdown (top to bottom):
 * 1. HeroSection    — "Built to Empower" headline, mission copy, two CTAs
 * 2. ValuesSection  — Privacy First, Always Free, Blazing Fast cards
 * 3. StatsSection   — 4 animated counters (200+ Tools, 1M+ Files, 150+ Countries, 0 Signups)
 * 4. StorySection   — Origin narrative with decorative graphic
 * 5. TeamSection    — 4 mock team member cards
 * 6. JoinUsSection  — "Want to work with us?" CTA pointing to /careers
 */
export function AboutPage() {
  const shouldReduce = useReducedMotion() ?? false;

  return (
    <>
      <HeroSection shouldReduce={shouldReduce} />
      <ValuesSection shouldReduce={shouldReduce} />
      <StatsSection shouldReduce={shouldReduce} />
      <StorySection shouldReduce={shouldReduce} />
      <TeamSection shouldReduce={shouldReduce} />
      <JoinUsSection shouldReduce={shouldReduce} />
    </>
  );
}
