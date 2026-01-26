// lib/recommendations.ts
import { Listing, getLocationStats } from './data'

export interface Recommendation {
  type: 'cheaper_alternative' | 'affordable_upgrade' | 'best_deal' | 'budget_stretch'
  location: string
  price: number
  bedrooms: number
  savings?: number
  reason: string
  confidence: 'high' | 'medium' | 'low'
}

export function getRecommendations(
  budget: number,
  preferredLocation: string,
  bedrooms: number,
  listings: Listing[]
): Recommendation[] {
  const recommendations: Recommendation[] = []
  const stats = getLocationStats(listings)
  
  // Find current location stats
  const currentLocationStats = stats.find(s => s.location === preferredLocation)
  const currentPrice = currentLocationStats?.priceByBedroom[bedrooms] || currentLocationStats?.averagePrice || budget
  
  // 1. Cheaper Alternatives (same bedrooms, different location, lower price)
  const cheaperAlternatives = stats
    .filter(s => {
      const price = s.priceByBedroom[bedrooms] || s.averagePrice
      return price > 0 && price < currentPrice * 0.85 && s.location !== preferredLocation
    })
    .map(s => ({
      type: 'cheaper_alternative' as const,
      location: s.location,
      price: s.priceByBedroom[bedrooms] || s.averagePrice,
      bedrooms,
      savings: currentPrice - (s.priceByBedroom[bedrooms] || s.averagePrice),
      reason: `Save GH₵${(currentPrice - (s.priceByBedroom[bedrooms] || s.averagePrice)).toLocaleString()}/month vs ${preferredLocation}`,
      confidence: s.count >= 5 ? 'high' as const : s.count >= 3 ? 'medium' as const : 'low' as const
    }))
    .sort((a, b) => (b.savings || 0) - (a.savings || 0))
    .slice(0, 3)
  
  recommendations.push(...cheaperAlternatives)
  
  // 2. Affordable Upgrades (more bedrooms within budget)
  if (bedrooms < 5) {
    const upgrades = stats
      .filter(s => {
        const price = s.priceByBedroom[bedrooms + 1]
        return price > 0 && price <= budget * 1.1
      })
      .map(s => ({
        type: 'affordable_upgrade' as const,
        location: s.location,
        price: s.priceByBedroom[bedrooms + 1],
        bedrooms: bedrooms + 1,
        reason: `Get ${bedrooms + 1} bedrooms for just GH₵${(s.priceByBedroom[bedrooms + 1]).toLocaleString()}/month`,
        confidence: s.count >= 5 ? 'high' as const : s.count >= 3 ? 'medium' as const : 'low' as const
      }))
      .sort((a, b) => a.price - b.price)
      .slice(0, 2)
    
    recommendations.push(...upgrades)
  }
  
  // 3. Best Deals (below average for the area)
  const bestDeals = stats
    .filter(s => {
      const bedroomPrice = s.priceByBedroom[bedrooms]
      return bedroomPrice > 0 && 
             bedroomPrice < s.averagePrice * 0.9 &&
             bedroomPrice <= budget &&
             s.location !== preferredLocation
    })
    .map(s => ({
      type: 'best_deal' as const,
      location: s.location,
      price: s.priceByBedroom[bedrooms],
      bedrooms,
      reason: `Below average price for ${s.location}`,
      confidence: s.count >= 5 ? 'high' as const : 'medium' as const
    }))
    .sort((a, b) => a.price - b.price)
    .slice(0, 2)
  
  recommendations.push(...bestDeals)
  
  // 4. Budget Stretch Options (if budget allows 10-15% more)
  const stretchOptions = stats
    .filter(s => {
      const price = s.priceByBedroom[bedrooms] || s.averagePrice
      return price > budget && price <= budget * 1.15 && s.location !== preferredLocation
    })
    .map(s => ({
      type: 'budget_stretch' as const,
      location: s.location,
      price: s.priceByBedroom[bedrooms] || s.averagePrice,
      bedrooms,
      reason: `Premium area for GH₵${((s.priceByBedroom[bedrooms] || s.averagePrice) - budget).toLocaleString()} more/month`,
      confidence: s.count >= 5 ? 'high' as const : 'medium' as const
    }))
    .sort((a, b) => a.price - b.price)
    .slice(0, 2)
  
  recommendations.push(...stretchOptions)
  
  return recommendations
}

export function getRecommendationIcon(type: Recommendation['type']): string {
  switch (type) {
    case 'cheaper_alternative': return '💰'
    case 'affordable_upgrade': return '⬆️'
    case 'best_deal': return '🎯'
    case 'budget_stretch': return '✨'
  }
}

export function getRecommendationTitle(type: Recommendation['type']): string {
  switch (type) {
    case 'cheaper_alternative': return 'Save Money'
    case 'affordable_upgrade': return 'More Space'
    case 'best_deal': return 'Best Value'
    case 'budget_stretch': return 'Upgrade Option'
  }
}