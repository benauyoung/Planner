import { SocialProofStrip } from '@/components/landing/social-proof-strip'
import { PlanningPlayground } from '@/components/landing/planning-playground'
import { InteractiveShowcase } from '@/components/landing/interactive-showcase'
import { FeaturesLanding } from '@/components/landing/features-landing'
import { HowItWorksLanding } from '@/components/landing/how-it-works-landing'
import { CtaLanding } from '@/components/landing/cta-landing'

export default function LandingPage() {
  return (
    <div className="french-editorial">
      <PlanningPlayground />
      <SocialProofStrip />
      <InteractiveShowcase />
      <FeaturesLanding />
      <HowItWorksLanding />
      <CtaLanding />
    </div>
  )
}
