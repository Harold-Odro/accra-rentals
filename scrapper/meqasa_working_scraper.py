"""
Meqasa Working Scraper - Based on Actual HTML Structure
Extracts from mqs-prop-dt-wrapper divs

Automated scraping for Accra Rentals platform.
Can be run manually or via GitHub Actions.
"""

from playwright.sync_api import sync_playwright
import json
import time
from datetime import datetime
import re
import os
from pathlib import Path
from collections import Counter


def get_output_path():
    """Get the correct output path for the JSON file."""
    # Get the directory where this script is located
    script_dir = Path(__file__).parent.absolute()
    # Go up one level and into public/
    public_dir = script_dir.parent / 'public'

    # Create public directory if it doesn't exist
    public_dir.mkdir(exist_ok=True)

    return public_dir / 'meqasa_data.json'


def scrape_meqasa_working(output_path=None):
    """Scrape Meqasa based on actual structure"""

    print("="*70)
    print("MEQASA WORKING SCRAPER")
    print("="*70)

    all_listings = []

    with sync_playwright() as p:
        print("\nLaunching browser...")
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1920, "height": 1080})

        base_url = 'https://meqasa.com/properties-for-rent-in-accra-ghana'

        for page_num in range(1, 51):  # Scrape 50 pages
            if page_num == 1:
                url = base_url
            else:
                url = f"{base_url}?page={page_num}"

            print(f"\nPage {page_num}/50: {url}")

            try:
                page.goto(url, wait_until='load', timeout=30000)
                time.sleep(3)

                # Find all listing wrappers
                listing_containers = page.query_selector_all(
                    'div.mqs-prop-dt-wrapper')

                if not listing_containers:
                    print(f"  No listings found, stopping.")
                    break

                print(f"  Found {len(listing_containers)} listings")

                for container in listing_containers:
                    try:
                        # Extract title and URL
                        title_elem = container.query_selector('h2 a')
                        if not title_elem:
                            continue

                        title = title_elem.text_content().strip()
                        href = title_elem.get_attribute('href')

                        # Extract price
                        price_elem = container.query_selector('p.h3')
                        if not price_elem:
                            continue

                        price_text = price_elem.text_content()
                        price_match = re.search(r'GH₵([\d,]+)', price_text)
                        if not price_match:
                            continue

                        try:
                            price = int(price_match.group(1).replace(',', ''))
                        except:
                            continue

                        if price < 500 or price > 500000:
                            continue

                        # Extract bedrooms
                        bed_elem = container.query_selector('li.bed span')
                        bedrooms = None
                        if bed_elem:
                            try:
                                bedrooms = int(bed_elem.text_content().strip())
                            except:
                                pass

                        # Extract location from title
                        # Pattern: "X bedroom house/apartment for rent in LOCATION"
                        location = "Accra"
                        loc_match = re.search(
                            r'in\s+([A-Z][a-z]+(?:[ -][A-Z][a-z]+)*)', title)
                        if loc_match:
                            location = loc_match.group(1).strip()
                            # Clean up
                            location = location.replace('Accra-Ghana', 'Accra')
                            location = location.replace('-', ' ')
                            if ',' in location:
                                location = location.split(',')[0].strip()

                        # Build URL
                        full_url = f"https://meqasa.com{href}" if href and not href.startswith(
                            'http') else href

                        listing = {
                            'title': title,
                            'price': price,
                            'price_text': f"GH₵{price:,}",
                            'bedrooms': bedrooms,
                            'location': location,
                            'url': full_url or "",
                            'source': 'meqasa',
                            'scraped_at': datetime.now().isoformat(),
                            'page': page_num
                        }

                        all_listings.append(listing)
                        print(
                            f"    {len(all_listings):3d}. {location:20s} | {bedrooms if bedrooms else '?'}BR | GH₵{price:,}")

                    except Exception as e:
                        continue

                print(
                    f"  Page total: {len([l for l in all_listings if l.get('page') == page_num])} | Running total: {len(all_listings)}")

                if page_num % 10 == 0:
                    print(
                        f"\n  🎯 Checkpoint: {len(all_listings)} listings collected")

                time.sleep(2)

            except Exception as e:
                print(f"  Error: {e}")
                break

        browser.close()

    print(f"\n{'='*70}")
    print("SCRAPING COMPLETE")
    print(f"{'='*70}")
    print(f"Total listings collected: {len(all_listings)}")

    if len(all_listings) == 0:
        print("\n❌ No listings extracted!")
        return

    # Determine output path
    if output_path is None:
        output_path = get_output_path()

    # Save
    output_data = {
        'scraped_at': datetime.now().isoformat(),
        'total_listings': len(all_listings),
        'source': 'meqasa',
        'listings': all_listings
    }

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Saved to {output_path}")

    # Analysis
    print(f"\n{'='*70}")
    print("ANALYSIS")
    print(f"{'='*70}")

    prices = [l['price'] for l in all_listings]
    print(f"\n💰 PRICES")
    print(f"  Total listings:  {len(all_listings)}")
    print(f"  Average:    GH₵{sum(prices)/len(prices):>10,.0f}")
    print(f"  Median:     GH₵{sorted(prices)[len(prices)//2]:>10,}")
    print(f"  Min:        GH₵{min(prices):>10,}")
    print(f"  Max:        GH₵{max(prices):>10,}")

    locations = [l['location'] for l in all_listings]
    loc_counts = Counter(locations)
    print(f"\n📍 LOCATIONS ({len(loc_counts)} unique)")
    for loc, count in loc_counts.most_common(25):
        percentage = (count / len(locations)) * 100
        bar = '█' * min(int(count / 3), 40)
        print(f"  {loc:25s}: {count:4d} ({percentage:4.1f}%) {bar}")

    bedrooms = [l['bedrooms'] for l in all_listings if l.get('bedrooms')]
    if bedrooms:
        bed_counts = Counter(bedrooms)
        print(f"\n🛏️  BEDROOMS")
        for beds in sorted(bed_counts.keys()):
            count = bed_counts[beds]
            percentage = (count / len(bedrooms)) * 100
            bar = '█' * min(int(count / 5), 40)
            print(f"  {beds} BR: {count:4d} ({percentage:4.1f}%) {bar}")

    print(f"\n{'='*70}")
    print("✅ SUCCESS!")
    print(f"{'='*70}")
    print(f"\nData saved directly to: {output_path}")
    print("Your app will automatically use the updated data!")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description='Scrape Meqasa rental listings')
    parser.add_argument('--output', '-o', type=str, help='Custom output path for JSON file')
    args = parser.parse_args()

    if args.output:
        scrape_meqasa_working(output_path=args.output)
    else:
        scrape_meqasa_working()
