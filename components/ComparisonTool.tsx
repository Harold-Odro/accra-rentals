'use client'

import { useState, useEffect } from 'react'
import { MapPin, Home, Plus, X, ArrowRight, Scale } from 'lucide-react'
import { getListings, getUniqueLocations, estimatePrice, type Listing } from '@/lib/data'

interface ComparisonItem {
  id: string
  location: string
  bedrooms: number
  estimate: {
    low: number
    average: number
    high: number
    confidence: string
    count: number
  } | null
}

export default function ComparisonTool() {
  const [locations, setLocations] = useState<string[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [comparisons, setComparisons] = useState<ComparisonItem[]>([
    { id: '1', location: '', bedrooms: 2, estimate: null },
    { id: '2', location: '', bedrooms: 2, estimate: null }
  ])

  useEffect(() => {
    const data = getListings()
    setListings(data)
    const uniqueLocations = getUniqueLocations(data)
    setLocations(uniqueLocations)
  }, [])

  const BEDROOMS = [1, 2, 3, 4, 5]

  const updateComparison = (id: string, field: 'location' | 'bedrooms', value: string | number) => {
    setComparisons(prev => prev.map(item => {
      if (item.id !== id) return item

      const updated = { ...item, [field]: value }

      // Recalculate estimate if we have both location and bedrooms
      if (updated.location && updated.bedrooms) {
        const result = estimatePrice(updated.location, updated.bedrooms, listings)
        updated.estimate = result
      } else {
        updated.estimate = null
      }

      return updated
    }))
  }

  const addComparison = () => {
    if (comparisons.length >= 4) return
    setComparisons(prev => [
      ...prev,
      { id: Date.now().toString(), location: '', bedrooms: 2, estimate: null }
    ])
  }

  const removeComparison = (id: string) => {
    if (comparisons.length <= 2) return
    setComparisons(prev => prev.filter(item => item.id !== id))
  }

  const formatPrice = (price: number) => {
    return `GH₵${price.toLocaleString()}`
  }

  const getLowestPrice = () => {
    const validEstimates = comparisons.filter(c => c.estimate).map(c => c.estimate!.average)
    return validEstimates.length > 0 ? Math.min(...validEstimates) : 0
  }

  const getHighestPrice = () => {
    const validEstimates = comparisons.filter(c => c.estimate).map(c => c.estimate!.average)
    return validEstimates.length > 0 ? Math.max(...validEstimates) : 0
  }

  const hasValidComparisons = comparisons.some(c => c.estimate !== null)

  return (
    <div className="space-y-8">
      {/* Header Card */}
      <div className="rounded-3xl bg-white p-8 shadow-2xl shadow-neutral-900/10 border border-neutral-200">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-display font-bold text-neutral-900 mb-2">
              Compare Neighborhoods
            </h2>
            <p className="text-neutral-600">
              Compare monthly apartment rent across different locations in Accra
            </p>
          </div>

          {comparisons.length < 4 && (
            <button
              onClick={addComparison}
              className="flex items-center gap-2 rounded-xl bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Location
            </button>
          )}
        </div>

        {/* Comparison Inputs */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {comparisons.map((item, index) => (
            <div key={item.id} className="relative">
              {comparisons.length > 2 && (
                <button
                  onClick={() => removeComparison(item.id)}
                  className="absolute -top-2 -right-2 z-10 rounded-full bg-neutral-200 p-1 text-neutral-600 hover:bg-neutral-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              <div className="rounded-2xl border-2 border-neutral-200 p-4 hover:border-primary-500 transition-colors">
                <div className="text-sm font-semibold text-neutral-500 mb-3">
                  Location {index + 1}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-600">
                      <MapPin className="inline h-3 w-3 mr-1" />
                      Neighborhood
                    </label>
                    <select
                      value={item.location}
                      onChange={(e) => updateComparison(item.id, 'location', e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                    >
                      <option value="">Select area</option>
                      {locations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-600">
                      <Home className="inline h-3 w-3 mr-1" />
                      Bedrooms
                    </label>
                    <select
                      value={item.bedrooms}
                      onChange={(e) => updateComparison(item.id, 'bedrooms', Number(e.target.value))}
                      className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                    >
                      {BEDROOMS.map((num) => (
                        <option key={num} value={num}>
                          {num} BR
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Results */}
      {hasValidComparisons && (
        <div className="animate-slide-up space-y-6">
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 shadow-lg shadow-neutral-900/5 border border-neutral-200">
              <div className="flex items-center gap-2 text-neutral-600 mb-2">
                <Scale className="h-4 w-4" />
                <span className="text-sm font-medium">Price Spread</span>
              </div>
              <div className="text-2xl font-display font-bold text-neutral-900">
                {formatPrice(getHighestPrice() - getLowestPrice())}
              </div>
              <div className="text-sm text-neutral-500 mt-1">
                difference between highest & lowest
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-6 border border-green-100">
              <div className="text-sm font-medium text-green-700 mb-2">Most Affordable</div>
              <div className="text-2xl font-display font-bold text-green-900">
                {formatPrice(getLowestPrice())}
                <span className="text-sm font-normal text-green-600">/month</span>
              </div>
              <div className="text-sm text-green-600 mt-1">
                {comparisons.find(c => c.estimate?.average === getLowestPrice())?.location || '-'}
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50 p-6 border border-primary-100">
              <div className="text-sm font-medium text-primary-700 mb-2">Premium Area</div>
              <div className="text-2xl font-display font-bold text-primary-900">
                {formatPrice(getHighestPrice())}
                <span className="text-sm font-normal text-primary-600">/month</span>
              </div>
              <div className="text-sm text-primary-600 mt-1">
                {comparisons.find(c => c.estimate?.average === getHighestPrice())?.location || '-'}
              </div>
            </div>
          </div>

          {/* Detailed Comparison Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {comparisons.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl p-6 transition-all ${
                  item.estimate
                    ? item.estimate.average === getLowestPrice()
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 shadow-lg shadow-green-500/10'
                      : 'bg-white border border-neutral-200 shadow-lg shadow-neutral-900/5'
                    : 'bg-neutral-50 border border-neutral-200'
                }`}
              >
                {item.estimate ? (
                  <>
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-neutral-600" />
                        <span className="font-semibold text-neutral-900">{item.location}</span>
                      </div>
                      <div className="text-sm text-neutral-500">
                        {item.bedrooms} {item.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-neutral-500 mb-1">Average Monthly Rent</div>
                        <div className="text-2xl font-display font-bold text-neutral-900">
                          {formatPrice(item.estimate.average)}
                          <span className="text-sm font-normal text-neutral-500">/mo</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <ArrowRight className="h-4 w-4 text-neutral-400" />
                        <span className="text-neutral-600">
                          {formatPrice(item.estimate.low)} - {formatPrice(item.estimate.high)}/mo
                        </span>
                      </div>

                      <div className="pt-3 border-t border-neutral-100">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          item.estimate.confidence === 'high'
                            ? 'bg-green-100 text-green-700'
                            : item.estimate.confidence === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {item.estimate.confidence === 'high' && 'High Confidence'}
                          {item.estimate.confidence === 'medium' && 'Medium Confidence'}
                          {item.estimate.confidence === 'low' && 'Low Confidence'}
                        </span>
                        <div className="text-xs text-neutral-500 mt-2">
                          Based on {item.estimate.count} listings
                        </div>
                      </div>
                    </div>

                    {item.estimate.average === getLowestPrice() && (
                      <div className="mt-4 rounded-lg bg-green-100 p-2 text-center text-sm font-medium text-green-800">
                        Best Value
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📍</div>
                    <div className="text-sm text-neutral-500">
                      Select a location to see estimate
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Visual Price Comparison Bar */}
          <div className="rounded-3xl bg-white p-8 shadow-lg shadow-neutral-900/5 border border-neutral-200">
            <h3 className="text-xl font-display font-bold text-neutral-900 mb-6">
              Price Comparison
            </h3>

            <div className="space-y-4">
              {comparisons
                .filter(item => item.estimate)
                .sort((a, b) => (a.estimate?.average || 0) - (b.estimate?.average || 0))
                .map((item) => {
                  const maxPrice = getHighestPrice()
                  const percentage = maxPrice > 0 ? ((item.estimate?.average || 0) / maxPrice) * 100 : 0

                  return (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-medium text-neutral-700 truncate">
                        {item.location}
                      </div>
                      <div className="flex-1">
                        <div className="h-8 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              item.estimate?.average === getLowestPrice()
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                : 'bg-gradient-to-r from-primary-500 to-primary-400'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-32 text-right font-semibold text-neutral-900">
                        {formatPrice(item.estimate?.average || 0)}<span className="text-xs font-normal text-neutral-500">/mo</span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasValidComparisons && (
        <div className="rounded-3xl bg-white p-12 shadow-lg shadow-neutral-900/5 border border-neutral-200 text-center">
          <div className="text-6xl mb-4">🏘️</div>
          <h3 className="text-2xl font-display font-bold text-neutral-900 mb-2">
            Select Neighborhoods to Compare
          </h3>
          <p className="text-neutral-600 max-w-md mx-auto">
            Choose at least one neighborhood above to see how rental prices compare across different areas in Accra.
          </p>
        </div>
      )}
    </div>
  )
}
