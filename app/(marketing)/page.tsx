import { SocialProofStrip } from '@/components/landing/social-proof-strip'
import { FeaturesTabs } from '@/components/landing/features-tabs'
import { PlanningPlayground } from '@/components/landing/planning-playground'

export default function LandingPage() {
  return (
    <div className="french-editorial">
      <PlanningPlayground />
      <SocialProofStrip />
      <FeaturesTabs />
    </div>
  )
}
