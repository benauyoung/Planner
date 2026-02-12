'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { CollaboratorPresence } from '@/services/collaboration'

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

interface PresenceCursorsProps {
  peers: CollaboratorPresence[]
}

export function PresenceCursors({ peers }: PresenceCursorsProps) {
  const activePeers = peers.filter(
    (p) => p.cursor && Date.now() - p.lastSeen < 30000
  )

  return (
    <AnimatePresence>
      {activePeers.map((peer) => (
        <motion.div
          key={peer.id}
          className="absolute pointer-events-none z-50"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: 1,
            scale: 1,
            x: peer.cursor!.x,
            y: peer.cursor!.y,
          }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ type: 'spring', damping: 30, stiffness: 500 }}
        >
          {/* Cursor arrow */}
          <svg
            width="16"
            height="20"
            viewBox="0 0 16 20"
            fill="none"
            className="drop-shadow-sm"
          >
            <path
              d="M0.928711 0.643799L14.9287 10.6438L8.42871 11.1438L4.92871 19.1438L0.928711 0.643799Z"
              fill={peer.color}
            />
            <path
              d="M0.928711 0.643799L14.9287 10.6438L8.42871 11.1438L4.92871 19.1438L0.928711 0.643799Z"
              stroke="white"
              strokeWidth="1"
            />
          </svg>

          {/* Name label */}
          <div
            className="absolute top-4 left-3 px-1.5 py-0.5 rounded text-[9px] font-medium text-white whitespace-nowrap shadow-sm"
            style={{ backgroundColor: peer.color }}
          >
            {peer.name}
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  )
}
