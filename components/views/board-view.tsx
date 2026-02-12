'use client'

import { useMemo } from 'react'
import { useProjectStore } from '@/stores/project-store'
import { useUIStore } from '@/stores/ui-store'
import { NODE_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { AssigneeAvatar } from '@/components/ui/assignee-picker'
import type { PlanNode, NodeStatus } from '@/types/project'

const COLUMNS: { status: NodeStatus; label: string; color: string; bg: string }[] = [
  { status: 'not_started', label: 'Not Started', color: '#9ca3af', bg: 'bg-gray-500/10' },
  { status: 'in_progress', label: 'In Progress', color: '#3b82f6', bg: 'bg-blue-500/10' },
  { status: 'completed', label: 'Completed', color: '#22c55e', bg: 'bg-green-500/10' },
  { status: 'blocked', label: 'Blocked', color: '#ef4444', bg: 'bg-red-500/10' },
]

export function BoardView() {
  const nodes = useProjectStore((s) => s.currentProject?.nodes || [])
  const updateNodeStatus = useProjectStore((s) => s.updateNodeStatus)
  const selectedNodeId = useUIStore((s) => s.selectedNodeId)
  const selectNode = useUIStore((s) => s.selectNode)
  const searchQuery = useUIStore((s) => s.searchQuery)
  const filterType = useUIStore((s) => s.filterType)
  const team = useProjectStore((s) => s.currentProject?.team || [])

  const filtered = useMemo(() => {
    let result = nodes
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (n) => n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q)
      )
    }
    if (filterType) result = result.filter((n) => n.type === filterType)
    return result
  }, [nodes, searchQuery, filterType])

  const columns = useMemo(() => {
    return COLUMNS.map((col) => ({
      ...col,
      nodes: filtered.filter((n) => n.status === col.status),
    }))
  }, [filtered])

  const handleDragStart = (e: React.DragEvent, nodeId: string) => {
    e.dataTransfer.setData('text/plain', nodeId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, status: NodeStatus) => {
    e.preventDefault()
    const nodeId = e.dataTransfer.getData('text/plain')
    if (nodeId) {
      updateNodeStatus(nodeId, status)
    }
  }

  return (
    <div className="h-full flex gap-3 p-3 overflow-x-auto">
      {columns.map((col) => (
        <div
          key={col.status}
          className="flex flex-col w-72 shrink-0"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, col.status)}
        >
          {/* Column header */}
          <div className="flex items-center gap-2 px-3 py-2 mb-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: col.color }}
            />
            <span className="text-xs font-semibold uppercase tracking-wider">
              {col.label}
            </span>
            <span className="text-xs text-muted-foreground ml-auto">
              {col.nodes.length}
            </span>
          </div>

          {/* Column body */}
          <div className={cn('flex-1 rounded-lg p-2 space-y-2 overflow-y-auto', col.bg)}>
            {col.nodes.length === 0 && (
              <div className="text-center py-8 text-xs text-muted-foreground">
                Drop nodes here
              </div>
            )}
            {col.nodes.map((node) => (
              <div
                key={node.id}
                draggable
                onDragStart={(e) => handleDragStart(e, node.id)}
                onClick={() => selectNode(node.id)}
                className={cn(
                  'rounded-lg border bg-background p-3 cursor-pointer transition-all hover:shadow-md hover:border-primary/30',
                  selectedNodeId === node.id && 'ring-2 ring-primary border-primary'
                )}
              >
                {/* Type badge */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${NODE_CONFIG[node.type]?.color}20`,
                      color: NODE_CONFIG[node.type]?.color,
                    }}
                  >
                    {NODE_CONFIG[node.type]?.label}
                  </span>
                </div>

                {/* Title */}
                <p className="text-sm font-medium truncate">{node.title}</p>

                {/* Description preview */}
                {node.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {node.description}
                  </p>
                )}

                {/* Priority + Assignee footer */}
                {(node.priority && node.priority !== 'none' || node.assigneeId) && (
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border/50">
                    {node.priority && node.priority !== 'none' ? (
                      <PriorityBadge priority={node.priority} />
                    ) : <span />}
                    {node.assigneeId && (() => {
                      const member = team.find((m) => m.id === node.assigneeId)
                      return member ? <AssigneeAvatar member={member} size="sm" /> : null
                    })()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
