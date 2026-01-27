"""
Meqasa Alternative Scraper - Direct HTML parsing
Extracts data from raw HTML instead of using selectors
"""

from playwright.sync_api import sync_playwright
import json
import time
from datetime import datetime
import re
from pathlib import Path
from collections import Counter


def get_output_path():
    """Get the correct output path for the JSON file."""
    script_dir = Path(__file__).parent.absolute()
    public_dir = script_dir.parent / 'public'
    public_dir.mkdir(exist_ok=True)
    return public_dir / 'meqasa_data.json'


def extract_from_html(html_content, page_num):
    """Extract listings directly from HTML string"""
    listings = []

    # Split by mqs-prop-dt-wrapper divs
    sections = html_content.split('class="mqs-prop-dt-wrapper"')

    print(f"  Found {len(sections)-1} potential listing sections")

    for section in sections[1:]:  # Skip first (before any wrapper)
        try:
            # Extract title and URL from h2 a tag
            title_match = re.search(
                r'<h2>\s*<a[^>]*href="([^"]*)"[^>]*>([^<]+)</a>', section)
            if not title_match:
                continue

            href = title_match.group(1)
            title = title_match.group(2).strip()

            if not title or len(title) < 10:
                continue

            # Filter out non-apartments
            title_lower = title.lower()
            excluded = ['house', 'villa', 'mansion', 'townhouse',
                        'office', 'shop', 'warehouse', 'land', 'plot']
            if any(term in title_lower for term in excluded):
                continue

            # Extract price
            price_match = re.search(
                r'GH₵\s*([\d,]+)\s*<span>.*?month', section, re.IGNORECASE)
            if not price_match:
                continue

            try:
                price = int(price_match.group(1).replace(',', ''))
            except:
                continue

            # Validate price
            if price < 500 or price > 100000:
                continue

            # Extract bedrooms
            bed_match = re.search(
                r'<li class="bed"><span>(\d+)</span>', section)
            bedrooms = None
            if bed_match:
                try:
                    bedrooms = int(bed_match.group(1))
                except:
                    pass

            # Extract location from title
            location = "Accra"
            loc_match = re.search(
                r'in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', title)
            if loc_match:
                location = loc_match.group(1).strip()
                location = location.replace('Accra-Ghana', 'Accra')
                location = location.replace('-', ' ')
                if ',' in location:
                    location = location.split(',')[0].strip()

            # Build full URL
            full_url = f"https://meqasa.com{href}" if not href.startswith(
                'http') else href

            listing = {
                'title': title,
                'price': price,
                'price_text': f"GH₵{price:,}/month",
                'price_period': 'month',
                'property_type': 'apartment',
                'bedrooms': bedrooms,
                'location': location,
                'url': full_url,
                'source': 'meqasa',
                'scraped_at': datetime.now().isoformat(),
                'page': page_num
            }

            listings.append(listing)

        except Exception as e:
            continue

    return listings


def scrape_meqasa_alternative(output_path=None):
    """Scrape Meqasa using direct HTML parsing"""

    print("="*70)
    print("MEQASA ALTERNATIVE SCRAPER")
    print("="*70)
    print("\nThis scraper extracts data directly from HTML")
    print("More reliable than DOM selectors\n")

    all_listings = []

    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(headless=True)

        context = browser.new_context(
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        )
        page = context.new_page()
        page.set_viewport_size({"width": 1920, "height": 1080})

        base_url = 'https://meqasa.com/properties-for-rent-in-accra-ghana'

        for page_num in range(1, 51):
            if page_num == 1:
                url = base_url
            else:
                url = f"{base_url}?page={page_num}"

            print(f"\nPage {page_num}/50")

            try:
                # Load page
                response = page.goto(
                    url, wait_until='domcontentloaded', timeout=30000)

                if not response or response.status != 200:
                    print(
                        f"  ✗ Failed to load (status: {response.status if response else 'N/A'})")
                    if page_num == 1:
                        break
                    continue

                # Wait a bit for content
                time.sleep(4)

                # Get the HTML
                html_content = page.content()

                # Save first page HTML for debugging
                if page_num == 1:
                    with open('meqasa_page1.html', 'w', encoding='utf-8') as f:
                        f.write(html_content)
                    print("  (Saved page HTML to meqasa_page1.html)")

                # Extract listings from HTML
                page_listings = extract_from_html(html_content, page_num)

                if not page_listings:
                    print(f"  ✗ No listings extracted")
                    if page_num == 1:
                        print("\n❌ No listings found on first page!")
                        print("Check meqasa_page1.html to see what was loaded")
                        break
                    else:
                        print("  End of results")
                        break

                # Print extracted listings
                for listing in page_listings:
                    all_listings.append(listing)
                    loc = listing['location']
                    beds = listing['bedrooms'] or '?'
                    price = listing['price']
                    print(
                        f"    {len(all_listings):3d}. {loc:20s} | {beds}BR | GH₵{price:,}")

                print(
                    f"  ✓ Extracted {len(page_listings)} listings | Total: {len(all_listings)}")

                if page_num % 10 == 0:
                    print(f"\n  🎯 Checkpoint: {len(all_listings)} total")

                # Wait before next page
                time.sleep(2.5)

            except Exception as e:
                print(f"  ✗ Error: {e}")
                if page_num == 1:
                    break
                continue

        browser.close()

    print(f"\n{'='*70}")
    print("SCRAPING COMPLETE")
    print(f"{'='*70}")
    print(f"Total listings: {len(all_listings)}")

    if len(all_listings) == 0:
        print("\n❌ No listings extracted!")
        print("\nTroubleshooting:")
        print("  1. Check meqasa_page1.html - does it have listings?")
        print("  2. Is Meqasa blocking scrapers?")
        print("  3. Did the website structure change?")
        return False

    # Determine output path
    if output_path is None:
        output_path = get_output_path()

    # Save
    output_data = {
        'scraped_at': datetime.now().isoformat(),
        'total_listings': len(all_listings),
        'source': 'meqasa',
        'property_type': 'apartments',
        'price_period': 'monthly',
        'currency': 'GHS',
        'listings': all_listings
    }

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Saved to {output_path}")

    # Analysis
    print(f"\n{'='*70}")
    print("STATISTICS")
    print(f"{'='*70}")

    prices = [l['price'] for l in all_listings]
    print(f"\n💰 PRICES")
    print(f"  Total:   {len(all_listings)}")
    print(f"  Average: GH₵{sum(prices)/len(prices):,.0f}/month")
    print(f"  Median:  GH₵{sorted(prices)[len(prices)//2]:,}/month")
    print(f"  Range:   GH₵{min(prices):,} - GH₵{max(prices):,}")

    locations = Counter(l['location'] for l in all_listings)
    print(f"\n📍 TOP 20 LOCATIONS (out of {len(locations)})")
    for loc, count in locations.most_common(20):
        pct = (count / len(all_listings)) * 100
        print(f"  {loc:25s}: {count:4d} ({pct:4.1f}%)")

    bedrooms = [l['bedrooms'] for l in all_listings if l.get('bedrooms')]
    if bedrooms:
        bed_counts = Counter(bedrooms)
        print(f"\n🛏️  BEDROOMS")
        for beds in sorted(bed_counts.keys()):
            count = bed_counts[beds]
            pct = (count / len(bedrooms)) * 100
            print(f"  {beds}BR: {count:4d} ({pct:4.1f}%)")

    print(f"\n{'='*70}")
    print("✅ SUCCESS!")
    print(f"{'='*70}")

    return True


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', '-o', type=str)
    args = parser.parse_args()

    success = scrape_meqasa_alternative(args.output)
    exit(0 if success else 1)
