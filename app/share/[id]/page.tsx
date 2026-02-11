'use client'

import { use, useEffect, useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import type { Project } from '@/types/project'
import * as persistence from '@/services/persistence'
import { SharedPlanView } from '@/components/share/shared-plan-view'

export default function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadShared() {
      try {
        const p = await persistence.getProject(id)
        if (!p) {
          setError('Plan not found')
        } else if (!p.isPublic) {
          setError('This plan is not publicly shared')
        } else {
          setProject(p)
        }
      } catch {
        setError('Failed to load plan')
      } finally {
        setLoading(false)
      }
    }
    loadShared()
  }, [id])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Oops</h1>
          <p className="text-muted-foreground">{error}</p>
          <a href="/" className="text-primary underline mt-4 inline-block">
            Go to VisionPath
          </a>
        </div>
      </div>
    )
  }

  if (!project) return null

  return (
    <ReactFlowProvider>
      <SharedPlanView project={project} />
    </ReactFlowProvider>
  )
}
