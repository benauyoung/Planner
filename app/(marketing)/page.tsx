import { HeroSection } from '@/components/landing/hero-section'
import { HeroPrompt } from '@/components/landing/hero-prompt'
import { FeaturesTabs } from '@/components/landing/features-tabs'
import { TrustBar } from '@/components/landing/trust-bar'

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesTabs />
      <HeroPrompt />
      <TrustBar />
    </>
  )
}
