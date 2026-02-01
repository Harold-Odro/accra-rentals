import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/Toast'
import ErrorBoundary from '@/components/ErrorBoundary'

export const metadata: Metadata = {
  title: 'Accra Rentals | Property Price Intelligence',
  description: 'Discover accurate rental prices across Accra. Compare neighborhoods, estimate costs, and make informed decisions.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
