'use client'

import { useState } from 'react'
import {
  Lightbulb,
  X,
  RefreshCw,
  AlertTriangle,
  TestTube,
  Unlink,
  Zap,
  Clock,
  Users,
  GitBranch,
  Calculator,
  ListTree,
  Shield,
  ChevronRight,
} from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SmartSuggestion } from '@/hooks/use-ai-suggestions'
import type { SuggestionType } from '@/prompts/suggestion-system'

const TYPE_CONFIG: Record<SuggestionType, { icon: React.ReactNode; color: string; label: string }> = {
  missing_testing: { icon: <TestTube className="h-3.5 w-3.5" />, color: 'text-purple-500', label: 'Missing Tests' },
  orphan_nodes: { icon: <Unlink className="h-3.5 w-3.5" />, color: 'text-amber-500', label: 'Orphan Nodes' },
  bottleneck: { icon: <Zap className="h-3.5 w-3.5" />, color: 'text-red-500', label: 'Bottleneck' },
  stale_items: { icon: <Clock className="h-3.5 w-3.5" />, color: 'text-orange-500', label: 'Stale Items' },
  unbalanced_workload: { icon: <Users className="h-3.5 w-3.5" />, color: 'text-blue-500', label: 'Workload' },
  missing_dependencies: { icon: <GitBranch className="h-3.5 w-3.5" />, color: 'text-cyan-500', label: 'Dependencies' },
  estimation_gap: { icon: <Calculator className="h-3.5 w-3.5" />, color: 'text-yellow-500', label: 'Estimates' },
  missing_subtasks: { icon: <ListTree className="h-3.5 w-3.5" />, color: 'text-green-500', label: 'Subtasks' },
  risk: { icon: <Shield className="h-3.5 w-3.5" />, color: 'text-red-600', label: 'Risk' },
}

const SEVERITY_CONFIG = {
  high: { color: 'bg-red-500', label: 'High' },
  medium: { color: 'bg-yellow-500', label: 'Medium' },
  low: { color: 'bg-blue-500', label: 'Low' },
}

interface SmartSuggestionsPanelProps {
  suggestions: SmartSuggestion[]
  loading: boolean
  error: string | null
  onAnalyze: () => void
  onDismiss: (index: number) => void
  onClose: () => void
}

export function SmartSuggestionsPanel({
  suggestions,
  loading,
  error,
  onAnalyze,
  onDismiss,
  onClose,
}: SmartSuggestionsPanelProps) {
  const selectNode = useUIStore((s) => s.selectNode)
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  const highCount = suggestions.filter((s) => s.severity === 'high').length
  const medCount = suggestions.filter((s) => s.severity === 'medium').length
  const lowCount = suggestions.filter((s) => s.severity === 'low').length

  return (
    <div className="w-80 border-l bg-background h-full flex flex-col shrink-0">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b shrink-0">
        <Lightbulb className="h-4 w-4 text-amber-500" />
        <h2 className="text-sm font-semibold flex-1">Smart Suggestions</h2>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={onAnalyze}
          disabled={loading}
        >
          <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
        </Button>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Summary badges */}
      {suggestions.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 border-b text-[10px]">
          {highCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              {highCount} high
            </span>
          )}
          {medCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              {medCount} medium
            </span>
          )}
          {lowCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {lowCount} low
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <RefreshCw className="h-6 w-6 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground">Analyzing your project...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="px-4 py-6 text-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mx-auto mb-2" />
            <p className="text-xs text-red-500">{error}</p>
            <Button size="sm" variant="outline" className="mt-3" onClick={onAnalyze}>
              Try Again
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && suggestions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 px-6">
            <Lightbulb className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground text-center">
              Click the refresh button to analyze your project and get AI-powered improvement suggestions.
            </p>
            <Button size="sm" onClick={onAnalyze}>Analyze Project</Button>
          </div>
        )}

        {/* Suggestions */}
        {!loading && suggestions.length > 0 && (
          <div className="divide-y">
            {suggestions.map((suggestion, idx) => {
              const typeCfg = TYPE_CONFIG[suggestion.type]
              const sevCfg = SEVERITY_CONFIG[suggestion.severity]
              const isExpanded = expandedIdx === idx

              return (
                <div key={idx} className="px-3 py-2.5">
                  <button
                    className="flex items-start gap-2 w-full text-left"
                    onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                  >
                    <span className={cn('mt-0.5 shrink-0', typeCfg.color)}>
                      {typeCfg.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium truncate flex-1">
                          {suggestion.title}
                        </span>
                        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', sevCfg.color)} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {typeCfg.label} · {suggestion.nodeIds.length} node{suggestion.nodeIds.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <ChevronRight className={cn(
                      'h-3 w-3 text-muted-foreground shrink-0 mt-0.5 transition-transform',
                      isExpanded && 'rotate-90'
                    )} />
                  </button>

                  {isExpanded && (
                    <div className="mt-2 ml-5 space-y-2">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {suggestion.description}
                      </p>
                      {suggestion.action && (
                        <p className="text-xs text-primary font-medium">
                          → {suggestion.action}
                        </p>
                      )}
                      {suggestion.nodeIds.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {suggestion.nodeIds.slice(0, 5).map((nodeId) => (
                            <button
                              key={nodeId}
                              onClick={(e) => { e.stopPropagation(); selectNode(nodeId) }}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-muted hover:bg-primary/10 hover:text-primary transition-colors truncate max-w-[100px]"
                            >
                              {nodeId}
                            </button>
                          ))}
                          {suggestion.nodeIds.length > 5 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{suggestion.nodeIds.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                      <button
                        onClick={() => onDismiss(idx)}
                        className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
