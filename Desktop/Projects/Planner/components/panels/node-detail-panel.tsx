'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Copy, ChevronDown, ChevronRight, Plus } from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { useProjectStore } from '@/stores/project-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NodeEditForm } from './node-edit-form'
import { NODE_CONFIG, STATUS_COLORS, NODE_CHILD_TYPE } from '@/lib/constants'
import type { NodeStatus, NodeType } from '@/types/project'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS: { value: NodeStatus; label: string }[] = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'blocked', label: 'Blocked' },
]

const TYPE_OPTIONS: NodeType[] = ['goal', 'subgoal', 'feature', 'task']

export function NodeDetailPanel() {
  const { selectedNodeId, detailPanelOpen, closeDetailPanel } = useUIStore()
  const currentProject = useProjectStore((s) => s.currentProject)
  const updateNodeStatus = useProjectStore((s) => s.updateNodeStatus)
  const deleteNode = useProjectStore((s) => s.deleteNode)
  const toggleNodeCollapse = useProjectStore((s) => s.toggleNodeCollapse)
  const addChildNode = useProjectStore((s) => s.addChildNode)
  const duplicateNode = useProjectStore((s) => s.duplicateNode)
  const changeNodeType = useProjectStore((s) => s.changeNodeType)

  const [addingChild, setAddingChild] = useState(false)
  const [childTitle, setChildTitle] = useState('')

  const node = currentProject?.nodes.find((n) => n.id === selectedNodeId)
  const parent = node?.parentId
    ? currentProject?.nodes.find((n) => n.id === node.parentId)
    : null
  const children = currentProject?.nodes.filter((n) => n.parentId === selectedNodeId) || []
  const childType = node ? NODE_CHILD_TYPE[node.type] : null

  function handleAddChild() {
    if (!node || !childTitle.trim()) return
    const newId = addChildNode(node.id, childTitle.trim())
    setChildTitle('')
    setAddingChild(false)
    if (newId) {
      useUIStore.getState().selectNode(newId)
    }
  }

  function handleDuplicate() {
    if (!node) return
    const newId = duplicateNode(node.id, true)
    if (newId) {
      useUIStore.getState().selectNode(newId)
    }
  }

  return (
    <AnimatePresence>
      {detailPanelOpen && node && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          className="w-80 border-l bg-background h-full overflow-y-auto shrink-0"
        >
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <Badge className={NODE_CONFIG[node.type].badgeClass}>
                {NODE_CONFIG[node.type].label}
              </Badge>
              <Button variant="ghost" size="icon" onClick={closeDetailPanel}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Edit form */}
            <NodeEditForm
              nodeId={node.id}
              title={node.title}
              description={node.description}
            />

            {/* Node Type */}
            <div className="mt-4">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Type
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TYPE_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => changeNodeType(node.id, t)}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border transition-colors',
                      node.type === t
                        ? 'border-primary bg-primary/10 font-medium'
                        : 'hover:bg-accent'
                    )}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: NODE_CONFIG[t].color }}
                    />
                    {NODE_CONFIG[t].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="mt-4">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Status
              </label>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateNodeStatus(node.id, opt.value)}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border transition-colors',
                      node.status === opt.value
                        ? 'border-primary bg-primary/10 font-medium'
                        : 'hover:bg-accent'
                    )}
                  >
                    <div className={cn('w-2 h-2 rounded-full', STATUS_COLORS[opt.value])} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Parent */}
            {parent && (
              <div className="mt-4">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Parent
                </label>
                <p className="text-sm">{parent.title}</p>
              </div>
            )}

            {/* Children */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Children ({children.length})
                </label>
                {children.length > 0 && (
                  <button
                    onClick={() => toggleNodeCollapse(node.id)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {node.collapsed ? (
                      <ChevronRight className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                    {node.collapsed ? 'Expand' : 'Collapse'}
                  </button>
                )}
              </div>
              {children.length > 0 && (
                <div className="space-y-1">
                  {children.map((child) => (
                    <div
                      key={child.id}
                      className="text-sm flex items-center gap-2 p-1.5 rounded hover:bg-accent cursor-pointer"
                      onClick={() => useUIStore.getState().selectNode(child.id)}
                    >
                      <div className={cn('w-2 h-2 rounded-full', STATUS_COLORS[child.status])} />
                      {child.title}
                    </div>
                  ))}
                </div>
              )}
              {childType && (
                <>
                  {addingChild ? (
                    <div className="mt-2 flex gap-1.5">
                      <input
                        autoFocus
                        value={childTitle}
                        onChange={(e) => setChildTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddChild()
                          if (e.key === 'Escape') { setAddingChild(false); setChildTitle('') }
                        }}
                        placeholder={`${NODE_CONFIG[childType].label} title...`}
                        className="flex-1 text-sm px-2 py-1 rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={handleAddChild}>
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => { setAddingChild(false); setChildTitle('') }}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingChild(true)}
                      className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add {NODE_CONFIG[childType].label}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Danger zone */}
            <div className="mt-6 pt-4 border-t flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleDuplicate}
              >
                <Copy className="h-4 w-4" />
                Duplicate
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={() => {
                  deleteNode(node.id)
                  closeDetailPanel()
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
