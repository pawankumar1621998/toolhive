# ToolHive SEO Action Plan

**URL:** https://toolhive-red.vercel.app
**For:** Pawan Kumar, Founder — ToolHive
**Date:** 2026-05-13
**Current SEO Health Score:** 47/100
**Target Score after full implementation:** 87/100

---

## HOW TO USE THIS PLAN

Each action is tagged by:
- **Priority:** CRITICAL / HIGH / MEDIUM / LOW
- **Effort:** Low (hours) / Medium (days) / High (weeks)
- **Impact:** Low / Medium / High / Very High
- **Type:** Technical / Content / Schema / Off-page / Performance

Execute in order. Complete all CRITICAL items before moving to HIGH.

---

## PHASE 1: CRITICAL FIXES (Week 0-1)

### 1. Add H1 Tags to Every Page
**Priority:** CRITICAL | **Effort:** Low | **Impact:** Very High | **Type:** On-Page SEO

**Why:** The homepage, /tools, /about, /blog, and ALL tool pages have zero H1 tags. Search engines cannot identify page topics without H1. This is the single most impactful fix.

**Implementation:**
```tsx
// Homepage — add inside the page component
<h1 className="sr-only">200+ Free AI Tools — PDF, Image, Video, AI Writing & More</h1>

// OR visible heading (if design allows):
<h1 className="text-4xl font-bold mb-6">
  200+ Free AI Tools for PDF, Image, Video & Writing
</h1>

// Tools page — add before the tool grid
<h1 className="sr-only">All Free AI Tools — Browse 200+ Tools</h1>

// About page — add in the main content area
<h1>About ToolHive</h1>

// Blog page — add in the main content area
<h1>ToolHive Blog — AI Tools Tips & Tutorials</h1>

// Each tool page — add the tool name as H1
// Example: /tools/ai-writing/summarize
<h1>Free AI Summarizer — No Signup, No Limit</h1>
```

**Note:** For tool pages, use the `generateMetadata` function in Next.js App Router to set dynamic titles and H1s:
```tsx
export async function generateMetadata({ params }) {
  return {
    title: `Free AI ${toolName} — No Signup, No Limit | ToolHive`,
    description: `Use our free AI ${toolName}. No signup, no watermark, no limits. Works in your browser.`,
  }
}
```

---

### 2. Fix Canonical URL on /tools Page
**Priority:** CRITICAL | **Effort:** Low | **Impact:** Very High | **Type:** Technical SEO

**Why:** The /tools page canonical points to `https://toolhive.app/tools` — a different domain. All SEO equity for the tools page leaks to the wrong URL.

**Implementation:**
```tsx
// In your Next.js /tools/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://toolhive-red.vercel.app/tools',
  },
}

// Or if using the deployed production domain:
export const metadata: Metadata = {
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL + '/tools',
  },
}
```

---

### 3. Update robots.txt Sitemap URL
**Priority:** CRITICAL | **Effort:** Low | **Impact:** High | **Type:** Technical SEO

**Why:** robots.txt points to `https://toolhive.app/sitemap.xml` which serves compliancehive.eu content. Search engines are being sent to the wrong sitemap.

**Implementation:**
```txt
# robots.txt — for toolhive-red.vercel.app
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/
Disallow: /auth/

Sitemap: https://toolhive-red.vercel.app/sitemap.xml
```

**For production (toolhive.app):**
```txt
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/
Disallow: /auth/

Sitemap: https://toolhive.app/sitemap.xml
```

---

### 4. Add Alt Text to All Images
**Priority:** CRITICAL | **Effort:** Medium | **Impact:** High | **Type:** On-Page SEO

**Why:** Every image on the site has zero alt text. This eliminates all image search traffic and harms accessibility.

**Implementation:**
Audit all images in your codebase:

```tsx
// Before:
<img src="/hero.png" />

// After:
<img src="/hero.png" alt="ToolHive — 200+ free AI tools for PDF, image, video, and writing" />

// Decorative images:
<img src="/decoration.svg" alt="" />

// Tool-specific images:
<img src="/pdf-compress-tool.jpg" alt="Compress PDF online free — drag and drop your file to reduce PDF size without signup" />
```

For Next.js Image component:
```tsx
import Image from 'next/image'

<Image
  src="/hero.png"
  alt="ToolHive — 200+ free AI tools for PDF compression, image editing, AI writing and more"
  width={1200}
  height={630}
/>
```

Build a script to audit all images:
```bash
# Find all img tags in your codebase without alt attribute
grep -r '<img' --include='*.tsx' --include='*.jsx' src/ | grep -v 'alt='
```

---

### 5. Create Direct URL Redirects for Target Keyword Pages
**Priority:** CRITICAL | **Effort:** Medium | **Impact:** High | **Type:** Technical SEO

**Why:** URLs like `/pdf-summarizer`, `/remove-background` return 404. Users searching for these terms will hit dead ends.

**Implementation — Next.js redirect config:**
```tsx
// next.config.ts or next.config.js
module.exports = {
  async redirects() {
    return [
      { source: '/pdf-summarizer', destination: '/tools/ai-writing/summarize', permanent: true },
      { source: '/remove-background', destination: '/tools/image/remove-background', permanent: true },
      { source: '/compress-pdf', destination: '/tools/pdf/compress', permanent: true },
      { source: '/twitter-thread-generator', destination: '/tools/ai-writing/twitter-thread-generator', permanent: true },
      { source: '/linkedin-post-generator', destination: '/tools/ai-writing/linkedin-post-generator', permanent: true },
      { source: '/youtube-script-generator', destination: '/tools/ai-writing/youtube-script-generator', permanent: true },
      { source: '/grammar-checker', destination: '/tools/ai-writing/grammar-check', permanent: true },
      { source: '/paraphrasing-tool', destination: '/tools/ai-writing/paraphrase', permanent: true },
      { source: '/image-generator', destination: '/tools/image/image-generator', permanent: true },
      { source: '/image-resize', destination: '/tools/image/resize', permanent: true },
      { source: '/resume-builder', destination: '/tools/resume/builder', permanent: true },
      { source: '/free-resume', destination: '/tools/resume/builder', permanent: true },
    ]
  },
}
```

**Or use Next.js dynamic routes:**
```tsx
// app/[tool]/page.tsx — catch-all for keyword URLs
import { redirect } from 'next/navigation'

const toolRedirects: Record<string, string> = {
  'pdf-summarizer': '/tools/ai-writing/summarize',
  'remove-background': '/tools/image/remove-background',
  // ... add all
}

export default function ToolPage({ params }: { params: { tool: string } }) {
  const dest = toolRedirects[params.tool]
  if (dest) redirect(dest)
  notFound()
}
```

---

## PHASE 2: HIGH PRIORITY (Week 1-2)

### 6. Rewrite Tool Page Titles with Target Keywords
**Priority:** HIGH | **Effort:** Low | **Impact:** High | **Type:** On-Page SEO

**Why:** Current titles like "AI Summarizer | ToolHive" do not contain target keywords. Title tags are the most important on-page ranking factor.

**Implementation — update generateMetadata in each tool page:**
```tsx
// /tools/ai-writing/summarize/page.tsx
export const metadata: Metadata = {
  title: 'AI PDF Summarizer — Free, No Signup, No Limit | ToolHive',
  description: 'Summarize any PDF or text with AI. Free, no signup required, no watermarks, no limits. Works in your browser instantly.',
}

// /tools/image/remove-background/page.tsx
export const metadata: Metadata = {
  title: 'Remove Background from Image — Free, No Watermark | ToolHive',
  description: 'Remove image background with AI for free. No signup, no watermark, no limits. Works in your browser — 100% free.',
}

// /tools/pdf/compress/page.tsx
export const metadata: Metadata = {
  title: 'Compress PDF Online — Free, No Limit, No Watermark | ToolHive',
  description: 'Compress PDF online for free with no file size limit and no watermarks. Reduce PDF file size without signup — works in your browser.',
}

// /tools/ai-writing/grammar-check/page.tsx
export const metadata: Metadata = {
  title: 'Free Grammar Checker — No Signup, No Limit | ToolHive',
  description: 'Check grammar for free with AI. No signup, no limits, instant fixes. Works in your browser — 100% free grammar checker.',
}

// /tools/ai-writing/paraphrase/page.tsx
export const metadata: Metadata = {
  title: 'Free Paraphrasing Tool — No Signup, No Limit | ToolHive',
  description: 'Paraphrase any text for free with AI. No signup, no watermarks, no limits. Instant results in your browser.',
}

// /tools/image/resize/page.tsx
export const metadata: Metadata = {
  title: 'Free Image Resize — No Signup, No Watermark | ToolHive',
  description: 'Resize any image for free. No signup, no watermarks, no quality loss. Works in your browser — 100% free.',
}

// /tools/image/image-generator/page.tsx
export const metadata: Metadata = {
  title: 'Free Image Generation — AI Art, No Signup | ToolHive',
  description: 'Generate AI images for free. No signup, no watermarks. Create stunning art from text prompts in seconds.',
}

// /tools/resume/builder/page.tsx
export const metadata: Metadata = {
  title: 'Free Premium Resume Builder — No Signup, No Watermark | ToolHive',
  description: 'Build a free premium resume — no signup, no watermarks, 50+ templates. Create a professional resume in minutes.',
}

// /tools/ai-writing/twitter-thread-generator/page.tsx
export const metadata: Metadata = {
  title: 'Twitter Thread Generator — Free AI, No Signup | ToolHive',
  description: 'Generate Twitter threads with AI for free. No signup, no limits. Create engaging viral threads instantly.',
}
```

---

### 7. Add FAQPage JSON-LD Schema to Tool Pages
**Priority:** HIGH | **Effort:** Low | **Impact:** High | **Type:** Schema

**Why:** FAQPage schema unlocks rich results in Google — your FAQ questions appear as expandable snippets in search results, dramatically increasing CTR.

**Implementation — create a FAQSchema component:**
```tsx
// components/FAQSchema.tsx
export default function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

**Then add to your PDF tool pages:**
```tsx
// app/tools/pdf/compress/page.tsx
import FAQSchema from '@/components/FAQSchema'

const faqs = [
  { question: "How to compress PDF online for free?", answer: "Upload your PDF to ToolHive, and our AI will compress it instantly. No signup, no file size limit, no watermarks." },
  { question: "Is there a file size limit?", answer: "No. ToolHive lets you compress PDFs of any size for free with no limits." },
  { question: "Is my data secure?", answer: "Yes. All processing happens in your browser. Your files are never uploaded to our servers." },
  { question: "Do you add watermarks?", answer: "No. The compressed PDF is returned to you without any watermarks." },
  { question: "Do I need to signup?", answer: "No. ToolHive is 100% free with no signup required." },
]

export default function CompressPDFPage() {
  return (
    <>
      <FAQSchema faqs={faqs} />
      {/* rest of page */}
    </>
  )
}
```

Do this for all 10+ target keyword tool pages.

---

### 8. Expand Blog Content to 1,500+ Words Each
**Priority:** HIGH | **Effort:** High | **Impact:** High | **Type:** Content

**Why:** Blog posts average 300-500 words. Competitive blog posts for AI tools keywords need 1,500-3,000 words to rank.

**Implementation:**

For each blog post, expand with:
1. **Introduction** (150 words) — Hook with the target keyword in the first paragraph
2. **What is [Topic]** (200 words) — Explain the concept
3. **Why Use ToolHive for [Topic]** (200 words) — Feature the tool naturally
4. **Step-by-Step Tutorial** (400 words) — Numbered HowTo steps
5. **Use Cases** (200 words) — Real-world applications
6. **Tips & Best Practices** (200 words) — Expert tips
7. **FAQ Section** (300 words) — 5 common questions with answers
8. **Related Tools** (100 words) — Internal links to related tools

Add internal links to 3+ other blog posts and 2+ tool pages in each post.

---

### 9. Add Organization Schema with Founder Info
**Priority:** HIGH | **Effort:** Medium | **Impact:** High | **Type:** Schema

**Why:** No Organization schema exists with founder, location, or social links. Adding this boosts E-E-A-T signals.

**Implementation:**
```tsx
// components/OrganizationSchema.tsx
export default function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ToolHive",
    "url": "https://toolhive-red.vercel.app",
    "logo": "https://toolhive-red.vercel.app/logo.png",
    "description": "200+ free AI-powered tools for PDF, image, video, and writing — no signup required. Founded by Pawan Kumar from Haryana, India.",
    "founder": {
      "@type": "Person",
      "name": "Pawan Kumar",
      "jobTitle": "Founder",
      "homeLocation": {
        "@type": "Place",
        "name": "Haryana, India"
      }
    },
    "areaServed": {
      "@type": "Place",
      "name": "Worldwide"
    },
    "sameAs": [
      "https://twitter.com/toolhive",
      "https://linkedin.com/company/toolhive"
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

Add `<OrganizationSchema />` to your root layout.tsx.

---

### 10. Begin Link-Building Campaign
**Priority:** HIGH | **Effort:** High | **Impact:** High | **Type:** Off-Page SEO

**Why:** ToolHive has a very limited backlink profile. High-quality backlinks are essential for domain authority and ranking.

**Quick wins (can execute in Week 1):**
1. Submit to **AlternativeTo**: https://alternativeto.net — list ToolHive under PDF tools and AI tools
2. Submit to **SaaSHub**: https://saashub.com — free listing for AI tools
3. Submit to **Product Hunt**: https://producthunt.com — launch ToolHive with screenshots
4. List on **Reddit** communities: r/software, r/artificial, r/Entrepreneur, r/SideProject

**Medium-term (Week 2-4):**
5. Write a **guest post** for a marketing or AI tools blog about "how to use free AI tools"
6. Create an **infographic** on "200+ Free AI Tools in 2026" and submit to infographic sites
7. Add ToolHive to **Wikipedia** "List of PDF software" and "List of AI tools" if notable
8. Respond to **HARO/Connectively** queries on AI tools, productivity software

---

## PHASE 3: MEDIUM PRIORITY (Week 3-4)

### 11. Add HowTo Schema on PDF and Image Tool Pages
**Priority:** MEDIUM | **Effort:** Low | **Impact:** Medium | **Type:** Schema

**Why:** HowTo schema appears as rich results with step-by-step instructions in Google.

**Template:**
```tsx
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Compress PDF Online for Free",
  "step": [
    { "@type": "HowToStep", "name": "Upload PDF", "text": "Drag and drop your PDF file onto ToolHive" },
    { "@type": "HowToStep", "name": "Compress", "text": "Our AI automatically compresses your PDF" },
    { "@type": "HowToStep", "name": "Download", "text": "Download your compressed PDF instantly" }
  ]
}
```

---

### 12. Add BreadcrumbList Schema to Tool Pages
**Priority:** MEDIUM | **Effort:** Low | **Impact:** Medium | **Type:** Schema

**Why:** BreadcrumbList schema shows your site hierarchy in search results, improving click-through rates.

**Template:**
```tsx
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://toolhive-red.vercel.app" },
    { "@type": "ListItem", "position": 2, "name": "Tools", "item": "https://toolhive-red.vercel.app/tools" },
    { "@type": "ListItem", "position": 3, "name": "PDF Tools", "item": "https://toolhive-red.vercel.app/tools/pdf" },
    { "@type": "ListItem", "position": 4, "name": "Compress PDF", "item": "https://toolhive-red.vercel.app/tools/pdf/compress" }
  ]
}
```

---

### 13. Expand About Page to 800+ Words
**Priority:** MEDIUM | **Effort:** Medium | **Impact:** Medium | **Type:** Content

**Why:** The about page has only 463 words with no founder story, no mission statement depth, and no E-E-A-T signals.

**Content to add:**
- Founder story: Pawan Kumar, Haryana, India — why he built ToolHive
- Mission: Make powerful AI tools free and accessible to everyone
- The problem: Most AI tools require signup, have limits, or add watermarks
- The solution: ToolHive — browser-based, no signup, no limits, no watermarks
- Team section (if applicable)
- Contact information
- Company values

---

### 14. Add Blog Posts to Sitemap
**Priority:** MEDIUM | **Effort:** Low | **Impact:** Medium | **Type:** Technical SEO

**Why:** The sitemap has 0 blog posts indexed. Individual blog posts may not be discovered.

**Implementation:**
Update your sitemap generation to include blog post URLs:
```tsx
// If using next-sitemap:
module.exports = {
  siteUrl: 'https://toolhive-red.vercel.app',
  changefreq: 'weekly',
  priority: 0.7,
  // Ensure blog posts are included
  transformations: ['tools', 'blog', 'guides', 'compare'],
}
```

---

### 15. Generate and Publish llms.txt
**Priority:** MEDIUM | **Effort:** Low | **Impact:** Medium | **Type:** AI Search Readiness

**Why:** AI crawlers (ChatGPT, Perplexity) benefit from llms.txt files that summarize site content.

**Implementation:**
Create `/app/llms.txt/route.ts` or a static `llms.txt` file:
```
# ToolHive — Free AI Tools Platform

ToolHive provides 200+ free AI-powered tools for PDF, image, video, writing, and more — no signup required.

## Tool Categories
- PDF Tools: compress, merge, split, convert, OCR, sign, watermark
- Image Tools: remove background, resize, compress, generator
- AI Writing: summarizer, grammar checker, paraphrasing, Twitter thread generator, LinkedIn post generator, YouTube script generator
- Resume Tools: builder, analyzer, ATS checker, cover letter
- Calculators: budget planner, Pomodoro, countdown
- Converters: JPG to PDF, PDF to Excel, audio transcriber

## Key Features
- No signup required
- No watermarks
- No file size limits
- Works in browser (no upload to servers)
- 100% free

## Contact
Website: https://toolhive-red.vercel.app
Founder: Pawan Kumar, Haryana, India

## Social
Twitter: https://twitter.com/toolhive
LinkedIn: https://linkedin.com/company/toolhive
```

---

### 16. Add Author Schema to Blog Posts
**Priority:** MEDIUM | **Effort:** Medium | **Impact:** Medium | **Type:** Schema

**Why:** Author schema establishes E-E-A-T for blog content.

**Implementation:**
```tsx
// For each blog post page:
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Blog Post Title",
  "datePublished": "2026-03-15",
  "author": {
    "@type": "Person",
    "name": "Priya Sharma",
    "url": "https://toolhive-red.vercel.app/team/priya-sharma"
  },
  "publisher": {
    "@type": "Organization",
    "name": "ToolHive",
    "url": "https://toolhive-red.vercel.app"
  }
}
```

---

### 17. Expand Compare Pages to 1,500+ Words Each
**Priority:** MEDIUM | **Effort:** High | **Impact:** Medium | **Type:** Content

**Why:** Compare pages have only ~424 words. They need comprehensive content to compete with established comparison pages.

**Content to add:**
- Feature-by-feature comparison table
- Pros and cons for each tool
- Pricing comparison
- User experience comparison
- "Our verdict" section
- FAQ section

---

### 18. Implement SSR/SSG for Tool Pages
**Priority:** MEDIUM | **Effort:** High | **Impact:** Medium | **Type:** Performance

**Why:** Next.js SPA architecture means search engines may see empty HTML on first parse. Server-side rendering ensures content is in the initial HTML.

**Implementation:**
```tsx
// Use generateStaticParams for pre-rendering tool pages
export async function generateStaticParams() {
  const tools = await fetchAllTools()
  return tools.map(tool => ({
    category: tool.category,
    slug: tool.slug,
  }))
}

// Use server components by default (no 'use client')
export default async function ToolPage({ params }: Props) {
  // Server-side data fetching
  const tool = await getTool(params.category, params.slug)
  return <ToolClientComponent tool={tool} />
}
```

---

## PHASE 4: LOW PRIORITY (Week 5+)

### 19. Verify HSTS Header
**Priority:** LOW | **Effort:** Low | **Impact:** Low | **Type:** Security

**Check with:**
```bash
curl -I https://toolhive-red.vercel.app
```
Look for `Strict-Transport-Security` in response headers.

If missing, add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload" }
      ]
    }
  ]
}
```

---

### 20. Create Custom 404 Page
**Priority:** LOW | **Effort:** Medium | **Impact:** Low | **Type:** UX/SEO

```tsx
// app/not-found.tsx
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl mb-4">Page not found</h2>
        <p className="text-gray-600 mb-8">
          The tool or page you're looking for doesn't exist.
        </p>
        <div className="space-y-2">
          <p className="font-medium">Try these popular tools:</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="/tools/pdf/compress" className="btn-primary">Compress PDF</a>
            <a href="/tools/image/remove-background" className="btn-primary">Remove Background</a>
            <a href="/tools/ai-writing/summarize" className="btn-primary">Summarize Text</a>
            <a href="/tools/ai-writing/grammar-check" className="btn-primary">Grammar Check</a>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

### 21. Validate og:image
**Priority:** LOW | **Effort:** Low | **Impact:** Low | **Type:** Social SEO

Check that `https://toolhive-red.vercel.app/og-image.png`:
- Is at least 1200x630 pixels
- Is under 5MB
- Is in PNG or JPG format
- Has your logo and a clear call-to-action
- Does not have too much text (Facebook cuts off text-heavy images)

---

## QUICK IMPLEMENTATION CHECKLIST

Print or share this checklist:

- [ ] Add H1 to homepage
- [ ] Add H1 to /tools page
- [ ] Add H1 to /about page
- [ ] Add H1 to /blog page
- [ ] Add H1 to each of the 10 target keyword tool pages
- [ ] Fix canonical on /tools page
- [ ] Update robots.txt sitemap URL
- [ ] Add alt text to all images (audit + fix)
- [ ] Add URL redirects for keyword URLs in next.config.ts
- [ ] Rewrite tool page titles with target keywords
- [ ] Add FAQPage JSON-LD to top 10 tool pages
- [ ] Add Organization schema to layout
- [ ] Expand blog posts to 1,500+ words
- [ ] Submit to AlternativeTo and SaaSHub
- [ ] Add HowTo schema to PDF/image tools
- [ ] Add BreadcrumbList to tool pages
- [ ] Expand About page to 800+ words
- [ ] Add blog posts to sitemap
- [ ] Generate llms.txt
- [ ] Add Author schema to blog posts

---

## NOTES FOR PRODUCTION DEPLOYMENT

When deploying to **toolhive.app** (production):
1. Update all canonical URLs to `https://toolhive.app/...`
2. Update robots.txt sitemap to `https://toolhive.app/sitemap.xml`
3. Set `NEXT_PUBLIC_SITE_URL=https://toolhive.app` in environment variables
4. Keep toolhive-red.vercel.app as staging/QA before production push

---

*Action Plan generated: 2026-05-13 | SEO Audit by Claude Code (Anthropic)*