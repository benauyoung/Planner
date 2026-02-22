'use client'

import { useCallback, useState } from 'react'
import {
  Trash2,
  Copy,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
  AlignStartHorizontal,
  AlignEndHorizontal,
  AlignCenterHorizontal,
  AlignStartVertical,
  AlignEndVertical,
  AlignCenterVertical,
  ChevronDown,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/ui-store'
import { useProjectStore } from '@/stores/project-store'
import {
  alignTop,
  alignMiddle,
  alignBottom,
  alignLeft,
  alignCenter,
  alignRight,
  distributeHorizontal,
  distributeVertical,
} from '@/lib/canvas-align'
import type { NodeStatus } from '@/types/project'

const STATUS_OPTIONS: { value: NodeStatus; label: string; color: string }[] = [
  { value: 'not_started', label: 'Not Started', color: 'bg-gray-400' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
  { value: 'completed', label: 'Completed', color: 'bg-green-500' },
  { value: 'blocked', label: 'Blocked', color: 'bg-red-500' },
]

export function BulkActionsBar() {
  const selectedNodeIds = useUIStore((s) => s.selectedNodeIds)
  const clearSelection = useUIStore((s) => s.clearSelection)
  const deleteNodes = useProjectStore((s) => s.deleteNodes)
  const duplicateNodes = useProjectStore((s) => s.duplicateNodes)
  const updateNodeStatus = useProjectStore((s) => s.updateNodeStatus)
  const flowNodes = useProjectStore((s) => s.flowNodes)
  const setFlowNodes = useProjectStore((s) => s.setFlowNodes)

  const [statusOpen, setStatusOpen] = useState(false)
  const [alignOpen, setAlignOpen] = useState(false)

  const count = selectedNodeIds.size

  const handleDelete = useCallback(() => {
    deleteNodes(Array.from(selectedNodeIds))
    clearSelection()
  }, [deleteNodes, selectedNodeIds, clearSelection])

  const handleDuplicate = useCallback(() => {
    duplicateNodes(Array.from(selectedNodeIds))
  }, [duplicateNodes, selectedNodeIds])

  const handleSetStatus = useCallback(
    (status: NodeStatus) => {
      for (const id of selectedNodeIds) {
        updateNodeStatus(id, status)
      }
      setStatusOpen(false)
    },
    [selectedNodeIds, updateNodeStatus]
  )

  const handleAlign = useCallback(
    (fn: (nodes: typeof flowNodes, ids: Set<string>) => typeof flowNodes) => {
      const updated = fn(flowNodes, selectedNodeIds)
      setFlowNodes(updated)
      setAlignOpen(false)
    },
    [flowNodes, selectedNodeIds, setFlowNodes]
  )

  if (count < 2) return null

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-background/95 border shadow-lg backdrop-blur-sm">
      <span className="text-xs font-medium text-muted-foreground mr-1">
        {count} selected
      </span>

      <div className="w-px h-5 bg-border" />

      {/* Status dropdown */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs"
          onClick={() => { setStatusOpen(!statusOpen); setAlignOpen(false) }}
        >
          Status
          <ChevronDown className="h-3 w-3" />
        </Button>
        {statusOpen && (
          <div className="absolute bottom-full mb-1 left-0 w-36 py-1 bg-background border rounded-lg shadow-lg">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-accent transition-colors"
                onClick={() => handleSetStatus(opt.value)}
              >
                <div className={`w-2 h-2 rounded-full ${opt.color}`} />
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Align dropdown */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs"
          onClick={() => { setAlignOpen(!alignOpen); setStatusOpen(false) }}
        >
          Align
          <ChevronDown className="h-3 w-3" />
        </Button>
        {alignOpen && (
          <div className="absolute bottom-full mb-1 left-0 w-48 py-1 bg-background border rounded-lg shadow-lg">
            <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Align
            </div>
            <button className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-accent" onClick={() => handleAlign(alignLeft)}>
              <AlignStartHorizontal className="h-3.5 w-3.5" /> Align Left
            </button>
            <button className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-accent" onClick={() => handleAlign(alignCenter)}>
              <AlignCenterHorizontal className="h-3.5 w-3.5" /> Align Center
            </button>
            <button className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-accent" onClick={() => handleAlign(alignRight)}>
              <AlignEndHorizontal className="h-3.5 w-3.5" /> Align Right
            </button>
            <div className="h-px bg-border mx-2 my-1" />
            <button className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-accent" onClick={() => handleAlign(alignTop)}>
              <AlignStartVertical className="h-3.5 w-3.5" /> Align Top
            </button>
            <button className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-accent" onClick={() => handleAlign(alignMiddle)}>
              <AlignCenterVertical className="h-3.5 w-3.5" /> Align Middle
            </button>
            <button className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-accent" onClick={() => handleAlign(alignBottom)}>
              <AlignEndVertical className="h-3.5 w-3.5" /> Align Bottom
            </button>
            <div className="h-px bg-border mx-2 my-1" />
            <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Distribute
            </div>
            <button className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-accent" onClick={() => handleAlign(distributeHorizontal)}>
              <AlignHorizontalDistributeCenter className="h-3.5 w-3.5" /> Distribute H
            </button>
            <button className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-accent" onClick={() => handleAlign(distributeVertical)}>
              <AlignVerticalDistributeCenter className="h-3.5 w-3.5" /> Distribute V
            </button>
          </div>
        )}
      </div>

      <div className="w-px h-5 bg-border" />

      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1 text-xs"
        onClick={handleDuplicate}
        title="Duplicate selected"
      >
        <Copy className="h-3.5 w-3.5" />
        Duplicate
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1 text-xs text-destructive hover:text-destructive"
        onClick={handleDelete}
        title="Delete selected"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </Button>

      <div className="w-px h-5 bg-border" />

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={clearSelection}
        title="Clear selection"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
