'use client'

import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { cn } from '@/lib/utils'
import { NODE_CONFIG, STATUS_COLORS } from '@/lib/constants'
import type { NodeProps } from '@xyflow/react'
import type { PlanNodeData } from '@/types/canvas'
import { useUIStore } from '@/stores/ui-store'

export const ConnectorNode = memo(function ConnectorNode({ id, data }: NodeProps) {
  const nodeData = data as unknown as PlanNodeData
  const config = NODE_CONFIG.connector
  const selectedNodeId = useUIStore((s) => s.selectedNodeId)
  const selectNode = useUIStore((s) => s.selectNode)
  const isSelected = selectedNodeId === id

  return (
    <div
      className={cn(
        'rounded-full border shadow-sm transition-all cursor-pointer flex items-center gap-2 px-3 py-1.5',
        config.bgClass,
        isSelected ? 'ring-2 ring-primary shadow-glow' : 'hover:shadow-md',
      )}
      style={{
        borderColor: config.color,
      }}
      onClick={() => selectNode(id)}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-muted-foreground !w-2 !h-2"
      />

      <div className={cn('w-2.5 h-2.5 rounded-full', STATUS_COLORS[nodeData.status])} />
      {nodeData.label && (
        <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[80px]">
          {nodeData.label}
        </span>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-muted-foreground !w-2 !h-2"
      />
    </div>
  )
})
