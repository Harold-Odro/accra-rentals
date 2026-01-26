"""
Tonaton Scraper - Improved with Better Element Detection
"""

from playwright.sync_api import sync_playwright
import json
import time
from datetime import datetime
import re
from collections import Counter


def clean_price(price_text):
    """Extract numeric price from text"""
    if not price_text:
        return None

    clean = re.sub(r'[^\d]', '', str(price_text))

    try:
        price = int(clean)
        if 500 <= price <= 500000:
            return price
    except:
        pass
    return None


def extract_bedrooms(text):
    """Extract bedroom count from text"""
    if not text:
        return None

    text_lower = text.lower()

    if 'studio' in text_lower or 'bedsitter' in text_lower:
        return 1

    patterns = [
        r'(\d+)\s*bedroom',
        r'(\d+)\s*bed\b',
        r'(\d+)\s*br\b',
    ]

    for pattern in patterns:
        match = re.search(pattern, text_lower)
        if match:
            beds = int(match.group(1))
            if 1 <= beds <= 10:
                return beds

    return None


def scrape_tonaton():
    """Scrape Tonaton using Playwright"""
    print("="*70)
    print("TONATON SCRAPER - IMPROVED")
    print("="*70)

    all_listings = []

    with sync_playwright() as p:
        print("\nLaunching browser...")
        # Show browser for debugging
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        page.set_viewport_size({"width": 1920, "height": 1080})

        base_url = "https://tonaton.com/c_houses-apartments-for-rent"

        for page_num in range(1, 6):
            print(f"\n{'='*70}")
            print(f"PAGE {page_num}")
            print(f"{'='*70}")

            if page_num == 1:
                url = base_url
            else:
                url = f"{base_url}?page={page_num}"

            print(f"URL: {url}")

            try:
                page.goto(url, wait_until='load', timeout=30000)
                time.sleep(5)  # Wait for dynamic content

                # Try different selectors for listing items
                print("\nTrying to find listing containers...")

                # Method 1: Look for article elements
                articles = page.query_selector_all('article')
                print(f"Found {len(articles)} article elements")

                # Method 2: Look for divs with data attributes
                data_divs = page.query_selector_all(
                    'div[data-testid], div[data-id]')
                print(f"Found {len(data_divs)} divs with data attributes")

                # Method 3: Look for list items
                list_items = page.query_selector_all(
                    'li.item, li[class*="item"], li[class*="listing"]')
                print(f"Found {len(list_items)} list items")

                # Method 4: Look for divs with specific classes
                listing_divs = page.query_selector_all(
                    'div[class*="listing"], div[class*="ad-item"], div[class*="card"]')
                print(f"Found {len(listing_divs)} listing divs")

                # Use whichever found the most
                containers = articles or data_divs or list_items or listing_divs

                if not containers:
                    print("⚠️ No listing containers found!")

                    # Fallback: Save page HTML for manual inspection
                    with open(f'tonaton_page_{page_num}.html', 'w', encoding='utf-8') as f:
                        f.write(page.content())
                    print(
                        f"Saved page HTML to tonaton_page_{page_num}.html for inspection")
                    continue

                print(f"\nProcessing {len(containers)} containers...")

                for idx, container in enumerate(containers):
                    try:
                        # Get all text from this container
                        text_content = container.text_content()

                        if not text_content or len(text_content) < 20:
                            continue

                        # Find price in text
                        price_match = re.search(
                            r'GH₵\s*([\d,]+)', text_content)
                        if not price_match:
                            continue

                        price = clean_price(price_match.group(1))
                        if not price:
                            continue

                        # Find link/title
                        link_elem = container.query_selector('a')
                        if not link_elem:
                            continue

                        title = link_elem.text_content().strip()
                        href = link_elem.get_attribute('href')

                        if not title or len(title) < 10:
                            continue

                        # Skip sales
                        if 'for sale' in title.lower() or 'land' in title.lower():
                            continue

                        # Extract bedrooms
                        bedrooms = extract_bedrooms(text_content)

                        # Try to find location
                        location = "Accra"
                        # Look for location patterns in text
                        loc_match = re.search(
                            r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*,\s*Accra', text_content)
                        if loc_match:
                            location = loc_match.group(1)
                        else:
                            # Try other patterns
                            lines = text_content.split('\n')
                            for line in lines:
                                if len(line) > 3 and len(line) < 30 and ',' in line:
                                    potential_loc = line.split(',')[0].strip()
                                    if potential_loc and not any(char.isdigit() for char in potential_loc):
                                        location = potential_loc
                                        break

                        # Build URL
                        full_url = href if href and href.startswith(
                            'http') else f"https://tonaton.com{href}" if href else ""

                        listing = {
                            'title': title,
                            'price': price,
                            'price_text': f"GH₵{price:,}",
                            'bedrooms': bedrooms,
                            'location': location,
                            'url': full_url,
                            'source': 'tonaton',
                            'scraped_at': datetime.now().isoformat()
                        }

                        # Check duplicates
                        if full_url and not any(l.get('url') == full_url for l in all_listings):
                            all_listings.append(listing)
                            print(
                                f"  {len(all_listings):3d}. {location:20s} | {bedrooms if bedrooms else '?'}BR | GH₵{price:,} | {title[:40]}")

                    except Exception as e:
                        continue

                found_this_page = len([l for l in all_listings]) - (
                    0 if page_num == 1 else len([l for l in all_listings if l]))
                print(
                    f"\nPage {page_num}: Found {len(all_listings)} total listings")

                if page_num < 5:
                    print("Waiting 3s...")
                    time.sleep(3)

            except Exception as e:
                print(f"Error on page {page_num}: {e}")
                break

        print("\n\nClosing browser in 5 seconds (check if you saw listings)...")
        time.sleep(5)
        browser.close()

    print(f"\n{'='*70}")
    print(f"SCRAPING COMPLETE")
    print(f"{'='*70}")
    print(f"Total listings: {len(all_listings)}")

    if not all_listings:
        print("\n❌ No listings found!")
        print("Check the saved HTML files (tonaton_page_*.html) to see the page structure")
        return

    # Save
    output = {
        'scraped_at': datetime.now().isoformat(),
        'total_listings': len(all_listings),
        'source': 'tonaton',
        'listings': all_listings
    }

    with open('tonaton_data.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Saved to tonaton_data.json")

    # Analysis
    if all_listings:
        prices = [l['price'] for l in all_listings]
        print(f"\nPRICE STATS:")
        print(f"  Average: GH₵{sum(prices)/len(prices):,.0f}")
        print(f"  Range: GH₵{min(prices):,} - GH₵{max(prices):,}")

        locations = [l['location'] for l in all_listings]
        loc_counts = Counter(locations)
        print(f"\nTOP LOCATIONS:")
        for loc, count in loc_counts.most_common(10):
            print(f"  {loc:20s}: {count}")


if __name__ == "__main__":
    scrape_tonaton()
