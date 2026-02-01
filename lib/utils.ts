// lib/utils.ts - Shared utilities

// ============================================
// Constants
// ============================================

// Confidence thresholds for price estimates
export const CONFIDENCE_HIGH_THRESHOLD = 10
export const CONFIDENCE_MEDIUM_THRESHOLD = 5

// Price estimation fallback multipliers
export const PRICE_LOW_MULTIPLIER = 0.8
export const PRICE_HIGH_MULTIPLIER = 1.2

// Recommendation thresholds
export const CHEAPER_ALTERNATIVE_THRESHOLD = 0.85  // 15% cheaper
export const BEST_DEAL_THRESHOLD = 0.85            // 15% below market
export const BUDGET_STRETCH_THRESHOLD = 1.15       // 15% above budget
export const AFFORDABLE_UPGRADE_THRESHOLD = 1.1    // 10% above budget

// Premium locations in Greater Accra
export const PREMIUM_LOCATIONS = [
  'East Legon',
  'Cantonments',
  'Airport Residential',
  'Labone',
  'Roman Ridge',
  'Ridge',
  'Osu',
  'Dzorwulu',
  'Trasacco',
  'American House'
]

// ============================================
// Formatting utilities
// ============================================

/**
 * Format a price in Ghanaian Cedis
 */
export function formatPrice(price: number): string {
  return `GH₵${price.toLocaleString()}`
}

/**
 * Format a date string to a human-readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date)
}

// ============================================
// Location utilities
// ============================================

/**
 * Check if a location is considered premium
 */
export function isPremiumLocation(location: string): boolean {
  return PREMIUM_LOCATIONS.some(
    premium => location.toLowerCase().includes(premium.toLowerCase())
  )
}

/**
 * Get market position label for a location
 */
export function getMarketPosition(location: string): 'Premium' | 'Standard' {
  return isPremiumLocation(location) ? 'Premium' : 'Standard'
}

// ============================================
// ID generation
// ============================================

/**
 * Generate a unique ID for saved items
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
