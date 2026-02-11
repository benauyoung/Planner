import { ProjectList } from '@/components/dashboard/project-list'

export default function DashboardPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6">
        <ProjectList />
      </div>
    </div>
  )
}
