from playwright.sync_api import sync_playwright

def capture(url, output_path, viewport_width=1920, viewport_height=1080):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': viewport_width, 'height': viewport_height})
        page.goto(url, wait_until='networkidle')
        page.screenshot(path=output_path, full_page=False)
        browser.close()

if __name__ == "__main__":
    url = "https://toolhive-nob0vi32u-pawan-kumars-projects-31cec85c.vercel.app"
    capture(url, "C:/Users/M.K COMPUTERS/Desktop/PDF/toolhive/screenshots/desktop.png", 1920, 1080)
    capture(url, "C:/Users/M.K COMPUTERS/Desktop/PDF/toolhive/screenshots/mobile.png", 375, 812)
    print("Screenshots captured.")