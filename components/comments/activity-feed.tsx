'use client'

import {
  MessageSquare,
  ArrowRightLeft,
  User,
  Flag,
  Plus,
  Trash2,
  Pencil,
} from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { useUIStore } from '@/stores/ui-store'
import type { ActivityEvent } from '@/types/project'

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const EVENT_ICONS: Record<ActivityEvent['type'], React.ReactNode> = {
  status_change: <ArrowRightLeft className="h-3 w-3" />,
  assignment: <User className="h-3 w-3" />,
  priority_change: <Flag className="h-3 w-3" />,
  comment: <MessageSquare className="h-3 w-3" />,
  node_created: <Plus className="h-3 w-3" />,
  node_deleted: <Trash2 className="h-3 w-3" />,
  node_updated: <Pencil className="h-3 w-3" />,
}

const EVENT_COLORS: Record<ActivityEvent['type'], string> = {
  status_change: 'text-blue-500 bg-blue-500/10',
  assignment: 'text-purple-500 bg-purple-500/10',
  priority_change: 'text-orange-500 bg-orange-500/10',
  comment: 'text-green-500 bg-green-500/10',
  node_created: 'text-emerald-500 bg-emerald-500/10',
  node_deleted: 'text-red-500 bg-red-500/10',
  node_updated: 'text-amber-500 bg-amber-500/10',
}

export function ActivityFeed() {
  const activity = useProjectStore((s) => s.currentProject?.activity || [])
  const selectNode = useUIStore((s) => s.selectNode)

  const sorted = [...activity].sort((a, b) => b.timestamp - a.timestamp).slice(0, 50)

  if (sorted.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-muted-foreground">
        No activity yet. Changes to nodes will appear here.
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {sorted.map((event) => (
        <button
          key={event.id}
          className="flex items-start gap-2 w-full px-2 py-1.5 rounded hover:bg-muted/50 transition-colors text-left"
          onClick={() => selectNode(event.nodeId)}
        >
          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${EVENT_COLORS[event.type]}`}>
            {EVENT_ICONS[event.type]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs">
              <span className="font-medium">{event.actorName}</span>
              {' '}
              <span className="text-muted-foreground">{event.detail}</span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {event.nodeTitle} · {timeAgo(event.timestamp)}
            </p>
          </div>
        </button>
      ))}
    </div>
  )
}
