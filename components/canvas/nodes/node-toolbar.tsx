'use client'

import { memo } from 'react'
import { Pencil, ChevronDown, ChevronUp, Plus, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NODE_CHILD_TYPE, NODE_CONFIG, STATUS_COLORS } from '@/lib/constants'
import { useProjectStore } from '@/stores/project-store'
import { useUIStore } from '@/stores/ui-store'
import type { NodeType, NodeStatus } from '@/types/project'

const STATUS_CYCLE: NodeStatus[] = ['not_started', 'in_progress', 'completed', 'blocked']

interface NodeToolbarProps {
  nodeId: string
  nodeType: NodeType
  status: NodeStatus
  collapsed: boolean
  hasChildren: boolean
}

export const NodeToolbar = memo(function NodeToolbar({
  nodeId,
  nodeType,
  status,
  collapsed,
  hasChildren,
}: NodeToolbarProps) {
  const childType = NODE_CHILD_TYPE[nodeType]

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    useUIStore.getState().selectNode(nodeId)
  }

  const handleStatusCycle = (e: React.MouseEvent) => {
    e.stopPropagation()
    const currentIdx = STATUS_CYCLE.indexOf(status)
    const nextStatus = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length]
    useProjectStore.getState().updateNodeStatus(nodeId, nextStatus)
  }

  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation()
    useProjectStore.getState().toggleNodeCollapse(nodeId)
  }

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!childType) return
    const newId = useProjectStore.getState().addChildNode(nodeId, `New ${NODE_CONFIG[childType].label}`)
    if (newId) {
      useUIStore.getState().selectNode(newId)
    }
  }

  return (
    <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-0.5 px-1 py-0.5 rounded-md bg-background/90 border shadow-sm backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10">
      <button
        onClick={handleEdit}
        className="p-1 rounded hover:bg-accent transition-colors"
        title="Edit"
      >
        <Pencil className="h-3 w-3 text-muted-foreground" />
      </button>

      <button
        onClick={handleStatusCycle}
        className="p-1 rounded hover:bg-accent transition-colors"
        title={`Status: ${status}`}
      >
        <Circle className={cn('h-3 w-3 fill-current', STATUS_COLORS[status].replace('bg-', 'text-'))} />
      </button>

      {hasChildren && (
        <button
          onClick={handleToggleCollapse}
          className="p-1 rounded hover:bg-accent transition-colors"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? (
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-3 w-3 text-muted-foreground" />
          )}
        </button>
      )}

      {childType && (
        <button
          onClick={handleAddChild}
          className="p-1 rounded hover:bg-accent transition-colors"
          title={`Add ${NODE_CONFIG[childType].label}`}
        >
          <Plus className="h-3 w-3 text-muted-foreground" />
        </button>
      )}
    </div>
  )
})
