'use client'

import { useMemo, useState } from 'react'
import { X, FileText, Sparkles, RefreshCw, ChevronRight, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui-store'
import { useProjectStore } from '@/stores/project-store'
import { NODE_CONFIG } from '@/lib/constants'
import {
  getNodePrdStatus,
  getProjectPrdSummary,
  PRD_STATUS_CONFIG,
  type PrdStatus,
} from '@/lib/prd-status'
import type { PlanNode } from '@/types/project'
import { downloadRalphyZip, downloadFlatPrdMd } from '@/lib/export-ralphy'

type FilterTab = 'all' | 'ready' | 'stale' | 'generated' | 'answering'

const TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'ready', label: 'Ready' },
  { id: 'stale', label: 'Stale' },
  { id: 'generated', label: 'Generated' },
  { id: 'answering', label: 'In Progress' },
]

function StatusBadge({ status }: { status: PrdStatus }) {
  const cfg = PRD_STATUS_CONFIG[status]
  return (
    <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium', cfg.badge)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  )
}

function NodeRow({ node, onSelect }: { node: PlanNode; onSelect: () => void }) {
  const status = getNodePrdStatus(node)
  if (!status) return null
  const config = NODE_CONFIG[node.type]
  const answered = node.questions.filter((q) => (q.answer ?? '').trim()).length
  const total = node.questions.length

  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left group"
    >
      <span className={cn('text-[10px] font-semibold uppercase tracking-wide shrink-0 w-14 text-right', config.textClass)}>
        {config.label}
      </span>
      <span className="flex-1 text-sm font-medium truncate">{node.title}</span>
      {total > 0 && (
        <span className="text-[10px] text-muted-foreground shrink-0">{answered}/{total}</span>
      )}
      {status && <StatusBadge status={status} />}
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 group-hover:text-muted-foreground transition-colors" />
    </button>
  )
}

export function PrdPipelinePanel() {
  const prdPipelineOpen = useUIStore((s) => s.prdPipelineOpen)
  const setPrdPipelineOpen = useUIStore((s) => s.setPrdPipelineOpen)
  const selectNode = useUIStore((s) => s.selectNode)
  const currentProject = useProjectStore((s) => s.currentProject)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  const summary = useMemo(
    () => (currentProject ? getProjectPrdSummary(currentProject) : null),
    [currentProject]
  )

  const filteredNodes = useMemo(() => {
    if (!currentProject) return []
    const eligible = currentProject.nodes.filter((n) =>
      ['goal', 'subgoal', 'feature', 'task'].includes(n.type)
    )
    if (activeTab === 'all') return eligible
    return eligible.filter((n) => {
      const s = getNodePrdStatus(n)
      if (activeTab === 'ready') return s === 'ready' || s === 'export_ready'
      if (activeTab === 'stale') return s === 'stale'
      if (activeTab === 'generated') return s === 'generated' || s === 'export_ready'
      if (activeTab === 'answering') return s === 'answering' || s === 'needs_questions'
      return true
    })
  }, [currentProject, activeTab])

  if (!prdPipelineOpen) return null

  return (
    <div className="absolute top-0 right-0 h-full w-80 z-30 flex flex-col bg-background border-l shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">PRD Pipeline</span>
          {summary && summary.actionable > 0 && (
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
              {summary.actionable}
            </span>
          )}
        </div>
        <button
          onClick={() => setPrdPipelineOpen(false)}
          className="p-1 rounded hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Summary strip */}
      {summary && (
        <div className="grid grid-cols-3 gap-px bg-border shrink-0">
          {[
            { label: 'Ready', value: summary.ready + summary.stale, color: 'text-blue-500' },
            { label: 'Generated', value: summary.generated + summary.exportReady, color: 'text-green-500' },
            { label: 'Total', value: summary.total, color: 'text-foreground' },
          ].map((item) => (
            <div key={item.label} className="bg-background px-3 py-2 text-center">
              <div className={cn('text-lg font-bold tabular-nums', item.color)}>{item.value}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex border-b shrink-0 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors shrink-0',
              activeTab === tab.id
                ? 'text-primary border-b-2 border-primary -mb-px'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Node list */}
      <div className="flex-1 overflow-y-auto">
        {filteredNodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
            <Sparkles className="h-6 w-6 opacity-30" />
            <p className="text-sm">
              {activeTab === 'all' ? 'No eligible nodes yet' : `No ${activeTab} nodes`}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredNodes.map((node) => (
              <NodeRow
                key={node.id}
                node={node}
                onSelect={() => {
                  selectNode(node.id)
                  setPrdPipelineOpen(false)
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Export footer */}
      {summary && summary.generated + summary.exportReady > 0 && (
        <div className="border-t px-3 py-2.5 shrink-0 flex gap-2">
          <button
            onClick={() => currentProject && downloadRalphyZip(currentProject)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            <Package className="h-3.5 w-3.5" />
            Export ZIP
          </button>
          <button
            onClick={() => currentProject && downloadFlatPrdMd(currentProject)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium hover:bg-muted transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            PRD.md
          </button>
        </div>
      )}
    </div>
  )
}
