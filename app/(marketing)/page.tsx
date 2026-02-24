import { HeroConversion } from '@/components/landing/hero-conversion'
import { SocialProofStrip } from '@/components/landing/social-proof-strip'
import { FeaturesTabs } from '@/components/landing/features-tabs'

export default function LandingPage() {
  return (
    <>
      <HeroConversion />
      <SocialProofStrip />
      <FeaturesTabs />
    </>
  )
}
