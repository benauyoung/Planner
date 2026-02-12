'use client'

import { cn } from '@/lib/utils'
import type { Priority } from '@/types/project'

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  critical: { label: 'Critical', color: 'text-red-600', bg: 'bg-red-500/15' },
  high: { label: 'High', color: 'text-orange-600', bg: 'bg-orange-500/15' },
  medium: { label: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-500/15' },
  low: { label: 'Low', color: 'text-blue-600', bg: 'bg-blue-500/15' },
  none: { label: 'None', color: 'text-muted-foreground', bg: 'bg-muted' },
}

interface PriorityBadgeProps {
  priority: Priority
  size?: 'sm' | 'md'
}

export function PriorityBadge({ priority, size = 'sm' }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        config.color,
        config.bg,
        size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
      )}
    >
      {config.label}
    </span>
  )
}

interface PrioritySelectorProps {
  value: Priority
  onChange: (priority: Priority) => void
}

export function PrioritySelector({ value, onChange }: PrioritySelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Priority)}
      className="h-7 px-2 text-xs bg-muted rounded border-0 outline-none focus:ring-1 focus:ring-primary text-foreground"
    >
      <option value="none">No Priority</option>
      <option value="critical">🔴 Critical</option>
      <option value="high">🟠 High</option>
      <option value="medium">🟡 Medium</option>
      <option value="low">🔵 Low</option>
    </select>
  )
}
