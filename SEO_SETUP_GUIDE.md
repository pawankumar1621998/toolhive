# Google Search Console Setup Guide — ToolHive

## Step 1: Add Property to Google Search Console

Go to [search.google.com/search-console](https://search.google.com/search-console) and:

### Method A — URL Prefix (Recommended for Vercel)
1. Click **"Add property"**
2. Select **"URL prefix"**
3. Enter: `https://toolhive-red.vercel.app`
4. Click **Continue**
5. **Verify ownership** — choose ONE method:
   - **HTML tag** (fastest): Copy the `<meta>` tag and add it to `src/app/layout.tsx` in the `<head>` section
   - **HTML file upload**: Download the HTML file and upload to `public/` folder, then deploy
   - **Google Analytics**: If GA4 is installed, this verifies automatically
   - **Google Tag Manager**: If GTM is installed, this verifies automatically

### Method B — Domain (Requires DNS Access)
1. Click **"Add property"**
2. Select **"Domain"**
3. Enter: `toolhive-red.vercel.app`
4. Go to your DNS provider and add the TXT record shown
5. Wait 5-30 minutes for DNS propagation
6. Click **Verify**

---

## Step 2: Submit Sitemap

After verification:

1. In GSC left sidebar, click **"Sitemaps"**
2. In the "Add a sitemap" box, enter just: `sitemap.xml`
3. Click **Submit**
4. Wait 24-48 hours for Google to process it

---

## Step 3: Request Indexing for Key Pages

To get indexed FAST, use URL Inspection:

1. In GSC, go to **"URL Inspection"** in the left sidebar
2. Enter each key URL and click **Request Indexing**:

### Priority Pages to Index First:
```
https://toolhive-red.vercel.app/
https://toolhive-red.vercel.app/tools/pdf/compress
https://toolhive-red.vercel.app/tools/image/remove-background
https://toolhive-red.vercel.app/tools/ai-writing/summarize
https://toolhive-red.vercel.app/tools/ai-writing/twitter-thread
https://toolhive-red.vercel.app/tools/image/text-to-image
https://toolhive-red.vercel.app/tools/image/resize
https://toolhive-red.vercel.app/resume-builder
https://toolhive-red.vercel.app/tools/ai-writing/grammar-check
https://toolhive-red.vercel.app/tools/ai-writing/paraphrase
https://toolhive-red.vercel.app/tools/ai-writing/linkedin-post
https://toolhive-red.vercel.app/tools/ai-writing/youtube-script
```

---

## Step 4: Check Coverage Report

After 24-48 hours:

1. Go to **"Pages"** or **"Coverage"** in GSC
2. Check for any **Error** issues
3. Fix any **Excluded** pages (especially "Crawled - currently not indexed" or "Discovered - currently not indexed")
4. Click on each error for details on how to fix

---

## Step 5: Set Up Performance Monitoring

1. Go to **"Performance"** in GSC
2. Set date range to **Last 28 days** (or Last 3 months)
3. Track these metrics:
   - **Clicks** — How many people clicked from Google
   - **Impressions** — How many times your pages appeared
   - **CTR** — Click-through rate (aim for 3%+)
   - **Position** — Average ranking position (aim for top 10)

4. Add **Search Queries** filter to see which keywords bring traffic
5. Set up **Email alerts** — click the gear icon ⚙️ → **Notifications** → Enable all alerts

---

## Step 6: Fix Core Web Vitals Issues

1. Go to **"Core Web Vitals"** report
2. Check for any URLs with **Poor** status
3. Click each URL to see which metric is failing:
   - **LCP** (Largest Contentful Paint) — should be under 2.5s
   - **INP** (Interaction to Next Paint) — should be under 200ms
   - **CLS** (Cumulative Layout Shift) — should be under 0.1

---

## Step 7: Connect Google Analytics 4 (Optional but Recommended)

1. Get your GA4 **Measurement ID** (G-XXXXXXXXXX) from [analytics.google.com](https://analytics.google.com)
2. Add it to Vercel environment variables or directly to the site
3. In GSC, link GA4: Settings → **Associates** → Connect Google Analytics property

---

## Timeline: When Will My Site Rank?

| Action | Time to Effect |
|--------|---------------|
| Submit sitemap | 1-4 weeks |
| Index new pages | 1-14 days |
| First rankings appear | 2-4 weeks |
| Rankings stabilize | 1-3 months |
| Top 10 rankings | 3-6 months |
| Top 3 rankings | 6-12 months |

---

## Quick Wins Checklist

- [x] Sitemap submitted to GSC
- [x] Key pages requested for indexing
- [x] robots.txt allows crawlers
- [x] Meta descriptions added to all pages
- [x] Open Graph tags added
- [x] JSON-LD structured data added
- [ ] Google Analytics 4 connected
- [ ] Set up email alerts in GSC
- [ ] Create a blog (1 post per keyword = faster ranking)
- [ ] Get backlinks from relevant sites

---

## Pro Tips

1. **Check URL Inspection** weekly for new pages — always request indexing manually
2. **Use "Performance" report** to find which keywords you're already ranking for, then optimize those pages
3. **Fix errors in Coverage report** within 7 days — Google penalizes sites with many errors
4. **Submit updated sitemap** every time you add new content
5. **Start a blog** — blog posts rank easier than tool pages and drive internal links
6. **Share on social media** — Twitter, LinkedIn posts with links = signals to Google

---

## Common GSC Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Crawled - currently not indexed" | Improve content quality, add more unique text |
| "Discovered - currently not indexed" | Check robots.txt, ensure canonical is correct |
| "Sitemap submitted but no pages indexed" | Wait 1-2 weeks, check Coverage for errors |
| "Page removed from index" | Check if page was deleted or set to noindex |
| "Improvement needed: Page experience" | Fix Core Web Vitals issues |