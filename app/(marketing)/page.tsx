import { HeroLanding } from '@/components/landing/hero-landing'
import { SocialProofStrip } from '@/components/landing/social-proof-strip'
import { FeaturesLanding } from '@/components/landing/features-landing'
import { HowItWorksLanding } from '@/components/landing/how-it-works-landing'
import { CtaLanding } from '@/components/landing/cta-landing'

export default function LandingPage() {
  return (
    <div className="french-editorial">
      <HeroLanding />
      <SocialProofStrip />
      <FeaturesLanding />
      <HowItWorksLanding />
      <CtaLanding />
    </div>
  )
}
