'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { ReactFlowProvider } from '@xyflow/react'
import { motion, AnimatePresence } from 'framer-motion'
// Icons moved to ProjectToolbar
import { useProject } from '@/hooks/use-project'
import { useProjectStore } from '@/stores/project-store'
import { useChatStore } from '@/stores/chat-store'
import { useUIStore } from '@/stores/ui-store'
import { ErrorBoundary } from '@/components/error-boundary'
import { NodeDetailPanel } from '@/components/panels/node-detail-panel'
import { PrdPipelinePanel } from '@/components/panels/prd-pipeline-panel'
import { PlanningChat } from '@/components/chat/planning-chat'
import { Skeleton } from '@/components/ui/skeleton'
import { ProjectToolbar } from '@/components/project/project-toolbar'
import { CommandPalette } from '@/components/ui/command-palette'
import { ShortcutsHelp } from '@/components/ui/shortcuts-help'
import { AISuggestionsPanel } from '@/components/ai/ai-suggestions-panel'
import { useAIIterate, type AISuggestion } from '@/hooks/use-ai-iterate'
import { TeamManager } from '@/components/project/team-manager'
import { SmartSuggestionsPanel } from '@/components/ai/smart-suggestions-panel'
import { VersionHistory } from '@/components/versions/version-history'
import { IntegrationSettings } from '@/components/integrations/integration-settings'
import { useAISuggestions } from '@/hooks/use-ai-suggestions'
import type { IterationAction } from '@/prompts/iteration-system'

function ViewSkeleton() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
    </div>
  )
}

const GraphCanvas = dynamic(
  () => import('@/components/canvas/graph-canvas').then(m => ({ default: m.GraphCanvas })),
  { ssr: false, loading: () => <ViewSkeleton /> }
)
const DesignView = dynamic(
  () => import('@/components/views/design-view').then(m => ({ default: m.DesignView })),
  { ssr: false, loading: () => <ViewSkeleton /> }
)
const AgentsView = dynamic(
  () => import('@/components/views/agents-view').then(m => ({ default: m.AgentsView })),
  { ssr: false, loading: () => <ViewSkeleton /> }
)
const BackendView = dynamic(
  () => import('@/components/views/backend-view').then(m => ({ default: m.BackendView })),
  { ssr: false, loading: () => <ViewSkeleton /> }
)
const ListView = dynamic(
  () => import('@/components/views/list-view').then(m => ({ default: m.ListView })),
  { ssr: false, loading: () => <ViewSkeleton /> }
)
const TableView = dynamic(
  () => import('@/components/views/table-view').then(m => ({ default: m.TableView })),
  { ssr: false, loading: () => <ViewSkeleton /> }
)
const BoardView = dynamic(
  () => import('@/components/views/board-view').then(m => ({ default: m.BoardView })),
  { ssr: false, loading: () => <ViewSkeleton /> }
)
const TimelineView = dynamic(
  () => import('@/components/views/timeline-view').then(m => ({ default: m.TimelineView })),
  { ssr: false, loading: () => <ViewSkeleton /> }
)
const SprintBoard = dynamic(
  () => import('@/components/sprints/sprint-board').then(m => ({ default: m.SprintBoard })),
  { ssr: false, loading: () => <ViewSkeleton /> }
)
const StepsView = dynamic(
  () => import('@/components/views/steps-view').then(m => ({ default: m.StepsView })),
  { ssr: false, loading: () => <ViewSkeleton /> }
)

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
  const currentView = useUIStore((s) => s.currentView)
  const manageSubView = useUIStore((s) => s.manageSubView)
  const planSubView = useUIStore((s) => s.planSubView)
  const reLayoutRef = useRef<(() => void) | null>(null)
  const fitViewRef = useRef<(() => void) | null>(null)
  const { iterate, applySuggestion, applyAll, clearResult, loading: aiLoading, result: aiResult, error: aiError } = useAIIterate()
  const [aiPanelOpen, setAIPanelOpen] = useState(false)
  const [teamManagerOpen, setTeamManagerOpen] = useState(false)
  const [smartPanelOpen, setSmartPanelOpen] = useState(false)
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false)
  const [integrationsOpen, setIntegrationsOpen] = useState(false)
  const { suggestions: smartSuggestions, loading: smartLoading, error: smartError, analyze: smartAnalyze, dismiss: smartDismiss, clear: smartClear } = useAISuggestions()
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set())
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (currentProject) {
      setLoading(false)
      return
    }
    const timer = setTimeout(() => setLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [currentProject])

  // Listen for AI iteration events from context menu
  useEffect(() => {
    function handleAIIterate(e: Event) {
      const detail = (e as CustomEvent).detail as { action: IterationAction; nodeId: string }
      setAIPanelOpen(true)
      setDismissedSuggestions(new Set())
      setAppliedSuggestions(new Set())
      iterate(detail.action, detail.nodeId)
    }
    window.addEventListener('ai-iterate', handleAIIterate)
    return () => window.removeEventListener('ai-iterate', handleAIIterate)
  }, [iterate])

  const handleApplySuggestion = useCallback((s: AISuggestion) => {
    applySuggestion(s)
    setAppliedSuggestions((prev) => new Set(prev).add(s.id))
  }, [applySuggestion])

  const handleApplyAll = useCallback((suggestions: AISuggestion[]) => {
    applyAll(suggestions)
    setAppliedSuggestions((prev) => {
      const next = new Set(prev)
      suggestions.forEach((s) => next.add(s.id))
      return next
    })
  }, [applyAll])

  const handleDismissSuggestion = useCallback((id: string) => {
    setDismissedSuggestions((prev) => new Set(prev).add(id))
  }, [])

  const handleCloseAIPanel = useCallback(() => {
    setAIPanelOpen(false)
    clearResult()
    setDismissedSuggestions(new Set())
    setAppliedSuggestions(new Set())
  }, [clearResult])

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

      // Escape — close palette/help/detail panel/multi-selection
      if (e.key === 'Escape') {
        const ui = useUIStore.getState()
        if (ui.commandPaletteOpen) { ui.closeCommandPalette(); return }
        if (ui.shortcutsHelpOpen) { ui.closeShortcutsHelp(); return }
        if (ui.selectedNodeIds.size > 1) { ui.clearSelection(); return }
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

      // Ctrl+T — territory sync
      if (mod && e.key === 't') {
        e.preventDefault()
        const ui = useUIStore.getState()
        ui.setTerritorySyncOpen(!ui.territorySyncOpen)
        return
      }

      // Ctrl+A — select all visible nodes
      if (mod && e.key === 'a') {
        e.preventDefault()
        const allIds = useProjectStore.getState().flowNodes.map((n) => n.id)
        if (allIds.length > 0) useUIStore.getState().setSelectedNodes(allIds)
        return
      }

      // Ctrl+D — duplicate node(s)
      if (mod && e.key === 'd') {
        e.preventDefault()
        const ui = useUIStore.getState()
        if (ui.selectedNodeIds.size > 1) {
          useProjectStore.getState().duplicateNodes(Array.from(ui.selectedNodeIds))
        } else if (ui.selectedNodeId) {
          useProjectStore.getState().duplicateNode(ui.selectedNodeId, false)
        }
        return
      }

      // Delete / Backspace — delete selected node(s)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const ui = useUIStore.getState()
        if (ui.selectedNodeIds.size > 1) {
          useProjectStore.getState().deleteNodes(Array.from(ui.selectedNodeIds))
          ui.clearSelection()
        } else if (ui.selectedNodeId) {
          useProjectStore.getState().deleteNode(ui.selectedNodeId)
          ui.closeDetailPanel()
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
        <div className="text-center max-w-md space-y-3">
          <h3 className="text-lg font-semibold">Project not found</h3>
          <p className="text-sm text-muted-foreground">
            This project couldn&apos;t be loaded. It may have been deleted, or the database connection failed.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <a href="/dashboard" className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              Back to Dashboard
            </a>
            <a href="/project/new" className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors">
              New Project
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ReactFlowProvider>
      <div className="h-full flex flex-col">
        {/* Project Toolbar — always visible */}
        <ProjectToolbar
          chatOpen={chatOpen}
          onToggleChat={() => setChatOpen((prev) => !prev)}
          onOpenTeamManager={() => setTeamManagerOpen(true)}
          onOpenSmartSuggestions={() => { setSmartPanelOpen(true); smartAnalyze() }}
          onOpenVersionHistory={() => setVersionHistoryOpen(true)}
          onOpenIntegrations={() => setIntegrationsOpen(true)}
        />

        <div className="flex-1 flex min-h-0">
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

          {/* Main content area */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 relative overflow-hidden">
              {currentView === 'plan' && (
                currentProject.nodes.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <p className="text-lg font-medium">Your plan will appear here</p>
                      <p className="text-sm mt-1">
                        Open the chat to describe your project idea, or add nodes manually
                      </p>
                    </div>
                  </div>
                ) : planSubView === 'steps' ? (
                  <ErrorBoundary compact><StepsView /></ErrorBoundary>
                ) : (
                  <ErrorBoundary compact><GraphCanvas /></ErrorBoundary>
                )
              )}
              {currentView === 'manage' && (
                <>
                  {manageSubView === 'list' && <ErrorBoundary compact><ListView /></ErrorBoundary>}
                  {manageSubView === 'table' && <ErrorBoundary compact><TableView /></ErrorBoundary>}
                  {manageSubView === 'board' && <ErrorBoundary compact><BoardView /></ErrorBoundary>}
                  {manageSubView === 'timeline' && <ErrorBoundary compact><TimelineView /></ErrorBoundary>}
                  {manageSubView === 'sprints' && <ErrorBoundary compact><SprintBoard /></ErrorBoundary>}
                  {manageSubView === 'backend' && <ErrorBoundary compact><BackendView /></ErrorBoundary>}
                </>
              )}
              {currentView === 'design' && <ErrorBoundary compact><DesignView /></ErrorBoundary>}
              {currentView === 'agents' && <ErrorBoundary compact><AgentsView /></ErrorBoundary>}
            </div>
          </div>

          {/* Detail Panel */}
          <NodeDetailPanel />

          {/* PRD Pipeline Panel */}
          <PrdPipelinePanel />

          {/* AI Suggestions Panel */}
          {aiPanelOpen && (
            <AISuggestionsPanel
              result={aiResult}
              loading={aiLoading}
              error={aiError}
              onApply={handleApplySuggestion}
              onApplyAll={handleApplyAll}
              onDismiss={handleDismissSuggestion}
              onClose={handleCloseAIPanel}
              dismissed={dismissedSuggestions}
              applied={appliedSuggestions}
            />
          )}

          {/* Smart Suggestions Panel */}
          {smartPanelOpen && (
            <SmartSuggestionsPanel
              suggestions={smartSuggestions}
              loading={smartLoading}
              error={smartError}
              onAnalyze={smartAnalyze}
              onDismiss={smartDismiss}
              onClose={() => setSmartPanelOpen(false)}
            />
          )}
        </div>
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
      <TeamManager
        open={teamManagerOpen}
        onClose={() => setTeamManagerOpen(false)}
      />
      <VersionHistory
        open={versionHistoryOpen}
        onClose={() => setVersionHistoryOpen(false)}
      />
      <IntegrationSettings
        open={integrationsOpen}
        onClose={() => setIntegrationsOpen(false)}
      />
    </ReactFlowProvider>
  )
}
