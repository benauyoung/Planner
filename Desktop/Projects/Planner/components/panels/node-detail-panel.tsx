'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2 } from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { useProjectStore } from '@/stores/project-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NodeEditForm } from './node-edit-form'
import { NODE_CONFIG, STATUS_COLORS } from '@/lib/constants'
import type { NodeStatus } from '@/types/project'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS: { value: NodeStatus; label: string }[] = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'blocked', label: 'Blocked' },
]

export function NodeDetailPanel() {
  const { selectedNodeId, detailPanelOpen, closeDetailPanel } = useUIStore()
  const currentProject = useProjectStore((s) => s.currentProject)
  const updateNodeStatus = useProjectStore((s) => s.updateNodeStatus)
  const deleteNode = useProjectStore((s) => s.deleteNode)

  const node = currentProject?.nodes.find((n) => n.id === selectedNodeId)
  const parent = node?.parentId
    ? currentProject?.nodes.find((n) => n.id === node.parentId)
    : null
  const children = currentProject?.nodes.filter((n) => n.parentId === selectedNodeId) || []

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
            <div className="flex items-center justify-between mb-4">
              <Badge className={NODE_CONFIG[node.type].badgeClass}>
                {NODE_CONFIG[node.type].label}
              </Badge>
              <Button variant="ghost" size="icon" onClick={closeDetailPanel}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <NodeEditForm
              nodeId={node.id}
              title={node.title}
              description={node.description}
            />

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

            {parent && (
              <div className="mt-4">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Parent
                </label>
                <p className="text-sm">{parent.title}</p>
              </div>
            )}

            {children.length > 0 && (
              <div className="mt-4">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Children ({children.length})
                </label>
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
              </div>
            )}

            <div className="mt-6 pt-4 border-t">
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => {
                  deleteNode(node.id)
                  closeDetailPanel()
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete Node
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
