"""
Meqasa Greater Accra Scraper - Full Region Coverage
Scrapes rental apartments from all major areas in Greater Accra Region
"""

from playwright.sync_api import sync_playwright
import json
import time
from datetime import datetime
import re
from pathlib import Path
from collections import Counter


# Greater Accra Region areas to scrape
GREATER_ACCRA_AREAS = [
    # Main search (catches general Accra listings)
    {"name": "Accra", "url": "properties-for-rent-in-accra-ghana"},

    # Premium/Upscale Areas
    {"name": "East Legon", "url": "properties-for-rent-in-east-legon"},
    {"name": "Airport Residential", "url": "properties-for-rent-in-airport-residential-area"},
    {"name": "Cantonments", "url": "properties-for-rent-in-cantonments"},
    {"name": "Labone", "url": "properties-for-rent-in-labone"},
    {"name": "Osu", "url": "properties-for-rent-in-osu"},
    {"name": "Ridge", "url": "properties-for-rent-in-ridge"},
    {"name": "Roman Ridge", "url": "properties-for-rent-in-roman-ridge"},
    {"name": "Dzorwulu", "url": "properties-for-rent-in-dzorwulu"},
    {"name": "Abelemkpe", "url": "properties-for-rent-in-abelemkpe"},
    {"name": "Tesano", "url": "properties-for-rent-in-tesano"},

    # Spintex/Tema Corridor
    {"name": "Spintex", "url": "properties-for-rent-in-spintex"},
    {"name": "Tema", "url": "properties-for-rent-in-tema"},
    {"name": "Community 25", "url": "properties-for-rent-in-community-25"},
    {"name": "Sakumono", "url": "properties-for-rent-in-sakumono"},
    {"name": "Lashibi", "url": "properties-for-rent-in-lashibi"},
    {"name": "Baatsona", "url": "properties-for-rent-in-baatsona"},
    {"name": "Kpone", "url": "properties-for-rent-in-kpone"},
    {"name": "Ashaiman", "url": "properties-for-rent-in-ashaiman"},

    # North Accra
    {"name": "Madina", "url": "properties-for-rent-in-madina"},
    {"name": "Adenta", "url": "properties-for-rent-in-adenta"},
    {"name": "Haatso", "url": "properties-for-rent-in-haatso"},
    {"name": "Dome", "url": "properties-for-rent-in-dome"},
    {"name": "Kwabenya", "url": "properties-for-rent-in-kwabenya"},
    {"name": "Taifa", "url": "properties-for-rent-in-taifa"},
    {"name": "Achimota", "url": "properties-for-rent-in-achimota"},
    {"name": "Legon", "url": "properties-for-rent-in-legon"},

    # West Accra
    {"name": "Dansoman", "url": "properties-for-rent-in-dansoman"},
    {"name": "Kaneshie", "url": "properties-for-rent-in-kaneshie"},
    {"name": "Odorkor", "url": "properties-for-rent-in-odorkor"},
    {"name": "Darkuman", "url": "properties-for-rent-in-darkuman"},
    {"name": "Awoshie", "url": "properties-for-rent-in-awoshie"},
    {"name": "Ablekuma", "url": "properties-for-rent-in-ablekuma"},
    {"name": "Santa Maria", "url": "properties-for-rent-in-santa-maria"},
    {"name": "Kwashieman", "url": "properties-for-rent-in-kwashieman"},
    {"name": "Sowutuom", "url": "properties-for-rent-in-sowutuom"},

    # Kasoa/Weija Corridor
    {"name": "Kasoa", "url": "properties-for-rent-in-kasoa"},
    {"name": "Weija", "url": "properties-for-rent-in-weija"},
    {"name": "Gbawe", "url": "properties-for-rent-in-gbawe"},
    {"name": "Mallam", "url": "properties-for-rent-in-mallam"},
    {"name": "McCarthy Hill", "url": "properties-for-rent-in-mccarthy-hill"},

    # Pokuase/Amasaman Corridor
    {"name": "Pokuase", "url": "properties-for-rent-in-pokuase"},
    {"name": "Amasaman", "url": "properties-for-rent-in-amasaman"},
    {"name": "Ofankor", "url": "properties-for-rent-in-ofankor"},

    # Coastal Areas
    {"name": "Teshie", "url": "properties-for-rent-in-teshie"},
    {"name": "Nungua", "url": "properties-for-rent-in-nungua"},
    {"name": "La", "url": "properties-for-rent-in-la"},
    {"name": "Labadi", "url": "properties-for-rent-in-labadi"},
    {"name": "Mamprobi", "url": "properties-for-rent-in-mamprobi"},

    # Central Accra
    {"name": "Kokomlemle", "url": "properties-for-rent-in-kokomlemle"},
    {"name": "Adabraka", "url": "properties-for-rent-in-adabraka"},
    {"name": "Asylum Down", "url": "properties-for-rent-in-asylum-down"},
    {"name": "North Ridge", "url": "properties-for-rent-in-north-ridge"},
    {"name": "Tudu", "url": "properties-for-rent-in-tudu"},

    # Outer Areas
    {"name": "Prampram", "url": "properties-for-rent-in-prampram"},
    {"name": "Dodowa", "url": "properties-for-rent-in-dodowa"},
    {"name": "Oyibi", "url": "properties-for-rent-in-oyibi"},
    {"name": "Ayi Mensah", "url": "properties-for-rent-in-ayi-mensah"},
    {"name": "Peduase", "url": "properties-for-rent-in-peduase"},

    # Additional Areas
    {"name": "East Airport", "url": "properties-for-rent-in-east-airport"},
    {"name": "Shiashie", "url": "properties-for-rent-in-shiashie"},
    {"name": "American House", "url": "properties-for-rent-in-american-house"},
    {"name": "Trasacco", "url": "properties-for-rent-in-trasacco"},
    {"name": "Ogbojo", "url": "properties-for-rent-in-ogbojo"},
    {"name": "Adjiriganor", "url": "properties-for-rent-in-adjiriganor"},
    {"name": "Lakeside", "url": "properties-for-rent-in-lakeside"},
    {"name": "Tseaddo", "url": "properties-for-rent-in-tseaddo"},
    {"name": "North Legon", "url": "properties-for-rent-in-north-legon"},
    {"name": "Agbogba", "url": "properties-for-rent-in-agbogba"},
    {"name": "West Legon", "url": "properties-for-rent-in-west-legon"},
    {"name": "Atomic", "url": "properties-for-rent-in-atomic"},
    {"name": "Tantra Hill", "url": "properties-for-rent-in-tantra-hill"},
    {"name": "Lapaz", "url": "properties-for-rent-in-lapaz"},
    {"name": "Abeka", "url": "properties-for-rent-in-abeka"},
    {"name": "Circle", "url": "properties-for-rent-in-circle"},
    {"name": "Pig Farm", "url": "properties-for-rent-in-pig-farm"},
]


def get_output_path():
    """Get the correct output path for the JSON file."""
    script_dir = Path(__file__).parent.absolute()
    public_dir = script_dir.parent / 'public'
    public_dir.mkdir(exist_ok=True)
    return public_dir / 'meqasa_data.json'


def extract_from_html(html_content, page_num, area_name):
    """Extract listings directly from HTML string"""
    listings = []

    # Split by mqs-prop-dt-wrapper divs
    sections = html_content.split('class="mqs-prop-dt-wrapper"')

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
            excluded = ['house', 'villa', 'mansion', 'townhouse', 'bungalow',
                        'office', 'shop', 'warehouse', 'land', 'plot', 'store',
                        'commercial', 'retail', 'industrial', 'factory']
            if any(term in title_lower for term in excluded):
                continue

            # Extract price - handle various formats
            price_match = re.search(
                r'GH₵\s*([\d,]+)', section, re.IGNORECASE)
            if not price_match:
                continue

            try:
                price = int(price_match.group(1).replace(',', ''))
            except:
                continue

            # Check if it's monthly (skip yearly)
            section_lower = section.lower()
            if any(term in section_lower for term in ['/year', 'per year', 'p.a', 'per annum', '/yr', 'yearly']):
                continue

            # Validate price range for monthly (500 - 100,000 GHS)
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

            # Extract location from title or use area name
            location = area_name
            loc_match = re.search(
                r'(?:for rent|apartment|flat|studio)\s+(?:at|in)\s+([A-Z][a-zA-Z\s\-]+?)(?:\s*[-,]|\s+Ghana|\s*$)', title, re.IGNORECASE)
            if loc_match:
                extracted_loc = loc_match.group(1).strip()
                # Clean up location
                extracted_loc = re.sub(r'\s+', ' ', extracted_loc)
                extracted_loc = extracted_loc.replace('Accra-Ghana', '').replace('Ghana', '').strip()
                extracted_loc = extracted_loc.strip(' -,')
                if extracted_loc and len(extracted_loc) > 2:
                    location = extracted_loc

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
                'area': area_name,  # Store the search area for reference
                'url': full_url,
                'source': 'meqasa',
                'scraped_at': datetime.now().isoformat(),
                'page': page_num
            }

            listings.append(listing)

        except Exception as e:
            continue

    return listings


def scrape_meqasa_greater_accra(output_path=None, max_pages_per_area=10):
    """Scrape Meqasa for all Greater Accra areas"""

    print("=" * 70)
    print("MEQASA GREATER ACCRA REGION SCRAPER")
    print("=" * 70)
    print(f"\nScraping {len(GREATER_ACCRA_AREAS)} areas across Greater Accra")
    print(f"Max {max_pages_per_area} pages per area\n")

    all_listings = []
    seen_urls = set()  # Track URLs to avoid duplicates
    area_stats = {}

    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(headless=True)

        context = browser.new_context(
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        page = context.new_page()
        page.set_viewport_size({"width": 1920, "height": 1080})

        for area_idx, area in enumerate(GREATER_ACCRA_AREAS):
            area_name = area["name"]
            area_url_path = area["url"]
            area_listings = 0

            print(f"\n{'='*50}")
            print(f"[{area_idx + 1}/{len(GREATER_ACCRA_AREAS)}] Scraping: {area_name}")
            print(f"{'='*50}")

            for page_num in range(1, max_pages_per_area + 1):
                if page_num == 1:
                    url = f"https://meqasa.com/{area_url_path}"
                else:
                    url = f"https://meqasa.com/{area_url_path}?page={page_num}"

                try:
                    # Load page
                    response = page.goto(
                        url, wait_until='domcontentloaded', timeout=30000)

                    if not response:
                        print(f"  Page {page_num}: No response")
                        break

                    if response.status == 404:
                        print(f"  Page {page_num}: 404 - Area not found, skipping")
                        break

                    if response.status != 200:
                        print(f"  Page {page_num}: Status {response.status}")
                        if page_num == 1:
                            break
                        continue

                    # Wait for content
                    time.sleep(3)

                    # Get the HTML
                    html_content = page.content()

                    # Extract listings from HTML
                    page_listings = extract_from_html(html_content, page_num, area_name)

                    if not page_listings:
                        if page_num == 1:
                            print(f"  No listings in {area_name}")
                        break

                    # Filter out duplicates
                    new_listings = []
                    for listing in page_listings:
                        if listing['url'] not in seen_urls:
                            seen_urls.add(listing['url'])
                            new_listings.append(listing)
                            all_listings.append(listing)
                            area_listings += 1

                    if new_listings:
                        print(f"  Page {page_num}: +{len(new_listings)} new listings")
                        for listing in new_listings[:3]:  # Show first 3
                            beds = listing['bedrooms'] or '?'
                            price = listing['price']
                            loc = listing['location']
                            print(f"    - {loc} | {beds}BR | GH₵{price:,}/mo")
                        if len(new_listings) > 3:
                            print(f"    ... and {len(new_listings) - 3} more")
                    else:
                        print(f"  Page {page_num}: All duplicates")

                    # Small delay between pages
                    time.sleep(2)

                except Exception as e:
                    print(f"  Page {page_num}: Error - {str(e)[:50]}")
                    if page_num == 1:
                        break
                    continue

            area_stats[area_name] = area_listings
            print(f"  Total for {area_name}: {area_listings} unique listings")

            # Small delay between areas
            time.sleep(1)

        browser.close()

    # Summary
    print(f"\n{'='*70}")
    print("SCRAPING COMPLETE")
    print(f"{'='*70}")
    print(f"\nTotal unique listings: {len(all_listings)}")
    print(f"Areas with listings: {sum(1 for v in area_stats.values() if v > 0)}/{len(area_stats)}")

    if len(all_listings) == 0:
        print("\n❌ No listings extracted!")
        return False

    # Determine output path
    if output_path is None:
        output_path = get_output_path()

    # Save
    output_data = {
        'scraped_at': datetime.now().isoformat(),
        'total_listings': len(all_listings),
        'source': 'meqasa',
        'region': 'Greater Accra',
        'property_type': 'apartments',
        'price_period': 'monthly',
        'currency': 'GHS',
        'currency_symbol': 'GH₵',
        'areas_scraped': len(GREATER_ACCRA_AREAS),
        'area_stats': area_stats,
        'listings': all_listings
    }

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Saved to {output_path}")

    # Statistics
    print(f"\n{'='*70}")
    print("STATISTICS")
    print(f"{'='*70}")

    prices = [l['price'] for l in all_listings]
    print(f"\n💰 MONTHLY RENT PRICES")
    print(f"  Total listings:  {len(all_listings)}")
    print(f"  Average:         GH₵{sum(prices)/len(prices):,.0f}/month")
    print(f"  Median:          GH₵{sorted(prices)[len(prices)//2]:,}/month")
    print(f"  Min:             GH₵{min(prices):,}/month")
    print(f"  Max:             GH₵{max(prices):,}/month")

    # Location stats
    locations = Counter(l['location'] for l in all_listings)
    print(f"\n📍 TOP 25 LOCATIONS (out of {len(locations)} unique)")
    for loc, count in locations.most_common(25):
        pct = (count / len(all_listings)) * 100
        bar = '█' * min(int(count / 5), 30)
        print(f"  {loc:25s}: {count:4d} ({pct:4.1f}%) {bar}")

    # Bedroom stats
    bedrooms = [l['bedrooms'] for l in all_listings if l.get('bedrooms')]
    if bedrooms:
        bed_counts = Counter(bedrooms)
        print(f"\n🛏️  BEDROOMS")
        for beds in sorted(bed_counts.keys()):
            count = bed_counts[beds]
            pct = (count / len(bedrooms)) * 100
            bar = '█' * min(int(count / 10), 30)
            print(f"  {beds} BR: {count:4d} ({pct:4.1f}%) {bar}")

    # Areas with most listings
    print(f"\n📊 AREAS BY LISTING COUNT (Top 20)")
    sorted_areas = sorted(area_stats.items(), key=lambda x: x[1], reverse=True)
    for area, count in sorted_areas[:20]:
        if count > 0:
            bar = '█' * min(int(count / 5), 30)
            print(f"  {area:25s}: {count:4d} {bar}")

    print(f"\n{'='*70}")
    print("✅ SUCCESS!")
    print(f"{'='*70}")
    print(f"\nData saved to: {output_path}")
    print("Your app will automatically use the updated data!")

    return True


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description='Scrape Meqasa for Greater Accra rentals')
    parser.add_argument('--output', '-o', type=str, help='Custom output path')
    parser.add_argument('--pages', '-p', type=int, default=10,
                        help='Max pages per area (default: 10)')
    args = parser.parse_args()

    success = scrape_meqasa_greater_accra(
        output_path=args.output,
        max_pages_per_area=args.pages
    )
    exit(0 if success else 1)
