'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Play, CheckCircle2, Clock, Calendar, ChevronDown, ChevronRight, GripVertical } from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { useUIStore } from '@/stores/ui-store'
import { NODE_CONFIG } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { AssigneeAvatar } from '@/components/ui/assignee-picker'
import { cn } from '@/lib/utils'
import type { Sprint, SprintStatus, PlanNode, NodeStatus } from '@/types/project'

const STATUS_DOTS: Record<NodeStatus, string> = {
  not_started: 'bg-gray-400',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
  blocked: 'bg-red-500',
}

const SPRINT_STATUS_CONFIG: Record<SprintStatus, { label: string; icon: React.ReactNode; color: string }> = {
  planning: { label: 'Planning', icon: <Clock className="h-3 w-3" />, color: 'text-amber-500' },
  active: { label: 'Active', icon: <Play className="h-3 w-3" />, color: 'text-blue-500' },
  completed: { label: 'Completed', icon: <CheckCircle2 className="h-3 w-3" />, color: 'text-green-500' },
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getProgress(nodes: PlanNode[]): number {
  if (nodes.length === 0) return 0
  const completed = nodes.filter((n) => n.status === 'completed').length
  return Math.round((completed / nodes.length) * 100)
}

interface CreateSprintFormProps {
  onSubmit: (name: string, start: number, end: number) => void
  onCancel: () => void
}

function CreateSprintForm({ onSubmit, onCancel }: CreateSprintFormProps) {
  const [name, setName] = useState('')
  const today = new Date().toISOString().split('T')[0]
  const twoWeeks = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  const [start, setStart] = useState(today)
  const [end, setEnd] = useState(twoWeeks)

  const handleSubmit = () => {
    if (!name.trim()) return
    onSubmit(name.trim(), new Date(start).getTime(), new Date(end).getTime())
  }

  return (
    <div className="border rounded-lg p-3 space-y-2 bg-muted/30">
      <input
        type="text"
        placeholder="Sprint name (e.g. Sprint 1)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        className="w-full h-8 px-3 text-sm bg-background rounded border outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
        autoFocus
      />
      <div className="flex gap-2">
        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="flex-1 h-8 px-2 text-xs bg-background rounded border outline-none focus:ring-1 focus:ring-primary text-foreground"
        />
        <span className="text-xs text-muted-foreground self-center">→</span>
        <input
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="flex-1 h-8 px-2 text-xs bg-background rounded border outline-none focus:ring-1 focus:ring-primary text-foreground"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={handleSubmit} disabled={!name.trim()}>Create</Button>
      </div>
    </div>
  )
}

export function SprintBoard() {
  const sprints = useProjectStore((s) => s.currentProject?.sprints || [])
  const nodes = useProjectStore((s) => s.currentProject?.nodes || [])
  const team = useProjectStore((s) => s.currentProject?.team || [])
  const createSprint = useProjectStore((s) => s.createSprint)
  const updateSprint = useProjectStore((s) => s.updateSprint)
  const deleteSprint = useProjectStore((s) => s.deleteSprint)
  const assignNodeToSprint = useProjectStore((s) => s.assignNodeToSprint)
  const selectNode = useUIStore((s) => s.selectNode)
  const selectedNodeId = useUIStore((s) => s.selectedNodeId)

  const [creating, setCreating] = useState(false)
  const [expandedSprints, setExpandedSprints] = useState<Set<string>>(() => new Set(sprints.map((s) => s.id)))

  const backlogNodes = useMemo(
    () => nodes.filter((n) => !n.sprintId && (n.type === 'feature' || n.type === 'task')),
    [nodes]
  )

  const toggleExpand = (id: string) => {
    setExpandedSprints((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleCreate = (name: string, start: number, end: number) => {
    const id = createSprint(name, start, end)
    setCreating(false)
    setExpandedSprints((prev) => new Set([...prev, id]))
  }

  const handleDrop = (e: React.DragEvent, sprintId: string | undefined) => {
    e.preventDefault()
    const nodeId = e.dataTransfer.getData('text/plain')
    if (nodeId) assignNodeToSprint(nodeId, sprintId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragStart = (e: React.DragEvent, nodeId: string) => {
    e.dataTransfer.setData('text/plain', nodeId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const cycleStatus = (sprintId: string, current: SprintStatus) => {
    const order: SprintStatus[] = ['planning', 'active', 'completed']
    const idx = order.indexOf(current)
    updateSprint(sprintId, { status: order[(idx + 1) % order.length] })
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Sprint Planning</h2>
        {!creating && (
          <Button size="sm" variant="outline" className="gap-1" onClick={() => setCreating(true)}>
            <Plus className="h-3.5 w-3.5" />
            New Sprint
          </Button>
        )}
      </div>

      {creating && (
        <CreateSprintForm
          onSubmit={handleCreate}
          onCancel={() => setCreating(false)}
        />
      )}

      {/* Sprints */}
      {sprints.map((sprint) => {
        const sprintNodes = nodes.filter((n) => n.sprintId === sprint.id)
        const progress = getProgress(sprintNodes)
        const isExpanded = expandedSprints.has(sprint.id)
        const statusCfg = SPRINT_STATUS_CONFIG[sprint.status]

        return (
          <div
            key={sprint.id}
            className="border rounded-lg overflow-hidden"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, sprint.id)}
          >
            {/* Sprint header */}
            <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/30">
              <button onClick={() => toggleExpand(sprint.id)} className="shrink-0">
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>

              <span className="text-sm font-semibold flex-1">{sprint.name}</span>

              <button
                onClick={() => cycleStatus(sprint.id, sprint.status)}
                className={cn('flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full', statusCfg.color)}
                title="Click to cycle status"
              >
                {statusCfg.icon}
                {statusCfg.label}
              </button>

              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(sprint.startDate)} – {formatDate(sprint.endDate)}
              </span>

              <span className="text-[10px] text-muted-foreground">
                {sprintNodes.length} items
              </span>

              <button
                onClick={() => deleteSprint(sprint.id)}
                className="text-muted-foreground hover:text-red-500 transition-colors shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-muted">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Sprint nodes */}
            {isExpanded && (
              <div className="divide-y">
                {sprintNodes.length === 0 && (
                  <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                    Drag tasks here from the backlog
                  </div>
                )}
                {sprintNodes.map((node) => {
                  const member = node.assigneeId ? team.find((m) => m.id === node.assigneeId) : null
                  return (
                    <div
                      key={node.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, node.id)}
                      onClick={() => selectNode(node.id)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-muted/30 transition-colors',
                        selectedNodeId === node.id && 'bg-primary/10'
                      )}
                    >
                      <GripVertical className="h-3 w-3 text-muted-foreground shrink-0 cursor-grab" />
                      <span className={cn('w-2 h-2 rounded-full shrink-0', STATUS_DOTS[node.status])} />
                      <span className="truncate flex-1 text-xs font-medium">{node.title}</span>
                      {node.priority && node.priority !== 'none' && (
                        <PriorityBadge priority={node.priority} />
                      )}
                      {node.estimatedHours && (
                        <span className="text-[10px] text-muted-foreground">{node.estimatedHours}h</span>
                      )}
                      {member && <AssigneeAvatar member={member} size="sm" />}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* Backlog */}
      <div
        className="border rounded-lg overflow-hidden border-dashed"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, undefined)}
      >
        <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/10">
          <span className="text-sm font-semibold flex-1">Backlog</span>
          <span className="text-[10px] text-muted-foreground">
            {backlogNodes.length} items
          </span>
        </div>
        <div className="divide-y max-h-60 overflow-y-auto">
          {backlogNodes.length === 0 && (
            <div className="px-4 py-4 text-center text-xs text-muted-foreground">
              All tasks are assigned to sprints
            </div>
          )}
          {backlogNodes.map((node) => {
            const member = node.assigneeId ? team.find((m) => m.id === node.assigneeId) : null
            return (
              <div
                key={node.id}
                draggable
                onDragStart={(e) => handleDragStart(e, node.id)}
                onClick={() => selectNode(node.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-muted/30 transition-colors',
                  selectedNodeId === node.id && 'bg-primary/10'
                )}
              >
                <GripVertical className="h-3 w-3 text-muted-foreground shrink-0 cursor-grab" />
                <span className={cn('w-2 h-2 rounded-full shrink-0', STATUS_DOTS[node.status])} />
                <span
                  className="text-[10px] px-1 py-0.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: `${NODE_CONFIG[node.type]?.color}20`,
                    color: NODE_CONFIG[node.type]?.color,
                  }}
                >
                  {NODE_CONFIG[node.type]?.label}
                </span>
                <span className="truncate flex-1 text-xs font-medium">{node.title}</span>
                {node.priority && node.priority !== 'none' && (
                  <PriorityBadge priority={node.priority} />
                )}
                {member && <AssigneeAvatar member={member} size="sm" />}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
