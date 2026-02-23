'use client'

import { useMemo, useState } from 'react'
import {
  Target,
  Flag,
  Puzzle,
  CheckSquare,
  ImagePlus,
  FileText,
  Circle,
  ScrollText,
  ClipboardList,
  Braces,
  Terminal,
  ExternalLink,
  Check,
  ChevronRight,
  Plus,
} from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { useUIStore } from '@/stores/ui-store'
import { NODE_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { PlanNode, NodeType, NodeStatus } from '@/types/project'

// ─── Icons ──────────────────────────────────────────────────

const TYPE_ICONS: Record<NodeType, React.ReactNode> = {
  goal: <Target className="h-4 w-4" />,
  subgoal: <Flag className="h-4 w-4" />,
  feature: <Puzzle className="h-4 w-4" />,
  task: <CheckSquare className="h-4 w-4" />,
  moodboard: <ImagePlus className="h-4 w-4" />,
  notes: <FileText className="h-4 w-4" />,
  connector: <Circle className="h-4 w-4" />,
  spec: <ScrollText className="h-4 w-4" />,
  prd: <ClipboardList className="h-4 w-4" />,
  schema: <Braces className="h-4 w-4" />,
  prompt: <Terminal className="h-4 w-4" />,
  reference: <ExternalLink className="h-4 w-4" />,
}

// ─── Status Helpers ─────────────────────────────────────────

const STATUS_CONFIG: Record<NodeStatus, { label: string; dotClass: string; badgeClass: string }> = {
  not_started: {
    label: 'Not Started',
    dotClass: 'bg-gray-300 dark:bg-gray-600',
    badgeClass: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
  in_progress: {
    label: 'In Progress',
    dotClass: 'bg-blue-500',
    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  },
  completed: {
    label: 'Completed',
    dotClass: 'bg-green-500',
    badgeClass: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  },
  blocked: {
    label: 'Blocked',
    dotClass: 'bg-red-500',
    badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  },
}

function StatusIcon({ status }: { status: NodeStatus }) {
  if (status === 'completed') {
    return (
      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0">
        <Check className="h-3.5 w-3.5 text-white" />
      </div>
    )
  }
  if (status === 'in_progress') {
    return (
      <div className="w-6 h-6 rounded-full border-2 border-blue-500 flex items-center justify-center shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
      </div>
    )
  }
  if (status === 'blocked') {
    return (
      <div className="w-6 h-6 rounded-full border-2 border-red-500 flex items-center justify-center shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
      </div>
    )
  }
  return (
    <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 shrink-0" />
  )
}

// ─── Steps View ─────────────────────────────────────────────

const EMPTY_NODES: PlanNode[] = []

export function StepsView() {
  const nodes = useProjectStore((s) => s.currentProject?.nodes ?? EMPTY_NODES)
  const selectedNodeId = useUIStore((s) => s.selectedNodeId)
  const selectNode = useUIStore((s) => s.selectNode)
  const updateNodeStatus = useProjectStore((s) => s.updateNodeStatus)

  // Left sidebar: top-level nodes (no parent, or parent-level nodes)
  const topLevelNodes = useMemo(
    () => nodes.filter((n) => !n.parentId),
    [nodes]
  )

  // Track which top-level node is focused in the center panel
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null)

  // Auto-select first top-level node if none focused
  const effectiveFocusId = focusedNodeId && nodes.find((n) => n.id === focusedNodeId)
    ? focusedNodeId
    : topLevelNodes[0]?.id || null

  const focusedNode = nodes.find((n) => n.id === effectiveFocusId) || null

  // Children of the focused node (the "steps")
  const steps = useMemo(
    () => (effectiveFocusId ? nodes.filter((n) => n.parentId === effectiveFocusId) : []),
    [nodes, effectiveFocusId]
  )

  // Grandchildren count per step
  const childCountMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const n of nodes) {
      if (n.parentId) {
        map.set(n.parentId, (map.get(n.parentId) || 0) + 1)
      }
    }
    return map
  }, [nodes])

  // Progress for focused node
  const completedSteps = steps.filter((s) => s.status === 'completed').length
  const totalSteps = steps.length

  if (nodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
        No nodes in this project. Open the chat to describe your project idea.
      </div>
    )
  }

  return (
    <div className="h-full flex">
      {/* ─── Left Sidebar ─── */}
      <div className="w-64 border-r bg-muted/30 flex flex-col shrink-0">
        <div className="px-3 py-2.5 border-b">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Project
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {topLevelNodes.map((node) => {
            const isFocused = node.id === effectiveFocusId
            const childCount = childCountMap.get(node.id) || 0
            const config = NODE_CONFIG[node.type]
            const statusCfg = STATUS_CONFIG[node.status]

            return (
              <button
                key={node.id}
                onClick={() => setFocusedNodeId(node.id)}
                className={cn(
                  'flex items-center gap-2.5 w-full px-3 py-2 text-left transition-colors',
                  isFocused
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
              >
                <span className={cn('w-2 h-2 rounded-full shrink-0', statusCfg.dotClass)} />
                <span style={{ color: config?.color }} className="shrink-0">
                  {TYPE_ICONS[node.type]}
                </span>
                <span className="text-sm font-medium truncate flex-1">{node.title}</span>
                {childCount > 0 && (
                  <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 shrink-0">
                    {childCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── Center Panel ─── */}
      <div className="flex-1 overflow-y-auto">
        {focusedNode ? (
          <div className="max-w-2xl mx-auto px-6 py-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider',
                    NODE_CONFIG[focusedNode.type]?.badgeClass
                  )}
                >
                  {TYPE_ICONS[focusedNode.type]}
                  {NODE_CONFIG[focusedNode.type]?.label}
                </span>
                <span className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium',
                  STATUS_CONFIG[focusedNode.status].badgeClass
                )}>
                  {STATUS_CONFIG[focusedNode.status].label}
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight mb-1">{focusedNode.title}</h1>
              {focusedNode.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {focusedNode.description}
                </p>
              )}
              {totalSteps > 0 && (
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {completedSteps}/{totalSteps}
                  </span>
                </div>
              )}
            </div>

            {/* Steps header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Steps
              </h2>
              <span className="text-xs text-muted-foreground">
                {steps.length} item{steps.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Steps list */}
            {steps.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">
                <p className="mb-1">No sub-items yet</p>
                <p className="text-xs">Add children to this node from the canvas view</p>
              </div>
            ) : (
              <div className="relative">
                {/* Vertical connecting line */}
                <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border" />

                <div className="space-y-0">
                  {steps.map((step, idx) => {
                    const isSelected = step.id === selectedNodeId
                    const statusCfg = STATUS_CONFIG[step.status]
                    const config = NODE_CONFIG[step.type]
                    const grandchildCount = childCountMap.get(step.id) || 0

                    return (
                      <button
                        key={step.id}
                        onClick={() => selectNode(step.id)}
                        className={cn(
                          'relative flex items-start gap-3 w-full text-left px-0 py-3 rounded-lg transition-colors group',
                          isSelected
                            ? 'bg-primary/5'
                            : 'hover:bg-muted/50'
                        )}
                      >
                        {/* Status icon (overlays the vertical line) */}
                        <div className="relative z-10 mt-0.5">
                          <StatusIcon status={step.status} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-medium truncate">{step.title}</span>
                            {step.status === 'in_progress' && (
                              <span className={cn(
                                'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0',
                                statusCfg.badgeClass
                              )}>
                                {statusCfg.label}
                              </span>
                            )}
                          </div>
                          {step.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {step.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 text-[10px] font-medium',
                              )}
                              style={{ color: config?.color }}
                            >
                              {TYPE_ICONS[step.type]}
                              {config?.label}
                            </span>
                            {grandchildCount > 0 && (
                              <span className="text-[10px] text-muted-foreground">
                                {grandchildCount} sub-item{grandchildCount !== 1 ? 's' : ''}
                              </span>
                            )}
                            {step.assigneeId && (
                              <span className="text-[10px] text-muted-foreground">
                                Assigned
                              </span>
                            )}
                            {step.priority && step.priority !== 'none' && (
                              <span className={cn(
                                'text-[10px] font-medium capitalize',
                                step.priority === 'critical' && 'text-red-500',
                                step.priority === 'high' && 'text-orange-500',
                                step.priority === 'medium' && 'text-yellow-600 dark:text-yellow-400',
                                step.priority === 'low' && 'text-gray-500',
                              )}>
                                {step.priority}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Chevron */}
                        <ChevronRight className={cn(
                          'h-4 w-4 text-muted-foreground shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity',
                          isSelected && 'opacity-100'
                        )} />
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            Select a node from the sidebar
          </div>
        )}
      </div>
    </div>
  )
}
