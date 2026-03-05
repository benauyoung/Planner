'use client'

import { LandingNavBar } from '@/components/landing/nav-bar'
import { Footer } from '@/components/landing/footer'
import { LandingLangProvider } from '@/lib/landing-lang-context'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LandingLangProvider>
      <LandingNavBar />
      <main>{children}</main>
      <Footer />
    </LandingLangProvider>
  )
}
