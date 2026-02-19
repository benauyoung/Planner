'use client'

import { useState, useEffect, useRef } from 'react'
import { LayoutGrid, List, Table2, Columns3, Search, X, GanttChart, Zap, AppWindow, Server } from 'lucide-react'
import { useUIStore, type ViewType, type ManageSubView } from '@/stores/ui-store'
import { NODE_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { NodeType, NodeStatus } from '@/types/project'

const VIEW_OPTIONS: { value: ViewType; label: string; icon: React.ReactNode }[] = [
  { value: 'plan', label: 'Plan', icon: <LayoutGrid className="h-3.5 w-3.5" /> },
  { value: 'design', label: 'Design', icon: <AppWindow className="h-3.5 w-3.5" /> },
  { value: 'agents', label: 'Agents', icon: <Server className="h-3.5 w-3.5" /> },
  { value: 'manage', label: 'Manage', icon: <List className="h-3.5 w-3.5" /> },
]

const MANAGE_SUB_OPTIONS: { value: ManageSubView; label: string; icon: React.ReactNode }[] = [
  { value: 'list', label: 'List', icon: <List className="h-3.5 w-3.5" /> },
  { value: 'table', label: 'Table', icon: <Table2 className="h-3.5 w-3.5" /> },
  { value: 'board', label: 'Board', icon: <Columns3 className="h-3.5 w-3.5" /> },
  { value: 'timeline', label: 'Timeline', icon: <GanttChart className="h-3.5 w-3.5" /> },
  { value: 'sprints', label: 'Sprints', icon: <Zap className="h-3.5 w-3.5" /> },
  { value: 'backend', label: 'Backend', icon: <Server className="h-3.5 w-3.5" /> },
]

const TYPE_OPTIONS: { value: NodeType; label: string }[] = [
  { value: 'goal', label: 'Goal' },
  { value: 'subgoal', label: 'Subgoal' },
  { value: 'feature', label: 'Feature' },
  { value: 'task', label: 'Task' },
  { value: 'moodboard', label: 'Mood Board' },
  { value: 'notes', label: 'Notes' },
  { value: 'connector', label: 'Connector' },
  { value: 'spec', label: 'Specification' },
  { value: 'prd', label: 'PRD' },
  { value: 'schema', label: 'Schema' },
  { value: 'prompt', label: 'Prompt' },
  { value: 'reference', label: 'Reference' },
]

const STATUS_OPTIONS: { value: NodeStatus; label: string; color: string }[] = [
  { value: 'not_started', label: 'Not Started', color: '#9ca3af' },
  { value: 'in_progress', label: 'In Progress', color: '#3b82f6' },
  { value: 'completed', label: 'Completed', color: '#22c55e' },
  { value: 'blocked', label: 'Blocked', color: '#ef4444' },
]

export function ViewSwitcher() {
  const currentView = useUIStore((s) => s.currentView)
  const setCurrentView = useUIStore((s) => s.setCurrentView)
  const manageSubView = useUIStore((s) => s.manageSubView)
  const setManageSubView = useUIStore((s) => s.setManageSubView)
  const searchQuery = useUIStore((s) => s.searchQuery)
  const setSearchQuery = useUIStore((s) => s.setSearchQuery)
  const filterType = useUIStore((s) => s.filterType)
  const setFilterType = useUIStore((s) => s.setFilterType)
  const filterStatus = useUIStore((s) => s.filterStatus)
  const setFilterStatus = useUIStore((s) => s.setFilterStatus)

  const [manageDropdownOpen, setManageDropdownOpen] = useState(false)
  const manageDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!manageDropdownOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (manageDropdownRef.current && !manageDropdownRef.current.contains(e.target as Node)) {
        setManageDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [manageDropdownOpen])

  const hasFilters = searchQuery || filterType || filterStatus

  return (
    <div className="flex items-center gap-3 px-4 py-1.5 border-b bg-background/80 backdrop-blur-sm shrink-0">
      {/* View tabs */}
      <div className="flex items-center bg-muted rounded-md p-0.5">
        {VIEW_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setCurrentView(opt.value)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors',
              currentView === opt.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
            title={opt.label}
          >
            {opt.icon}
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        ))}
      </div>

      {/* Manage sub-view dropdown */}
      {currentView === 'manage' && (
        <>
          <div className="w-px h-5 bg-border" />
          <div className="relative" ref={manageDropdownRef}>
            <button
              onClick={() => setManageDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-muted hover:bg-accent transition-colors"
            >
              {MANAGE_SUB_OPTIONS.find((o) => o.value === manageSubView)?.icon}
              <span>{MANAGE_SUB_OPTIONS.find((o) => o.value === manageSubView)?.label}</span>
              <svg className="h-3 w-3 ml-0.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {manageDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-popover border rounded-md shadow-md py-1 z-50 min-w-[140px]">
                {MANAGE_SUB_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setManageSubView(opt.value); setManageDropdownOpen(false) }}
                    className={cn(
                      'flex items-center gap-2 w-full px-3 py-1.5 text-xs font-medium transition-colors',
                      manageSubView === opt.value
                        ? 'bg-accent text-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    )}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Separator */}
      <div className="w-px h-5 bg-border" />

      {/* Filters (only for manage views) */}
      {currentView === 'manage' && (
        <>
          {/* Search */}
          <div className="relative flex items-center">
            <Search className="absolute left-2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7 w-40 pl-7 pr-2 text-xs bg-muted rounded border-0 outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-1.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Type filter */}
          <select
            value={filterType || ''}
            onChange={(e) => setFilterType((e.target.value || null) as NodeType | null)}
            className="h-7 px-2 text-xs bg-muted rounded border-0 outline-none focus:ring-1 focus:ring-primary text-foreground"
          >
            <option value="">All Types</option>
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          {/* Status filter (not for board view since it's grouped by status) */}
          {manageSubView !== 'board' && (
            <select
              value={filterStatus || ''}
              onChange={(e) => setFilterStatus((e.target.value || null) as NodeStatus | null)}
              className="h-7 px-2 text-xs bg-muted rounded border-0 outline-none focus:ring-1 focus:ring-primary text-foreground"
            >
              <option value="">All Status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          )}

          {/* Clear filters */}
          {hasFilters && (
            <button
              onClick={() => useUIStore.getState().clearFilters()}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}
        </>
      )}
    </div>
  )
}
