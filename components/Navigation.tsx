'use client'

import { Home, Menu, X } from 'lucide-react'
import { Dispatch, SetStateAction, useState } from 'react'

interface NavigationProps {
  activeTab: 'estimator' | 'analytics' | 'saved' | 'compare'
  setActiveTab: Dispatch<SetStateAction<'estimator' | 'analytics' | 'saved' | 'compare'>>
}

export default function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleTabClick = (tab: 'estimator' | 'analytics' | 'saved' | 'compare') => {
    setActiveTab(tab)
    setMobileMenuOpen(false) // Close menu after selection
  }

  return (
    <nav className="relative z-10 border-b border-white/10 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="h-6 w-6 text-white" />
            <span className="text-xl font-display font-bold text-white">
              Accra Rentals
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setActiveTab('estimator')}
              className={`text-sm font-medium transition-colors ${
                activeTab === 'estimator' ? 'text-white' : 'text-white/80 hover:text-white'
              }`}
            >
              Estimator
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`text-sm font-medium transition-colors ${
                activeTab === 'compare' ? 'text-white' : 'text-white/80 hover:text-white'
              }`}
            >
              Compare
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`text-sm font-medium transition-colors ${
                activeTab === 'analytics' ? 'text-white' : 'text-white/80 hover:text-white'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`text-sm font-medium transition-colors ${
                activeTab === 'saved' ? 'text-white' : 'text-white/80 hover:text-white'
              }`}
            >
              Saved
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleTabClick('estimator')}
                className={`px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === 'estimator' 
                    ? 'bg-white/10 text-white font-medium' 
                    : 'text-white/80 hover:bg-white/5 hover:text-white'
                }`}
              >
                Price Estimator
              </button>
              <button
                onClick={() => handleTabClick('compare')}
                className={`px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === 'compare' 
                    ? 'bg-white/10 text-white font-medium' 
                    : 'text-white/80 hover:bg-white/5 hover:text-white'
                }`}
              >
                Compare
              </button>
              <button
                onClick={() => handleTabClick('analytics')}
                className={`px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === 'analytics' 
                    ? 'bg-white/10 text-white font-medium' 
                    : 'text-white/80 hover:bg-white/5 hover:text-white'
                }`}
              >
                Market Analytics
              </button>
              <button
                onClick={() => handleTabClick('saved')}
                className={`px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === 'saved' 
                    ? 'bg-white/10 text-white font-medium' 
                    : 'text-white/80 hover:bg-white/5 hover:text-white'
                }`}
              >
                Saved Searches
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}