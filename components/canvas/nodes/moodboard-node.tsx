'use client'

import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { ImagePlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NODE_CONFIG, STATUS_COLORS } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import type { NodeProps } from '@xyflow/react'
import type { PlanNodeData } from '@/types/canvas'
import { useUIStore } from '@/stores/ui-store'
import { useProjectStore } from '@/stores/project-store'
import { NodeToolbar } from './node-toolbar'

export const MoodboardNode = memo(function MoodboardNode({ id, data }: NodeProps) {
  const nodeData = data as unknown as PlanNodeData
  const config = NODE_CONFIG.moodboard
  const selectedNodeId = useUIStore((s) => s.selectedNodeId)
  const selectNode = useUIStore((s) => s.selectNode)
  const isSelected = selectedNodeId === id
  const images = nodeData.images || []
  const hasChildren = useProjectStore((s) =>
    s.currentProject?.nodes.some((n) => n.parentId === id) ?? false
  )

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
        nodeType="moodboard"
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
            <ImagePlus className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
          <div className={cn('w-2 h-2 rounded-full ml-auto', STATUS_COLORS[nodeData.status])} />
        </div>

        <h4 className="text-sm font-medium leading-tight mb-2 line-clamp-1">
          {nodeData.label}
        </h4>

        {images.length > 0 ? (
          <div className="grid grid-cols-2 gap-1.5">
            {images.slice(0, 4).map((url, i) => (
              <div
                key={i}
                className="aspect-video rounded overflow-hidden bg-muted"
              >
                <img
                  src={url}
                  alt={`Mood ${i + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
            ))}
            {images.length > 4 && (
              <div className="aspect-video rounded bg-muted/50 flex items-center justify-center text-xs text-muted-foreground font-medium">
                +{images.length - 4} more
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 border border-dashed rounded-md text-muted-foreground">
            <ImagePlus className="h-6 w-6 mb-1.5 opacity-50" />
            <span className="text-xs">Add images</span>
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
