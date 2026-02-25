import Link from 'next/link'
import { ProjectList } from '@/components/dashboard/project-list'
import { WebFetchDemo } from '@/components/dashboard/web-fetch-demo'

interface DashboardPageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { tab } = await searchParams
  const activeTab = tab === 'demo' ? 'demo' : 'projects'

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Tab bar */}
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
    </div>
  )
}
