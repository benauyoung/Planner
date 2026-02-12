'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  ArrowRight,
  Undo2,
  Redo2,
  Trash2,
  Copy,
  Eye,
  MessageSquare,
  Layout,
  Target,
  Compass,
  Sun,
  Moon,
  Maximize2,
  Zap,
  Circle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Command as CommandIcon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProjectStore } from '@/stores/project-store'
import { useUIStore } from '@/stores/ui-store'
import { buildCommands, fuzzyMatch, type Command as AppCommand, type CommandContext } from '@/lib/commands'

const CATEGORY_ORDER = ['node', 'canvas', 'view', 'project', 'navigation', 'ai'] as const
const CATEGORY_LABELS: Record<string, string> = {
  navigation: 'Navigation',
  node: 'Node',
  canvas: 'Canvas',
  project: 'Project',
  view: 'View',
  ai: 'AI',
}

const ICON_MAP: Record<string, React.ReactNode> = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  'nav:dashboard': <ArrowRight className="h-4 w-4" />,
  'project:undo': <Undo2 className="h-4 w-4" />,
  'project:redo': <Redo2 className="h-4 w-4" />,
  'view:toggle-detail': <Eye className="h-4 w-4" />,
  'view:toggle-chat': <MessageSquare className="h-4 w-4" />,
  'view:toggle-theme': <Sun className="h-4 w-4" />,
  'canvas:relayout': <Layout className="h-4 w-4" />,
  'canvas:fit-view': <Maximize2 className="h-4 w-4" />,
  'canvas:blast-radius': <Zap className="h-4 w-4" />,
  'node:delete': <Trash2 className="h-4 w-4" />,
  'node:duplicate': <Copy className="h-4 w-4" />,
  'node:duplicate-tree': <Copy className="h-4 w-4" />,
  'node:status-not-started': <Circle className="h-4 w-4" />,
  'node:status-in-progress': <Clock className="h-4 w-4" />,
  'node:status-completed': <CheckCircle2 className="h-4 w-4" />,
  'node:status-blocked': <AlertCircle className="h-4 w-4" />,
} as const

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  reLayout?: () => void
  fitView?: () => void
  toggleChat?: () => void
}

export function CommandPalette({ open, onClose, reLayout, fitView, toggleChat }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const currentProject = useProjectStore((s) => s.currentProject)
  const selectedNodeId = useUIStore((s) => s.selectedNodeId)
  const blastRadiusMode = useUIStore((s) => s.blastRadiusMode)
  const theme = useUIStore((s) => s.theme)

  const ctx: CommandContext = useMemo(
    () => ({
      hasProject: !!currentProject,
      hasSelection: !!selectedNodeId,
      selectedNodeId,
      navigate: (path: string) => router.push(path),
      undo: () => useProjectStore.getState().undo(),
      redo: () => useProjectStore.getState().redo(),
      canUndo: useProjectStore.getState().canUndo,
      canRedo: useProjectStore.getState().canRedo,
      deleteNode: (id: string) => useProjectStore.getState().deleteNode(id),
      duplicateNode: (id: string, children: boolean) =>
        useProjectStore.getState().duplicateNode(id, children),
      selectNode: (id: string | null) => useUIStore.getState().selectNode(id),
      closeDetailPanel: () => useUIStore.getState().closeDetailPanel(),
      toggleDetailPanel: () => useUIStore.getState().toggleDetailPanel(),
      toggleBlastRadius: () =>
        useUIStore.getState().setBlastRadiusMode(!blastRadiusMode),
      reLayout: reLayout || (() => {}),
      toggleChat: toggleChat || (() => {}),
      toggleTheme: () => {
        const next = theme === 'dark' ? 'light' : 'dark'
        useUIStore.getState().setTheme(next)
        document.documentElement.classList.toggle('dark', next === 'dark')
        localStorage.setItem('visionpath-theme', next)
      },
      setNodeStatus: (id: string, status) =>
        useProjectStore.getState().updateNodeStatus(id, status),
      fitView: fitView || (() => {}),
      allNodes: (currentProject?.nodes || []).map((n) => ({
        id: n.id,
        title: n.title,
        type: n.type,
      })),
    }),
    [currentProject, selectedNodeId, blastRadiusMode, theme, router, reLayout, fitView, toggleChat]
  )

  const allCommands = useMemo(() => buildCommands(ctx), [ctx])

  const filtered = useMemo(() => {
    if (!query.trim()) {
      // Show non-jump commands when no query
      return allCommands.filter((c) => !c.id.startsWith('jump:'))
    }
    return allCommands
      .map((c) => {
        const { match, score } = fuzzyMatch(query, c.label)
        return { command: c, match, score }
      })
      .filter((r) => r.match)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.command)
  }, [allCommands, query])

  const grouped = useMemo(() => {
    const groups: Record<string, AppCommand[]> = {}
    for (const cmd of filtered) {
      if (!groups[cmd.category]) groups[cmd.category] = []
      groups[cmd.category].push(cmd)
    }
    return CATEGORY_ORDER
      .filter((cat) => groups[cat]?.length)
      .map((cat) => ({ category: cat, commands: groups[cat] }))
  }, [filtered])

  // Flatten for keyboard navigation
  const flatList = useMemo(() => grouped.flatMap((g) => g.commands), [grouped])

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return
    const selected = listRef.current.querySelector('[data-selected="true"]')
    selected?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  const executeCommand = useCallback(
    (cmd: AppCommand) => {
      onClose()
      // Small delay so the palette closes before action executes
      setTimeout(() => cmd.action(), 50)
    },
    [onClose]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, flatList.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (flatList[selectedIndex]) {
          executeCommand(flatList[selectedIndex])
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    },
    [flatList, selectedIndex, executeCommand, onClose]
  )

  if (!open) return null

  let globalIdx = 0

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-[101]"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <div className="bg-background border rounded-xl shadow-2xl overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  autoComplete="off"
                  spellCheck={false}
                />
                <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted rounded">
                  ESC
                </kbd>
              </div>

              {/* Command list */}
              <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
                {grouped.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No matching commands
                  </div>
                )}

                {grouped.map((group) => (
                  <div key={group.category}>
                    <div className="px-4 py-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      {CATEGORY_LABELS[group.category]}
                    </div>
                    {group.commands.map((cmd) => {
                      const idx = globalIdx++
                      const isSelected = idx === selectedIndex
                      return (
                        <button
                          key={cmd.id}
                          data-selected={isSelected}
                          className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${
                            isSelected
                              ? 'bg-primary/10 text-primary'
                              : 'text-foreground hover:bg-muted/50'
                          }`}
                          onClick={() => executeCommand(cmd)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                        >
                          <span className="text-muted-foreground shrink-0">
                            {ICON_MAP[cmd.id] ||
                              (cmd.id.startsWith('jump:') ? (
                                <Compass className="h-4 w-4" />
                              ) : (
                                <CommandIcon className="h-4 w-4" />
                              ))}
                          </span>
                          <span className="flex-1 truncate">{cmd.label}</span>
                          {cmd.shortcut && (
                            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[11px] font-mono text-muted-foreground">
                              {cmd.shortcut.split('+').map((key: string, i: number) => (
                                <span
                                  key={i}
                                  className="px-1 py-0.5 bg-muted rounded text-[10px]"
                                >
                                  {key === 'Ctrl' ? '⌘' : key}
                                </span>
                              ))}
                            </kbd>
                          )}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-4 px-4 py-2 border-t text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">↑↓</kbd> navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">↵</kbd> select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">esc</kbd> close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
