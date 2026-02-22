'use client'

import { memo, useMemo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NODE_CONFIG, STATUS_COLORS } from '@/lib/constants'
import type { NodeType, NodeStatus } from '@/types/project'
import { useUIStore } from '@/stores/ui-store'
import { useProjectStore } from '@/stores/project-store'
import { getNodePrdStatus, PRD_STATUS_CONFIG } from '@/lib/prd-status'
import { useZoomLevel } from '@/hooks/use-zoom-level'
import { NodeToolbar } from './node-toolbar'

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

const STATUS_CIRCLE_COLORS: Record<NodeStatus, string> = {
  not_started: 'bg-gray-400/20 text-gray-500 dark:bg-gray-600/30 dark:text-gray-400',
  in_progress: 'bg-blue-400/20 text-blue-600 dark:bg-blue-600/30 dark:text-blue-400',
  completed: 'bg-green-400/20 text-green-600 dark:bg-green-600/30 dark:text-green-400',
  blocked: 'bg-red-400/20 text-red-600 dark:bg-red-600/30 dark:text-red-400',
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

  const nodes = useProjectStore((s) => s.currentProject?.nodes)
  const children = useMemo(
    () => nodes?.filter((n) => n.parentId === id) ?? [],
    [nodes, id]
  )
  const hasChildren = children.length > 0

  const fullNode = useMemo(() => nodes?.find((n) => n.id === id), [nodes, id])
  const prdStatus = useMemo(
    () => (fullNode ? getNodePrdStatus(fullNode) : null),
    [fullNode]
  )

  const statusCounts = useMemo(() => {
    if (!hasChildren) return null
    const counts: Partial<Record<NodeStatus, number>> = {}
    children.forEach((c) => {
      counts[c.status] = (counts[c.status] || 0) + 1
    })
    return counts
  }, [children, hasChildren])

  // ── Dot LOD: tiny colored pill ──
  if (lod === 'dot') {
    return (
      <div
        className={cn(
          'rounded-md border shadow-sm cursor-pointer flex items-center justify-center',
          config.bgClass,
          isSelected ? 'ring-2 ring-primary' : isInMultiSelect ? 'ring-2 ring-blue-400/60' : '',
        )}
        style={{ width: 48, height: 28, borderColor: config.color }}
        onClick={() => selectNode(id)}
      >
        {data.parentId && (
          <Handle type="target" position={Position.Left} className="!bg-muted-foreground !w-1.5 !h-1.5" />
        )}
        <div className={cn('w-2 h-2 rounded-full', STATUS_COLORS[data.status])} />
        <Handle type="source" position={Position.Right} className="!bg-muted-foreground !w-1.5 !h-1.5" />
      </div>
    )
  }

  // ── Compact LOD: title + status only ──
  if (lod === 'compact') {
    return (
      <div
        className={cn(
          'group relative rounded-lg border-2 shadow-sm cursor-pointer',
          config.bgClass,
          isSelected
            ? 'ring-2 ring-primary shadow-glow'
            : isInMultiSelect
              ? 'ring-2 ring-blue-400/60 ring-dashed'
              : 'hover:shadow-md',
        )}
        style={{ width: 180, minHeight: 40, borderColor: config.color }}
        onClick={() => selectNode(id)}
      >
        {data.parentId && (
          <Handle type="target" position={Position.Left} className="!bg-muted-foreground !w-2 !h-2" />
        )}
        <div className="p-2 flex items-center gap-2">
          <div className={cn('w-2 h-2 rounded-full shrink-0', STATUS_COLORS[data.status])} />
          <span className="text-xs font-medium leading-tight truncate">{data.label}</span>
        </div>
        <Handle type="source" position={Position.Right} className="!bg-muted-foreground !w-2 !h-2" />
      </div>
    )
  }

  // ── Full LOD ──
  return (
    <div
      className={cn(
        'group relative rounded-lg border-2 shadow-sm transition-all cursor-pointer',
        config.bgClass,
        isSelected
          ? 'ring-2 ring-primary shadow-glow'
          : isInMultiSelect
            ? 'ring-2 ring-blue-400/60 ring-dashed'
            : 'hover:shadow-md',
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
        nodeType={data.nodeType}
        status={data.status}
        collapsed={data.collapsed}
        hasChildren={hasChildren}
      />

      {data.parentId && (
        <Handle
          type="target"
          position={Position.Left}
          className="!bg-muted-foreground !w-2 !h-2"
        />
      )}

      <div className="p-3.5">
        {/* Header: type indicator + status circles */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className={cn('opacity-70', config.textClass)}>{icon}</span>
            <span className={cn('text-[10px] font-semibold uppercase tracking-wider', config.textClass)}>
              {config.label}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {statusCounts ? (
              Object.entries(statusCounts).map(([status, count]) => (
                <div
                  key={status}
                  className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold',
                    STATUS_CIRCLE_COLORS[status as NodeStatus],
                  )}
                  title={`${count} ${status.replace('_', ' ')}`}
                >
                  {count}
                </div>
              ))
            ) : (
              <div className={cn('w-2.5 h-2.5 rounded-full', STATUS_COLORS[data.status])} />
            )}
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleNodeCollapse(id)
                }}
                className="p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded ml-0.5"
              >
                {data.collapsed ? (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h4 className="text-sm font-semibold leading-snug mb-1 line-clamp-2">
          {data.label}
        </h4>

        {/* Description */}
        {data.description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
            {data.description}
          </p>
        )}

        {/* PRD status dot */}
        {prdStatus && (
          <div className="flex items-center gap-1 mt-2">
            <div
              className={cn('w-1.5 h-1.5 rounded-full shrink-0', PRD_STATUS_CONFIG[prdStatus].dot)}
              title={`PRD: ${PRD_STATUS_CONFIG[prdStatus].label}`}
            />
            <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider font-medium">
              {PRD_STATUS_CONFIG[prdStatus].label}
            </span>
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
