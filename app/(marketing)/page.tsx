import { HeroSection } from '@/components/landing/hero-section'
import { TrustBar } from '@/components/landing/trust-bar'
import { HowItWorks } from '@/components/landing/how-it-works'
import { FeaturesGrid } from '@/components/landing/features-grid'
import { CTABanner } from '@/components/landing/cta-banner'

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <HowItWorks />
      <FeaturesGrid />
      <CTABanner />
    </>
  )
}
