"use client";

import React, { useState } from "react";
import { clsx } from "clsx";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  Mail,
  MessageSquare,
  GitFork,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type Subject = "General" | "Bug Report" | "Feature Request" | "Billing" | "Other";

interface FormState {
  name: string;
  email: string;
  subject: Subject;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

// ─────────────────────────────────────────────
// Animation variants
// ─────────────────────────────────────────────

const EASE_OUT: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

// ─────────────────────────────────────────────
// Contact info cards
// ─────────────────────────────────────────────

interface ContactCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  href: string;
  accentClass: string;
}

function ContactCard({ icon, title, description, action, href, accentClass }: ContactCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(
        "group flex items-start gap-4 rounded-xl border border-card-border bg-card p-5",
        "hover:shadow-md hover:border-border-strong transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      <div
        className={clsx(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          accentClass
        )}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-foreground mb-0.5">{title}</p>
        <p className="text-sm text-foreground-muted mb-1.5">{description}</p>
        <span className="text-sm font-medium text-primary group-hover:underline">{action}</span>
      </div>
    </a>
  );
}

// ─────────────────────────────────────────────
// ContactPage
// ─────────────────────────────────────────────

export function ContactPage() {
  const shouldReduce = useReducedMotion() ?? false;

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: "General",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    if (!form.email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!form.message.trim()) errs.message = "Message is required.";
    else if (form.message.trim().length < 20) errs.message = "Message must be at least 20 characters.";
    return errs;
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setIsSubmitting(true);
    // Simulate network request
    await new Promise((res) => setTimeout(res, 1200));
    setIsSubmitting(false);
    setSubmitted(true);
  }

  const SUBJECTS: Subject[] = ["General", "Bug Report", "Feature Request", "Billing", "Other"];

  const contactCards: ContactCardProps[] = [
    {
      icon: <Mail className="h-5 w-5 text-violet-600 dark:text-violet-400" />,
      title: "Email Us",
      description: "Pawan usually replies within 24 hours on business days.",
      action: "pawankumar1621998@gmail.com",
      href: "mailto:pawankumar1621998@gmail.com",
      accentClass: "bg-violet-500/10",
    },
    {
      icon: <MessageSquare className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />,
      title: "Instagram",
      description: "Follow for updates, tips, and behind-the-scenes content.",
      action: "@pawankumar849494",
      href: "https://www.instagram.com/pawankumar849494",
      accentClass: "bg-cyan-500/10",
    },
    {
      icon: <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      title: "LinkedIn",
      description: "Connect professionally or send a message on LinkedIn.",
      action: "Pawan Kumar on LinkedIn",
      href: "https://www.linkedin.com/in/pawan-kumar-b354a1287",
      accentClass: "bg-blue-500/10",
    },
    {
      icon: <GitFork className="h-5 w-5 text-foreground" />,
      title: "GitHub",
      description: "Found a bug or want to request a feature? Open an issue.",
      action: "github.com/pawankumar1621998",
      href: "https://github.com/pawankumar1621998",
      accentClass: "bg-background-muted",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ───────────────────────────────── */}
      <section className="relative overflow-hidden bg-background-subtle border-b border-card-border py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div
            className="absolute -top-20 left-1/3 h-[360px] w-[360px] rounded-full"
            style={{ background: "radial-gradient(circle, oklch(55% 0.22 285 / 0.08) 0%, transparent 70%)" }}
          />
          <div
            className="absolute -bottom-10 right-1/4 h-[280px] w-[280px] rounded-full"
            style={{ background: "radial-gradient(circle, oklch(62% 0.18 195 / 0.07) 0%, transparent 70%)" }}
          />
        </div>

        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={shouldReduce ? undefined : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
          >
            <Badge variant="primary" size="md" className="mb-4">Contact</Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
              Get in{" "}
              <span className="bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">
                Touch
              </span>
            </h1>
            <p className="max-w-lg mx-auto text-lg text-foreground-muted leading-relaxed">
              Have a question, bug report, or just want to say hi? We&apos;d love
              to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Two-column layout ──────────────────── */}
      <div className="container mx-auto px-4 py-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px]">

          {/* ── Left: Contact form ──────────────── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUpVariant} className="mb-8">
              <h2 className="text-2xl font-bold text-foreground">Send us a message</h2>
              <p className="text-foreground-muted mt-1 text-sm">
                Fill out the form below and we&apos;ll get back to you shortly.
              </p>
            </motion.div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
                className={clsx(
                  "flex flex-col items-center justify-center text-center rounded-2xl border border-success/25",
                  "bg-success/5 p-10 sm:p-14 gap-4"
                )}
                role="alert"
                aria-live="polite"
              >
                <CheckCircle2 className="h-14 w-14 text-success" aria-hidden="true" />
                <h3 className="text-xl font-bold text-foreground">Message sent!</h3>
                <p className="text-foreground-muted max-w-xs">
                  Thanks for reaching out. We&apos;ll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: "", email: "", subject: "General", message: "" });
                  }}
                  className={clsx(
                    "mt-2 text-sm font-medium text-primary underline-offset-4 hover:underline",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  )}
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <motion.form
                variants={fadeUpVariant}
                onSubmit={handleSubmit}
                noValidate
                aria-label="Contact form"
                className="space-y-5"
              >
                {/* Name + Email row */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Full Name"
                    name="name"
                    type="text"
                    placeholder="Alex Johnson"
                    value={form.name}
                    onChange={handleChange}
                    error={errors.name}
                    required
                    autoComplete="name"
                  />
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
                    required
                    autoComplete="email"
                  />
                </div>

                {/* Subject select */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="subject" className="text-sm font-medium text-foreground">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className={clsx(
                      "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground",
                      "hover:border-border-strong",
                      "focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary",
                      "transition-all duration-150",
                      "cursor-pointer"
                    )}
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Message textarea */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="message" className="text-sm font-medium text-foreground">
                    Message
                    <span className="ml-1 text-destructive" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    placeholder="Tell us how we can help..."
                    value={form.message}
                    onChange={handleChange}
                    aria-required="true"
                    aria-invalid={!!errors.message}
                    className={clsx(
                      "w-full resize-none rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground",
                      "placeholder:text-foreground-subtle",
                      "hover:border-border-strong",
                      "focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary",
                      "transition-all duration-150",
                      errors.message ? "border-destructive focus:ring-destructive/30" : "border-border"
                    )}
                  />
                  {errors.message && (
                    <p className="flex items-center gap-1 text-xs text-destructive" role="alert">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {errors.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  isLoading={isSubmitting}
                  loadingText="Sending..."
                  leftIcon={!isSubmitting ? <Send className="h-4 w-4" /> : undefined}
                  className="w-full sm:w-auto"
                >
                  Send Message
                </Button>
              </motion.form>
            )}
          </motion.div>

          {/* ── Right: Contact info ──────────────── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6"
          >
            <motion.div variants={fadeUpVariant}>
              <h2 className="text-2xl font-bold text-foreground mb-1">Other ways to reach us</h2>
              <p className="text-sm text-foreground-muted">Pick the channel that works best for you.</p>
            </motion.div>

            {contactCards.map((card) => (
              <motion.div key={card.title} variants={fadeUpVariant}>
                <ContactCard {...card} />
              </motion.div>
            ))}

            {/* Response time notice */}
            <motion.div
              variants={fadeUpVariant}
              className={clsx(
                "flex items-start gap-3 rounded-xl border border-warning/25 bg-warning/5 p-4"
              )}
            >
              <Clock className="h-5 w-5 text-warning shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-foreground">Response time</p>
                <p className="text-xs text-foreground-muted mt-0.5 leading-relaxed">
                  We typically reply within <strong>24 hours</strong> on weekdays.
                  For urgent issues, Discord is the fastest channel.
                </p>
              </div>
            </motion.div>

            {/* FAQ link */}
            <motion.div variants={fadeUpVariant}>
              <p className="text-sm text-foreground-muted">
                Before reaching out, you might find your answer in our{" "}
                <a
                  href="/faq"
                  className="font-medium text-primary hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  FAQ page
                </a>
                .
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
