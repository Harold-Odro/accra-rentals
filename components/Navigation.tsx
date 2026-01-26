'use client'

import { Home, Menu } from 'lucide-react'
import { Dispatch, SetStateAction } from 'react'

interface NavigationProps {
  activeTab: 'estimator' | 'analytics' | 'saved' | 'compare'
  setActiveTab: Dispatch<SetStateAction<'estimator' | 'analytics' | 'saved' | 'compare'>>
}

export default function Navigation({ activeTab, setActiveTab }: NavigationProps) {
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

          <button className="md:hidden text-white">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </nav>
  )
}