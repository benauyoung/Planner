'use client'

import { LayoutGrid, List, Table2, Columns3, Search, X } from 'lucide-react'
import { useUIStore, type ViewType } from '@/stores/ui-store'
import { NODE_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { NodeType, NodeStatus } from '@/types/project'

const VIEW_OPTIONS: { value: ViewType; label: string; icon: React.ReactNode }[] = [
  { value: 'canvas', label: 'Canvas', icon: <LayoutGrid className="h-3.5 w-3.5" /> },
  { value: 'list', label: 'List', icon: <List className="h-3.5 w-3.5" /> },
  { value: 'table', label: 'Table', icon: <Table2 className="h-3.5 w-3.5" /> },
  { value: 'board', label: 'Board', icon: <Columns3 className="h-3.5 w-3.5" /> },
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

export function ViewSwitcher() {
  const currentView = useUIStore((s) => s.currentView)
  const setCurrentView = useUIStore((s) => s.setCurrentView)
  const searchQuery = useUIStore((s) => s.searchQuery)
  const setSearchQuery = useUIStore((s) => s.setSearchQuery)
  const filterType = useUIStore((s) => s.filterType)
  const setFilterType = useUIStore((s) => s.setFilterType)
  const filterStatus = useUIStore((s) => s.filterStatus)
  const setFilterStatus = useUIStore((s) => s.setFilterStatus)

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

      {/* Separator */}
      <div className="w-px h-5 bg-border" />

      {/* Filters (only for non-canvas views) */}
      {currentView !== 'canvas' && (
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
          {currentView !== 'board' && (
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
