'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, PanelLeftClose } from 'lucide-react'
import { useProject } from '@/hooks/use-project'
import { useProjectStore } from '@/stores/project-store'
import { useChatStore } from '@/stores/chat-store'
import { useUIStore } from '@/stores/ui-store'
import { GraphCanvas } from '@/components/canvas/graph-canvas'
import { NodeDetailPanel } from '@/components/panels/node-detail-panel'
import { PlanningChat } from '@/components/chat/planning-chat'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TimelineBar } from '@/components/canvas/timeline-bar'
import { ShareButton } from '@/components/share/share-button'
import { CommandPalette } from '@/components/ui/command-palette'
import { ShortcutsHelp } from '@/components/ui/shortcuts-help'

interface ProjectWorkspaceProps {
  projectId: string
}

export function ProjectWorkspace({ projectId }: ProjectWorkspaceProps) {
  useProject(projectId)
  const currentProject = useProjectStore((s) => s.currentProject)
  const [chatOpen, setChatOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const commandPaletteOpen = useUIStore((s) => s.commandPaletteOpen)
  const shortcutsHelpOpen = useUIStore((s) => s.shortcutsHelpOpen)
  const reLayoutRef = useRef<(() => void) | null>(null)
  const fitViewRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (currentProject) {
      setLoading(false)
      return
    }
    const timer = setTimeout(() => setLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [currentProject])

  // Ensure chat phase is 'greeting' (not 'onboarding') for saved projects
  useEffect(() => {
    if (currentProject && useChatStore.getState().phase === 'onboarding') {
      useChatStore.getState().setPhase('greeting')
    }
  }, [currentProject])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
      const mod = e.ctrlKey || e.metaKey

      // Cmd+K — always open command palette
      if (mod && e.key === 'k') {
        e.preventDefault()
        useUIStore.getState().openCommandPalette()
        return
      }

      // Don't handle other shortcuts when typing in inputs
      if (isInput) return

      // ? — shortcuts help
      if (e.key === '?' && !mod) {
        e.preventDefault()
        useUIStore.getState().openShortcutsHelp()
        return
      }

      // Escape — close palette/help/detail panel
      if (e.key === 'Escape') {
        const ui = useUIStore.getState()
        if (ui.commandPaletteOpen) { ui.closeCommandPalette(); return }
        if (ui.shortcutsHelpOpen) { ui.closeShortcutsHelp(); return }
        ui.closeDetailPanel()
        return
      }

      // Undo / Redo
      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        useProjectStore.getState().undo()
        return
      }
      if (mod && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        e.preventDefault()
        useProjectStore.getState().redo()
        return
      }

      // Ctrl+E — toggle detail panel
      if (mod && e.key === 'e') {
        e.preventDefault()
        useUIStore.getState().toggleDetailPanel()
        return
      }

      // Ctrl+J — toggle chat
      if (mod && e.key === 'j') {
        e.preventDefault()
        setChatOpen((prev) => !prev)
        return
      }

      // Ctrl+L — re-layout
      if (mod && e.key === 'l') {
        e.preventDefault()
        reLayoutRef.current?.()
        return
      }

      // Ctrl+0 — fit view
      if (mod && e.key === '0') {
        e.preventDefault()
        fitViewRef.current?.()
        return
      }

      // Ctrl+B — blast radius
      if (mod && e.key === 'b') {
        e.preventDefault()
        const ui = useUIStore.getState()
        ui.setBlastRadiusMode(!ui.blastRadiusMode)
        return
      }

      // Ctrl+D — duplicate node
      if (mod && e.key === 'd') {
        e.preventDefault()
        const selectedId = useUIStore.getState().selectedNodeId
        if (selectedId) useProjectStore.getState().duplicateNode(selectedId, false)
        return
      }

      // Delete / Backspace — delete selected node
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedId = useUIStore.getState().selectedNodeId
        if (selectedId) {
          useProjectStore.getState().deleteNode(selectedId)
          useUIStore.getState().closeDetailPanel()
        }
        return
      }

      // 1-4 — set node status
      const selectedId = useUIStore.getState().selectedNodeId
      if (selectedId && !mod) {
        const statusMap: Record<string, 'not_started' | 'in_progress' | 'completed' | 'blocked'> = {
          '1': 'not_started',
          '2': 'in_progress',
          '3': 'completed',
          '4': 'blocked',
        }
        if (statusMap[e.key]) {
          e.preventDefault()
          useProjectStore.getState().updateNodeStatus(selectedId, statusMap[e.key])
          return
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        {/* Timeline bar skeleton */}
        <div className="border-b bg-background/80 px-4 py-2">
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center shrink-0">
                <div className="flex items-center gap-2 px-3 py-1.5">
                  <Skeleton
                    className="w-7 h-7 rounded-full"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                  <Skeleton
                    className="h-3 rounded"
                    style={{
                      width: [80, 100, 64][i],
                      animationDelay: `${i * 150 + 75}ms`,
                    }}
                  />
                </div>
                {i < 2 && <div className="w-8 h-px bg-border shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* Canvas area skeleton */}
        <div className="flex-1 relative bg-canvas overflow-hidden">
          {/* Dot grid background */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'radial-gradient(circle, hsl(var(--muted-foreground) / 0.3) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Chat toggle button skeleton */}
          <div className="absolute top-4 left-4 z-10">
            <Skeleton
              className="w-9 h-9 rounded-md"
              style={{ animationDelay: '600ms' }}
            />
          </div>

          {/* Skeleton node cards */}
          {[
            { top: '18%', left: '22%', w: 180, delay: 200 },
            { top: '40%', left: '50%', w: 160, delay: 400 },
            { top: '28%', left: '70%', w: 140, delay: 600 },
            { top: '62%', left: '35%', w: 170, delay: 800 },
          ].map((node, i) => (
            <div
              key={i}
              className="absolute"
              style={{ top: node.top, left: node.left }}
            >
              <div
                className="rounded-xl border bg-background/80 backdrop-blur-sm p-4 space-y-2.5 shadow-sm"
                style={{ width: node.w }}
              >
                <div className="flex items-center gap-2">
                  <Skeleton
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ animationDelay: `${node.delay}ms` }}
                  />
                  <Skeleton
                    className="h-3.5 flex-1 rounded"
                    style={{ animationDelay: `${node.delay + 100}ms` }}
                  />
                </div>
                <Skeleton
                  className="h-2.5 w-4/5 rounded"
                  style={{ animationDelay: `${node.delay + 200}ms` }}
                />
                <Skeleton
                  className="h-2.5 w-3/5 rounded"
                  style={{ animationDelay: `${node.delay + 300}ms` }}
                />
              </div>
            </div>
          ))}

          {/* Dashed connector lines between nodes */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line
              x1="30%" y1="24%" x2="54%" y2="44%"
              stroke="hsl(var(--muted-foreground) / 0.15)"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
            <line
              x1="58%" y1="44%" x2="74%" y2="34%"
              stroke="hsl(var(--muted-foreground) / 0.15)"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
            <line
              x1="54%" y1="48%" x2="42%" y2="66%"
              stroke="hsl(var(--muted-foreground) / 0.15)"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
          </svg>
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
          <div className="flex-1 flex flex-col min-h-0">
            {currentProject.nodes.length > 0 && <TimelineBar />}
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
          </div>
          <NodeDetailPanel />
        </div>
        <CommandPalette
          open={commandPaletteOpen}
          onClose={() => useUIStore.getState().closeCommandPalette()}
          toggleChat={() => setChatOpen((prev) => !prev)}
        />
        <ShortcutsHelp
          open={shortcutsHelpOpen}
          onClose={() => useUIStore.getState().closeShortcutsHelp()}
        />
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
        <div className="flex-1 flex flex-col min-h-0">
          <TimelineBar />
          <div className="flex-1 relative">
            <GraphCanvas />
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
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
              <ShareButton />
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        <NodeDetailPanel />
      </div>
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => useUIStore.getState().closeCommandPalette()}
        toggleChat={() => setChatOpen((prev) => !prev)}
      />
      <ShortcutsHelp
        open={shortcutsHelpOpen}
        onClose={() => useUIStore.getState().closeShortcutsHelp()}
      />
    </ReactFlowProvider>
  )
}
