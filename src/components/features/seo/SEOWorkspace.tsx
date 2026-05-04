"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import type { Tool } from "@/types";
import { useAIGenerate } from "@/hooks/useAIGenerate";
import {
  FileText,
  Code2,
  CheckCircle,
  AlertCircle,
  Link as LinkIcon,
  Eye,
  Share2,
  X,
  Globe,
} from "lucide-react";

// ─── Shared Styles ───────────────────────────────────────────────────────────

const inputClass =
  "w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-orange-500/30";

const cardClass =
  "rounded-xl border border-card-border bg-background-subtle p-4";

const primaryBtn =
  "h-11 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed";

const secondaryBtn =
  "h-11 px-6 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-background-subtle transition-colors disabled:opacity-50";

// ─── Shared Output Card ───────────────────────────────────────────────────────

function OutputCard({
  text,
  onClear,
  label = "Output",
}: {
  text: string;
  onClear: () => void;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cardClass}
    >
      {label && (
        <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">
          {label}
        </p>
      )}
      <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-mono">
        {text}
      </pre>
      {text && (
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <button
            onClick={handleCopy}
            className={clsx(
              "text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium",
              copied
                ? "bg-orange-500/10 border-orange-500/30 text-orange-600"
                : "bg-background border-border text-foreground-muted hover:text-foreground hover:border-border-strong"
            )}
          >
            {copied ? "Copied!" : "Copy to Clipboard"}
          </button>
          <button
            onClick={onClear}
            className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground-muted hover:text-foreground hover:border-border-strong transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ─── 1. Meta Description Generator ─────────────────────────────────────────

function MetaDescriptionGenerator() {
  const [topic, setTopic] = useState("");
  const { output, loading, error, generate, clear } = useAIGenerate(
    "meta-description-generator"
  );

  async function handleGenerate() {
    if (!topic.trim()) return;
    await generate({ topic });
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">
          Topic or Page Title
        </label>
        <textarea
          className={inputClass}
          rows={4}
          placeholder="Enter your page topic, title, or content brief..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={!topic.trim() || loading}
        className={primaryBtn}
      >
        {loading ? "Generating..." : "Generate Meta Description"}
      </button>

      {error && (
        <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      <AnimatePresence>
        {output && <OutputCard text={output} onClear={clear} label="Meta Description" />}
      </AnimatePresence>
    </div>
  );
}

// ─── 2. Structured Data Generator ────────────────────────────────────────────

const STRUCTURED_DATA_TYPES = [
  "Article",
  "Product",
  "Recipe",
  "Event",
  "LocalBusiness",
];

interface StructuredDataFields {
  // Article
  articleHeadline?: string;
  articleAuthor?: string;
  articleDate?: string;
  articleDescription?: string;
  articleImage?: string;
  // Product
  productName?: string;
  productBrand?: string;
  productPrice?: string;
  productCurrency?: string;
  productDescription?: string;
  productImage?: string;
  // Recipe
  recipeName?: string;
  recipeAuthor?: string;
  recipePrepTime?: string;
  recipeCookTime?: string;
  recipeCalories?: string;
  recipeIngredients?: string;
  // Event
  eventName?: string;
  eventStartDate?: string;
  eventEndDate?: string;
  eventLocation?: string;
  eventDescription?: string;
  // LocalBusiness
  businessName?: string;
  businessAddress?: string;
  businessCity?: string;
  businessPhone?: string;
  businessUrl?: string;
}

function StructuredDataGenerator() {
  const [dataType, setDataType] = useState("Article");
  const [fields, setFields] = useState<StructuredDataFields>({});
  const [output, setOutput] = useState("");
  const { loading, generate, clear } = useAIGenerate("structured-data-generator");

  function handleGenerate() {
    generate({ dataType, fields });
  }

  function updateField(key: keyof StructuredDataFields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  // Simple form generator for Article
  function renderArticleFields() {
    return (
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Headline
          </label>
          <input
            className={inputClass}
            value={fields.articleHeadline || ""}
            onChange={(e) => updateField("articleHeadline", e.target.value)}
            placeholder="Article headline..."
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-foreground-muted block mb-1">
              Author
            </label>
            <input
              className={inputClass}
              value={fields.articleAuthor || ""}
              onChange={(e) => updateField("articleAuthor", e.target.value)}
              placeholder="Author name"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground-muted block mb-1">
              Date Published
            </label>
            <input
              type="date"
              className={inputClass}
              value={fields.articleDate || ""}
              onChange={(e) => updateField("articleDate", e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Description
          </label>
          <textarea
            className={inputClass}
            rows={2}
            value={fields.articleDescription || ""}
            onChange={(e) => updateField("articleDescription", e.target.value)}
            placeholder="Article description..."
          />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Image URL
          </label>
          <input
            className={inputClass}
            value={fields.articleImage || ""}
            onChange={(e) => updateField("articleImage", e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>
    );
  }

  function renderProductFields() {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-foreground-muted block mb-1">
              Product Name
            </label>
            <input
              className={inputClass}
              value={fields.productName || ""}
              onChange={(e) => updateField("productName", e.target.value)}
              placeholder="Product name"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground-muted block mb-1">
              Brand
            </label>
            <input
              className={inputClass}
              value={fields.productBrand || ""}
              onChange={(e) => updateField("productBrand", e.target.value)}
              placeholder="Brand name"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-foreground-muted block mb-1">
              Price
            </label>
            <input
              className={inputClass}
              value={fields.productPrice || ""}
              onChange={(e) => updateField("productPrice", e.target.value)}
              placeholder="29.99"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground-muted block mb-1">
              Currency
            </label>
            <select
              className={inputClass}
              value={fields.productCurrency || "USD"}
              onChange={(e) => updateField("productCurrency", e.target.value)}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="INR">INR</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Description
          </label>
          <textarea
            className={inputClass}
            rows={2}
            value={fields.productDescription || ""}
            onChange={(e) => updateField("productDescription", e.target.value)}
            placeholder="Product description..."
          />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Image URL
          </label>
          <input
            className={inputClass}
            value={fields.productImage || ""}
            onChange={(e) => updateField("productImage", e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>
    );
  }

  function renderRecipeFields() {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-foreground-muted block mb-1">
              Recipe Name
            </label>
            <input
              className={inputClass}
              value={fields.recipeName || ""}
              onChange={(e) => updateField("recipeName", e.target.value)}
              placeholder="Recipe name"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground-muted block mb-1">
              Author
            </label>
            <input
              className={inputClass}
              value={fields.recipeAuthor || ""}
              onChange={(e) => updateField("recipeAuthor", e.target.value)}
              placeholder="Author name"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-foreground-muted block mb-1">
              Prep Time (PT)
            </label>
            <input
              className={inputClass}
              value={fields.recipePrepTime || ""}
              onChange={(e) => updateField("recipePrepTime", e.target.value)}
              placeholder="PT30M"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground-muted block mb-1">
              Cook Time (PT)
            </label>
            <input
              className={inputClass}
              value={fields.recipeCookTime || ""}
              onChange={(e) => updateField("recipeCookTime", e.target.value)}
              placeholder="PT1H"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground-muted block mb-1">
              Calories
            </label>
            <input
              type="number"
              className={inputClass}
              value={fields.recipeCalories || ""}
              onChange={(e) => updateField("recipeCalories", e.target.value)}
              placeholder="350"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Ingredients
          </label>
          <textarea
            className={inputClass}
            rows={3}
            value={fields.recipeIngredients || ""}
            onChange={(e) => updateField("recipeIngredients", e.target.value)}
            placeholder="1 cup flour&#10;2 eggs&#10;1/2 cup sugar"
          />
        </div>
      </div>
    );
  }

  function renderEventFields() {
    return (
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Event Name
          </label>
          <input
            className={inputClass}
            value={fields.eventName || ""}
            onChange={(e) => updateField("eventName", e.target.value)}
            placeholder="Event name"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-foreground-muted block mb-1">
              Start Date/Time
            </label>
            <input
              type="datetime-local"
              className={inputClass}
              value={fields.eventStartDate || ""}
              onChange={(e) => updateField("eventStartDate", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground-muted block mb-1">
              End Date/Time
            </label>
            <input
              type="datetime-local"
              className={inputClass}
              value={fields.eventEndDate || ""}
              onChange={(e) => updateField("eventEndDate", e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Location
          </label>
          <input
            className={inputClass}
            value={fields.eventLocation || ""}
            onChange={(e) => updateField("eventLocation", e.target.value)}
            placeholder="123 Main St, City, State"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Description
          </label>
          <textarea
            className={inputClass}
            rows={2}
            value={fields.eventDescription || ""}
            onChange={(e) => updateField("eventDescription", e.target.value)}
            placeholder="Event description..."
          />
        </div>
      </div>
    );
  }

  function renderLocalBusinessFields() {
    return (
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Business Name
          </label>
          <input
            className={inputClass}
            value={fields.businessName || ""}
            onChange={(e) => updateField("businessName", e.target.value)}
            placeholder="Business name"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Address
          </label>
          <input
            className={inputClass}
            value={fields.businessAddress || ""}
            onChange={(e) => updateField("businessAddress", e.target.value)}
            placeholder="123 Main St"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-foreground-muted block mb-1">
              City
            </label>
            <input
              className={inputClass}
              value={fields.businessCity || ""}
              onChange={(e) => updateField("businessCity", e.target.value)}
              placeholder="City"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground-muted block mb-1">
              Phone
            </label>
            <input
              type="tel"
              className={inputClass}
              value={fields.businessPhone || ""}
              onChange={(e) => updateField("businessPhone", e.target.value)}
              placeholder="+1-234-567-8900"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Website URL
          </label>
          <input
            className={inputClass}
            value={fields.businessUrl || ""}
            onChange={(e) => updateField("businessUrl", e.target.value)}
            placeholder="https://example.com"
          />
        </div>
      </div>
    );
  }

  function renderFields() {
    switch (dataType) {
      case "Article":
        return renderArticleFields();
      case "Product":
        return renderProductFields();
      case "Recipe":
        return renderRecipeFields();
      case "Event":
        return renderEventFields();
      case "LocalBusiness":
        return renderLocalBusinessFields();
      default:
        return null;
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">
          Schema Type
        </label>
        <select
          className={inputClass}
          value={dataType}
          onChange={(e) => setDataType(e.target.value)}
        >
          {STRUCTURED_DATA_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className={cardClass}>
        <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">
          Fields for {dataType}
        </p>
        {renderFields()}
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className={primaryBtn}
      >
        {loading ? "Generating JSON-LD..." : "Generate JSON-LD"}
      </button>

      <AnimatePresence>
        {output && (
          <OutputCard text={output} onClear={() => { setOutput(""); clear(); }} label="JSON-LD Output" />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── 3. Sitemap Validator ────────────────────────────────────────────────────

interface SitemapError {
  type: "error" | "warning" | "info";
  message: string;
  url?: string;
}

function SitemapValidator() {
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [validating, setValidating] = useState(false);
  const [urlCount, setUrlCount] = useState<number | null>(null);
  const [errors, setErrors] = useState<SitemapError[]>([]);
  const [status, setStatus] = useState<"idle" | "valid" | "invalid">("idle");

  async function handleValidate() {
    if (!sitemapUrl.trim()) return;
    setValidating(true);
    setErrors([]);
    setUrlCount(null);
    setStatus("idle");

    try {
      const res = await fetch(sitemapUrl);
      const text = await res.text();

      // Parse XML
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, "text/xml");

      // Check for parse errors
      const parseError = xml.querySelector("parsererror");
      if (parseError) {
        setErrors([
          {
            type: "error",
            message: "Invalid XML format. The sitemap is not valid XML.",
          },
        ]);
        setStatus("invalid");
        setValidating(false);
        return;
      }

      const urls = xml.querySelectorAll("url loc");
      const sitemapIndex = xml.querySelectorAll("sitemap loc");
      const newErrors: SitemapError[] = [];
      const discoveredUrls: string[] = [];

      if (sitemapIndex.length > 0) {
        // This is a sitemap index
        setUrlCount(sitemapIndex.length);
        newErrors.push({
          type: "info",
          message: `Sitemap index detected with ${sitemapIndex.length} child sitemaps.`,
        });
      } else if (urls.length > 0) {
        // Regular sitemap
        setUrlCount(urls.length);

        urls.forEach((urlEl) => {
          const loc = urlEl.textContent?.trim() || "";

          // Validate URL format
          try {
            new URL(loc);
            discoveredUrls.push(loc);
          } catch {
            newErrors.push({
              type: "error",
              message: `Invalid URL: ${loc}`,
              url: loc,
            });
          }

          // Check for lastmod
          const lastmod = urlEl.parentElement?.querySelector("lastmod")?.textContent;
          if (!lastmod) {
            newErrors.push({
              type: "warning",
              message: `Missing <lastmod> for: ${loc}`,
              url: loc,
            });
          }

          // Check for changefreq
          const changefreq = urlEl.parentElement?.querySelector("changefreq")?.textContent;
          if (!changefreq) {
            newErrors.push({
              type: "warning",
              message: `Missing <changefreq> for: ${loc}`,
              url: loc,
            });
          }

          // Check for priority
          const priority = urlEl.parentElement?.querySelector("priority")?.textContent;
          if (!priority) {
            newErrors.push({
              type: "info",
              message: `Missing <priority> for: ${loc}`,
              url: loc,
            });
          }
        });

        if (newErrors.filter((e) => e.type === "error").length === 0) {
          setStatus("valid");
        } else {
          setStatus("invalid");
        }
      } else {
        setErrors([
          {
            type: "error",
            message: "No <url> elements found in the sitemap.",
          },
        ]);
        setStatus("invalid");
      }

      // Add any remaining errors
      if (newErrors.length > 0) {
        setErrors(newErrors);
      }
    } catch (err) {
      setErrors([
        {
          type: "error",
          message: `Failed to fetch or parse sitemap: ${(err as Error).message}`,
        },
      ]);
      setStatus("invalid");
    }

    setValidating(false);
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">
          Sitemap URL
        </label>
        <input
          className={inputClass}
          type="url"
          placeholder="https://example.com/sitemap.xml"
          value={sitemapUrl}
          onChange={(e) => setSitemapUrl(e.target.value)}
        />
      </div>

      <button
        onClick={handleValidate}
        disabled={!sitemapUrl.trim() || validating}
        className={primaryBtn}
      >
        {validating ? "Validating..." : "Validate Sitemap"}
      </button>

      {status !== "idle" && (
        <div
          className={clsx(
            "rounded-xl border p-4 flex items-center gap-3",
            status === "valid"
              ? "bg-green-500/10 border-green-500/30"
              : "bg-red-500/10 border-red-500/30"
          )}
        >
          {status === "valid" ? (
            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          )}
          <div>
            <p
              className={clsx(
                "text-sm font-medium",
                status === "valid" ? "text-green-600" : "text-red-600"
              )}
            >
              {status === "valid" ? "Sitemap is valid!" : "Sitemap has issues"}
            </p>
            {urlCount !== null && (
              <p className="text-xs text-foreground-muted mt-0.5">
                {urlCount} URL{urlCount !== 1 ? "s" : ""} found
              </p>
            )}
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
            Issues ({errors.length})
          </p>
          {errors.map((err, i) => (
            <div
              key={i}
              className={clsx(
                "rounded-xl border px-4 py-3 text-sm",
                err.type === "error"
                  ? "bg-red-500/5 border-red-500/20"
                  : err.type === "warning"
                  ? "bg-yellow-500/5 border-yellow-500/20"
                  : "bg-blue-500/5 border-blue-500/20"
              )}
            >
              <div className="flex items-start gap-2">
                {err.type === "error" && (
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                )}
                {err.type === "warning" && (
                  <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                )}
                {err.type === "info" && (
                  <FileText className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                )}
                <div>
                  <p
                    className={clsx(
                      "text-foreground",
                      err.type === "error"
                        ? "text-red-600"
                        : err.type === "warning"
                        ? "text-yellow-600"
                        : "text-blue-600"
                    )}
                  >
                    {err.message}
                  </p>
                  {err.url && (
                    <p className="text-xs text-foreground-muted mt-1 font-mono">
                      {err.url}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 4. Robots.txt Generator ───────────────────────────────────────────────

interface RobotsRule {
  userAgent: string;
  allow: string[];
  disallow: string[];
}

function RobotsTxtGenerator() {
  const [rules, setRules] = useState<RobotsRule[]>([
    { userAgent: "*", allow: [], disallow: [] },
  ]);
  const [crawlDelay, setCrawlDelay] = useState("");
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [output, setOutput] = useState("");

  function addRule() {
    setRules([...rules, { userAgent: "", allow: [], disallow: [] }]);
  }

  function removeRule(index: number) {
    setRules(rules.filter((_, i) => i !== index));
  }

  function updateRuleUserAgent(index: number, value: string) {
    const updated = [...rules];
    updated[index].userAgent = value;
    setRules(updated);
  }

  function addPath(
    ruleIndex: number,
    type: "allow" | "disallow",
    path: string
  ) {
    if (!path.trim()) return;
    const updated = [...rules];
    if (type === "allow") {
      updated[ruleIndex].allow.push(path);
    } else {
      updated[ruleIndex].disallow.push(path);
    }
    setRules(updated);
  }

  function removePath(
    ruleIndex: number,
    type: "allow" | "disallow",
    pathIndex: number
  ) {
    const updated = [...rules];
    if (type === "allow") {
      updated[ruleIndex].allow.splice(pathIndex, 1);
    } else {
      updated[ruleIndex].disallow.splice(pathIndex, 1);
    }
    setRules(updated);
  }

  function generateRobotsTxt() {
    let content = "";

    rules.forEach((rule) => {
      if (rule.userAgent) {
        content += `User-agent: ${rule.userAgent}\n`;
      }

      rule.disallow.forEach((path) => {
        content += `Disallow: ${path}\n`;
      });

      rule.allow.forEach((path) => {
        content += `Allow: ${path}\n`;
      });

      if (rule.userAgent) {
        content += "\n";
      }
    });

    if (crawlDelay) {
      content += `Crawl-delay: ${crawlDelay}\n\n`;
    }

    if (sitemapUrl) {
      content += `Sitemap: ${sitemapUrl}\n`;
    }

    setOutput(content.trim());
  }

  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!output) return;
    navigator.clipboard.writeText(output).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-5">
      {/* Default common rules */}
      <div className={cardClass}>
        <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">
          Quick Rules
        </p>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-border text-orange-500 focus:ring-orange-500"
              onChange={(e) => {
                if (e.target.checked) {
                  const updated = [...rules];
                  if (!updated[0].disallow.includes("/admin/")) {
                    updated[0].disallow.push("/admin/");
                  }
                  if (!updated[0].disallow.includes("/private/")) {
                    updated[0].disallow.push("/private/");
                  }
                  if (!updated[0].disallow.includes("/wp-admin/")) {
                    updated[0].disallow.push("/wp-admin/");
                  }
                  setRules(updated);
                }
              }}
            />
            <span className="text-sm text-foreground">
              Block common admin paths (admin, private, wp-admin)
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-border text-orange-500 focus:ring-orange-500"
              onChange={(e) => {
                if (e.target.checked) {
                  const updated = [...rules];
                  if (!updated[0].disallow.includes("/api/")) {
                    updated[0].disallow.push("/api/");
                  }
                  if (!updated[0].disallow.includes("/~")) {
                    updated[0].disallow.push("/~");
                  }
                  setRules(updated);
                }
              }}
            />
            <span className="text-sm text-foreground">
              Block API and user paths
            </span>
          </label>
        </div>
      </div>

      {/* Custom rules */}
      <div className="space-y-4">
        {rules.map((rule, ruleIndex) => (
          <div key={ruleIndex} className={cardClass}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                Rule #{ruleIndex + 1}
              </p>
              {rules.length > 1 && (
                <button
                  onClick={() => removeRule(ruleIndex)}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="mb-3">
              <label className="text-xs font-medium text-foreground-muted block mb-1">
                User Agent
              </label>
              <input
                className={inputClass}
                value={rule.userAgent}
                onChange={(e) => updateRuleUserAgent(ruleIndex, e.target.value)}
                placeholder="* or specific bot name (e.g., Googlebot)"
              />
            </div>

            {/* Disallow */}
            <div className="mb-3">
              <label className="text-xs font-medium text-foreground-muted block mb-1">
                Disallow
              </label>
              <div className="space-y-1">
                {rule.disallow.map((path, pathIndex) => (
                  <div
                    key={pathIndex}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span className="text-red-500 font-mono">Disallow:</span>
                    <span className="text-foreground font-mono flex-1">{path}</span>
                    <button
                      onClick={() =>
                        removePath(ruleIndex, "disallow", pathIndex)
                      }
                      className="text-foreground-muted hover:text-red-500"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
              <PathInput
                onAdd={(path) => addPath(ruleIndex, "disallow", path)}
                placeholder="/path/to/block"
              />
            </div>

            {/* Allow */}
            <div>
              <label className="text-xs font-medium text-foreground-muted block mb-1">
                Allow
              </label>
              <div className="space-y-1">
                {rule.allow.map((path, pathIndex) => (
                  <div
                    key={pathIndex}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span className="text-green-500 font-mono">Allow:</span>
                    <span className="text-foreground font-mono flex-1">{path}</span>
                    <button
                      onClick={() => removePath(ruleIndex, "allow", pathIndex)}
                      className="text-foreground-muted hover:text-red-500"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
              <PathInput
                onAdd={(path) => addPath(ruleIndex, "allow", path)}
                placeholder="/path/to/allow"
              />
            </div>
          </div>
        ))}

        <button onClick={addRule} className={secondaryBtn}>
          + Add Rule
        </button>
      </div>

      {/* Crawl delay and sitemap */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Crawl-Delay (optional)
          </label>
          <input
            type="number"
            className={inputClass}
            value={crawlDelay}
            onChange={(e) => setCrawlDelay(e.target.value)}
            placeholder="10"
            min={1}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Sitemap URL (optional)
          </label>
          <input
            className={inputClass}
            value={sitemapUrl}
            onChange={(e) => setSitemapUrl(e.target.value)}
            placeholder="https://example.com/sitemap.xml"
          />
        </div>
      </div>

      <button onClick={generateRobotsTxt} className={primaryBtn}>
        Generate robots.txt
      </button>

      {output && (
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
              robots.txt Preview
            </p>
            <button
              onClick={handleCopy}
              className={clsx(
                "text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium",
                copied
                  ? "bg-orange-500/10 border-orange-500/30 text-orange-600"
                  : "bg-background border-border text-foreground-muted hover:text-foreground"
              )}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-foreground font-mono bg-background rounded-lg p-4">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}

function PathInput({
  onAdd,
  placeholder,
}: {
  onAdd: (path: string) => void;
  placeholder: string;
}) {
  const [value, setValue] = useState("");

  function handleAdd() {
    if (value.trim()) {
      onAdd(value.trim());
      setValue("");
    }
  }

  return (
    <div className="flex gap-2 mt-2">
      <input
        className={inputClass}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
      />
      <button
        onClick={handleAdd}
        className="h-11 px-4 rounded-xl bg-background border border-border text-foreground text-sm font-medium hover:bg-background-subtle"
      >
        Add
      </button>
    </div>
  );
}

// ─── 5. Open Graph Generator ──────────────────────────────────────────────────

function OpenGraphGenerator() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [siteName, setSiteName] = useState("");
  const [output, setOutput] = useState("");

  function generateOG() {
    let code = "";

    if (title) code += `<meta property="og:title" content="${escapeHtml(title)}">\n`;
    if (description) code += `<meta property="og:description" content="${escapeHtml(description)}">\n`;
    if (imageUrl) code += `<meta property="og:image" content="${escapeHtml(imageUrl)}">\n`;
    if (pageUrl) code += `<meta property="og:url" content="${escapeHtml(pageUrl)}">\n`;
    if (siteName) code += `<meta property="og:site_name" content="${escapeHtml(siteName)}">\n`;
    code += `<meta property="og:type" content="website">\n`;

    code += "\n<!-- Twitter Card -->\n";
    code += `<meta name="twitter:card" content="summary_large_image">\n`;
    if (title) code += `<meta name="twitter:title" content="${escapeHtml(title)}">\n`;
    if (description) code += `<meta name="twitter:description" content="${escapeHtml(description)}">\n`;
    if (imageUrl) code += `<meta name="twitter:image" content="${escapeHtml(imageUrl)}">\n`;

    setOutput(code.trim());
  }

  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!output) return;
    navigator.clipboard.writeText(output).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Page URL
          </label>
          <input
            className={inputClass}
            value={pageUrl}
            onChange={(e) => setPageUrl(e.target.value)}
            placeholder="https://example.com/page"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Site Name
          </label>
          <input
            className={inputClass}
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="Your Site Name"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Title (max 60 chars)
          </label>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Page title for social sharing"
            maxLength={60}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Description (max 155 chars)
          </label>
          <textarea
            className={inputClass}
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description for social sharing"
            maxLength={155}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Image URL (min 1200x630 recommended)
          </label>
          <input
            className={inputClass}
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>

      <button onClick={generateOG} className={primaryBtn}>
        Generate Open Graph Tags
      </button>

      {/* Social Preview */}
      {(title || description || imageUrl || pageUrl) && (
        <div>
          <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">
            Social Preview
          </p>
          <div className="space-y-3">
            {/* Facebook Preview */}
            <div className={cardClass}>
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-foreground-muted">
                  Facebook
                </span>
              </div>
              <div className="rounded-lg border border-border overflow-hidden">
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover bg-muted"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <div className="p-3">
                  <p className="text-[10px] uppercase text-foreground-muted">
                    {pageUrl || "example.com"}
                  </p>
                  <p className="text-sm font-semibold text-foreground line-clamp-2 mt-0.5">
                    {title || "Page Title"}
                  </p>
                  <p className="text-xs text-foreground-muted line-clamp-2 mt-0.5">
                    {description || "Page description will appear here..."}
                  </p>
                </div>
              </div>
            </div>

            {/* Twitter Preview */}
            <div className={cardClass}>
              <div className="flex items-center gap-2 mb-2">
                <X className="w-4 h-4 text-sky-500" />
                <span className="text-xs font-medium text-foreground-muted">
                  X / Twitter
                </span>
              </div>
              <div className="rounded-lg border border-border overflow-hidden">
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover bg-muted"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <div className="p-3">
                  <p className="text-sm font-semibold text-foreground line-clamp-2">
                    {title || "Page Title"}
                  </p>
                  <p className="text-xs text-foreground-muted line-clamp-2 mt-0.5">
                    {description || "Page description will appear here..."}
                  </p>
                  <p className="text-[10px] uppercase text-foreground-muted mt-1">
                    {pageUrl || "example.com"}
                  </p>
                </div>
              </div>
            </div>

            {/* LinkedIn Preview */}
            <div className={cardClass}>
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-blue-700" />
                <span className="text-xs font-medium text-foreground-muted">
                  LinkedIn
                </span>
              </div>
              <div className="rounded-lg border border-border overflow-hidden">
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover bg-muted"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <div className="p-3">
                  <p className="text-[10px] uppercase text-foreground-muted">
                    {siteName || "example.com"}
                  </p>
                  <p className="text-sm font-semibold text-foreground line-clamp-2 mt-0.5">
                    {title || "Page Title"}
                  </p>
                  <p className="text-xs text-foreground-muted line-clamp-2 mt-0.5">
                    {description || "Page description will appear here..."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {output && (
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
              Generated HTML
            </p>
            <button
              onClick={handleCopy}
              className={clsx(
                "text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium",
                copied
                  ? "bg-orange-500/10 border-orange-500/30 text-orange-600"
                  : "bg-background border-border text-foreground-muted hover:text-foreground"
              )}
            >
              {copied ? "Copied!" : "Copy Code"}
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-xs text-foreground font-mono bg-background rounded-lg p-4">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function SEOWorkspace({ tool }: { tool: Tool }) {
  switch (tool.slug) {
    case "meta-description-generator":
      return <MetaDescriptionGenerator />;
    case "structured-data-generator":
      return <StructuredDataGenerator />;
    case "sitemap-validator":
      return <SitemapValidator />;
    case "robots-txt-generator":
      return <RobotsTxtGenerator />;
    case "open-graph-generator":
      return <OpenGraphGenerator />;
    default:
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-foreground-muted">Tool not found: {tool.slug}</p>
        </div>
      );
  }
}