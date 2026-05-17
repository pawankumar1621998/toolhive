from playwright.sync_api import sync_playwright
import json

def analyze_mobile(url):
    issues = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': 375, 'height': 812})
        page.goto(url, wait_until='networkidle')

        # Check for horizontal scroll
        body_width = page.evaluate("document.body.scrollWidth")
        viewport_width = page.viewport_size['width']
        if body_width > viewport_width:
            issues.append(f"HORIZONTAL SCROLL: Body width ({body_width}px) > viewport width ({viewport_width}px)")

        # Check touch targets
        small_buttons = page.evaluate("""() => {
            const buttons = document.querySelectorAll('button, a, [role="button"]');
            const small = [];
            buttons.forEach(btn => {
                const rect = btn.getBoundingClientRect();
                if (rect.width < 44 || rect.height < 44) {
                    small.push({
                        tag: btn.tagName,
                        text: btn.innerText?.substring(0, 30) || 'no text',
                        width: Math.round(rect.width),
                        height: Math.round(rect.height)
                    });
                }
            });
            return small.slice(0, 10);
        }""")
        if small_buttons:
            issues.append(f"SMALL TOUCH TARGETS: Found {len(small_buttons)} buttons/links < 44px")
            for btn in small_buttons[:3]:
                issues.append(f"  - {btn['tag']}: {btn['width']}x{btn['height']}px ('{btn['text']}')")

        # Check font sizes
        small_fonts = page.evaluate("""() => {
            const elements = document.querySelectorAll('p, span, div, li');
            const small = [];
            elements.forEach(el => {
                const style = window.getComputedStyle(el);
                const size = parseFloat(style.fontSize);
                if (size > 0 && size < 14 && el.innerText?.trim()) {
                    small.push({
                        tag: el.tagName,
                        text: el.innerText.substring(0, 30),
                        size: size
                    });
                }
            });
            return small.slice(0, 5);
        }""")
        if small_fonts:
            issues.append(f"SMALL FONTS: Found text < 14px")
            for font in small_fonts[:3]:
                issues.append(f"  - {font['tag']}: {font['size']}px ('{font['text']}')")

        # Check navigation
        nav_visible = page.evaluate("""() => {
            const nav = document.querySelector('nav');
            if (!nav) return 'No nav found';
            const rect = nav.getBoundingClientRect();
            return `visible: ${rect.top < 100}, height: ${Math.round(rect.height)}px`;
        }""")
        issues.append(f"NAVIGATION: {nav_visible}")

        # Check hamburger menu
        hamburger = page.evaluate("""() => {
            const menu = document.querySelector('[class*="hamburger"], [class*="menu"], [aria-label*="menu"], button[class*="menu"]');
            return menu ? 'Found' : 'Not found';
        }""")
        issues.append(f"HAMBURGER MENU: {hamburger}")

        # Check padding/margins
        padding = page.evaluate("""() => {
            const body = document.body;
            const style = window.getComputedStyle(body);
            return {
                paddingLeft: style.paddingLeft,
                paddingRight: style.paddingRight
            };
        }""")
        issues.append(f"BODY PADDING: left={padding['paddingLeft']}, right={padding['paddingRight']}")

        # Get above-the-fold content info
        above_fold = page.evaluate("""() => {
            const h1 = document.querySelector('h1');
            const hero = document.querySelector('[class*="hero"], [class*="Hero"]');
            const cta = document.querySelector('button, a[href*="get"], a[href*="start"], a[href*="try"]');
            return {
                h1: h1?.innerText?.substring(0, 50) || 'No H1',
                h1Visible: h1 ? h1.getBoundingClientRect().top < 500 : false,
                heroFound: !!hero,
                ctaFound: !!cta,
                ctaText: cta?.innerText?.substring(0, 30) || 'none'
            };
        }""")
        issues.append(f"ABOVE FOLD: H1='{above_fold['h1']}', H1 visible={above_fold['h1Visible']}, CTA='{above_fold['ctaText']}'")

        # Check images
        images = page.evaluate("""() => {
            const imgs = document.querySelectorAll('img');
            return {
                total: imgs.length,
                withoutAlt: Array.from(imgs).filter(img => !img.alt).length,
                largeSrcset: Array.from(imgs).filter(img => {
                    const rect = img.getBoundingClientRect();
                    return rect.width > 300;
                }).length
            };
        }""")
        issues.append(f"IMAGES: {images['total']} total, {images['withoutAlt']} without alt text, {images['largeSrcset']} large images")

        browser.close()

    return issues

if __name__ == "__main__":
    url = "https://toolhive-nob0vi32u-pawan-kumars-projects-31cec85c.vercel.app"
    issues = analyze_mobile(url)
    print(json.dumps(issues, indent=2))