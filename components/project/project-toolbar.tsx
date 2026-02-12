'use client'

import { useState, useEffect, useRef } from 'react'
import {
  MessageSquare,
  PanelLeftClose,
  Users,
  Lightbulb,
  History,
  Plug,
  Check,
  Loader2,
  ArrowLeft,
  LayoutGrid,
  List,
  Table2,
  Columns3,
  GanttChart,
  Zap,
  Search,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShareButton } from '@/components/share/share-button'
import { useProjectStore } from '@/stores/project-store'
import { useUIStore, type ViewType } from '@/stores/ui-store'
import { cn } from '@/lib/utils'
import type { NodeType, NodeStatus } from '@/types/project'

const VIEW_OPTIONS: { value: ViewType; label: string; icon: React.ReactNode }[] = [
  { value: 'canvas', label: 'Canvas', icon: <LayoutGrid className="h-3.5 w-3.5" /> },
  { value: 'list', label: 'List', icon: <List className="h-3.5 w-3.5" /> },
  { value: 'table', label: 'Table', icon: <Table2 className="h-3.5 w-3.5" /> },
  { value: 'board', label: 'Board', icon: <Columns3 className="h-3.5 w-3.5" /> },
  { value: 'timeline', label: 'Timeline', icon: <GanttChart className="h-3.5 w-3.5" /> },
  { value: 'sprints', label: 'Sprints', icon: <Zap className="h-3.5 w-3.5" /> },
]

const TYPE_OPTIONS: { value: NodeType; label: string }[] = [
  { value: 'goal', label: 'Goal' },
  { value: 'subgoal', label: 'Subgoal' },
  { value: 'feature', label: 'Feature' },
  { value: 'task', label: 'Task' },
  { value: 'moodboard', label: 'Mood Board' },
  { value: 'notes', label: 'Notes' },
  { value: 'connector', label: 'Connector' },
]

const STATUS_OPTIONS: { value: NodeStatus; label: string; color: string }[] = [
  { value: 'not_started', label: 'Not Started', color: '#9ca3af' },
  { value: 'in_progress', label: 'In Progress', color: '#3b82f6' },
  { value: 'completed', label: 'Completed', color: '#22c55e' },
  { value: 'blocked', label: 'Blocked', color: '#ef4444' },
]

interface ProjectToolbarProps {
  chatOpen: boolean
  onToggleChat: () => void
  onOpenTeamManager: () => void
  onOpenSmartSuggestions: () => void
  onOpenVersionHistory: () => void
  onOpenIntegrations: () => void
}

type SaveStatus = 'saved' | 'saving' | 'unsaved'

export function ProjectToolbar({
  chatOpen,
  onToggleChat,
  onOpenTeamManager,
  onOpenSmartSuggestions,
  onOpenVersionHistory,
  onOpenIntegrations,
}: ProjectToolbarProps) {
  const currentProject = useProjectStore((s) => s.currentProject)
  const updateProjectTitle = useProjectStore((s) => s.updateProjectTitle)
  const currentView = useUIStore((s) => s.currentView)
  const setCurrentView = useUIStore((s) => s.setCurrentView)
  const searchQuery = useUIStore((s) => s.searchQuery)
  const setSearchQuery = useUIStore((s) => s.setSearchQuery)
  const filterType = useUIStore((s) => s.filterType)
  const setFilterType = useUIStore((s) => s.setFilterType)
  const filterStatus = useUIStore((s) => s.filterStatus)
  const setFilterStatus = useUIStore((s) => s.setFilterStatus)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const prevProjectRef = useRef<string>('')

  const hasFilters = searchQuery || filterType || filterStatus

  // Track save status based on project changes
  useEffect(() => {
    if (!currentProject) return
    const serialized = JSON.stringify(currentProject)
    if (prevProjectRef.current && serialized !== prevProjectRef.current) {
      setSaveStatus('saving')
      const timer = setTimeout(() => setSaveStatus('saved'), 2500)
      return () => clearTimeout(timer)
    }
    prevProjectRef.current = serialized
  }, [currentProject])

  useEffect(() => {
    if (currentProject) setTitle(currentProject.title)
  }, [currentProject?.title])

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const handleSaveTitle = () => {
    setEditing(false)
    if (title.trim() && title !== currentProject?.title) {
      updateProjectTitle(title.trim())
    }
  }

  if (!currentProject) return null

  return (
    <div className="border-b bg-background/90 backdrop-blur-sm shrink-0">
      <div className="h-10 flex items-center px-3 gap-2">
        {/* Left: Back + Project name + save status */}
        <div className="flex items-center gap-1.5 min-w-0 shrink-0">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" title="Back to dashboard">
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>
          </Link>

          {editing ? (
            <input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle()
                if (e.key === 'Escape') { setTitle(currentProject.title); setEditing(false) }
              }}
              className="text-sm font-semibold bg-transparent border-b border-primary outline-none px-1 py-0.5 min-w-[100px] max-w-[200px]"
            />
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-sm font-semibold truncate max-w-[200px] hover:text-primary transition-colors px-1"
              title="Click to rename project"
            >
              {currentProject.title || 'Untitled Project'}
            </button>
          )}

          <span className={cn(
            'text-[10px] shrink-0',
            saveStatus === 'saved' ? 'text-muted-foreground' : 'text-primary'
          )}>
            {saveStatus === 'saving' ? (
              <Loader2 className="h-3 w-3 animate-spin inline" />
            ) : (
              <Check className="h-3 w-3 inline" />
            )}
          </span>
        </div>

        <div className="w-px h-5 bg-border shrink-0" />

        {/* Center: View tabs */}
        <div className="flex items-center bg-muted rounded-md p-0.5">
          {VIEW_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setCurrentView(opt.value)}
              className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors',
                currentView === opt.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title={opt.label}
            >
              {opt.icon}
              <span className="hidden lg:inline">{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Filters (non-canvas views) */}
        {currentView !== 'canvas' && (
          <>
            <div className="w-px h-5 bg-border shrink-0" />
            <div className="relative flex items-center">
              <Search className="absolute left-2 h-3 w-3 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-6 w-28 pl-6 pr-2 text-[11px] bg-muted rounded border-0 outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-1.5 text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <select
              value={filterType || ''}
              onChange={(e) => setFilterType((e.target.value || null) as NodeType | null)}
              className="h-6 px-1.5 text-[11px] bg-muted rounded border-0 outline-none focus:ring-1 focus:ring-primary text-foreground"
            >
              <option value="">All Types</option>
              {TYPE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {currentView !== 'board' && (
              <select
                value={filterStatus || ''}
                onChange={(e) => setFilterStatus((e.target.value || null) as NodeStatus | null)}
                className="h-6 px-1.5 text-[11px] bg-muted rounded border-0 outline-none focus:ring-1 focus:ring-primary text-foreground"
              >
                <option value="">All Status</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            )}
            {hasFilters && (
              <button
                onClick={() => useUIStore.getState().clearFilters()}
                className="text-[11px] text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right: Action buttons */}
        <div className="flex items-center gap-0.5 shrink-0">
          <Button
            variant={chatOpen ? 'secondary' : 'ghost'}
            size="icon"
            onClick={onToggleChat}
            className="h-7 w-7"
            title={chatOpen ? 'Close chat (Ctrl+J)' : 'Open chat (Ctrl+J)'}
          >
            {chatOpen ? <PanelLeftClose className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onOpenTeamManager} className="h-7 w-7" title="Team">
            <Users className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onOpenSmartSuggestions} className="h-7 w-7" title="AI Suggestions">
            <Lightbulb className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onOpenVersionHistory} className="h-7 w-7" title="History">
            <History className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onOpenIntegrations} className="h-7 w-7" title="Integrations">
            <Plug className="h-3.5 w-3.5" />
          </Button>
          <div className="w-px h-5 bg-border mx-0.5" />
          <ShareButton />
        </div>
      </div>
    </div>
  )
}
