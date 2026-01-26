'use client'

import { useEffect, useState } from 'react'
import { Trash2, Calendar, MapPin, Home, RefreshCw } from 'lucide-react'

interface SavedSearch {
  location: string
  bedrooms: number
  estimate: {
    low: number
    average: number
    high: number
    confidence: string
    count: number
  }
  savedAt: string
}

export default function SavedSearches() {
  const [searches, setSearches] = useState<SavedSearch[]>([])

  useEffect(() => {
    loadSearches()
  }, [])

  const loadSearches = () => {
    const saved = localStorage.getItem('savedSearches')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSearches(parsed)
      } catch (e) {
        console.error('Error loading saved searches:', e)
        setSearches([])
      }
    }
  }

  const deleteSearch = (index: number) => {
    const updated = searches.filter((_, i) => i !== index)
    setSearches(updated)
    localStorage.setItem('savedSearches', JSON.stringify(updated))
  }

  const clearAll = () => {
    if (confirm('Delete all saved searches?')) {
      setSearches([])
      localStorage.removeItem('savedSearches')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date)
  }

  const formatPrice = (price: number) => {
    return `GH₵${price.toLocaleString()}`
  }

  if (searches.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-12 shadow-lg shadow-neutral-900/5 border border-neutral-200 text-center">
        <div className="text-6xl mb-4">🔖</div>
        <h3 className="text-2xl font-display font-bold text-neutral-900 mb-2">
          No Saved Searches Yet
        </h3>
        <p className="text-neutral-600 mb-6 max-w-md mx-auto">
          When you estimate prices, click the "Save" button to keep track of your searches.
        </p>
        <div className="text-sm text-neutral-500">
          Saved searches are stored locally on your device
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-white p-6 shadow-lg shadow-neutral-900/5 border border-neutral-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold text-neutral-900 mb-1">
              Saved Searches
            </h2>
            <p className="text-neutral-600">
              {searches.length} {searches.length === 1 ? 'search' : 'searches'} saved
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={loadSearches}
              className="flex items-center gap-2 rounded-xl bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={clearAll}
              className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Saved Searches Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {searches.map((search, index) => (
          <div
            key={index}
            className="rounded-2xl bg-white p-6 shadow-lg shadow-neutral-900/5 border border-neutral-200 hover:shadow-xl transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-neutral-600 text-sm mb-1">
                  <MapPin className="h-4 w-4" />
                  {search.location}
                </div>
                <div className="flex items-center gap-2 text-neutral-600 text-sm">
                  <Home className="h-4 w-4" />
                  {search.bedrooms} {search.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                </div>
              </div>
              
              <button
                onClick={() => deleteSearch(index)}
                className="text-neutral-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Price Estimate */}
            <div className="space-y-3 mb-4">
              <div className="rounded-xl bg-gradient-to-br from-primary-50 to-accent-50 p-4">
                <div className="text-sm font-medium text-neutral-600 mb-1">
                  Average Rent
                </div>
                <div className="text-2xl font-display font-bold text-neutral-900">
                  {formatPrice(search.estimate.average)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-neutral-500 mb-1">Low</div>
                  <div className="text-sm font-semibold text-neutral-700">
                    {formatPrice(search.estimate.low)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500 mb-1">High</div>
                  <div className="text-sm font-semibold text-neutral-700">
                    {formatPrice(search.estimate.high)}
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="pt-4 border-t border-neutral-100">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <Calendar className="h-3 w-3" />
                {formatDate(search.savedAt)}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  search.estimate.confidence === 'high'
                    ? 'bg-green-50 text-green-700'
                    : search.estimate.confidence === 'medium'
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'bg-orange-50 text-orange-700'
                }`}>
                  {search.estimate.confidence === 'high' && '✓ High Confidence'}
                  {search.estimate.confidence === 'medium' && '~ Medium Confidence'}
                  {search.estimate.confidence === 'low' && '⚠ Low Confidence'}
                </span>
                <span className="text-xs text-neutral-500">
                  ({search.estimate.count} listings)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}