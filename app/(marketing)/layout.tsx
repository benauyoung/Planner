import { LandingNavBar } from '@/components/landing/nav-bar'
import { Footer } from '@/components/landing/footer'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <LandingNavBar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
