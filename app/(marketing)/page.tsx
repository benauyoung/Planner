import { HeroConversion } from '@/components/landing/hero-conversion'
import { SocialProofStrip } from '@/components/landing/social-proof-strip'
import { FeaturesTabs } from '@/components/landing/features-tabs'

export default function LandingPage() {
  return (
    <div className="features-dark-override" style={{ background: '#050812' }}>
      <HeroConversion />
      <SocialProofStrip />
      <FeaturesTabs />
    </div>
  )
}
