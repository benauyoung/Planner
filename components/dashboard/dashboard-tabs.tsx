'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ProjectList } from './project-list'
import { WebFetchDemo } from './web-fetch-demo'

export function DashboardTabs() {
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') === 'demo' ? 'demo' : 'projects'

  return (
    <div className="space-y-6">
      <div className="flex gap-1 border-b">
        <Link
          href="/dashboard"
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'projects'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Projects
        </Link>
        <Link
          href="/dashboard?tab=demo"
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'demo'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Web Demo
        </Link>
      </div>

      {activeTab === 'projects' ? <ProjectList /> : <WebFetchDemo />}
    </div>
  )
}
