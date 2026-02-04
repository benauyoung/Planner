'use client'

import { useEffect, useCallback, useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, PanelLeftClose } from 'lucide-react'
import { useProject } from '@/hooks/use-project'
import { useProjectStore } from '@/stores/project-store'
import { useUIStore } from '@/stores/ui-store'
import { GraphCanvas } from '@/components/canvas/graph-canvas'
import { NodeDetailPanel } from '@/components/panels/node-detail-panel'
import { PlanningChat } from '@/components/chat/planning-chat'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface ProjectWorkspaceProps {
  projectId: string
}

export function ProjectWorkspace({ projectId }: ProjectWorkspaceProps) {
  useProject(projectId)
  const currentProject = useProjectStore((s) => s.currentProject)
  const [chatOpen, setChatOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentProject) setLoading(false)
    const timer = setTimeout(() => setLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [currentProject])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

      if (e.key === 'Escape') {
        useUIStore.getState().closeDetailPanel()
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedId = useUIStore.getState().selectedNodeId
        if (selectedId) {
          useProjectStore.getState().deleteNode(selectedId)
          useUIStore.getState().closeDetailPanel()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="space-y-4 w-64">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    )
  }

  if (!currentProject) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    )
  }

  if (currentProject.phase === 'planning') {
    return (
      <ReactFlowProvider>
        <div className="h-full flex">
          <div className="w-96 shrink-0 border-r">
            <PlanningChat />
          </div>
          <div className="flex-1 relative">
            {currentProject.nodes.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg font-medium">Your plan will appear here</p>
                  <p className="text-sm mt-1">
                    Describe your project idea in the chat to get started
                  </p>
                </div>
              </div>
            ) : (
              <GraphCanvas />
            )}
          </div>
          <NodeDetailPanel />
        </div>
      </ReactFlowProvider>
    )
  }

  return (
    <ReactFlowProvider>
      <div className="h-full flex">
        {/* Chat Panel */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 384, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="border-r overflow-hidden shrink-0"
            >
              <div className="w-96 h-full">
                <PlanningChat />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Canvas */}
        <div className="flex-1 relative">
          <GraphCanvas />
          <div className="absolute top-4 left-4 z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setChatOpen(!chatOpen)}
              title={chatOpen ? 'Close chat' : 'Open chat'}
            >
              {chatOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Detail Panel */}
        <NodeDetailPanel />
      </div>
    </ReactFlowProvider>
  )
}
