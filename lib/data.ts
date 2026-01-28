// lib/data.ts
import rentalData from '@/public/meqasa_data.json'

export interface Listing {
  title: string;
  price: number;
  price_text: string;
  price_period?: string;
  property_type?: string;
  bedrooms: number | null;
  location: string;
  area?: string;  // Search area used during scraping
  url?: string;
  source: string;
  scraped_at: string;
  page?: number;
}

// Greater Accra location aliases for normalization
const LOCATION_ALIASES: Record<string, string> = {
  // Spelling variations
  'cantonment': 'Cantonments',
  'airport residential area': 'Airport Residential',
  'airport res': 'Airport Residential',
  'roman ridge area': 'Roman Ridge',
  'east legon hills': 'East Legon',
  'east legon extension': 'East Legon',
  'spintex road': 'Spintex',
  'tema community 25': 'Community 25',
  'comm 25': 'Community 25',
  'tema comm 25': 'Community 25',
  'north legon': 'Legon',
  'west legon': 'West Legon',
  'madina estates': 'Madina',
  'adenta housing down': 'Adenta',
  'adentan': 'Adenta',
  'kasoa millennium city': 'Kasoa',
  'mccarthy hills': 'McCarthy Hill',
  'macarthy hill': 'McCarthy Hill',
  'dzorwulu area': 'Dzorwulu',
  'dansoman exhibition': 'Dansoman',
  'dansoman last stop': 'Dansoman',
  'asylum down area': 'Asylum Down',
  'north ridge area': 'North Ridge',
  'osu re': 'Osu',
  'osu oxford street': 'Osu',
  'labone junction': 'Labone',
  'la dade': 'La',
  'la palm': 'La',
  'labadi beach': 'Labadi',
  'teshie nungua': 'Teshie',
  'teshie estates': 'Teshie',
  'sakumono estates': 'Sakumono',
  'tema sakumono': 'Sakumono',
  'achimota golf hills': 'Achimota',
  'achimota mile 7': 'Achimota',
  'tantra hills': 'Tantra Hill',
  'dome pillar 2': 'Dome',
  'dome kwabenya': 'Dome',
  'haatso ecomog': 'Haatso',
  'haatso atomic': 'Haatso',
  'pig farm junction': 'Pig Farm',
  'lapaz': 'Lapaz',
  'la paz': 'Lapaz',
  'circle odorkor': 'Circle',
  'kwame nkrumah circle': 'Circle',
  'east airport': 'Airport Residential',
  'airport hills': 'Airport Residential',
  'american house east legon': 'American House',
  'trasacco valley': 'Trasacco',
};

// Normalize location name
export function normalizeLocation(location: string): string {
  const lower = location.toLowerCase().trim();

  // Check aliases first
  if (LOCATION_ALIASES[lower]) {
    return LOCATION_ALIASES[lower];
  }

  // Title case the location if no alias found
  return location
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export interface PriceEstimate {
  low: number;
  average: number;
  high: number;
  count: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface LocationStats {
  location: string;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  count: number;
  priceByBedroom: Record<number, number>;
}

// Load rental data from scraped JSON
export function getListings(): Listing[] {
  return rentalData.listings;
}

export function estimatePrice(
  location: string,
  bedrooms: number,
  listings: Listing[]
): PriceEstimate | null {
  // Filter listings by location and bedrooms (exact match)
  const filtered = listings.filter(
    (l) =>
      l.location.toLowerCase() === location.toLowerCase() &&
      l.bedrooms === bedrooms &&
      l.price > 0
  );

  // If we have exact matches (location + bedrooms), use them
  if (filtered.length > 0) {
    const prices = filtered.map((l) => l.price).sort((a, b) => a - b);
    const sum = prices.reduce((a, b) => a + b, 0);
    const avg = sum / prices.length;
    
    // Use actual min/max for range
    const low = prices[0]; // Minimum price
    const high = prices[prices.length - 1]; // Maximum price

    return {
      low: Math.round(low),
      average: Math.round(avg),
      high: Math.round(high),
      count: filtered.length,
      confidence: filtered.length >= 10 ? 'high' : filtered.length >= 5 ? 'medium' : 'low',
    };
  }

  // Fallback: Try location only (when no exact bedroom match)
  const locationOnly = listings.filter(
    (l) => l.location.toLowerCase() === location.toLowerCase() && l.price > 0
  );

  if (locationOnly.length === 0) return null;

  // Calculate average bedroom count for this location
  const withBedrooms = locationOnly.filter(l => l.bedrooms !== null && l.bedrooms > 0);

  if (withBedrooms.length === 0) {
    // No bedroom data at all - just use location prices
    const prices = locationOnly.map((l) => l.price).sort((a, b) => a - b);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

    return {
      low: Math.round(avg * 0.8),
      average: Math.round(avg),
      high: Math.round(avg * 1.2),
      count: locationOnly.length,
      confidence: 'low',
    };
  }

  // Better approach: Calculate price-per-bedroom and use that to estimate
  // This gives more realistic results than simple ratio scaling

  // Get all listings with bedroom data across ALL locations for the requested bedroom count
  const sameBedAllLocations = listings.filter(
    (l) => l.bedrooms === bedrooms && l.price > 0
  );

  if (sameBedAllLocations.length > 0) {
    // Use market-wide average for this bedroom count as baseline
    const marketAvgForBedroom = sameBedAllLocations.reduce((a, b) => a + b.price, 0) / sameBedAllLocations.length;

    // Calculate location's price premium/discount compared to market
    const locationAvg = withBedrooms.reduce((a, b) => a + b.price, 0) / withBedrooms.length;
    const marketAvgForLocationBeds = listings
      .filter((l) => l.bedrooms !== null && l.bedrooms > 0 && l.price > 0)
      .reduce((sum, l, _, arr) => sum + l.price / arr.length, 0);

    // Location premium factor (how much more/less expensive is this location vs market)
    const locationPremium = marketAvgForLocationBeds > 0 ? locationAvg / marketAvgForLocationBeds : 1;

    // Apply location premium to market average for requested bedrooms
    const estimatedPrice = marketAvgForBedroom * locationPremium;

    // Get price range from same-bedroom listings market-wide
    const sameBedPrices = sameBedAllLocations.map((l) => l.price).sort((a, b) => a - b);
    const percentile10 = sameBedPrices[Math.floor(sameBedPrices.length * 0.1)] || sameBedPrices[0];
    const percentile90 = sameBedPrices[Math.floor(sameBedPrices.length * 0.9)] || sameBedPrices[sameBedPrices.length - 1];

    return {
      low: Math.round(Math.min(percentile10 * locationPremium, estimatedPrice * 0.85)),
      average: Math.round(estimatedPrice),
      high: Math.round(Math.max(percentile90 * locationPremium, estimatedPrice * 1.15)),
      count: sameBedAllLocations.length,
      confidence: 'low', // Always low confidence for estimates
    };
  }

  // Last resort: Use price-per-bedroom calculation
  const totalPrice = withBedrooms.reduce((sum, l) => sum + l.price, 0);
  const totalBeds = withBedrooms.reduce((sum, l) => sum + (l.bedrooms || 0), 0);
  const pricePerBedroom = totalPrice / totalBeds;
  const estimatedPrice = pricePerBedroom * bedrooms;

  return {
    low: Math.round(estimatedPrice * 0.8),
    average: Math.round(estimatedPrice),
    high: Math.round(estimatedPrice * 1.2),
    count: withBedrooms.length,
    confidence: 'low', // Always low confidence for estimates
  };
}

export function getLocationStats(listings: Listing[]): LocationStats[] {
  const locationMap = new Map<string, Listing[]>();

  // Group by location
  listings.forEach((listing) => {
    if (!locationMap.has(listing.location)) {
      locationMap.set(listing.location, []);
    }
    locationMap.get(listing.location)!.push(listing);
  });

  // Calculate stats for each location
  return Array.from(locationMap.entries())
    .map(([location, items]) => {
      const prices = items.map((l) => l.price);
      const priceByBedroom: Record<number, number> = {};

      // Calculate average price by bedroom count
      [1, 2, 3, 4, 5].forEach((bedCount) => {
        const bedroomPrices = items
          .filter((l) => l.bedrooms === bedCount)
          .map((l) => l.price);
        
        if (bedroomPrices.length > 0) {
          priceByBedroom[bedCount] =
            bedroomPrices.reduce((a, b) => a + b, 0) / bedroomPrices.length;
        }
      });

      return {
        location,
        averagePrice: prices.reduce((a, b) => a + b, 0) / prices.length,
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        count: items.length,
        priceByBedroom,
      };
    })
    .sort((a, b) => b.count - a.count);
}

export function getUniqueLocations(listings: Listing[]): string[] {
  return Array.from(new Set(listings.map((l) => l.location))).sort();
}

export function getBedroomDistribution(listings: Listing[]): Record<number, number> {
  const dist: Record<number, number> = {};
  listings.forEach((l) => {
    if (l.bedrooms) {
      dist[l.bedrooms] = (dist[l.bedrooms] || 0) + 1;
    }
  });
  return dist;
}

export function getPriceRanges(listings: Listing[]): {
  range: string;
  count: number;
}[] {
  const ranges = [
    { range: 'Under GH₵5,000', min: 0, max: 5000 },
    { range: 'GH₵5,000 - GH₵10,000', min: 5000, max: 10000 },
    { range: 'GH₵10,000 - GH₵20,000', min: 10000, max: 20000 },
    { range: 'GH₵20,000 - GH₵30,000', min: 20000, max: 30000 },
    { range: 'Over GH₵30,000', min: 30000, max: Infinity },
  ];

  return ranges.map((r) => ({
    range: r.range,
    count: listings.filter((l) => l.price >= r.min && l.price < r.max).length,
  }));
}