'use client'

import { memo, useMemo, useEffect, useCallback } from 'react'
import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NODE_CONFIG } from '@/lib/constants'
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
  const toggleNodeCollapse = useProjectStore((s) => s.toggleNodeCollapse)
  const isSelected = selectedNodeId === id
  const isInMultiSelect = selectedNodeIds.size > 1 && selectedNodeIds.has(id)
  const lod = useZoomLevel()
  const updateNodeInternals = useUpdateNodeInternals()
  useEffect(() => {
    updateNodeInternals(id)
  }, [lod, id, updateNodeInternals])

  const nodes = useProjectStore((s) => s.currentProject?.nodes)
  const childCount = useMemo(
    () => nodes?.filter((n) => n.parentId === id).length ?? 0,
    [nodes, id]
  )

  // Click handler: select the node + expand if collapsed
  const handleClick = useCallback(() => {
    selectNode(id)
    if (childCount > 0 && data.collapsed) {
      toggleNodeCollapse(id)
    }
  }, [id, childCount, data.collapsed, selectNode, toggleNodeCollapse])

  // Collapse button handler (stops propagation so it doesn't trigger expand)
  const handleCollapse = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    toggleNodeCollapse(id)
  }, [id, toggleNodeCollapse])

  // ── Dot LOD: tiny colored dot ──
  if (lod === 'dot') {
    return (
      <div
        className={cn(
          'rounded-full border shadow-sm cursor-pointer flex items-center justify-center',
          isSelected ? 'ring-2 ring-primary' : isInMultiSelect ? 'ring-2 ring-blue-400/60' : '',
        )}
        style={{ width: 24, height: 24, borderColor: config.color, backgroundColor: `${config.color}30` }}
        onClick={handleClick}
      >
        {data.parentId && (
          <Handle type="target" position={Position.Left} className="!bg-muted-foreground !w-1 !h-1" />
        )}
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.color }} />
        <Handle type="source" position={Position.Right} className="!bg-muted-foreground !w-1 !h-1" />
      </div>
    )
  }

  // ── Compact LOD: icon + truncated title ──
  if (lod === 'compact') {
    return (
      <div
        className={cn(
          'rounded-lg border cursor-pointer flex items-center',
          isSelected
            ? 'ring-2 ring-primary shadow-glow'
            : isInMultiSelect
              ? 'ring-2 ring-blue-400/60'
              : 'hover:border-white/30',
        )}
        style={{
          height: 28,
          borderColor: `${config.color}40`,
          backgroundColor: 'hsl(var(--card))',
        }}
        onClick={handleClick}
      >
        {data.parentId && (
          <Handle type="target" position={Position.Left} className="!bg-muted-foreground !w-1.5 !h-1.5" />
        )}
        <div className="flex items-center gap-1.5 px-2.5">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: config.color }} />
          <span className="text-[10px] font-medium leading-tight truncate max-w-[140px]">{data.label}</span>
        </div>
        <Handle type="source" position={Position.Right} className="!bg-muted-foreground !w-1.5 !h-1.5" />
      </div>
    )
  }

  // ── Full LOD: dark card with colored dot, title, type label, collapse button ──
  return (
    <div
      className={cn(
        'group relative rounded-xl border transition-all cursor-pointer',
        isSelected
          ? 'ring-2 ring-offset-1 ring-offset-background shadow-lg'
          : isInMultiSelect
            ? 'ring-2 ring-blue-400/60 ring-dashed'
            : 'hover:border-opacity-80 hover:shadow-md',
      )}
      style={{
        width: config.width,
        height: config.height,
        borderColor: isSelected ? config.color : `${config.color}50`,
        backgroundColor: isSelected ? `${config.color}12` : 'hsl(var(--card))',
        boxShadow: isSelected ? `0 0 16px ${config.color}25` : undefined,
      }}
      onClick={handleClick}
      onContextMenu={(e) => e.preventDefault()}
    >
      {data.parentId && (
        <Handle
          type="target"
          position={Position.Left}
          className="!bg-muted-foreground !w-1.5 !h-1.5"
        />
      )}

      <div className="flex items-center gap-2 h-full px-3">
        {/* Colored type dot */}
        <div
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: config.color }}
        />
        {/* Title + type label */}
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[11px] font-semibold leading-tight truncate">
            {data.label}
          </span>
          <span
            className="text-[8px] font-medium leading-tight opacity-60"
            style={{ color: config.color }}
          >
            {config.label}
          </span>
        </div>
        {/* Collapse/expand button for nodes with children */}
        {childCount > 0 && (
          <button
            onClick={handleCollapse}
            className={cn(
              'flex items-center justify-center rounded shrink-0 transition-all',
              'hover:scale-110'
            )}
            style={{
              width: 20,
              height: 18,
              backgroundColor: `${config.color}20`,
            }}
            title={data.collapsed ? 'Expand children' : 'Collapse children'}
          >
            {data.collapsed ? (
              <ChevronRight
                className="w-3 h-3"
                style={{ color: config.color }}
              />
            ) : (
              <ChevronLeft
                className="w-3 h-3"
                style={{ color: config.color }}
              />
            )}
          </button>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-muted-foreground !w-1.5 !h-1.5"
      />
    </div>
  )
})
