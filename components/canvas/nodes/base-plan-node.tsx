'use client'

import { memo, useMemo, useEffect } from 'react'
import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react'
import { cn } from '@/lib/utils'
import { NODE_CONFIG, STATUS_COLORS } from '@/lib/constants'
import type { NodeType, NodeStatus } from '@/types/project'
import { useUIStore } from '@/stores/ui-store'
import { useProjectStore } from '@/stores/project-store'
import { useZoomLevel } from '@/hooks/use-zoom-level'

interface BasePlanNodeProps {
  id: string
  data: {
    label: string
    description: string
    nodeType: NodeType
    status: NodeStatus
    collapsed: boolean
    parentId: string | null
    questionsTotal: number
    questionsAnswered: number
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
  const selectedNodeIds = useUIStore((s) => s.selectedNodeIds)
  const selectNode = useUIStore((s) => s.selectNode)
  const isSelected = selectedNodeId === id
  const isInMultiSelect = selectedNodeIds.size > 1 && selectedNodeIds.has(id)
  const lod = useZoomLevel()
  const updateNodeInternals = useUpdateNodeInternals()
  useEffect(() => {
    updateNodeInternals(id)
  }, [lod, id, updateNodeInternals])

  const nodes = useProjectStore((s) => s.currentProject?.nodes)
  const hasChildren = useMemo(
    () => nodes?.some((n) => n.parentId === id) ?? false,
    [nodes, id]
  )

  // ── Dot LOD: tiny colored dot ──
  if (lod === 'dot') {
    return (
      <div
        className={cn(
          'rounded-full border shadow-sm cursor-pointer flex items-center justify-center',
          config.bgClass,
          isSelected ? 'ring-2 ring-primary' : isInMultiSelect ? 'ring-2 ring-blue-400/60' : '',
        )}
        style={{ width: 24, height: 24, borderColor: config.color }}
        onClick={() => selectNode(id)}
      >
        {data.parentId && (
          <Handle type="target" position={Position.Top} className="!bg-muted-foreground !w-1 !h-1" />
        )}
        <div className={cn('w-2 h-2 rounded-full', STATUS_COLORS[data.status])} />
        <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground !w-1 !h-1" />
      </div>
    )
  }

  // ── Compact LOD: icon + truncated title ──
  if (lod === 'compact') {
    return (
      <div
        className={cn(
          'rounded-full border shadow-sm cursor-pointer flex items-center',
          config.bgClass,
          isSelected
            ? 'ring-2 ring-primary shadow-glow'
            : isInMultiSelect
              ? 'ring-2 ring-blue-400/60'
              : 'hover:shadow-md',
        )}
        style={{ height: 28, borderColor: config.color }}
        onClick={() => selectNode(id)}
      >
        {data.parentId && (
          <Handle type="target" position={Position.Top} className="!bg-muted-foreground !w-1.5 !h-1.5" />
        )}
        <div className="flex items-center gap-1.5 px-2.5">
          <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', STATUS_COLORS[data.status])} />
          <span className="text-[10px] font-medium leading-tight truncate max-w-[100px]">{data.label}</span>
        </div>
        <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground !w-1.5 !h-1.5" />
      </div>
    )
  }

  // ── Full LOD: pill with icon + title + status ──
  return (
    <div
      className={cn(
        'group relative rounded-xl border-2 shadow-sm transition-all cursor-pointer',
        config.bgClass,
        isSelected
          ? 'ring-2 ring-primary shadow-glow'
          : isInMultiSelect
            ? 'ring-2 ring-blue-400/60 ring-dashed'
            : 'hover:shadow-md',
      )}
      style={{
        width: config.width,
        height: config.height,
        borderColor: config.color,
      }}
      onClick={() => selectNode(id)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {data.parentId && (
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-muted-foreground !w-1.5 !h-1.5"
        />
      )}

      <div className="flex items-center gap-1.5 h-full px-2.5">
        {/* Status dot */}
        <div className={cn('w-2 h-2 rounded-full shrink-0', STATUS_COLORS[data.status])} />
        {/* Type icon */}
        <span className={cn('shrink-0 opacity-80', config.textClass)}>{icon}</span>
        {/* Title */}
        <span className="text-[11px] font-medium leading-tight truncate flex-1 min-w-0">
          {data.label}
        </span>
        {/* Children indicator */}
        {hasChildren && (
          <div className="w-1 h-1 rounded-full bg-muted-foreground/40 shrink-0" />
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-muted-foreground !w-1.5 !h-1.5"
      />
    </div>
  )
})
