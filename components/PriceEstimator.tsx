'use client'

import { useState, useEffect } from 'react'
import { MapPin, Home, TrendingUp, AlertCircle, Check, Share2, Download, Copy, FileText, Sparkles } from 'lucide-react'
import { getListings, getUniqueLocations, estimatePrice } from '@/lib/data'
import { generateShareableLink, copyToClipboard, exportToPDF, generateTextSummary } from '@/lib/export'
import { getRecommendations, getRecommendationIcon, getRecommendationTitle, type Recommendation } from '@/lib/recommendations'

export default function PriceEstimator() {
  const [locations, setLocations] = useState<string[]>([])
  const [location, setLocation] = useState('')
  const [bedrooms, setBedrooms] = useState<number | ''>('')
  const [estimate, setEstimate] = useState<{
    low: number
    average: number
    high: number
    confidence: string
    count: number
  } | null>(null)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])

  // Load locations from real data
  useEffect(() => {
    const listings = getListings()
    const uniqueLocations = getUniqueLocations(listings)
    setLocations(uniqueLocations)
  }, [])

  const BEDROOMS = [1, 2, 3, 4, 5]

  const handleEstimate = () => {
    if (!location || !bedrooms) return

    const listings = getListings()
    const result = estimatePrice(location, bedrooms as number, listings)
    
    if (result) {
      setEstimate(result)
      setSaved(false)
      setCopied(false)
      setShared(false)
      
      // Generate recommendations
      const recs = getRecommendations(result.average, location, bedrooms as number, listings)
      setRecommendations(recs)
    } else {
      // No data available
      alert(`No data available for ${bedrooms} bedroom properties in ${location}`)
    }
  }

  const formatPrice = (price: number) => {
    return `GH₵${price.toLocaleString()}`
  }

  const handleSave = () => {
    if (!estimate || !location || !bedrooms) return
    
    // Save to localStorage
    const searches = JSON.parse(localStorage.getItem('savedSearches') || '[]')
    searches.push({
      location,
      bedrooms,
      estimate,
      savedAt: new Date().toISOString()
    })
    localStorage.setItem('savedSearches', JSON.stringify(searches))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleCopyText = async () => {
    if (!estimate || !location || !bedrooms) return
    
    const text = generateTextSummary({ location, bedrooms: bedrooms as number, estimate })
    try {
      await copyToClipboard(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      alert('Failed to copy to clipboard')
    }
  }

  const handleShareLink = async () => {
    if (!estimate || !location || !bedrooms) return
    
    const link = generateShareableLink({ location, bedrooms: bedrooms as number, estimate })
    try {
      await copyToClipboard(link)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch (err) {
      alert('Failed to copy link')
    }
  }

  const handleExportPDF = () => {
    if (!estimate || !location || !bedrooms) return
    exportToPDF({ location, bedrooms: bedrooms as number, estimate })
  }

  return (
    <div className="space-y-8">
      {/* Search Card */}
      <div className="rounded-3xl bg-white p-8 shadow-2xl shadow-neutral-900/10 border border-neutral-200">
        <div className="mb-6">
          <h2 className="text-3xl font-display font-bold text-neutral-900 mb-2">
            Estimate Apartment Rent
          </h2>
          <p className="text-neutral-600">
            Get accurate monthly rent estimates for apartments based on real market data
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Location Select */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              <MapPin className="inline h-4 w-4 mr-1" />
              Location
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
            >
              <option value="">Select neighborhood</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Bedrooms Select */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              <Home className="inline h-4 w-4 mr-1" />
              Bedrooms
            </label>
            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(Number(e.target.value))}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
            >
              <option value="">Select bedrooms</option>
              {BEDROOMS.map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Bedroom' : 'Bedrooms'}
                </option>
              ))}
            </select>
          </div>

          {/* Estimate Button */}
          <div className="flex items-end">
            <button
              onClick={handleEstimate}
              disabled={!location || !bedrooms}
              className="w-full rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-3 font-medium text-white shadow-lg shadow-primary-600/30 hover:shadow-xl hover:shadow-primary-600/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <TrendingUp className="inline h-4 w-4 mr-2" />
              Get Estimate
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {estimate && (
        <div className="animate-slide-up space-y-6">
          {/* Price Range Card */}
          <div className="rounded-3xl bg-gradient-to-br from-primary-50 to-accent-50 p-8 border border-primary-100">
            <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
              <div>
                <h3 className="text-2xl font-display font-bold text-neutral-900 mb-2">
                  Estimated Monthly Rent
                </h3>
                <p className="text-neutral-600">
                  {bedrooms} bedroom{bedrooms !== 1 && 's'} in {location}
                </p>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm"
                >
                  {saved ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Save
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopyText}
                  className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </button>

                <button
                  onClick={handleShareLink}
                  className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm"
                >
                  {shared ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      Link Copied
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" />
                      Share
                    </>
                  )}
                </button>

                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm"
                >
                  <FileText className="h-4 w-4" />
                  PDF
                </button>
              </div>
            </div>

            {/* Price Display */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="text-sm font-medium text-neutral-600 mb-2">Low</div>
                <div className="text-3xl font-display font-bold text-neutral-900">
                  {formatPrice(estimate.low)}
                  <span className="text-sm font-normal text-neutral-500">/month</span>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-500 p-6 shadow-lg shadow-primary-600/20">
                <div className="text-sm font-medium text-white/80 mb-2">Average</div>
                <div className="text-3xl font-display font-bold text-white">
                  {formatPrice(estimate.average)}
                  <span className="text-sm font-normal text-white/70">/month</span>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="text-sm font-medium text-neutral-600 mb-2">High</div>
                <div className="text-3xl font-display font-bold text-neutral-900">
                  {formatPrice(estimate.high)}
                  <span className="text-sm font-normal text-neutral-500">/month</span>
                </div>
              </div>
            </div>

            {/* Confidence Indicator */}
            <div className="mt-6 flex items-center gap-3 rounded-xl bg-white p-4">
              <AlertCircle className="h-5 w-5 text-primary-600" />
              <div className="flex-1">
                <div className="text-sm font-medium text-neutral-900">
                  {estimate.confidence === 'high' && 'High Confidence'}
                  {estimate.confidence === 'medium' && 'Medium Confidence'}
                  {estimate.confidence === 'low' && 'Low Confidence'}
                </div>
                <div className="text-xs text-neutral-600">
                  Based on {estimate.count} similar properties
                </div>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`h-2 w-8 rounded-full ${
                      (estimate.confidence === 'high' && i <= 5) ||
                      (estimate.confidence === 'medium' && i <= 3) ||
                      (estimate.confidence === 'low' && i <= 1)
                        ? 'bg-primary-600'
                        : 'bg-neutral-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Market Insights */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 border border-neutral-200">
              <div className="text-sm font-medium text-neutral-600 mb-2">
                Price per Bedroom
              </div>
              <div className="text-2xl font-display font-bold text-neutral-900">
                {formatPrice(Math.round(estimate.average / (bedrooms as number)))}
                <span className="text-sm font-normal text-neutral-500">/month</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 border border-neutral-200">
              <div className="text-sm font-medium text-neutral-600 mb-2">
                Market Position
              </div>
              <div className="text-2xl font-display font-bold text-neutral-900">
                {['East Legon', 'Cantonments'].includes(location) ? 'Premium' : 'Standard'}
              </div>
            </div>
          </div>

          {/* Smart Recommendations */}
          {recommendations.length > 0 && (
            <div className="rounded-3xl bg-white p-8 shadow-lg shadow-neutral-900/5 border border-neutral-200">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-6 w-6 text-accent-500" />
                <h3 className="text-2xl font-display font-bold text-neutral-900">
                  Smart Recommendations
                </h3>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border-2 border-neutral-200 p-6 hover:border-primary-500 hover:bg-primary-50/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getRecommendationIcon(rec.type)}</span>
                        <div>
                          <div className="text-sm font-semibold text-neutral-900">
                            {getRecommendationTitle(rec.type)}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {rec.confidence === 'high' ? 'High confidence' : rec.confidence === 'medium' ? 'Medium confidence' : 'Low confidence'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-lg font-display font-bold text-neutral-900">
                        {rec.location}
                      </div>
                      <div className="text-sm text-neutral-600">
                        {rec.bedrooms} bedroom{rec.bedrooms > 1 ? 's' : ''}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-2xl font-bold text-primary-600">
                        {formatPrice(rec.price)}
                        <span className="text-sm text-neutral-500 font-normal">/month</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-neutral-600">
                      {rec.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}