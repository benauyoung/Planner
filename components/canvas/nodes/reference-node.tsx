'use client'

import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { ExternalLink, Link2, FileUp, Image } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NODE_CONFIG, STATUS_COLORS } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import type { NodeProps } from '@xyflow/react'
import type { PlanNodeData } from '@/types/canvas'
import { useUIStore } from '@/stores/ui-store'
import { useProjectStore } from '@/stores/project-store'
import { NodeToolbar } from './node-toolbar'

const REF_TYPE_ICONS: Record<string, React.ReactNode> = {
  link: <Link2 className="h-3 w-3" />,
  file: <FileUp className="h-3 w-3" />,
  image: <Image className="h-3 w-3" />,
}

export const ReferenceNode = memo(function ReferenceNode({ id, data }: NodeProps) {
  const nodeData = data as unknown as PlanNodeData
  const config = NODE_CONFIG.reference
  const selectedNodeId = useUIStore((s) => s.selectedNodeId)
  const selectNode = useUIStore((s) => s.selectNode)
  const isSelected = selectedNodeId === id
  const hasChildren = useProjectStore((s) =>
    s.currentProject?.nodes.some((n) => n.parentId === id) ?? false
  )

  const referenceType = nodeData.referenceType || 'link'
  const url = nodeData.url

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
        nodeType="reference"
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

      <div className="p-2.5">
        <div className="flex items-center gap-2 mb-1.5">
          <Badge className={cn('text-[10px] px-1.5 py-0', config.badgeClass)}>
            {REF_TYPE_ICONS[referenceType] || <ExternalLink className="h-3 w-3" />}
            <span className="ml-1">{config.label}</span>
          </Badge>
          <div className={cn('w-2 h-2 rounded-full ml-auto', STATUS_COLORS[nodeData.status])} />
        </div>

        <h4 className="text-xs font-medium leading-tight line-clamp-1">
          {nodeData.label}
        </h4>

        {url && (
          <p className="text-[10px] text-muted-foreground truncate mt-1 font-mono">
            {url}
          </p>
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
