'use client'

import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Project } from '@/types/project'

interface ProjectCardProps {
  project: Project
  onDelete: (id: string) => void
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const nodeCounts = {
    goal: project.nodes.filter((n) => n.type === 'goal').length,
    subgoal: project.nodes.filter((n) => n.type === 'subgoal').length,
    feature: project.nodes.filter((n) => n.type === 'feature').length,
    task: project.nodes.filter((n) => n.type === 'task').length,
  }

  const completed = project.nodes.filter((n) => n.status === 'completed').length
  const total = project.nodes.length

  return (
    <Link href={`/project/${project.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer group h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base line-clamp-1">{project.title}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-2 h-8 w-8"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onDelete(project.id)
              }}
            >
              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
            </Button>
          </div>
          <CardDescription className="line-clamp-2">
            {project.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {nodeCounts.goal > 0 && (
              <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 text-[10px]">
                {nodeCounts.goal} Goals
              </Badge>
            )}
            {nodeCounts.feature > 0 && (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 text-[10px]">
                {nodeCounts.feature} Features
              </Badge>
            )}
            {nodeCounts.task > 0 && (
              <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300 text-[10px]">
                {nodeCounts.task} Tasks
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {total > 0
                ? `${completed}/${total} complete`
                : project.phase === 'planning'
                  ? 'Planning...'
                  : 'No nodes'}
            </span>
            <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
          </div>
          {total > 0 && (
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${(completed / total) * 100}%` }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
