import { Suspense } from 'react'
import { DashboardTabs } from '@/components/dashboard/dashboard-tabs'

export default function DashboardPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6">
        <Suspense>
          <DashboardTabs />
        </Suspense>
      </div>
    </div>
  )
}
