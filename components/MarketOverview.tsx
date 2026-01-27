'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { getListings, getLocationStats, getBedroomDistribution } from '@/lib/data'

interface LocationData {
  location: string
  avgPrice: number
  count: number
}

interface BedroomData {
  name: string
  value: number
  color: string
}

const BEDROOM_COLORS = ['#ef4444', '#eab308', '#22c55e', '#3b82f6', '#a855f7']

export default function MarketOverview() {
  const [locationData, setLocationData] = useState<LocationData[]>([])
  const [bedroomData, setBedroomData] = useState<BedroomData[]>([])
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
      const topLocations = locStats.slice(0, 10).map(loc => ({
        location: loc.location,
        avgPrice: Math.round(loc.averagePrice),
        count: loc.count
      }))
      setLocationData(topLocations)

      // Get bedroom distribution
      const bedDist = getBedroomDistribution(listings)
      
      const bedData: BedroomData[] = Object.entries(bedDist).map(([beds, count], index) => ({
        name: `${beds} BR`,
        value: count,
        color: BEDROOM_COLORS[index % BEDROOM_COLORS.length]
      }))
      setBedroomData(bedData)

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
            {stats.totalListings}
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

      {/* Charts Grid */}
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
                tick={{ fontSize: 12 }}
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

        {/* Bedroom Distribution */}
        <div className="rounded-3xl bg-white p-8 shadow-lg shadow-neutral-900/5 border border-neutral-200">
          <h3 className="text-xl font-display font-bold text-neutral-900 mb-6">
            Apartment Distribution by Bedrooms
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={bedroomData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {bedroomData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
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