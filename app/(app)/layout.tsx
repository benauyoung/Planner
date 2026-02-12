'use client'

import { Suspense } from 'react'
import { Header } from '@/components/layout/header'
import { AuthProvider } from '@/contexts/auth-context'
import { ErrorBoundary } from '@/components/error-boundary'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="flex flex-col h-screen">
        <Header />
        <main className="flex-1 overflow-hidden">
          <ErrorBoundary>
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            }>
              {children}
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </AuthProvider>
  )
}
