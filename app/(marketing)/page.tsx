import { HeroPrompt } from '@/components/landing/hero-prompt'
import { FeaturesTabs } from '@/components/landing/features-tabs'
import { TrustBar } from '@/components/landing/trust-bar'
import { CTABanner } from '@/components/landing/cta-banner'

export default function LandingPage() {
  return (
    <>
      <HeroPrompt />
      <TrustBar />
      <FeaturesTabs />
      <CTABanner />
    </>
  )
}
