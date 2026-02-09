'use client'

import { useProjectStore } from '@/stores/project-store'
import { useUIStore } from '@/stores/ui-store'
import { NODE_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { PlanNode } from '@/types/project'

function getGoalProgress(goal: PlanNode, allNodes: PlanNode[]) {
  const descendants: PlanNode[] = []
  function collect(parentId: string) {
    const children = allNodes.filter((n) => n.parentId === parentId)
    for (const child of children) {
      descendants.push(child)
      collect(child.id)
    }
  }
  collect(goal.id)

  if (descendants.length === 0) return 0
  const completed = descendants.filter((n) => n.status === 'completed').length
  return Math.round((completed / descendants.length) * 100)
}

export function TimelineBar() {
  const currentProject = useProjectStore((s) => s.currentProject)
  const selectNode = useUIStore((s) => s.selectNode)

  if (!currentProject) return null

  const goals = currentProject.nodes.filter((n) => n.type === 'goal')
  if (goals.length === 0) return null

  return (
    <div className="border-b bg-background/80 backdrop-blur-sm px-4 py-2 overflow-x-auto">
      <div className="flex items-center gap-1 min-w-0">
        {goals.map((goal, i) => {
          const progress = getGoalProgress(goal, currentProject.nodes)
          const isLast = i === goals.length - 1
          return (
            <div key={goal.id} className="flex items-center shrink-0">
              <button
                onClick={() => selectNode(goal.id)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent transition-colors group"
              >
                {/* Progress circle */}
                <div className="relative w-7 h-7">
                  <svg className="w-7 h-7 -rotate-90" viewBox="0 0 28 28">
                    <circle
                      cx="14"
                      cy="14"
                      r="11"
                      fill="none"
                      strokeWidth="3"
                      className="stroke-muted"
                    />
                    <circle
                      cx="14"
                      cy="14"
                      r="11"
                      fill="none"
                      strokeWidth="3"
                      strokeDasharray={`${(progress / 100) * 69.1} 69.1`}
                      strokeLinecap="round"
                      style={{ stroke: NODE_CONFIG.goal.color }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold">
                    {progress}%
                  </span>
                </div>
                <span className="text-xs font-medium max-w-[120px] truncate group-hover:text-foreground text-muted-foreground">
                  {goal.title}
                </span>
              </button>
              {!isLast && (
                <div className={cn('w-8 h-px bg-border shrink-0')} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
