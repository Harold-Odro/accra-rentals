"""
Diagnostic script to check if Meqasa scraping is working
"""

from playwright.sync_api import sync_playwright
import time

def diagnose():
    print("=" * 70)
    print("MEQASA SCRAPER DIAGNOSTIC")
    print("=" * 70)

    with sync_playwright() as p:
        print("\n1. Launching browser...")
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1920, "height": 1080})

        url = 'https://meqasa.com/properties-for-rent-in-accra-ghana'
        print(f"\n2. Navigating to: {url}")

        try:
            page.goto(url, wait_until='load', timeout=30000)
            print("   Page loaded successfully!")
        except Exception as e:
            print(f"   ERROR loading page: {e}")
            browser.close()
            return

        time.sleep(3)

        # Save HTML for inspection
        print("\n3. Saving page HTML to 'debug_page.html'...")
        html = page.content()
        with open('debug_page.html', 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"   Saved {len(html)} characters")

        # Check for different possible selectors
        print("\n4. Testing CSS selectors...")

        selectors_to_test = [
            'div.mqs-prop-dt-wrapper',
            'div.mqs-featured-prop-inner-wrap',
            'div[class*="prop"]',
            'div[class*="listing"]',
            'article',
            '.property-card',
            '.listing-card',
            'a[href*="for-rent"]',
            'h2 a',
            '.price',
            '[class*="price"]',
        ]

        for selector in selectors_to_test:
            elements = page.query_selector_all(selector)
            count = len(elements)
            status = "✓" if count > 0 else "✗"
            print(f"   {status} '{selector}': {count} elements")

        # Try to find any links with rental info
        print("\n5. Looking for rental links...")
        links = page.query_selector_all('a')
        rental_links = []
        for link in links[:100]:  # Check first 100 links
            href = link.get_attribute('href') or ''
            text = link.text_content() or ''
            if 'rent' in href.lower() or 'bedroom' in text.lower():
                rental_links.append((href[:60], text[:40]))

        if rental_links:
            print(f"   Found {len(rental_links)} potential rental links:")
            for href, text in rental_links[:10]:
                print(f"      - {text} -> {href}")
        else:
            print("   No rental links found!")

        # Check page title
        print(f"\n6. Page title: {page.title()}")

        # Check for Cloudflare or bot protection
        print("\n7. Checking for bot protection...")
        if 'cloudflare' in html.lower():
            print("   ⚠ Cloudflare detected!")
        if 'captcha' in html.lower():
            print("   ⚠ CAPTCHA detected!")
        if 'blocked' in html.lower():
            print("   ⚠ Possible block detected!")
        if 'robot' in html.lower() or 'bot' in html.lower():
            print("   ⚠ Bot detection keywords found!")

        if not any(x in html.lower() for x in ['cloudflare', 'captcha', 'blocked']):
            print("   No obvious bot protection detected")

        # Take screenshot
        print("\n8. Taking screenshot 'debug_screenshot.png'...")
        page.screenshot(path='debug_screenshot.png', full_page=False)
        print("   Screenshot saved!")

        browser.close()

    print("\n" + "=" * 70)
    print("DIAGNOSIS COMPLETE")
    print("=" * 70)
    print("\nCheck these files for more info:")
    print("  - debug_page.html (full page HTML)")
    print("  - debug_screenshot.png (visual screenshot)")


if __name__ == "__main__":
    diagnose()
