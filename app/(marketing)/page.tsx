import { HeroPrompt } from '@/components/landing/hero-prompt'
import { FeaturesTabs } from '@/components/landing/features-tabs'
import { TrustBar } from '@/components/landing/trust-bar'
import { FaqAccordion } from '@/components/landing/faq-accordion'

export default function LandingPage() {
  return (
    <>
      <FeaturesTabs />
      <HeroPrompt />
      <FaqAccordion />
      <TrustBar />
    </>
  )
}
