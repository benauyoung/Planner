'use client'

import { useRef, useLayoutEffect, useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import {
  Pencil,
  ArrowRightLeft,
  CircleDot,
  Plus,
  Copy,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NODE_CONFIG, NODE_CHILD_TYPE, STATUS_COLORS } from '@/lib/constants'
import { useProjectStore } from '@/stores/project-store'
import { useUIStore } from '@/stores/ui-store'
import { ContextSubmenu } from './context-submenu'
import type { NodeType, NodeStatus, PlanNode } from '@/types/project'

interface NodeContextMenuProps {
  nodeId: string
  position: { x: number; y: number }
  onClose: () => void
}

const NODE_TYPES: NodeType[] = ['goal', 'subgoal', 'feature', 'task']

const STATUS_OPTIONS: { value: NodeStatus; label: string; color: string }[] = [
  { value: 'not_started', label: 'Not Started', color: '#9ca3af' },
  { value: 'in_progress', label: 'In Progress', color: '#3b82f6' },
  { value: 'completed', label: 'Completed', color: '#22c55e' },
  { value: 'blocked', label: 'Blocked', color: '#ef4444' },
]

export function NodeContextMenu({ nodeId, position, onClose }: NodeContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuPos, setMenuPos] = useState(position)
  const [activeSubmenu, setActiveSubmenu] = useState<'type' | 'status' | null>(null)
  const [submenuAnchorRect, setSubmenuAnchorRect] = useState<DOMRect | null>(null)
  const submenuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const node = useProjectStore((s) =>
    s.currentProject?.nodes.find((n) => n.id === nodeId)
  )
  const hasChildren = useProjectStore((s) =>
    s.currentProject?.nodes.some((n) => n.parentId === nodeId) ?? false
  )

  const childType = node ? NODE_CHILD_TYPE[node.type] : null

  // Viewport overflow adjustment
  useLayoutEffect(() => {
    if (!menuRef.current) return
    const rect = menuRef.current.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight

    let x = position.x
    let y = position.y

    if (x + rect.width > vw - 8) {
      x = Math.max(8, vw - rect.width - 8)
    }
    if (y + rect.height > vh - 8) {
      y = Math.max(8, vh - rect.height - 8)
    }

    setMenuPos({ x, y })
  }, [position])

  // Dismissal: Escape, click outside, scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        // Also allow clicks inside submenus (portaled outside menuRef)
        const target = e.target as HTMLElement
        if (target.closest('[data-context-submenu]')) return
        onClose()
      }
    }
    const handleScroll = () => onClose()

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('scroll', handleScroll, true)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [onClose])

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (submenuTimeoutRef.current) clearTimeout(submenuTimeoutRef.current)
    }
  }, [])

  const handleSubmenuEnter = useCallback(
    (type: 'type' | 'status', e: React.MouseEvent<HTMLButtonElement>) => {
      if (submenuTimeoutRef.current) {
        clearTimeout(submenuTimeoutRef.current)
        submenuTimeoutRef.current = null
      }
      setActiveSubmenu(type)
      setSubmenuAnchorRect(e.currentTarget.getBoundingClientRect())
    },
    []
  )

  const handleSubmenuLeave = useCallback(() => {
    submenuTimeoutRef.current = setTimeout(() => {
      setActiveSubmenu(null)
      setSubmenuAnchorRect(null)
    }, 100)
  }, [])

  const handleSubmenuStay = useCallback(() => {
    if (submenuTimeoutRef.current) {
      clearTimeout(submenuTimeoutRef.current)
      submenuTimeoutRef.current = null
    }
  }, [])

  const handleItemHover = useCallback(() => {
    // Hovering a non-submenu item closes any open submenu
    if (submenuTimeoutRef.current) {
      clearTimeout(submenuTimeoutRef.current)
      submenuTimeoutRef.current = null
    }
    setActiveSubmenu(null)
    setSubmenuAnchorRect(null)
  }, [])

  if (!node) return null

  const handleEdit = () => {
    useUIStore.getState().selectNode(nodeId)
    onClose()
  }

  const handleAddChild = () => {
    if (!childType) return
    const newId = useProjectStore.getState().addChildNode(nodeId, `New ${NODE_CONFIG[childType].label}`)
    if (newId) {
      useUIStore.getState().selectNode(newId)
    }
    onClose()
  }

  const handleDuplicate = () => {
    useProjectStore.getState().duplicateNode(nodeId, true)
    onClose()
  }

  const handleToggleCollapse = () => {
    useProjectStore.getState().toggleNodeCollapse(nodeId)
    onClose()
  }

  const handleDelete = () => {
    useProjectStore.getState().deleteNode(nodeId)
    useUIStore.getState().closeDetailPanel()
    onClose()
  }

  const typeSubmenuItems = NODE_TYPES.map((t) => ({
    label: NODE_CONFIG[t].label,
    value: t,
    color: NODE_CONFIG[t].color,
    active: node.type === t,
    onClick: () => useProjectStore.getState().changeNodeType(nodeId, t),
  }))

  const statusSubmenuItems = STATUS_OPTIONS.map((s) => ({
    label: s.label,
    value: s.value,
    color: s.color,
    active: node.status === s.value,
    onClick: () => useProjectStore.getState().updateNodeStatus(nodeId, s.value),
  }))

  const menu = (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.1 }}
      className="fixed z-[100] min-w-[200px] py-1 bg-background border rounded-lg shadow-lg"
      style={{ left: menuPos.x, top: menuPos.y }}
    >
      {/* Edit */}
      <button
        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        onClick={handleEdit}
        onMouseEnter={handleItemHover}
      >
        <Pencil className="h-4 w-4" />
        <span>Edit</span>
      </button>

      <div className="h-px bg-border mx-2 my-1" />

      {/* Change Type */}
      <button
        className={cn(
          'flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors',
          activeSubmenu === 'type' && 'bg-accent'
        )}
        onMouseEnter={(e) => handleSubmenuEnter('type', e)}
        onMouseLeave={handleSubmenuLeave}
      >
        <ArrowRightLeft className="h-4 w-4" />
        <span className="flex-1 text-left">Change Type</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Set Status */}
      <button
        className={cn(
          'flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors',
          activeSubmenu === 'status' && 'bg-accent'
        )}
        onMouseEnter={(e) => handleSubmenuEnter('status', e)}
        onMouseLeave={handleSubmenuLeave}
      >
        <CircleDot className="h-4 w-4" />
        <span className="flex-1 text-left">Set Status</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>

      <div className="h-px bg-border mx-2 my-1" />

      {/* Add Child (hidden for task nodes) */}
      {childType && (
        <button
          className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors"
          onClick={handleAddChild}
          onMouseEnter={handleItemHover}
        >
          <Plus className="h-4 w-4" />
          <span>Add {NODE_CONFIG[childType].label}</span>
        </button>
      )}

      {/* Duplicate */}
      <button
        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        onClick={handleDuplicate}
        onMouseEnter={handleItemHover}
      >
        <Copy className="h-4 w-4" />
        <span>Duplicate</span>
      </button>

      {/* Collapse/Expand (hidden if no children) */}
      {hasChildren && (
        <button
          className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors"
          onClick={handleToggleCollapse}
          onMouseEnter={handleItemHover}
        >
          {node.collapsed ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
          <span>{node.collapsed ? 'Expand' : 'Collapse'}</span>
        </button>
      )}

      <div className="h-px bg-border mx-2 my-1" />

      {/* Delete */}
      <button
        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        onClick={handleDelete}
        onMouseEnter={handleItemHover}
      >
        <Trash2 className="h-4 w-4" />
        <span>Delete</span>
      </button>

      {/* Submenus */}
      {activeSubmenu === 'type' && submenuAnchorRect && (
        <div
          data-context-submenu
          onMouseEnter={handleSubmenuStay}
          onMouseLeave={handleSubmenuLeave}
        >
          <ContextSubmenu
            items={typeSubmenuItems}
            anchorRect={submenuAnchorRect}
            onClose={onClose}
          />
        </div>
      )}

      {activeSubmenu === 'status' && submenuAnchorRect && (
        <div
          data-context-submenu
          onMouseEnter={handleSubmenuStay}
          onMouseLeave={handleSubmenuLeave}
        >
          <ContextSubmenu
            items={statusSubmenuItems}
            anchorRect={submenuAnchorRect}
            onClose={onClose}
          />
        </div>
      )}
    </motion.div>
  )

  if (typeof document === 'undefined') return null

  return createPortal(menu, document.body)
}
