'use client'

import { useRef, useState } from 'react'
import {
  FolderSync,
  Download,
  Upload,
  FolderOpen,
  FolderOutput,
  Check,
  X,
  AlertTriangle,
  Plus,
  Minus,
  RefreshCw,
  Loader2,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTerritorySync } from '@/hooks/use-territory-sync'
import { cn } from '@/lib/utils'
import type { NodeDiff } from '@/lib/territory-sync'

interface TerritorySyncPanelProps {
  onClose: () => void
}

const ACTION_ICONS: Record<NodeDiff['action'], React.ReactNode> = {
  add: <Plus className="h-3 w-3 text-green-500" />,
  update: <RefreshCw className="h-3 w-3 text-blue-500" />,
  delete: <Minus className="h-3 w-3 text-red-500" />,
  conflict: <AlertTriangle className="h-3 w-3 text-yellow-500" />,
}

const ACTION_LABELS: Record<NodeDiff['action'], string> = {
  add: 'New',
  update: 'Modified',
  delete: 'Removed',
  conflict: 'Conflict',
}

export function TerritorySyncPanel({ onClose }: TerritorySyncPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedDiffs, setSelectedDiffs] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(true)

  const {
    status,
    error,
    diff,
    exportTerritory,
    exportTerritoryToFolder,
    importTerritory,
    importTerritoryFromFolder,
    applyDiff,
    clearDiff,
  } = useTerritorySync()

  const hasFSAccess = typeof window !== 'undefined' && 'showDirectoryPicker' in window

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await importTerritory(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleApply = () => {
    if (!diff) return
    if (selectAll) {
      applyDiff()
    } else {
      applyDiff(selectedDiffs)
    }
  }

  const toggleDiffSelection = (id: string) => {
    setSelectedDiffs((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setSelectAll(false)
  }

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedDiffs(new Set())
      setSelectAll(false)
    } else {
      if (diff) {
        setSelectedDiffs(new Set(diff.nodes.map((d) => d.id)))
      }
      setSelectAll(true)
    }
  }

  return (
    <div className="absolute top-4 left-4 z-20 w-[380px] bg-background border rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <FolderSync className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Territory Sync</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Status bar */}
      {status !== 'idle' && status !== 'done' && (
        <div className="px-4 py-2 bg-blue-500/10 border-b flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
          <Loader2 className="h-3 w-3 animate-spin" />
          {status === 'exporting' && 'Exporting territory files...'}
          {status === 'importing' && 'Reading territory files...'}
          {status === 'diffing' && 'Computing differences...'}
          {status === 'merging' && 'Applying merge...'}
        </div>
      )}

      {status === 'done' && (
        <div className="px-4 py-2 bg-green-500/10 border-b flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
          <Check className="h-3 w-3" />
          Operation completed successfully
        </div>
      )}

      {error && (
        <div className="px-4 py-2 bg-red-500/10 border-b flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
          <AlertTriangle className="h-3 w-3" />
          {error}
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
        {/* No diff — show export/import options */}
        {!diff && (
          <>
            <div>
              <p className="text-xs text-muted-foreground mb-3">
                Sync your project as a folder of Markdown files. Each node becomes a file with YAML frontmatter. Edit externally, then import changes back.
              </p>
            </div>

            {/* Export section */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Export</h4>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={exportTerritory}
                  disabled={status !== 'idle'}
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Download Bundle
                </Button>
                {hasFSAccess && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={exportTerritoryToFolder}
                    disabled={status !== 'idle'}
                  >
                    <FolderOutput className="h-3.5 w-3.5 mr-1.5" />
                    Write to Folder
                  </Button>
                )}
              </div>
            </div>

            {/* Import section */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Import</h4>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={status !== 'idle'}
                >
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Upload Bundle
                </Button>
                {hasFSAccess && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={importTerritoryFromFolder}
                    disabled={status !== 'idle'}
                  >
                    <FolderOpen className="h-3.5 w-3.5 mr-1.5" />
                    Read from Folder
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".territory,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {/* File format info */}
            <div className="rounded-md bg-muted/50 p-3 text-[11px] text-muted-foreground space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-foreground/70">
                <FileText className="h-3 w-3" />
                Territory Format
              </div>
              <p><code>.territory/project.yaml</code> — metadata + edges</p>
              <p><code>.territory/goals/*.md</code> — one file per node</p>
              <p>Each file: YAML frontmatter (id, type, status, parent) + Markdown body</p>
            </div>
          </>
        )}

        {/* Diff view */}
        {diff && (
          <>
            {/* Summary */}
            <div className="flex items-center gap-3 text-xs">
              {diff.summary.added > 0 && (
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <Plus className="h-3 w-3" /> {diff.summary.added} new
                </span>
              )}
              {diff.summary.updated > 0 && (
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <RefreshCw className="h-3 w-3" /> {diff.summary.updated} modified
                </span>
              )}
              {diff.summary.deleted > 0 && (
                <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                  <Minus className="h-3 w-3" /> {diff.summary.deleted} removed
                </span>
              )}
              {diff.summary.conflicts > 0 && (
                <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                  <AlertTriangle className="h-3 w-3" /> {diff.summary.conflicts} conflicts
                </span>
              )}
            </div>

            {diff.summary.edgesAdded + diff.summary.edgesDeleted > 0 && (
              <p className="text-[11px] text-muted-foreground">
                Edges: +{diff.summary.edgesAdded} / -{diff.summary.edgesDeleted}
              </p>
            )}

            {/* Select all toggle */}
            <div className="flex items-center justify-between">
              <button
                className="text-xs text-primary hover:underline"
                onClick={toggleSelectAll}
              >
                {selectAll ? 'Deselect all' : 'Select all'}
              </button>
              <span className="text-[11px] text-muted-foreground">
                {selectAll ? diff.nodes.length : selectedDiffs.size} of {diff.nodes.length} selected
              </span>
            </div>

            {/* Node diff list */}
            <div className="space-y-1 max-h-[280px] overflow-y-auto">
              {diff.nodes.map((nd) => {
                const isSelected = selectAll || selectedDiffs.has(nd.id)
                const node = nd.territoryNode || nd.canvasNode
                return (
                  <button
                    key={nd.id}
                    className={cn(
                      'w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center gap-2 transition-colors',
                      isSelected
                        ? 'bg-primary/10 border border-primary/20'
                        : 'bg-muted/30 border border-transparent hover:bg-muted/60'
                    )}
                    onClick={() => toggleDiffSelection(nd.id)}
                  >
                    {ACTION_ICONS[nd.action]}
                    <span className="flex-1 truncate font-medium">
                      {node?.title || nd.id}
                    </span>
                    <span className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full',
                      nd.action === 'add' && 'bg-green-500/20 text-green-600',
                      nd.action === 'update' && 'bg-blue-500/20 text-blue-600',
                      nd.action === 'delete' && 'bg-red-500/20 text-red-600',
                      nd.action === 'conflict' && 'bg-yellow-500/20 text-yellow-600',
                    )}>
                      {ACTION_LABELS[nd.action]}
                    </span>
                    {nd.fields && nd.fields.length > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        ({nd.fields.join(', ')})
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={clearDiff}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="flex-1 text-xs"
                onClick={handleApply}
                disabled={!selectAll && selectedDiffs.size === 0}
              >
                <Check className="h-3.5 w-3.5 mr-1.5" />
                Apply {selectAll ? 'All' : selectedDiffs.size} Changes
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
