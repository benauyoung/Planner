'use client'

import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NODE_CONFIG, STATUS_COLORS } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import type { NodeType, NodeStatus } from '@/types/project'
import { useUIStore } from '@/stores/ui-store'
import { useProjectStore } from '@/stores/project-store'

interface BasePlanNodeProps {
  id: string
  data: {
    label: string
    description: string
    nodeType: NodeType
    status: NodeStatus
    collapsed: boolean
    parentId: string | null
  }
  icon: React.ReactNode
}

export const BasePlanNode = memo(function BasePlanNode({
  id,
  data,
  icon,
}: BasePlanNodeProps) {
  const config = NODE_CONFIG[data.nodeType]
  const selectedNodeId = useUIStore((s) => s.selectedNodeId)
  const selectNode = useUIStore((s) => s.selectNode)
  const toggleNodeCollapse = useProjectStore((s) => s.toggleNodeCollapse)
  const isSelected = selectedNodeId === id

  const hasChildren = useProjectStore((s) =>
    s.currentProject?.nodes.some((n) => n.parentId === id) ?? false
  )

  return (
    <div
      className={cn(
        'rounded-lg border-2 shadow-sm transition-all cursor-pointer',
        config.bgClass,
        isSelected ? 'ring-2 ring-primary shadow-glow' : 'hover:shadow-md',
      )}
      style={{
        width: config.width,
        minHeight: config.height,
        borderColor: config.color,
      }}
      onClick={() => selectNode(id)}
    >
      {data.parentId && (
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-muted-foreground !w-2 !h-2"
        />
      )}

      <div className="p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <Badge className={cn('text-[10px] px-1.5 py-0', config.badgeClass)}>
            <span className="mr-1">{icon}</span>
            {config.label}
          </Badge>
          <div className={cn('w-2 h-2 rounded-full ml-auto', STATUS_COLORS[data.status])} />
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleNodeCollapse(id)
              }}
              className="p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded"
            >
              {data.collapsed ? (
                <ChevronRight className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
        <h4 className="text-sm font-medium leading-tight mb-1 line-clamp-2">
          {data.label}
        </h4>
        {data.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {data.description}
          </p>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-muted-foreground !w-2 !h-2"
      />
    </div>
  )
})
