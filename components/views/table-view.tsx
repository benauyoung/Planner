'use client'

import { useMemo, useState } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { useUIStore } from '@/stores/ui-store'
import { NODE_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { AssigneeAvatar } from '@/components/ui/assignee-picker'
import type { PlanNode, NodeStatus, Priority, TeamMember } from '@/types/project'

const EMPTY_NODES: PlanNode[] = []
const EMPTY_TEAM: TeamMember[] = []

type SortKey = 'title' | 'type' | 'status' | 'priority' | 'description'

const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  none: 4,
}
type SortDir = 'asc' | 'desc'

const STATUS_ORDER: Record<NodeStatus, number> = {
  blocked: 0,
  in_progress: 1,
  not_started: 2,
  completed: 3,
}

const STATUS_DOTS: Record<NodeStatus, string> = {
  not_started: 'bg-gray-400',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
  blocked: 'bg-red-500',
}

const STATUS_LABELS: Record<NodeStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  blocked: 'Blocked',
}

export function TableView() {
  const nodes = useProjectStore((s) => s.currentProject?.nodes ?? EMPTY_NODES)
  const selectedNodeId = useUIStore((s) => s.selectedNodeId)
  const selectNode = useUIStore((s) => s.selectNode)
  const searchQuery = useUIStore((s) => s.searchQuery)
  const filterType = useUIStore((s) => s.filterType)
  const filterStatus = useUIStore((s) => s.filterStatus)
  const team = useProjectStore((s) => s.currentProject?.team ?? EMPTY_TEAM)

  const [sortKey, setSortKey] = useState<SortKey>('type')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = useMemo(() => {
    let result = [...nodes]
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

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case 'title':
          return a.title.localeCompare(b.title) * dir
        case 'type':
          return a.type.localeCompare(b.type) * dir
        case 'status':
          return (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]) * dir
        case 'priority':
          return (PRIORITY_ORDER[a.priority || 'none'] - PRIORITY_ORDER[b.priority || 'none']) * dir
        case 'description':
          return a.description.localeCompare(b.description) * dir
        default:
          return 0
      }
    })
  }, [filtered, sortKey, sortDir])

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return null
    return sortDir === 'asc' ? (
      <ArrowUp className="h-3 w-3 inline ml-0.5" />
    ) : (
      <ArrowDown className="h-3 w-3 inline ml-0.5" />
    )
  }

  if (sorted.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
        {searchQuery || filterType || filterStatus
          ? 'No nodes match your filters'
          : 'No nodes in this project'}
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-background z-10">
          <tr className="border-b">
            <th
              className="text-left px-3 py-2 font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none w-[35%]"
              onClick={() => handleSort('title')}
            >
              Title <SortIcon column="title" />
            </th>
            <th
              className="text-left px-3 py-2 font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none w-[10%]"
              onClick={() => handleSort('type')}
            >
              Type <SortIcon column="type" />
            </th>
            <th
              className="text-left px-3 py-2 font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none w-[12%]"
              onClick={() => handleSort('status')}
            >
              Status <SortIcon column="status" />
            </th>
            <th
              className="text-left px-3 py-2 font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none w-[8%]"
              onClick={() => handleSort('priority')}
            >
              Priority <SortIcon column="priority" />
            </th>
            <th className="text-left px-3 py-2 font-medium text-muted-foreground select-none w-[8%]">
              Assignee
            </th>
            <th
              className="text-left px-3 py-2 font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none"
              onClick={() => handleSort('description')}
            >
              Description <SortIcon column="description" />
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((node) => {
            const isSelected = node.id === selectedNodeId
            return (
              <tr
                key={node.id}
                className={cn(
                  'border-b cursor-pointer transition-colors hover:bg-muted/50',
                  isSelected && 'bg-primary/10'
                )}
                onClick={() => selectNode(node.id)}
              >
                <td className="px-3 py-2">
                  <span className="truncate block max-w-xs">{node.title}</span>
                </td>
                <td className="px-3 py-2">
                  <span
                    className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${NODE_CONFIG[node.type]?.color}20`,
                      color: NODE_CONFIG[node.type]?.color,
                    }}
                  >
                    {NODE_CONFIG[node.type]?.label}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-1.5 text-xs">
                    <span className={cn('w-2 h-2 rounded-full', STATUS_DOTS[node.status])} />
                    {STATUS_LABELS[node.status]}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {node.priority && node.priority !== 'none' ? (
                    <PriorityBadge priority={node.priority} />
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {node.assigneeId ? (
                    (() => {
                      const member = team.find((m) => m.id === node.assigneeId)
                      return member ? (
                        <div className="flex items-center gap-1.5">
                          <AssigneeAvatar member={member} size="sm" />
                          <span className="text-xs truncate max-w-[60px]">{member.name}</span>
                        </div>
                      ) : <span className="text-xs text-muted-foreground">—</span>
                    })()
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  <span className="truncate block max-w-md">{node.description || '—'}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
