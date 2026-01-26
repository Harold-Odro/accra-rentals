"""
Jiji.com.gh Scraper - Popular Ghana Classifieds
"""

import requests
from bs4 import BeautifulSoup
import json
import time
from datetime import datetime
import re
from collections import Counter, defaultdict


class JijiScraper:
    def __init__(self):
        """Initialize the scraper"""
        self.listings = []
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        }

    def clean_price(self, price_text):
        """Extract numeric price from text"""
        if not price_text:
            return None

        # Remove currency symbols and text
        clean = re.sub(r'[^\d,.]', '', price_text)
        clean = clean.replace(',', '')

        try:
            price = int(float(clean))
            # Jiji sometimes shows daily prices, convert to monthly
            if price < 1000:  # Likely daily price
                return price * 30
            return price
        except:
            return None

    def extract_bedrooms(self, text):
        """Extract bedroom count from text"""
        if not text:
            return None

        text_lower = text.lower()

        # Check for studio
        if 'studio' in text_lower or 'bedsitter' in text_lower or 'single room' in text_lower:
            return 1

        # Match patterns
        patterns = [
            r'(\d+)\s*bedroom',
            r'(\d+)\s*bed',
            r'(\d+)\s*br\b',
            r'(\d+)\s*b/r',
        ]

        for pattern in patterns:
            match = re.search(pattern, text_lower)
            if match:
                return int(match.group(1))

        return None

    def extract_location(self, location_text):
        """Extract clean location from Jiji location string"""
        if not location_text:
            return "Accra"

        # Jiji format is usually "Neighborhood - City"
        location = location_text.strip()

        # Remove common suffixes
        location = re.sub(r'\s*-\s*Greater\s*Accra\s*', '',
                          location, flags=re.IGNORECASE)
        location = re.sub(r'\s*-\s*Accra\s*', '',
                          location, flags=re.IGNORECASE)
        location = re.sub(r'\s*,\s*Ghana\s*', '',
                          location, flags=re.IGNORECASE)

        # Take first part if there's a dash
        if ' - ' in location:
            location = location.split(' - ')[0].strip()

        return location if location else "Accra"

    def scrape_page(self, url, page_num=1):
        """Scrape a single page"""
        print(f"\n{'='*70}")
        print(f"SCRAPING PAGE {page_num}")
        print(f"{'='*70}")
        print(f"URL: {url}")

        try:
            response = requests.get(url, headers=self.headers, timeout=30)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, 'html.parser')

            # Jiji uses div elements with specific classes for listings
            # Try multiple selectors
            listings = []
            selectors = [
                'div[data-item-id]',
                'div.b-list-advert__item',
                'div.item',
                'article',
                'div[class*="advert"]'
            ]

            for selector in selectors:
                listings = soup.select(selector)
                if listings:
                    print(
                        f"Found {len(listings)} listings using selector: {selector}")
                    break

            if not listings:
                print("⚠️  No listings found with standard selectors")
                # Fallback: look for price elements
                price_elements = soup.find_all(
                    string=re.compile(r'GH₵|₵\s*\d'))
                print(
                    f"Found {len(price_elements)} price elements as fallback")

                for price_elem in price_elements:
                    # Navigate up to find the listing container
                    parent = price_elem.parent
                    for _ in range(5):  # Check up to 5 levels up
                        if not parent:
                            break

                        # Try to find title
                        title_elem = parent.find('a') or parent.find(
                            'h3') or parent.find('h2')
                        if title_elem:
                            title = title_elem.get_text(strip=True)
                            if len(title) > 10:
                                price = self.clean_price(str(price_elem))
                                if price and price >= 500:
                                    # Extract other info
                                    bedrooms = self.extract_bedrooms(title)

                                    # Try to find location
                                    location_elem = parent.find(
                                        class_=re.compile(r'location|address|place'))
                                    location_text = location_elem.get_text(
                                        strip=True) if location_elem else ""
                                    location = self.extract_location(
                                        location_text)

                                    # Get URL
                                    link_elem = parent.find('a', href=True)
                                    url_path = link_elem['href'] if link_elem else ""
                                    full_url = url_path if url_path.startswith(
                                        'http') else f"https://jiji.com.gh{url_path}"

                                    listing = {
                                        'title': title,
                                        'price': price,
                                        'price_text': f"GH₵{price:,}",
                                        'bedrooms': bedrooms,
                                        'location': location,
                                        'url': full_url,
                                        'source': 'jiji',
                                        'scraped_at': datetime.now().isoformat(),
                                        'page': page_num
                                    }

                                    # Check for duplicate
                                    if not any(l.get('url') == full_url for l in self.listings):
                                        self.listings.append(listing)
                                        print(
                                            f"  {len(self.listings)}. {location:20s} - {bedrooms if bedrooms else '?'}BR - GH₵{price:,}")
                                    break

                        parent = parent.parent

                return len(price_elements)

            # Process found listings
            found_this_page = 0
            for item in listings:
                try:
                    # Extract title
                    title_elem = item.find('a') or item.find(
                        'h3') or item.find('h2')
                    title = title_elem.get_text(
                        strip=True) if title_elem else ""

                    if not title or len(title) < 10:
                        continue

                    # Extract price
                    price_elem = item.find(class_=re.compile(r'price')) or item.find(
                        string=re.compile(r'GH₵|₵'))
                    price_text = price_elem.get_text(strip=True) if hasattr(
                        price_elem, 'get_text') else str(price_elem)
                    price = self.clean_price(price_text)

                    if not price or price < 500:
                        continue

                    # Extract location
                    location_elem = item.find(
                        class_=re.compile(r'location|address|place'))
                    location_text = location_elem.get_text(
                        strip=True) if location_elem else ""
                    location = self.extract_location(location_text)

                    # Extract bedrooms
                    bedrooms = self.extract_bedrooms(title)

                    # Get URL
                    link = item.find('a', href=True)
                    url_path = link['href'] if link else ""
                    full_url = url_path if url_path.startswith(
                        'http') else f"https://jiji.com.gh{url_path}"

                    listing = {
                        'title': title,
                        'price': price,
                        'price_text': f"GH₵{price:,}",
                        'bedrooms': bedrooms,
                        'location': location,
                        'url': full_url,
                        'source': 'jiji',
                        'scraped_at': datetime.now().isoformat(),
                        'page': page_num
                    }

                    # Check for duplicate
                    if not any(l.get('url') == full_url for l in self.listings):
                        self.listings.append(listing)
                        found_this_page += 1
                        print(
                            f"  {len(self.listings)}. {location:20s} - {bedrooms if bedrooms else '?'}BR - GH₵{price:,}")

                except Exception as e:
                    print(f"  ⚠️  Error parsing listing: {e}")
                    continue

            print(
                f"\nExtracted {found_this_page} listings from page {page_num}")
            return found_this_page

        except requests.RequestException as e:
            print(f"❌ Error fetching page: {e}")
            return 0

    def scrape_multiple_pages(self, base_url, num_pages=5):
        """Scrape multiple pages"""
        print(f"\n{'='*70}")
        print("JIJI SCRAPER")
        print(f"{'='*70}")
        print(f"Target: {num_pages} pages\n")

        for page_num in range(1, num_pages + 1):
            # Jiji pagination
            if page_num == 1:
                url = base_url
            else:
                # Jiji uses ?page=N format
                separator = '&' if '?' in base_url else '?'
                url = f"{base_url}{separator}page={page_num}"

            found = self.scrape_page(url, page_num)

            if found == 0 and page_num > 1:
                print(f"\nNo listings found on page {page_num}, stopping.")
                break

            # Be respectful - wait between requests
            if page_num < num_pages:
                print(f"\nWaiting 2s before next page...")
                time.sleep(2)

        print(f"\n{'='*70}")
        print(f"COMPLETE! Total: {len(self.listings)} listings")
        print(f"{'='*70}")

    def save_to_json(self, filename='jiji_data.json'):
        """Save data to JSON"""
        output = {
            'scraped_at': datetime.now().isoformat(),
            'total_listings': len(self.listings),
            'source': 'jiji',
            'listings': self.listings
        }

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)

        print(f"\n✓ Saved {len(self.listings)} listings to {filename}")

    def analyze_data(self):
        """Analyze scraped data"""
        if not self.listings:
            print("\n⚠️  No data to analyze")
            return

        print(f"\n{'='*70}")
        print("DATA ANALYSIS")
        print(f"{'='*70}")

        # Overall stats
        print(f"\n📊 OVERALL STATISTICS")
        print(f"  Total listings: {len(self.listings)}")

        # Price statistics
        prices = [l['price'] for l in self.listings if l.get('price')]
        if prices:
            print(f"\n💰 PRICE STATISTICS (GH₵/month)")
            print(f"  Listings with price: {len(prices)}")
            print(f"  Average:   GH₵{sum(prices)/len(prices):>10,.0f}")
            print(f"  Median:    GH₵{sorted(prices)[len(prices)//2]:>10,}")
            print(f"  Minimum:   GH₵{min(prices):>10,}")
            print(f"  Maximum:   GH₵{max(prices):>10,}")

        # Location distribution
        locations = [l['location'] for l in self.listings if l.get('location')]
        if locations:
            location_counts = Counter(locations)
            print(f"\n📍 TOP LOCATIONS ({len(location_counts)} unique)")
            for loc, count in location_counts.most_common(15):
                percentage = (count / len(locations)) * 100
                bar = '█' * min(int(count / 2), 50)
                print(f"  {loc:25s}: {count:3d} ({percentage:4.1f}%) {bar}")

        # Bedroom distribution
        bedrooms = [l['bedrooms'] for l in self.listings if l.get('bedrooms')]
        if bedrooms:
            bed_counts = Counter(bedrooms)
            print(f"\n🛏️  BEDROOM DISTRIBUTION")
            for beds in sorted(bed_counts.keys()):
                count = bed_counts[beds]
                percentage = (count / len(bedrooms)) * 100
                bar = '█' * min(int(count / 3), 50)
                print(f"  {beds} bedroom: {count:3d} ({percentage:4.1f}%) {bar}")


def main():
    """Run the scraper"""
    try:
        scraper = JijiScraper()

        # Scrape apartments for rent in Accra
        base_url = 'https://jiji.com.gh/accra/houses-apartments-for-rent'
        scraper.scrape_multiple_pages(base_url, num_pages=10)

        # Save and analyze
        scraper.save_to_json('jiji_data.json')
        scraper.analyze_data()

        print(f"\n{'='*70}")
        print("✅ SUCCESS!")
        print(f"{'='*70}")
        print(f"Data saved to: jiji_data.json")
        print(f"Total listings: {len(scraper.listings)}")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
