"""
Multi-Source Scraper - Combines Meqasa, Tonaton, and Jiji
Run all scrapers and merge data into one comprehensive dataset
"""

import json
from datetime import datetime
from collections import Counter, defaultdict
import subprocess
import os


class MultiSourceScraper:
    def __init__(self):
        """Initialize multi-source scraper"""
        self.all_listings = []
        self.sources = {
            'meqasa': {'file': 'meqasa_data.json', 'count': 0},
            'tonaton': {'file': 'tonaton_data.json', 'count': 0},
            'jiji': {'file': 'jiji_data.json', 'count': 0}
        }

    def run_all_scrapers(self):
        """Run all scraper scripts"""
        print("="*70)
        print("MULTI-SOURCE SCRAPER")
        print("="*70)
        print("\nRunning all scrapers...\n")

        scrapers = [
            ('meqasa_working_scraper.py', 'Meqasa'),
            ('tonaton_scraper.py', 'Tonaton'),
            ('jiji_scraper.py', 'Jiji')
        ]

        for script, name in scrapers:
            if os.path.exists(script):
                print(f"\n{'='*70}")
                print(f"Running {name} scraper...")
                print(f"{'='*70}\n")
                try:
                    subprocess.run(['python', script], check=True)
                except subprocess.CalledProcessError as e:
                    print(f"⚠️  {name} scraper failed: {e}")
            else:
                print(f"⚠️  {script} not found, skipping {name}")

    def load_data(self):
        """Load data from all sources"""
        print(f"\n{'='*70}")
        print("LOADING DATA FROM ALL SOURCES")
        print(f"{'='*70}\n")

        for source, info in self.sources.items():
            filename = info['file']
            if os.path.exists(filename):
                try:
                    with open(filename, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        listings = data.get('listings', [])

                        # Ensure each listing has source marked
                        for listing in listings:
                            listing['source'] = source

                        self.all_listings.extend(listings)
                        self.sources[source]['count'] = len(listings)
                        print(
                            f"✓ Loaded {len(listings)} listings from {source}")
                except Exception as e:
                    print(f"⚠️  Error loading {filename}: {e}")
            else:
                print(f"⚠️  {filename} not found")

        print(f"\nTotal listings loaded: {len(self.all_listings)}")

    def deduplicate(self):
        """Remove duplicate listings"""
        print(f"\n{'='*70}")
        print("DEDUPLICATING LISTINGS")
        print(f"{'='*70}\n")

        before_count = len(self.all_listings)

        # Create a key based on location, bedrooms, and price (within 5% tolerance)
        seen = {}
        unique_listings = []

        for listing in self.all_listings:
            location = listing.get('location', '').lower().strip()
            bedrooms = listing.get('bedrooms')
            price = listing.get('price', 0)

            # Create a fuzzy key
            key = f"{location}_{bedrooms}"

            # Check if we've seen a similar listing
            is_duplicate = False
            if key in seen:
                for existing_price in seen[key]:
                    # If price is within 5%, consider it a duplicate
                    if abs(price - existing_price) / max(price, existing_price) < 0.05:
                        is_duplicate = True
                        break

            if not is_duplicate:
                unique_listings.append(listing)
                if key not in seen:
                    seen[key] = []
                seen[key].append(price)

        removed = before_count - len(unique_listings)
        self.all_listings = unique_listings

        print(f"Before deduplication: {before_count} listings")
        print(f"After deduplication:  {len(unique_listings)} listings")
        print(
            f"Removed: {removed} duplicates ({(removed/before_count*100):.1f}%)")

    def save_combined_data(self, filename='combined_rentals.json'):
        """Save combined dataset"""
        output = {
            'scraped_at': datetime.now().isoformat(),
            'total_listings': len(self.all_listings),
            'sources': {
                source: info['count']
                for source, info in self.sources.items()
            },
            'listings': self.all_listings
        }

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)

        print(f"\n✓ Saved {len(self.all_listings)} listings to {filename}")

    def analyze_combined_data(self):
        """Analyze the combined dataset"""
        if not self.all_listings:
            print("\n⚠️  No data to analyze")
            return

        print(f"\n{'='*70}")
        print("COMBINED DATA ANALYSIS")
        print(f"{'='*70}")

        # Source distribution
        print(f"\n📊 LISTINGS BY SOURCE")
        source_counts = Counter(l['source'] for l in self.all_listings)
        for source, count in source_counts.most_common():
            percentage = (count / len(self.all_listings)) * 100
            print(f"  {source.capitalize():15s}: {count:4d} ({percentage:5.1f}%)")

        # Price statistics
        prices = [l['price'] for l in self.all_listings if l.get('price')]
        if prices:
            print(f"\n💰 PRICE STATISTICS (GH₵/month)")
            print(f"  Total listings:  {len(prices)}")
            print(f"  Average:    GH₵{sum(prices)/len(prices):>10,.0f}")
            print(f"  Median:     GH₵{sorted(prices)[len(prices)//2]:>10,}")
            print(f"  Min:        GH₵{min(prices):>10,}")
            print(f"  Max:        GH₵{max(prices):>10,}")

        # Price comparison by source
        print(f"\n💵 AVERAGE PRICE BY SOURCE")
        for source in ['meqasa', 'tonaton', 'jiji']:
            source_prices = [l['price'] for l in self.all_listings if l.get(
                'source') == source and l.get('price')]
            if source_prices:
                avg = sum(source_prices) / len(source_prices)
                print(
                    f"  {source.capitalize():15s}: GH₵{avg:>10,.0f} ({len(source_prices)} listings)")

        # Location distribution
        locations = [l['location']
                     for l in self.all_listings if l.get('location')]
        if locations:
            location_counts = Counter(locations)
            print(f"\n📍 TOP 20 LOCATIONS ({len(location_counts)} unique)")
            for loc, count in location_counts.most_common(20):
                percentage = (count / len(locations)) * 100
                # Show source breakdown
                sources_for_loc = Counter(
                    l['source'] for l in self.all_listings
                    if l.get('location') == loc
                )
                source_str = ", ".join(
                    f"{s[0].upper()}:{c}" for s, c in sources_for_loc.most_common(3))
                print(
                    f"  {loc:25s}: {count:4d} ({percentage:4.1f}%) [{source_str}]")

        # Bedroom distribution
        bedrooms = [l['bedrooms']
                    for l in self.all_listings if l.get('bedrooms')]
        if bedrooms:
            bed_counts = Counter(bedrooms)
            print(f"\n🛏️  BEDROOM DISTRIBUTION")
            for beds in sorted(bed_counts.keys()):
                count = bed_counts[beds]
                percentage = (count / len(bedrooms)) * 100
                bar = '█' * min(int(count / 5), 50)
                print(f"  {beds} bedroom: {count:4d} ({percentage:5.1f}%) {bar}")

        # Data quality metrics
        print(f"\n✅ DATA QUALITY")
        total = len(self.all_listings)
        with_price = len([l for l in self.all_listings if l.get('price')])
        with_location = len(
            [l for l in self.all_listings if l.get('location')])
        with_bedrooms = len(
            [l for l in self.all_listings if l.get('bedrooms')])

        print(
            f"  Has price:     {with_price:4d} ({with_price/total*100:5.1f}%)")
        print(
            f"  Has location:  {with_location:4d} ({with_location/total*100:5.1f}%)")
        print(
            f"  Has bedrooms:  {with_bedrooms:4d} ({with_bedrooms/total*100:5.1f}%)")

        complete = len([
            l for l in self.all_listings
            if l.get('price') and l.get('location') and l.get('bedrooms')
        ])
        print(f"  Complete data: {complete:4d} ({complete/total*100:5.1f}%)")


def main():
    """Run the multi-source scraper"""
    scraper = MultiSourceScraper()

    # Option 1: Run all scrapers first
    print("\nDo you want to run all scrapers now? (y/n): ", end='')
    choice = input().lower().strip()

    if choice == 'y':
        scraper.run_all_scrapers()

    # Load existing data
    scraper.load_data()

    if not scraper.all_listings:
        print("\n❌ No data found. Please run individual scrapers first.")
        return

    # Deduplicate
    scraper.deduplicate()

    # Save combined data
    scraper.save_combined_data('combined_rentals.json')

    # Analyze
    scraper.analyze_combined_data()

    print(f"\n{'='*70}")
    print("✅ MULTI-SOURCE SCRAPING COMPLETE!")
    print(f"{'='*70}")
    print(f"\nData saved to: combined_rentals.json")
    print(f"Total unique listings: {len(scraper.all_listings)}")
    print(f"\nYou can now use combined_rentals.json in your Next.js app!")


if __name__ == "__main__":
    main()
