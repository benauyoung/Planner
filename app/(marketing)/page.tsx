import { SocialProofStrip } from '@/components/landing/social-proof-strip'
import { FeaturesTabs } from '@/components/landing/features-tabs'
import { PlanningPlayground } from '@/components/landing/planning-playground'
import { BaguetteFooter } from '@/components/landing/baguette-footer'

export default function LandingPage() {
  return (
    <div className="french-editorial">
      <PlanningPlayground />
      <SocialProofStrip />
      {/* Transition: parchment to dark */}
      <div
        className="h-20 sm:h-28"
        style={{
          background: 'linear-gradient(180deg, #3D5C45 0%, #1A2E1F 100%)',
        }}
      />
      <FeaturesTabs />
      {/* Transition: dark to parchment */}
      <div
        className="h-20 sm:h-28"
        style={{
          background: 'linear-gradient(180deg, #1A2E1F 0%, #EBE7DC 100%)',
        }}
      />
      <BaguetteFooter />
    </div>
  )
}
