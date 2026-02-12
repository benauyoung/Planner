'use client'

import { useMemo, useState, useRef, useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { useUIStore } from '@/stores/ui-store'
import { NODE_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { AssigneeAvatar } from '@/components/ui/assignee-picker'
import type { PlanNode, NodeStatus, TeamMember } from '@/types/project'

const EMPTY_NODES: PlanNode[] = []
const EMPTY_TEAM: TeamMember[] = []

const STATUS_COLORS: Record<NodeStatus, string> = {
  not_started: '#9ca3af',
  in_progress: '#3b82f6',
  completed: '#22c55e',
  blocked: '#ef4444',
}

const DAY_MS = 86400000
const COL_WIDTH = 36

function startOfDay(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function formatDay(ts: number): string {
  const d = new Date(ts)
  return d.getDate().toString()
}

function formatMonth(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function getWeekday(ts: number): number {
  return new Date(ts).getDay()
}

interface TimelineNode extends PlanNode {
  startDay: number
  endDay: number
}

type DragMode = 'move' | 'resize-left' | 'resize-right'

interface DragState {
  nodeId: string
  mode: DragMode
  startX: number
  origStartDay: number
  origEndDay: number
  origEstimateHours: number
}

export function TimelineView() {
  const nodes = useProjectStore((s) => s.currentProject?.nodes ?? EMPTY_NODES)
  const team = useProjectStore((s) => s.currentProject?.team ?? EMPTY_TEAM)
  const selectedNodeId = useUIStore((s) => s.selectedNodeId)
  const selectNode = useUIStore((s) => s.selectNode)
  const searchQuery = useUIStore((s) => s.searchQuery)
  const filterType = useUIStore((s) => s.filterType)
  const filterStatus = useUIStore((s) => s.filterStatus)
  const setNodeDueDate = useProjectStore((s) => s.setNodeDueDate)
  const setNodeEstimate = useProjectStore((s) => s.setNodeEstimate)

  const today = startOfDay(Date.now())
  const [viewStart, setViewStart] = useState(() => today - 7 * DAY_MS)
  const [drag, setDrag] = useState<DragState | null>(null)
  const [dragPreview, setDragPreview] = useState<{ nodeId: string; startDay: number; endDay: number } | null>(null)

  const VISIBLE_DAYS = 42

  const filtered = useMemo(() => {
    let result = nodes
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (n) => n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q)
      )
    }
    if (filterType) result = result.filter((n) => n.type === filterType)
    if (filterStatus) result = result.filter((n) => n.status === filterStatus)
    return result
  }, [nodes, searchQuery, filterType, filterStatus])

  const timelineNodes: TimelineNode[] = useMemo(() => {
    return filtered.map((node) => {
      const hours = node.estimatedHours || 4
      const durationDays = Math.max(1, Math.ceil(hours / 8))
      const startDay = node.dueDate
        ? startOfDay(node.dueDate) - durationDays * DAY_MS
        : today
      const endDay = node.dueDate
        ? startOfDay(node.dueDate)
        : startDay + durationDays * DAY_MS

      return { ...node, startDay, endDay }
    })
  }, [filtered, today])

  const dayColumns = useMemo(() => {
    const cols: number[] = []
    for (let i = 0; i < VISIBLE_DAYS; i++) {
      cols.push(viewStart + i * DAY_MS)
    }
    return cols
  }, [viewStart])

  const monthHeaders = useMemo(() => {
    const headers: { label: string; startCol: number; span: number }[] = []
    let currentMonth = ''
    let startIdx = 0
    for (let i = 0; i < dayColumns.length; i++) {
      const month = formatMonth(dayColumns[i])
      if (month !== currentMonth) {
        if (currentMonth) {
          headers.push({ label: currentMonth, startCol: startIdx, span: i - startIdx })
        }
        currentMonth = month
        startIdx = i
      }
    }
    if (currentMonth) {
      headers.push({ label: currentMonth, startCol: startIdx, span: dayColumns.length - startIdx })
    }
    return headers
  }, [dayColumns])

  // Drag handlers
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!drag) return
    const deltaX = e.clientX - drag.startX
    const deltaDays = Math.round(deltaX / COL_WIDTH)

    if (drag.mode === 'move') {
      const newStart = drag.origStartDay + deltaDays * DAY_MS
      const newEnd = drag.origEndDay + deltaDays * DAY_MS
      setDragPreview({ nodeId: drag.nodeId, startDay: newStart, endDay: newEnd })
    } else if (drag.mode === 'resize-right') {
      const newEnd = Math.max(drag.origStartDay + DAY_MS, drag.origEndDay + deltaDays * DAY_MS)
      setDragPreview({ nodeId: drag.nodeId, startDay: drag.origStartDay, endDay: newEnd })
    } else if (drag.mode === 'resize-left') {
      const newStart = Math.min(drag.origEndDay - DAY_MS, drag.origStartDay + deltaDays * DAY_MS)
      setDragPreview({ nodeId: drag.nodeId, startDay: newStart, endDay: drag.origEndDay })
    }
  }, [drag])

  const handleMouseUp = useCallback(() => {
    if (!drag || !dragPreview) {
      setDrag(null)
      setDragPreview(null)
      return
    }

    const durationDays = Math.max(1, Math.round((dragPreview.endDay - dragPreview.startDay) / DAY_MS))
    const newHours = durationDays * 8
    const newDueDate = dragPreview.endDay

    setNodeDueDate(drag.nodeId, newDueDate)
    setNodeEstimate(drag.nodeId, newHours)

    setDrag(null)
    setDragPreview(null)
  }, [drag, dragPreview, setNodeDueDate, setNodeEstimate])

  useEffect(() => {
    if (drag) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [drag, handleMouseMove, handleMouseUp])

  const startDrag = (nodeId: string, mode: DragMode, e: React.MouseEvent, node: TimelineNode) => {
    e.preventDefault()
    e.stopPropagation()
    setDrag({
      nodeId,
      mode,
      startX: e.clientX,
      origStartDay: node.startDay,
      origEndDay: node.endDay,
      origEstimateHours: node.estimatedHours || 4,
    })
    setDragPreview({ nodeId, startDay: node.startDay, endDay: node.endDay })
    selectNode(nodeId)
  }

  const scrollLeft = () => setViewStart((v) => v - 7 * DAY_MS)
  const scrollRight = () => setViewStart((v) => v + 7 * DAY_MS)
  const scrollToToday = () => setViewStart(today - 7 * DAY_MS)

  if (timelineNodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
        {searchQuery || filterType || filterStatus
          ? 'No nodes match your filters'
          : 'No nodes in this project. Add due dates and estimates to see the timeline.'}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col select-none">
      {/* Controls */}
      <div className="flex items-center gap-2 px-4 py-1.5 border-b shrink-0">
        <button onClick={scrollLeft} className="p-1 rounded hover:bg-muted transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={scrollToToday}
          className="px-2 py-0.5 text-xs font-medium rounded hover:bg-muted transition-colors"
        >
          Today
        </button>
        <button onClick={scrollRight} className="p-1 rounded hover:bg-muted transition-colors">
          <ChevronRight className="h-4 w-4" />
        </button>
        <span className="text-[10px] text-muted-foreground ml-2">
          Drag bars to move • Drag edges to resize
        </span>
      </div>

      {/* Gantt chart */}
      <div className="flex-1 overflow-auto">
        <div className="flex min-h-full">
          {/* Left panel — node labels */}
          <div className="w-56 shrink-0 border-r bg-background z-10 sticky left-0">
            {/* Month + Day header placeholder */}
            <div className="h-[52px] border-b" />

            {timelineNodes.map((node) => {
              const member = node.assigneeId ? team.find((m) => m.id === node.assigneeId) : null
              const preview = dragPreview?.nodeId === node.id ? dragPreview : null
              const displayStart = preview ? preview.startDay : node.startDay
              const displayEnd = preview ? preview.endDay : node.endDay
              const durationDays = Math.round((displayEnd - displayStart) / DAY_MS)
              return (
                <button
                  key={node.id}
                  className={cn(
                    'flex items-center gap-2 w-full px-3 h-10 text-left text-xs hover:bg-muted/50 transition-colors border-b',
                    selectedNodeId === node.id && 'bg-primary/10'
                  )}
                  onClick={() => selectNode(node.id)}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: STATUS_COLORS[node.status] }}
                  />
                  <span className="truncate flex-1 font-medium">{node.title}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">{durationDays}d</span>
                  {member && <AssigneeAvatar member={member} size="sm" />}
                </button>
              )
            })}
          </div>

          {/* Right panel — timeline grid */}
          <div className="flex-1">
            {/* Header: months + days */}
            <div className="sticky top-0 bg-background z-10 border-b">
              {/* Month row */}
              <div className="flex h-6" style={{ width: VISIBLE_DAYS * COL_WIDTH }}>
                {monthHeaders.map((mh) => (
                  <div
                    key={`${mh.label}-${mh.startCol}`}
                    className="text-[10px] font-medium text-muted-foreground px-1 border-r flex items-center"
                    style={{ width: mh.span * COL_WIDTH }}
                  >
                    {mh.label}
                  </div>
                ))}
              </div>

              {/* Day row */}
              <div className="flex h-[26px]" style={{ width: VISIBLE_DAYS * COL_WIDTH }}>
                {dayColumns.map((day) => {
                  const isToday = day === today
                  const isWeekend = getWeekday(day) === 0 || getWeekday(day) === 6
                  return (
                    <div
                      key={day}
                      className={cn(
                        'flex items-center justify-center text-[10px] border-r',
                        isToday && 'bg-primary/10 font-bold text-primary',
                        isWeekend && !isToday && 'bg-muted/30 text-muted-foreground'
                      )}
                      style={{ width: COL_WIDTH }}
                    >
                      {formatDay(day)}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Bars */}
            <div style={{ width: VISIBLE_DAYS * COL_WIDTH }}>
              {timelineNodes.map((node) => {
                const preview = dragPreview?.nodeId === node.id ? dragPreview : null
                const displayStart = preview ? preview.startDay : node.startDay
                const displayEnd = preview ? preview.endDay : node.endDay

                const barStartDays = (displayStart - viewStart) / DAY_MS
                const barEndDays = (displayEnd - viewStart) / DAY_MS
                const clampedStart = Math.max(0, barStartDays)
                const clampedEnd = Math.min(VISIBLE_DAYS, barEndDays)
                const barWidth = Math.max(0, (clampedEnd - clampedStart) * COL_WIDTH)
                const barLeft = clampedStart * COL_WIDTH

                const isVisible = clampedEnd > 0 && clampedStart < VISIBLE_DAYS
                const isDragging = drag?.nodeId === node.id

                return (
                  <div key={node.id} className="h-10 relative border-b">
                    {/* Grid columns */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      {dayColumns.map((day) => {
                        const isWeekend = getWeekday(day) === 0 || getWeekday(day) === 6
                        const isToday = day === today
                        return (
                          <div
                            key={day}
                            className={cn(
                              'border-r h-full',
                              isWeekend && 'bg-muted/20',
                              isToday && 'bg-primary/5'
                            )}
                            style={{ width: COL_WIDTH }}
                          />
                        )
                      })}
                    </div>

                    {/* Bar */}
                    {isVisible && barWidth > 0 && (
                      <div
                        className={cn(
                          'absolute top-1.5 h-7 rounded-md flex items-center overflow-hidden group',
                          isDragging ? 'opacity-90 shadow-lg z-20' : 'hover:brightness-110 z-10',
                          selectedNodeId === node.id && 'ring-2 ring-primary ring-offset-1'
                        )}
                        style={{
                          left: barLeft,
                          width: barWidth,
                          backgroundColor: STATUS_COLORS[node.status],
                          cursor: isDragging ? 'grabbing' : 'grab',
                        }}
                        onMouseDown={(e) => startDrag(node.id, 'move', e, node)}
                        title={`${node.title} — ${Math.round((displayEnd - displayStart) / DAY_MS)}d\nDrag to move • Drag edges to resize`}
                      >
                        {/* Left resize handle */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-white/30 transition-colors rounded-l-md"
                          onMouseDown={(e) => startDrag(node.id, 'resize-left', e, node)}
                        />

                        {/* Bar label */}
                        <div className="flex-1 px-2.5 overflow-hidden">
                          {barWidth > 50 && (
                            <span className="text-[10px] text-white font-medium truncate block">
                              {node.title}
                            </span>
                          )}
                        </div>

                        {/* Right resize handle */}
                        <div
                          className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-white/30 transition-colors rounded-r-md"
                          onMouseDown={(e) => startDrag(node.id, 'resize-right', e, node)}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
