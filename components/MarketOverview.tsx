'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getListings, getLocationStats } from '@/lib/data'

interface LocationData {
  location: string
  avgPrice: number
  count: number
}

interface AffordableArea {
  location: string
  avgPrice: number
  count: number
}

interface AreaAvailability {
  location: string
  count: number
}

export default function MarketOverview() {
  const [locationData, setLocationData] = useState<LocationData[]>([])
  const [affordableAreas, setAffordableAreas] = useState<AffordableArea[]>([])
  const [areaAvailability, setAreaAvailability] = useState<AreaAvailability[]>([])
  const [stats, setStats] = useState({
    avgRent: 0,
    totalListings: 0,
    neighborhoods: 0,
    avgBedrooms: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const listings = getListings()

      if (listings.length === 0) {
        setLoading(false)
        return
      }

      // Get location stats
      const locStats = getLocationStats(listings)

      // Top 10 locations by listing count (for the first chart)
      const topLocations = locStats.slice(0, 10).map(loc => ({
        location: loc.location,
        avgPrice: Math.round(loc.averagePrice),
        count: loc.count
      }))
      setLocationData(topLocations)

      // Top 10 Most Affordable Areas (minimum 5 listings for reliability)
      const areasWithEnoughData = locStats.filter(loc => loc.count >= 5)
      const sortedByPrice = [...areasWithEnoughData].sort((a, b) => a.averagePrice - b.averagePrice)
      const cheapestAreas = sortedByPrice.slice(0, 10).map(loc => ({
        location: loc.location.length > 15 ? loc.location.slice(0, 15) + '...' : loc.location,
        avgPrice: Math.round(loc.averagePrice),
        count: loc.count
      }))
      setAffordableAreas(cheapestAreas)

      // Top 10 Areas by Listings Availability
      const topByAvailability = locStats.slice(0, 10).map(loc => ({
        location: loc.location.length > 15 ? loc.location.slice(0, 15) + '...' : loc.location,
        count: loc.count
      }))
      setAreaAvailability(topByAvailability)

      // Calculate overall stats
      const prices = listings.map(l => l.price)
      const avgRent = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)

      const bedroomsWithData = listings.filter(l => l.bedrooms !== null)
      const avgBeds = bedroomsWithData.length > 0
        ? bedroomsWithData.reduce((sum, l) => sum + (l.bedrooms || 0), 0) / bedroomsWithData.length
        : 0

      setStats({
        avgRent,
        totalListings: listings.length,
        neighborhoods: locStats.length,
        avgBedrooms: Math.round(avgBeds * 10) / 10
      })

      setLoading(false)
    } catch (error) {
      console.error('Error loading market data:', error)
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-12 shadow-lg shadow-neutral-900/5 border border-neutral-200">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading market data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (stats.totalListings === 0) {
    return (
      <div className="rounded-3xl bg-white p-12 shadow-lg shadow-neutral-900/5 border border-neutral-200 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-2xl font-display font-bold text-neutral-900 mb-2">
          No Data Available
        </h3>
        <p className="text-neutral-600 mb-6">
          Add your scraped data to <code className="bg-neutral-100 px-2 py-1 rounded text-sm">public/meqasa_data.json</code>
        </p>
        <div className="text-sm text-neutral-500 bg-neutral-50 p-4 rounded-xl inline-block">
          Run: <code className="font-mono">python meqasa_working_scraper.py</code>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-2xl bg-white p-6 shadow-lg shadow-neutral-900/5 border border-neutral-200 animate-scale-in">
          <div className="text-sm font-medium text-neutral-600 mb-2">Avg. Rent</div>
          <div className="text-3xl font-display font-bold text-neutral-900 mb-1">
            GH₵{stats.avgRent.toLocaleString()}
          </div>
          <div className="text-sm text-green-600">per month</div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-lg shadow-neutral-900/5 border border-neutral-200 animate-scale-in" style={{ animationDelay: '100ms' }}>
          <div className="text-sm font-medium text-neutral-600 mb-2">Total Listings</div>
          <div className="text-3xl font-display font-bold text-neutral-900 mb-1">
            {stats.totalListings.toLocaleString()}
          </div>
          <div className="text-sm text-neutral-500">apartments</div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-lg shadow-neutral-900/5 border border-neutral-200 animate-scale-in" style={{ animationDelay: '200ms' }}>
          <div className="text-sm font-medium text-neutral-600 mb-2">Neighborhoods</div>
          <div className="text-3xl font-display font-bold text-neutral-900 mb-1">
            {stats.neighborhoods}
          </div>
          <div className="text-sm text-neutral-500">areas covered</div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-lg shadow-neutral-900/5 border border-neutral-200 animate-scale-in" style={{ animationDelay: '300ms' }}>
          <div className="text-sm font-medium text-neutral-600 mb-2">Avg. Size</div>
          <div className="text-3xl font-display font-bold text-neutral-900 mb-1">
            {stats.avgBedrooms} BR
          </div>
          <div className="text-sm text-neutral-500">bedrooms</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Average Price by Location */}
        <div className="rounded-3xl bg-white p-8 shadow-lg shadow-neutral-900/5 border border-neutral-200">
          <h3 className="text-xl font-display font-bold text-neutral-900 mb-6">
            Average Monthly Rent by Location
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={locationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis
                dataKey="location"
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  padding: '12px'
                }}
                formatter={(value: number) => [`GH₵${value.toLocaleString()}/month`, 'Avg. Rent']}
              />
              <Bar dataKey="avgPrice" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top 10 Most Affordable Areas */}
        <div className="rounded-3xl bg-white p-8 shadow-lg shadow-neutral-900/5 border border-neutral-200">
          <h3 className="text-xl font-display font-bold text-neutral-900 mb-2">
            Top 10 Most Affordable Areas
          </h3>
          <p className="text-sm text-neutral-500 mb-6">Areas with at least 5 listings</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={affordableAreas} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                dataKey="location"
                type="category"
                tick={{ fontSize: 11 }}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  padding: '12px'
                }}
                formatter={(value: number) => [`GH₵${value.toLocaleString()}/month`, 'Avg. Rent']}
              />
              <Bar dataKey="avgPrice" fill="#22c55e" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Listings Availability by Area */}
        <div className="rounded-3xl bg-white p-8 shadow-lg shadow-neutral-900/5 border border-neutral-200">
          <h3 className="text-xl font-display font-bold text-neutral-900 mb-2">
            Listings Availability by Area
          </h3>
          <p className="text-sm text-neutral-500 mb-6">Areas with most rental options</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={areaAvailability} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                dataKey="location"
                type="category"
                tick={{ fontSize: 11 }}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  padding: '12px'
                }}
                formatter={(value: number) => [`${value} apartments`, 'Available']}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Stats Card */}
        <div className="rounded-3xl bg-gradient-to-br from-primary-50 to-accent-50 p-8 border border-primary-100">
          <h3 className="text-xl font-display font-bold text-neutral-900 mb-6">
            Market Insights
          </h3>
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-neutral-600">Most Affordable Area</div>
                  <div className="text-lg font-bold text-neutral-900">
                    {affordableAreas[0]?.location || 'N/A'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-neutral-600">Avg. Rent</div>
                  <div className="text-lg font-bold text-green-600">
                    GH₵{affordableAreas[0]?.avgPrice.toLocaleString() || 0}/mo
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-neutral-600">Most Listings</div>
                  <div className="text-lg font-bold text-neutral-900">
                    {areaAvailability[0]?.location || 'N/A'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-neutral-600">Available</div>
                  <div className="text-lg font-bold text-blue-600">
                    {areaAvailability[0]?.count.toLocaleString() || 0} units
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-neutral-600">Price Range</div>
                  <div className="text-lg font-bold text-neutral-900">Market Spread</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-neutral-600">Low - High</div>
                  <div className="text-lg font-bold text-primary-600">
                    GH₵{affordableAreas[affordableAreas.length - 1]?.avgPrice.toLocaleString() || 0} - GH₵{locationData[0]?.avgPrice.toLocaleString() || 0}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-neutral-600">Data Coverage</div>
                  <div className="text-lg font-bold text-neutral-900">Greater Accra</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-neutral-600">Areas</div>
                  <div className="text-lg font-bold text-accent-600">
                    {stats.neighborhoods} neighborhoods
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Neighborhood Comparison Table */}
      <div className="rounded-3xl bg-white p-8 shadow-lg shadow-neutral-900/5 border border-neutral-200">
        <h3 className="text-xl font-display font-bold text-neutral-900 mb-6">
          Neighborhood Comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="pb-3 text-left text-sm font-semibold text-neutral-900">Location</th>
                <th className="pb-3 text-right text-sm font-semibold text-neutral-900">Avg. Rent/Month</th>
                <th className="pb-3 text-right text-sm font-semibold text-neutral-900">Apartments</th>
                <th className="pb-3 text-right text-sm font-semibold text-neutral-900">Rank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {locationData.map((loc, i) => (
                <tr key={i} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-4 text-sm font-medium text-neutral-900">{loc.location}</td>
                  <td className="py-4 text-right text-sm text-neutral-600">GH₵{loc.avgPrice.toLocaleString()}/mo</td>
                  <td className="py-4 text-right text-sm text-neutral-600">{loc.count}</td>
                  <td className="py-4 text-right">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      i < 3 ? 'bg-green-50 text-green-700' : 'bg-neutral-50 text-neutral-700'
                    }`}>
                      #{i + 1}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
