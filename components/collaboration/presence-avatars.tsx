'use client'

import { cn } from '@/lib/utils'
import type { CollaboratorPresence } from '@/services/collaboration'

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const secs = Math.floor(diff / 1000)
  if (secs < 10) return 'now'
  if (secs < 60) return `${secs}s`
  return `${Math.floor(secs / 60)}m`
}

interface PresenceAvatarsProps {
  peers: CollaboratorPresence[]
  className?: string
}

export function PresenceAvatars({ peers, className }: PresenceAvatarsProps) {
  if (peers.length === 0) return null

  return (
    <div className={cn('flex items-center -space-x-1.5', className)}>
      {peers.slice(0, 5).map((peer) => (
        <div
          key={peer.id}
          className="relative group"
          title={`${peer.name} — ${timeAgo(peer.lastSeen)}`}
        >
          {peer.avatar ? (
            <img
              src={peer.avatar}
              alt={peer.name}
              className="w-7 h-7 rounded-full border-2 border-background"
              style={{ borderColor: peer.color }}
            />
          ) : (
            <div
              className="w-7 h-7 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-medium text-white"
              style={{ backgroundColor: peer.color }}
            >
              {getInitials(peer.name)}
            </div>
          )}
          {/* Online dot */}
          <span
            className={cn(
              'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background',
              Date.now() - peer.lastSeen < 30000 ? 'bg-green-500' : 'bg-gray-400'
            )}
          />

          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            <div className="bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded-md shadow-md whitespace-nowrap border">
              {peer.name}
            </div>
          </div>
        </div>
      ))}
      {peers.length > 5 && (
        <div className="w-7 h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground">
          +{peers.length - 5}
        </div>
      )}
    </div>
  )
}
