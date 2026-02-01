'use client'

import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
    // In production, you could send this to an error reporting service
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="rounded-3xl bg-white p-12 shadow-lg shadow-neutral-900/5 border border-neutral-200 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>

          <h3 className="text-2xl font-display font-bold text-neutral-900 mb-2">
            Something went wrong
          </h3>
          <p className="text-neutral-600 mb-6 max-w-md mx-auto">
            We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
          </p>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mb-6 p-4 bg-red-50 rounded-xl text-left">
              <p className="text-sm font-mono text-red-800 break-all">
                {this.state.error.message}
              </p>
            </div>
          )}

          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
