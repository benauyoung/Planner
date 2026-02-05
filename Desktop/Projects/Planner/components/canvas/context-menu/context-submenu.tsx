'use client'

import { useRef, useLayoutEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SubmenuItem {
  label: string
  value: string
  color: string
  active: boolean
  onClick: () => void
}

interface ContextSubmenuProps {
  items: SubmenuItem[]
  anchorRect: DOMRect
  onClose: () => void
}

export function ContextSubmenu({ items, anchorRect, onClose }: ContextSubmenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useLayoutEffect(() => {
    if (!menuRef.current) return
    const rect = menuRef.current.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight

    // Default: right of the anchor item
    let x = anchorRect.right + 4
    let y = anchorRect.top

    // Flip left if overflows right edge
    if (x + rect.width > vw - 8) {
      x = anchorRect.left - rect.width - 4
    }

    // Shift up if overflows bottom
    if (y + rect.height > vh - 8) {
      y = Math.max(8, vh - rect.height - 8)
    }

    setPosition({ x, y })
  }, [anchorRect])

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.1 }}
      className="fixed z-[101] min-w-[160px] py-1 bg-background border rounded-lg shadow-lg"
      style={{ left: position.x, top: position.y }}
    >
      {items.map((item) => (
        <button
          key={item.value}
          className={cn(
            'flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left',
            'hover:bg-accent transition-colors'
          )}
          onClick={() => {
            item.onClick()
            onClose()
          }}
        >
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <span className="flex-1">{item.label}</span>
          {item.active && <Check className="h-3.5 w-3.5 text-muted-foreground" />}
        </button>
      ))}
    </motion.div>
  )
}
