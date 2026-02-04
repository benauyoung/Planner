'use client'

import { useEffect, useState } from 'react'
import { useProject } from '@/hooks/use-project'
import { useProjectStore } from '@/stores/project-store'
import { ProjectCard } from './project-card'
import { CreateProjectButton } from './create-project-button'
import { EmptyState } from './empty-state'
import { Skeleton } from '@/components/ui/skeleton'

export function ProjectList() {
  const { loadProjects, removeProject } = useProject()
  const projects = useProjectStore((s) => s.projects)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProjects().finally(() => setLoading(false))
  }, [loadProjects])

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (projects.length === 0) {
    return <EmptyState />
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Projects</h1>
        <CreateProjectButton />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onDelete={removeProject}
          />
        ))}
      </div>
    </div>
  )
}
