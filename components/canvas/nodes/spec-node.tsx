'use client'

import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { ScrollText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NODE_CONFIG, STATUS_COLORS } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import type { NodeProps } from '@xyflow/react'
import type { PlanNodeData } from '@/types/canvas'
import { useUIStore } from '@/stores/ui-store'
import { useProjectStore } from '@/stores/project-store'
import { NodeToolbar } from './node-toolbar'

export const SpecNode = memo(function SpecNode({ id, data }: NodeProps) {
  const nodeData = data as unknown as PlanNodeData
  const config = NODE_CONFIG.spec
  const selectedNodeId = useUIStore((s) => s.selectedNodeId)
  const selectNode = useUIStore((s) => s.selectNode)
  const isSelected = selectedNodeId === id
  const hasChildren = useProjectStore((s) =>
    s.currentProject?.nodes.some((n) => n.parentId === id) ?? false
  )

  const version = nodeData.version
  const description = nodeData.description

  return (
    <div
      className={cn(
        'group relative rounded-lg border-2 shadow-sm transition-all cursor-pointer',
        config.bgClass,
        isSelected ? 'ring-2 ring-primary shadow-glow' : 'hover:shadow-md',
      )}
      style={{
        width: config.width,
        minHeight: config.height,
        borderColor: config.color,
      }}
      onClick={() => selectNode(id)}
      onContextMenu={(e) => e.preventDefault()}
    >
      <NodeToolbar
        nodeId={id}
        nodeType="spec"
        status={nodeData.status}
        collapsed={nodeData.collapsed}
        hasChildren={hasChildren}
      />

      {nodeData.parentId && (
        <Handle
          type="target"
          position={Position.Left}
          className="!bg-muted-foreground !w-2 !h-2"
        />
      )}

      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Badge className={cn('text-[10px] px-1.5 py-0', config.badgeClass)}>
            <ScrollText className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
          {version && (
            <span className="text-[10px] text-muted-foreground font-mono">
              v{version}
            </span>
          )}
          <div className={cn('w-2 h-2 rounded-full ml-auto', STATUS_COLORS[nodeData.status])} />
        </div>

        <h4 className="text-sm font-medium leading-tight mb-2 line-clamp-1">
          {nodeData.label}
        </h4>

        {description ? (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
            {description}
          </p>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 border border-dashed rounded-md text-muted-foreground">
            <ScrollText className="h-6 w-6 mb-1.5 opacity-50" />
            <span className="text-xs">Click to add specification</span>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-muted-foreground !w-2 !h-2"
      />
    </div>
  )
})
