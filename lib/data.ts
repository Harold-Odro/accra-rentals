// lib/data.ts
import rentalData from '@/public/meqasa_data.json'

export interface Listing {
  title: string;
  price: number;
  price_text: string;
  bedrooms: number | null;
  location: string;
  url?: string;
  source: string;
  scraped_at: string;
  page?: number;
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

  // Calculate average price per bedroom for this location
  const totalBedrooms = withBedrooms.reduce((sum, l) => sum + (l.bedrooms || 0), 0);
  const avgBedroomsInLocation = totalBedrooms / withBedrooms.length;
  
  // Get average price
  const prices = locationOnly.map((l) => l.price);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  
  // Estimate based on bedroom ratio
  const bedroomRatio = bedrooms / avgBedroomsInLocation;
  const estimatedPrice = avgPrice * bedroomRatio;

  return {
    low: Math.round(estimatedPrice * 0.85),
    average: Math.round(estimatedPrice),
    high: Math.round(estimatedPrice * 1.15),
    count: locationOnly.length,
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