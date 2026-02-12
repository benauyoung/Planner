import { HeroSectionNew, InteractiveShowcase } from '@/components/landing/interactive-showcase'
import { TrustBar } from '@/components/landing/trust-bar'
import { HowItWorks } from '@/components/landing/how-it-works'
import { FeaturesGrid } from '@/components/landing/features-grid'
import { CTABanner } from '@/components/landing/cta-banner'

export default function LandingPage() {
  return (
    <>
      <HeroSectionNew />
      <TrustBar />
      <div id="showcase">
        <InteractiveShowcase />
      </div>
      <HowItWorks />
      <FeaturesGrid />
      <CTABanner />
    </>
  )
}
