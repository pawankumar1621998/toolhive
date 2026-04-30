"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import {
  Link2, AtSign, MessageCircle, MessageSquare, MousePointerClick,
  Mail, Send, FormInput, CalendarClock, CreditCard, Scan, Smartphone,
} from "lucide-react";
import { useAIGenerate } from "@/hooks/useAIGenerate";
import type { Tool } from "@/types";

const TOOL_ICONS: Record<string, React.ReactNode> = {
  "link-in-bio":    <Link2 className="h-5 w-5" />,
  "social-bio":     <AtSign className="h-5 w-5" />,
  "insta-dm-reply": <MessageCircle className="h-5 w-5" />,
  "youtube-comment":<MessageSquare className="h-5 w-5" />,
  "cta-link":       <MousePointerClick className="h-5 w-5" />,
  "email-signature":<Mail className="h-5 w-5" />,
  "cold-dm":        <Send className="h-5 w-5" />,
  "contact-form":   <FormInput className="h-5 w-5" />,
  "social-scheduler": <CalendarClock className="h-5 w-5" />,
  "whatsapp-link":  <MessageSquare className="h-5 w-5" />,
  "vcard":          <CreditCard className="h-5 w-5" />,
  "link-analyzer":  <Scan className="h-5 w-5" />,
};

const TOOL_DESCRIPTIONS: Record<string, string> = {
  "link-in-bio":    "Generate a Linktree-style page with all your social links",
  "social-bio":     "Write viral Instagram, Twitter, LinkedIn bios in any tone",
  "insta-dm-reply": "Generate auto-reply DM templates for Instagram keywords",
  "youtube-comment":"Generate comment auto-reply templates for YouTube",
  "cta-link":       "Build click-worthy CTA links with urgency + UTM tracking",
  "email-signature": "Create professional HTML email signatures",
  "cold-dm":        "Generate personalized cold DM templates for outreach",
  "contact-form":   "Generate copy-paste HTML contact forms",
  "social-scheduler":"Generate social media posts with optimal posting times",
  "whatsapp-link":  "Generate click-to-chat WhatsApp links with pre-filled message",
  "vcard":          "Create a digital business card with QR code",
  "link-analyzer":  "Analyze any URL and optimize for maximum CTR",
};

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={copy}
      className={clsx("text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium shrink-0",
        copied ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600" : "bg-background border-border text-foreground-muted hover:text-foreground hover:border-border-strong")}>
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}

function DownloadBtn({ text, filename }: { text: string; filename: string }) {
  function download() {
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  return (
    <button onClick={download}
      className="text-xs px-3 py-1.5 rounded-lg border bg-background border-border text-foreground-muted hover:text-foreground hover:border-border-strong transition-colors font-medium shrink-0">
      Download
    </button>
  );
}

// ── Individual tool forms ───────────────────────────────────────────────────────

function LinkInBioTool() {
  const { output, loading: isLoading, error, generate, clear } = useAIGenerate("link-in-bio");
  const [name, setName] = useState("");
  const [profession, setProfession] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [youtube, setYoutube] = useState("");
  const [links, setLinks] = useState("");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        <input value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="Profession (e.g. Fitness Coach)"
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@instagram"
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        <input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="@twitter"
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        <input value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="YouTube channel"
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
      </div>
      <textarea value={links} onChange={(e) => setLinks(e.target.value)} placeholder="Other links (one per line)"
        rows={3} className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none" />
      <button onClick={() => generate({ name, profession, instagram, twitter, youtube, links })}
        disabled={isLoading || !name.trim()}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all">
        {isLoading ? <><span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" /> Generating…</> : "Generate Link in Bio Page"}
      </button>
      {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 rounded-xl px-3 py-2">{error}</p>}
      {output && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <p className="text-xs font-semibold text-foreground">Generated Link in Bio</p>
            <div className="flex items-center gap-1.5">
              <CopyBtn text={output} />
              <DownloadBtn text={output} filename="link-in-bio.html" />
            </div>
          </div>
          <pre className="p-4 text-xs text-foreground whitespace-pre-wrap font-mono max-h-80 overflow-y-auto">{output}</pre>
        </motion.div>
      )}
    </div>
  );
}

function SocialBioTool() {
  const { output, loading: isLoading, error, generate, clear } = useAIGenerate("social-bio");
  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [vibe, setVibe] = useState("Professional");

  const vibes = ["Professional", "Funny", "Aesthetic", "Savage", "Motivational", "Mysterious", "Humble", "Bold"];
  const platforms = ["Instagram", "Twitter/X", "LinkedIn", "TikTok", "YouTube"];

  return (
    <div className="space-y-4">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name or brand"
        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
      <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="Your niche (e.g. fitness coach, tech enthusiast)"
        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-foreground-muted mb-1.5 block">Platform</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer">
            {platforms.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-foreground-muted mb-1.5 block">Bio vibe</label>
          <select value={vibe} onChange={(e) => setVibe(e.target.value)}
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer">
            {vibes.map((v) => <option key={v}>{v}</option>)}
          </select>
        </div>
      </div>
      <button onClick={() => generate({ name, niche, platform, vibe })}
        disabled={isLoading || !niche.trim()}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all">
        {isLoading ? <><span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" /> Generating…</> : "Generate Bio"}
      </button>
      {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 rounded-xl px-3 py-2">{error}</p>}
      {output && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <p className="text-xs font-semibold text-foreground">Generated Bio</p>
            <CopyBtn text={output} />
          </div>
          <div className="p-4">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{output}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function InstaDmReplyTool() {
  const { output, loading: isLoading, error, generate, clear } = useAIGenerate("insta-dm-reply");
  const [product, setProduct] = useState("");
  const [keywords, setKeywords] = useState("");

  return (
    <div className="space-y-4">
      <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Your product/service (e.g. Online course, Coaching)"
        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
      <textarea value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="Common trigger keywords (one per line, e.g. price, discount, free, shipping, demo)"
        rows={4} className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none" />
      <button onClick={() => generate({ product, keywords })}
        disabled={isLoading || !product.trim()}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all">
        {isLoading ? <><span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" /> Generating…</> : "Generate Auto-Reply Templates"}
      </button>
      {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 rounded-xl px-3 py-2">{error}</p>}
      {output && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <p className="text-xs font-semibold text-foreground">Auto-Reply Templates</p>
            <CopyBtn text={output} />
          </div>
          <div className="p-4">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{output}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function CTABuilderTool() {
  const { output, loading: isLoading, error, generate, clear } = useAIGenerate("cta-link");
  const [offer, setOffer] = useState("");
  const [audience, setAudience] = useState("");
  const [ctaType, setCtaType] = useState("Link with urgency");

  return (
    <div className="space-y-4">
      <input value={offer} onChange={(e) => setOffer(e.target.value)} placeholder="Your offer (e.g. Free ebook, 50% off course)"
        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
      <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Target audience (e.g. busy entrepreneurs)"
        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
      <select value={ctaType} onChange={(e) => setCtaType(e.target.value)}
        className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer">
        <option>Link with urgency</option>
        <option>Social proof link</option>
        <option>UTM tracking link</option>
        <option>All of the above</option>
      </select>
      <button onClick={() => generate({ offer, audience, ctaType })}
        disabled={isLoading || !offer.trim()}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all">
        {isLoading ? <><span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" /> Building…</> : "Build CTA Link"}
      </button>
      {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 rounded-xl px-3 py-2">{error}</p>}
      {output && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <p className="text-xs font-semibold text-foreground">CTA Link</p>
            <CopyBtn text={output} />
          </div>
          <div className="p-4">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{output}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function EmailSignatureTool() {
  const { output, loading: isLoading, error, generate, clear } = useAIGenerate("email-signature");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name"
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Job title"
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name"
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address"
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone"
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="@LinkedIn"
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        <input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="@Twitter"
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
      </div>
      <button onClick={() => generate({ name, title, company, email, phone, linkedin, twitter })}
        disabled={isLoading || !name.trim() || !email.trim()}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all">
        {isLoading ? <><span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" /> Generating…</> : "Generate Email Signature"}
      </button>
      {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 rounded-xl px-3 py-2">{error}</p>}
      {output && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <p className="text-xs font-semibold text-foreground">Email Signature (HTML)</p>
            <div className="flex items-center gap-1.5">
              <CopyBtn text={output} />
              <DownloadBtn text={output} filename="email-signature.html" />
            </div>
          </div>
          <pre className="p-4 text-xs text-foreground whitespace-pre-wrap font-mono max-h-80 overflow-y-auto">{output}</pre>
        </motion.div>
      )}
    </div>
  );
}

function ColdDMTool() {
  const { output, loading: isLoading, error, generate, clear } = useAIGenerate("cold-dm");
  const [product, setProduct] = useState("");
  const [target, setTarget] = useState("");
  const [channel, setChannel] = useState("Instagram DM");

  return (
    <div className="space-y-4">
      <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Your product/service"
        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
      <input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Target audience (e.g. startup founders)"
        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
      <select value={channel} onChange={(e) => setChannel(e.target.value)}
        className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer">
        <option>Instagram DM</option>
        <option>LinkedIn DM</option>
        <option>Twitter DM</option>
      </select>
      <button onClick={() => generate({ product, target, channel })}
        disabled={isLoading || !product.trim() || !target.trim()}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all">
        {isLoading ? <><span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" /> Generating…</> : "Generate Cold DMs"}
      </button>
      {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 rounded-xl px-3 py-2">{error}</p>}
      {output && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <p className="text-xs font-semibold text-foreground">Cold DM Templates</p>
            <CopyBtn text={output} />
          </div>
          <div className="p-4">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{output}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function ContactFormTool() {
  const { output, loading: isLoading, error, generate, clear } = useAIGenerate("contact-form");
  const [email, setEmail] = useState("");
  const [style, setStyle] = useState("Simple / Clean");

  return (
    <div className="space-y-4">
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email (where form sends to)"
        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
      <select value={style} onChange={(e) => setStyle(e.target.value)}
        className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer">
        <option>Simple / Clean</option>
        <option>Notion-style</option>
        <option>Typeform-style (questions)</option>
      </select>
      <button onClick={() => generate({ email, style })}
        disabled={isLoading || !email.trim()}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all">
        {isLoading ? <><span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" /> Generating…</> : "Generate HTML Contact Form"}
      </button>
      {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 rounded-xl px-3 py-2">{error}</p>}
      {output && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <p className="text-xs font-semibold text-foreground">HTML Contact Form</p>
            <div className="flex items-center gap-1.5">
              <CopyBtn text={output} />
              <DownloadBtn text={output} filename="contact-form.html" />
            </div>
          </div>
          <pre className="p-4 text-xs text-foreground whitespace-pre-wrap font-mono max-h-80 overflow-y-auto">{output}</pre>
        </motion.div>
      )}
    </div>
  );
}

function WhatsAppLinkTool() {
  const { output, loading: isLoading, error, generate, clear } = useAIGenerate("whatsapp-link");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [country, setCountry] = useState("91");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-foreground-muted mb-1 block">Country code</label>
          <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="91"
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-medium text-foreground-muted mb-1 block">WhatsApp number</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210"
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>
      </div>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Pre-filled message (optional)"
        rows={2} className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none" />
      <button onClick={() => generate({ phone, message, countryCode: country })}
        disabled={isLoading || !phone.trim()}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all">
        {isLoading ? <><span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" /> Generating…</> : "Generate WhatsApp Link"}
      </button>
      {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 rounded-xl px-3 py-2">{error}</p>}
      {output && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <p className="text-xs font-semibold text-foreground">WhatsApp Link</p>
            <CopyBtn text={output} />
          </div>
          <div className="p-4">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{output}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function VCardTool() {
  const { output, loading: isLoading, error, generate, clear } = useAIGenerate("vcard");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");

  return (
    <div className="space-y-4">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name"
        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Job title"
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company"
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone"
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Website"
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
      </div>
      <button onClick={() => generate({ name, title, company, email, phone, website })}
        disabled={isLoading || !name.trim()}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all">
        {isLoading ? <><span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" /> Generating…</> : "Generate vCard + QR Code"}
      </button>
      {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 rounded-xl px-3 py-2">{error}</p>}
      {output && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <p className="text-xs font-semibold text-foreground">Digital Business Card (vCard)</p>
            <div className="flex items-center gap-1.5">
              <CopyBtn text={output} />
              <DownloadBtn text={output} filename="business-card.vcf" />
            </div>
          </div>
          <pre className="p-4 text-xs text-foreground whitespace-pre-wrap font-mono max-h-80 overflow-y-auto">{output}</pre>
        </motion.div>
      )}
    </div>
  );
}

function SocialBioGenTool() { return <SocialBioTool />; }
function YouTubeCommentTool() {
  const { output, loading: isLoading, error, generate, clear } = useAIGenerate("youtube-comment");
  const [channel, setChannel] = useState("");
  const [niche, setNiche] = useState("");
  return (
    <div className="space-y-4">
      <input value={channel} onChange={(e) => setChannel(e.target.value)} placeholder="Your YouTube channel name"
        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
      <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="Content niche (e.g. tech reviews, fitness)"
        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
      <button onClick={() => generate({ channel, niche })}
        disabled={isLoading || !channel.trim()}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all">
        {isLoading ? <><span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" /> Generating…</> : "Generate YouTube Comment Templates"}
      </button>
      {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 rounded-xl px-3 py-2">{error}</p>}
      {output && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <p className="text-xs font-semibold text-foreground">YouTube Comment Templates</p>
            <CopyBtn text={output} />
          </div>
          <div className="p-4"><p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{output}</p></div>
        </motion.div>
      )}
    </div>
  );
}

function SocialSchedulerTool() {
  const { output, loading: isLoading, error, generate, clear } = useAIGenerate("social-scheduler");
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  return (
    <div className="space-y-4">
      <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="Your content niche (e.g. fitness, tech, food)"
        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
      <select value={platform} onChange={(e) => setPlatform(e.target.value)}
        className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer">
        <option>Instagram</option><option>LinkedIn</option><option>Twitter/X</option><option>YouTube</option><option>TikTok</option>
      </select>
      <button onClick={() => generate({ niche, platform })}
        disabled={isLoading || !niche.trim()}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all">
        {isLoading ? <><span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" /> Generating…</> : "Generate Content Calendar"}
      </button>
      {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 rounded-xl px-3 py-2">{error}</p>}
      {output && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <p className="text-xs font-semibold text-foreground">Content Calendar</p>
            <CopyBtn text={output} />
          </div>
          <div className="p-4"><p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{output}</p></div>
        </motion.div>
      )}
    </div>
  );
}

function LinkAnalyzerTool() {
  const { output, loading: isLoading, error, generate, clear } = useAIGenerate("link-analyzer");
  const [url, setUrl] = useState("");
  return (
    <div className="space-y-4">
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste any URL to analyze"
        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
      <button onClick={() => generate({ url })}
        disabled={isLoading || !url.trim()}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all">
        {isLoading ? <><span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" /> Analyzing…</> : "Analyze Link"}
      </button>
      {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 rounded-xl px-3 py-2">{error}</p>}
      {output && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <p className="text-xs font-semibold text-foreground">Link Analysis Report</p>
            <CopyBtn text={output} />
          </div>
          <div className="p-4"><p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{output}</p></div>
        </motion.div>
      )}
    </div>
  );
}

// ── Tool registry map ─────────────────────────────────────────────────────────

function renderTool(slug: string) {
  switch (slug) {
    case "link-in-bio":     return <LinkInBioTool />;
    case "social-bio":       return <SocialBioTool />;
    case "insta-dm-reply":   return <InstaDmReplyTool />;
    case "youtube-comment": return <YouTubeCommentTool />;
    case "cta-link":         return <CTABuilderTool />;
    case "email-signature":  return <EmailSignatureTool />;
    case "cold-dm":          return <ColdDMTool />;
    case "contact-form":     return <ContactFormTool />;
    case "social-scheduler": return <SocialSchedulerTool />;
    case "whatsapp-link":    return <WhatsAppLinkTool />;
    case "vcard":            return <VCardTool />;
    case "link-analyzer":    return <LinkAnalyzerTool />;
    default: return <SocialBioTool />;
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

export function ContactCreatorWorkspace({ tool }: { tool: Tool }) {
  return (
    <div className="py-8 sm:py-10 max-w-3xl mx-auto">
      {/* Tool label */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white">
          {TOOL_ICONS[tool.slug]}
        </div>
        <div>
          <p className="text-xs text-foreground-muted">{TOOL_DESCRIPTIONS[tool.slug] ?? tool.description}</p>
        </div>
      </div>

      {renderTool(tool.slug)}
    </div>
  );
}