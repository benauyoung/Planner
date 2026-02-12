import { HeroSectionNew, OneShotPipeline, InteractiveShowcase } from '@/components/landing/interactive-showcase'
import { TrustBar } from '@/components/landing/trust-bar'
import { FeaturesGrid } from '@/components/landing/features-grid'
import { CTABanner } from '@/components/landing/cta-banner'

export default function LandingPage() {
  return (
    <>
      <HeroSectionNew />
      <TrustBar />
      <OneShotPipeline />
      <div id="showcase">
        <InteractiveShowcase />
      </div>
      <FeaturesGrid />
      <CTABanner />
    </>
  )
}
