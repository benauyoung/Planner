'use client'

import { useState, useRef, useEffect } from 'react'
import { User, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TeamMember } from '@/types/project'

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

interface AssigneeAvatarProps {
  member: TeamMember
  size?: 'sm' | 'md'
}

export function AssigneeAvatar({ member, size = 'sm' }: AssigneeAvatarProps) {
  const px = size === 'sm' ? 'w-5 h-5 text-[9px]' : 'w-6 h-6 text-[10px]'
  return (
    <div
      className={cn('rounded-full flex items-center justify-center font-medium text-white shrink-0', px)}
      style={{ backgroundColor: member.color }}
      title={member.name}
    >
      {member.avatar ? (
        <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
      ) : (
        getInitials(member.name)
      )}
    </div>
  )
}

interface AssigneePickerProps {
  team: TeamMember[]
  value: string | undefined
  onChange: (assigneeId: string | undefined) => void
}

export function AssigneePicker({ team, value, onChange }: AssigneePickerProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = team.find((m) => m.id === value)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 h-7 px-2 text-xs bg-muted rounded hover:bg-muted/80 transition-colors"
      >
        {selected ? (
          <>
            <AssigneeAvatar member={selected} size="sm" />
            <span className="truncate max-w-[80px]">{selected.name}</span>
          </>
        ) : (
          <>
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Unassigned</span>
          </>
        )}
        <ChevronDown className="h-3 w-3 text-muted-foreground ml-auto" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-background border rounded-lg shadow-lg z-50 py-1">
          {/* Unassign option */}
          {selected && (
            <button
              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-muted transition-colors"
              onClick={() => { onChange(undefined); setOpen(false) }}
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Unassign</span>
            </button>
          )}

          {team.length === 0 && (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              No team members yet
            </div>
          )}

          {team.map((member) => (
            <button
              key={member.id}
              className={cn(
                'flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-muted transition-colors',
                member.id === value && 'bg-primary/10'
              )}
              onClick={() => { onChange(member.id); setOpen(false) }}
            >
              <AssigneeAvatar member={member} size="sm" />
              <span className="truncate">{member.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
