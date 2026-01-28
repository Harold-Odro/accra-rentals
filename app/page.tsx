'use client'

import { useState } from 'react'
import { Search, TrendingUp, MapPin, Home, RefreshCw } from 'lucide-react'
import PriceEstimator from '@/components/PriceEstimator'
import MarketOverview from '@/components/MarketOverview'
import SavedSearches from '@/components/SavedSearches'
import ComparisonTool from '@/components/ComparisonTool'
import Navigation from '@/components/Navigation'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'estimator' | 'analytics' | 'saved' | 'compare'>('estimator')

  return (
    <div className="min-h-screen">
      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(239,68,68,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(234,179,8,0.1),transparent_50%)]" />
        
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Hero Content */}
        <div className="relative px-4 pt-20 pb-32 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center animate-fade-in">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <div className="h-2 w-2 rounded-full bg-accent-400 animate-pulse" />
                <span className="text-sm font-medium text-white/90">Live Market Data</span>
              </div>
              
              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl mb-6">
                Know What You
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-400">
                  Should Pay
                </span>
              </h1>
              
              <p className="mx-auto max-w-2xl text-xl text-neutral-300 mb-12 text-balance">
                Accurate monthly apartment rent estimates across Greater Accra Region. Make informed decisions with real market data.
              </p>

              {/* Tab Switcher */}
              <div className="inline-flex rounded-2xl bg-white/10 p-1.5 backdrop-blur-sm flex-wrap gap-1">
                <button
                  onClick={() => setActiveTab('estimator')}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 sm:px-6 sm:py-3 text-sm font-medium transition-all ${
                    activeTab === 'estimator'
                      ? 'bg-white text-neutral-900 shadow-lg'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">Price Estimator</span>
                  <span className="sm:hidden">Estimate</span>
                </button>
                <button
                  onClick={() => setActiveTab('compare')}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 sm:px-6 sm:py-3 text-sm font-medium transition-all ${
                    activeTab === 'compare'
                      ? 'bg-white text-neutral-900 shadow-lg'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline">Compare</span>
                  <span className="sm:hidden">Compare</span>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 sm:px-6 sm:py-3 text-sm font-medium transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-white text-neutral-900 shadow-lg'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                  <span className="sm:hidden">Data</span>
                </button>
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 sm:px-6 sm:py-3 text-sm font-medium transition-all ${
                    activeTab === 'saved'
                      ? 'bg-white text-neutral-900 shadow-lg'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <MapPin className="h-4 w-4" />
                  <span className="hidden sm:inline">Saved</span>
                  <span className="sm:hidden">Saved</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-16 text-neutral-50" viewBox="0 0 1440 74" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 74L60 67.8C120 61.7 240 49.3 360 43.2C480 37 600 37 720 43.2C840 49.3 960 61.7 1080 61.7C1200 61.7 1320 49.3 1380 43.2L1440 37V74H1380C1320 74 1200 74 1080 74C960 74 840 74 720 74C600 74 480 74 360 74C240 74 120 74 60 74H0Z" fill="currentColor"/>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative -mt-20 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="mx-auto max-w-7xl">
          {activeTab === 'estimator' && (
            <div className="animate-fade-in" key="estimator">
              <PriceEstimator />
            </div>
          )}
          {activeTab === 'compare' && (
            <div className="animate-fade-in" key="compare">
              <ComparisonTool />
            </div>
          )}
          {activeTab === 'analytics' && (
            <div className="animate-fade-in" key="analytics">
              <MarketOverview />
            </div>
          )}
          {activeTab === 'saved' && (
            <div className="animate-fade-in" key="saved">
              <SavedSearches />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Home className="h-6 w-6 text-primary-600" />
                <span className="text-xl font-display font-bold">Accra Rentals</span>
              </div>
              <p className="text-sm text-neutral-600">
                Real-time rental market intelligence covering 75+ neighborhoods across Greater Accra Region.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li>Price Estimator</li>
                <li>Market Analytics</li>
                <li>Neighborhood Comparison</li>
                <li>Saved Searches</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Data</h3>
              <p className="text-sm text-neutral-600">
                Updated regularly from verified property listings across Accra.
              </p>
            </div>
          </div>
          
          <div className="mt-8 border-t border-neutral-200 pt-8 text-center text-sm text-neutral-500">
            <p>© 2026 Accra Rentals. Market intelligence platform.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}