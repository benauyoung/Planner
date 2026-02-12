'use client'

import { useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import {
  Target,
  GitBranch,
  Puzzle,
  CheckSquare,
  ImagePlus,
  FileText,
  Circle,
  ArrowRight,
  ScrollText,
  ClipboardList,
  Braces,
  Terminal,
  ExternalLink,
} from 'lucide-react'
import { NODE_CONFIG } from '@/lib/constants'
import { useProjectStore } from '@/stores/project-store'
import { useUIStore } from '@/stores/ui-store'
import type { NodeType } from '@/types/project'

interface PaneContextMenuProps {
  position: { x: number; y: number }
  canvasPosition: { x: number; y: number }
  onClose: () => void
}

const NODE_OPTIONS: { type: NodeType; icon: React.ReactNode; group?: string }[] = [
  { type: 'goal', icon: <Target className="h-4 w-4" /> },
  { type: 'subgoal', icon: <GitBranch className="h-4 w-4" /> },
  { type: 'feature', icon: <Puzzle className="h-4 w-4" /> },
  { type: 'task', icon: <CheckSquare className="h-4 w-4" /> },
  { type: 'moodboard', icon: <ImagePlus className="h-4 w-4" /> },
  { type: 'notes', icon: <FileText className="h-4 w-4" /> },
  { type: 'connector', icon: <Circle className="h-4 w-4" /> },
  { type: 'spec', icon: <ScrollText className="h-4 w-4" />, group: 'Document Nodes' },
  { type: 'prd', icon: <ClipboardList className="h-4 w-4" /> },
  { type: 'schema', icon: <Braces className="h-4 w-4" /> },
  { type: 'prompt', icon: <Terminal className="h-4 w-4" /> },
  { type: 'reference', icon: <ExternalLink className="h-4 w-4" /> },
]

// Hierarchy: which node type can be a parent for which child type
const PARENT_TYPE_MAP: Partial<Record<NodeType, NodeType[]>> = {
  subgoal: ['goal'],
  feature: ['subgoal', 'goal'],
  task: ['feature', 'subgoal'],
  spec: ['goal', 'subgoal'],
  prd: ['spec', 'feature'],
  schema: ['spec', 'prd'],
  prompt: ['prd', 'schema', 'feature', 'task'],
}

export function PaneContextMenu({ position, canvasPosition, onClose }: PaneContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const nodes = useProjectStore((s) => s.currentProject?.nodes ?? [])
  const flowNodes = useProjectStore((s) => s.flowNodes)

  // Find the best parent for a given node type based on proximity to click position
  const suggestParent = useMemo(() => {
    return (type: NodeType): string | null => {
      const validParentTypes = PARENT_TYPE_MAP[type]
      if (!validParentTypes) return null

      const candidates = nodes.filter((n) => validParentTypes.includes(n.type))
      if (candidates.length === 0) return null

      // Find the closest candidate by flow position distance
      let closestId: string | null = null
      let closestDist = Infinity
      for (const c of candidates) {
        const flowNode = flowNodes.find((fn) => fn.id === c.id)
        if (!flowNode) continue
        const dx = flowNode.position.x - canvasPosition.x
        const dy = flowNode.position.y - canvasPosition.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < closestDist) {
          closestDist = dist
          closestId = c.id
        }
      }
      return closestId
    }
  }, [nodes, flowNodes, canvasPosition])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as HTMLElement)) {
        onClose()
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const handleCreate = (type: NodeType, autoConnect: boolean) => {
    const config = NODE_CONFIG[type]
    const parentId = autoConnect ? suggestParent(type) : null
    const newId = useProjectStore.getState().addFreeNode(type, `New ${config.label}`, parentId)
    if (newId) {
      // Set position on the flow node
      const { flowNodes: currentFlowNodes } = useProjectStore.getState()
      const updated = currentFlowNodes.map((n) =>
        n.id === newId ? { ...n, position: canvasPosition } : n
      )
      useProjectStore.getState().setFlowNodes(updated)
      useUIStore.getState().selectNode(newId)
    }
    onClose()
  }

  // Adjust position to stay in viewport
  const menuStyle: React.CSSProperties = {
    left: Math.min(position.x, window.innerWidth - 220),
    top: Math.min(position.y, window.innerHeight - 400),
  }

  const content = (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
      className="fixed z-50 min-w-[200px] rounded-lg border bg-background/95 backdrop-blur-sm shadow-lg py-1.5"
      style={menuStyle}
    >
      <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Add Node
      </div>
      {NODE_OPTIONS.map(({ type, icon, group }) => {
        const parentId = suggestParent(type)
        const parentNode = parentId ? nodes.find((n) => n.id === parentId) : null
        return (
          <div key={type}>
            {group && (
              <>
                <div className="h-px bg-border mx-2 my-1" />
                <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group}
                </div>
              </>
            )}
            <div className="flex items-center">
              <button
                className="flex items-center gap-2.5 flex-1 px-3 py-1.5 text-sm hover:bg-accent transition-colors"
                onClick={() => handleCreate(type, false)}
              >
                <div style={{ color: NODE_CONFIG[type].color }}>{icon}</div>
                <span>{NODE_CONFIG[type].label}</span>
              </button>
              {parentNode && (
                <button
                  className="px-2 py-1.5 hover:bg-accent transition-colors group/connect"
                  onClick={() => handleCreate(type, true)}
                  title={`Auto-connect to "${parentNode.title}"`}
                >
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover/connect:text-primary transition-colors" />
                </button>
              )}
            </div>
          </div>
        )
      })}
      {nodes.length > 0 && (
        <div className="px-3 py-1 mt-1 border-t">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
            <ArrowRight className="h-3 w-3" /> = auto-connect to nearest parent
          </p>
        </div>
      )}
    </motion.div>
  )

  if (typeof document === 'undefined') return null
  return createPortal(content, document.body)
}
