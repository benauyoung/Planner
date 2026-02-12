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
  ImagePlus,
  FileText,
  Circle,
  Clipboard,
  Download,
  Ban,
  ArrowRight,
  Sparkles,
  ScrollText,
  ClipboardList,
  Braces,
  Terminal,
  ExternalLink,
  Link,
  RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NODE_CONFIG, NODE_CHILD_TYPE, STATUS_COLORS } from '@/lib/constants'
import { useProjectStore } from '@/stores/project-store'
import { useUIStore } from '@/stores/ui-store'
import { ContextSubmenu } from './context-submenu'
import { exportSubtreeAsMarkdown } from '@/lib/export-markdown'
import { downloadFile } from '@/lib/export-import'
import type { NodeType, NodeStatus, PlanNode } from '@/types/project'

interface NodeContextMenuProps {
  nodeId: string
  position: { x: number; y: number }
  onClose: () => void
}

const NODE_TYPES: NodeType[] = ['goal', 'subgoal', 'feature', 'task', 'moodboard', 'notes', 'connector', 'spec', 'prd', 'schema', 'prompt', 'reference']

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

  const handleAddMoodboard = () => {
    const newId = useProjectStore.getState().addFreeNode('moodboard', 'New Mood Board', node.parentId)
    if (newId) useUIStore.getState().selectNode(newId)
    onClose()
  }

  const handleAddNotes = () => {
    const newId = useProjectStore.getState().addFreeNode('notes', 'New Notes', node.parentId)
    if (newId) useUIStore.getState().selectNode(newId)
    onClose()
  }

  const handleAddConnector = () => {
    const newId = useProjectStore.getState().addFreeNode('connector', '', node.parentId)
    if (newId) useUIStore.getState().selectNode(newId)
    onClose()
  }

  const handleAddDocNode = (type: NodeType, label: string) => {
    const newId = useProjectStore.getState().addFreeNode(type, label, node.parentId)
    if (newId) useUIStore.getState().selectNode(newId)
    onClose()
  }

  const handleAddBlocksEdge = () => {
    useUIStore.getState().startEdgeCreation(nodeId, 'blocks')
    onClose()
  }

  const handleAddDependsOnEdge = () => {
    useUIStore.getState().startEdgeCreation(nodeId, 'depends_on')
    onClose()
  }

  const handleAddEdge = (edgeType: 'informs' | 'defines' | 'implements' | 'references' | 'supersedes') => {
    useUIStore.getState().startEdgeCreation(nodeId, edgeType)
    onClose()
  }

  const handleCopyContext = () => {
    const project = useProjectStore.getState().currentProject
    if (!project) return
    const md = exportSubtreeAsMarkdown(nodeId, project)
    navigator.clipboard.writeText(md)
    onClose()
  }

  const handleDownloadMarkdown = () => {
    const project = useProjectStore.getState().currentProject
    if (!project) return
    const md = exportSubtreeAsMarkdown(nodeId, project)
    const safeName = node.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()
    downloadFile(md, `${safeName}.md`, 'text/markdown')
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

      {/* Add Mood Board */}
      <button
        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        onClick={handleAddMoodboard}
        onMouseEnter={handleItemHover}
      >
        <ImagePlus className="h-4 w-4" />
        <span>Add Mood Board</span>
      </button>

      {/* Add Notes */}
      <button
        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        onClick={handleAddNotes}
        onMouseEnter={handleItemHover}
      >
        <FileText className="h-4 w-4" />
        <span>Add Notes</span>
      </button>

      {/* Add Connector */}
      <button
        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        onClick={handleAddConnector}
        onMouseEnter={handleItemHover}
      >
        <Circle className="h-4 w-4" />
        <span>Add Connector</span>
      </button>

      {/* Document Nodes */}
      <div className="px-3 py-1 mt-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        Document Nodes
      </div>
      <button
        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        onClick={() => handleAddDocNode('spec', 'New Specification')}
        onMouseEnter={handleItemHover}
      >
        <ScrollText className="h-4 w-4" style={{ color: NODE_CONFIG.spec.color }} />
        <span>Add Specification</span>
      </button>
      <button
        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        onClick={() => handleAddDocNode('prd', 'New PRD')}
        onMouseEnter={handleItemHover}
      >
        <ClipboardList className="h-4 w-4" style={{ color: NODE_CONFIG.prd.color }} />
        <span>Add PRD</span>
      </button>
      <button
        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        onClick={() => handleAddDocNode('schema', 'New Schema')}
        onMouseEnter={handleItemHover}
      >
        <Braces className="h-4 w-4" style={{ color: NODE_CONFIG.schema.color }} />
        <span>Add Schema</span>
      </button>
      <button
        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        onClick={() => handleAddDocNode('prompt', 'New Prompt')}
        onMouseEnter={handleItemHover}
      >
        <Terminal className="h-4 w-4" style={{ color: NODE_CONFIG.prompt.color }} />
        <span>Add Prompt</span>
      </button>
      <button
        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        onClick={() => handleAddDocNode('reference', 'New Reference')}
        onMouseEnter={handleItemHover}
      >
        <ExternalLink className="h-4 w-4" style={{ color: NODE_CONFIG.reference.color }} />
        <span>Add Reference</span>
      </button>

      <div className="h-px bg-border mx-2 my-1" />

      {/* Add Blocks Edge */}
      <button
        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        onClick={handleAddBlocksEdge}
        onMouseEnter={handleItemHover}
      >
        <Ban className="h-4 w-4 text-red-500" />
        <span>Add &quot;Blocks&quot; Edge</span>
      </button>

      {/* Add Depends On Edge */}
      <button
        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        onClick={handleAddDependsOnEdge}
        onMouseEnter={handleItemHover}
      >
        <ArrowRight className="h-4 w-4 text-blue-500" />
        <span>Add &quot;Depends On&quot; Edge</span>
      </button>

      {/* Document Edge Types */}
      <div className="px-3 py-1 mt-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        Document Edges
      </div>
      <button
        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        onClick={() => handleAddEdge('informs')}
        onMouseEnter={handleItemHover}
      >
        <ArrowRight className="h-4 w-4 text-sky-500" />
        <span>Informs...</span>
      </button>
      <button
        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        onClick={() => handleAddEdge('defines')}
        onMouseEnter={handleItemHover}
      >
        <ArrowRight className="h-4 w-4 text-purple-500" />
        <span>Defines...</span>
      </button>
      <button
        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        onClick={() => handleAddEdge('implements')}
        onMouseEnter={handleItemHover}
      >
        <ArrowRight className="h-4 w-4 text-emerald-500" />
        <span>Implements...</span>
      </button>
      <button
        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        onClick={() => handleAddEdge('references')}
        onMouseEnter={handleItemHover}
      >
        <Link className="h-4 w-4 text-gray-500" />
        <span>References...</span>
      </button>
      <button
        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        onClick={() => handleAddEdge('supersedes')}
        onMouseEnter={handleItemHover}
      >
        <RotateCcw className="h-4 w-4 text-red-500" />
        <span>Supersedes...</span>
      </button>

      <div className="h-px bg-border mx-2 my-1" />

      {/* Copy Context for AI */}
      <button
        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        onClick={handleCopyContext}
        onMouseEnter={handleItemHover}
      >
        <Clipboard className="h-4 w-4" />
        <span>Copy Context for AI</span>
      </button>

      {/* Download as Markdown */}
      <button
        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        onClick={handleDownloadMarkdown}
        onMouseEnter={handleItemHover}
      >
        <Download className="h-4 w-4" />
        <span>Export as Markdown</span>
      </button>

      <div className="h-px bg-border mx-2 my-1" />

      {/* AI Actions */}
      <div className="px-3 py-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        AI Actions
      </div>
      <button
        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        onClick={() => { window.dispatchEvent(new CustomEvent('ai-iterate', { detail: { action: 'break_down', nodeId } })); onClose() }}
        onMouseEnter={handleItemHover}
      >
        <Sparkles className="h-4 w-4 text-primary" />
        <span>AI: Break Down</span>
      </button>
      <button
        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        onClick={() => { window.dispatchEvent(new CustomEvent('ai-iterate', { detail: { action: 'rewrite', nodeId } })); onClose() }}
        onMouseEnter={handleItemHover}
      >
        <Sparkles className="h-4 w-4 text-primary" />
        <span>AI: Rewrite</span>
      </button>
      <button
        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        onClick={() => { window.dispatchEvent(new CustomEvent('ai-iterate', { detail: { action: 'estimate', nodeId } })); onClose() }}
        onMouseEnter={handleItemHover}
      >
        <Sparkles className="h-4 w-4 text-primary" />
        <span>AI: Estimate</span>
      </button>
      <button
        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        onClick={() => { window.dispatchEvent(new CustomEvent('ai-iterate', { detail: { action: 'suggest_deps', nodeId } })); onClose() }}
        onMouseEnter={handleItemHover}
      >
        <Sparkles className="h-4 w-4 text-primary" />
        <span>AI: Suggest Dependencies</span>
      </button>

      <div className="h-px bg-border mx-2 my-1" />

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
