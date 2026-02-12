'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Check,
  Trash2,
  Plus,
  Pencil,
  Link,
  Clock,
  Sparkles,
  CheckCheck,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AISuggestion, IterationResult } from '@/hooks/use-ai-iterate'

const SUGGESTION_ICONS: Record<string, React.ReactNode> = {
  add_node: <Plus className="h-3.5 w-3.5" />,
  update_node: <Pencil className="h-3.5 w-3.5" />,
  delete_node: <Trash2 className="h-3.5 w-3.5" />,
  add_edge: <Link className="h-3.5 w-3.5" />,
  estimate: <Clock className="h-3.5 w-3.5" />,
}

const SUGGESTION_COLORS: Record<string, string> = {
  add_node: 'text-green-500',
  update_node: 'text-blue-500',
  delete_node: 'text-red-500',
  add_edge: 'text-purple-500',
  estimate: 'text-amber-500',
}

const TYPE_LABELS: Record<string, string> = {
  add_node: 'Add',
  update_node: 'Update',
  delete_node: 'Remove',
  add_edge: 'Dependency',
  estimate: 'Estimate',
}

interface AISuggestionsPanelProps {
  result: IterationResult | null
  loading: boolean
  error: string | null
  onApply: (suggestion: AISuggestion) => void
  onApplyAll: (suggestions: AISuggestion[]) => void
  onDismiss: (suggestionId: string) => void
  onClose: () => void
  dismissed: Set<string>
  applied: Set<string>
}

export function AISuggestionsPanel({
  result,
  loading,
  error,
  onApply,
  onApplyAll,
  onDismiss,
  onClose,
  dismissed,
  applied,
}: AISuggestionsPanelProps) {
  if (!result && !loading && !error) return null

  const pendingSuggestions = result?.suggestions.filter(
    (s) => !dismissed.has(s.id) && !applied.has(s.id)
  ) || []

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 320, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className="w-80 border-l bg-background flex flex-col h-full shrink-0 z-20"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">AI Suggestions</h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Analyzing your plan...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="p-4">
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {error}
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <>
            {/* AI Message */}
            <div className="px-4 py-3 border-b bg-muted/30">
              <p className="text-sm text-muted-foreground">{result.message}</p>
            </div>

            {/* Apply all button */}
            {pendingSuggestions.length > 1 && (
              <div className="px-4 py-2 border-b">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => onApplyAll(pendingSuggestions)}
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Apply all {pendingSuggestions.length} suggestions
                </Button>
              </div>
            )}

            {/* Suggestion list */}
            <div className="flex-1 overflow-y-auto">
              {result.suggestions.map((suggestion) => {
                const isDismissed = dismissed.has(suggestion.id)
                const isApplied = applied.has(suggestion.id)

                if (isDismissed) return null

                return (
                  <motion.div
                    key={suggestion.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: isApplied ? 0.5 : 1, y: 0 }}
                    className={`px-4 py-3 border-b last:border-b-0 ${
                      isApplied ? 'bg-muted/20' : ''
                    }`}
                  >
                    {/* Type badge + confidence */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={SUGGESTION_COLORS[suggestion.type]}>
                          {SUGGESTION_ICONS[suggestion.type]}
                        </span>
                        <span className="text-xs font-medium">
                          {TYPE_LABELS[suggestion.type]}
                        </span>
                        {suggestion.node && (
                          <span className="text-xs text-muted-foreground">
                            · {suggestion.node.type}
                          </span>
                        )}
                      </div>
                      <div
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor:
                            suggestion.confidence > 0.7
                              ? 'hsl(142 76% 36% / 0.15)'
                              : suggestion.confidence > 0.4
                              ? 'hsl(38 92% 50% / 0.15)'
                              : 'hsl(0 84% 60% / 0.15)',
                          color:
                            suggestion.confidence > 0.7
                              ? 'hsl(142 76% 36%)'
                              : suggestion.confidence > 0.4
                              ? 'hsl(38 92% 50%)'
                              : 'hsl(0 84% 60%)',
                        }}
                      >
                        {Math.round(suggestion.confidence * 100)}%
                      </div>
                    </div>

                    {/* Title / content */}
                    {suggestion.node && (
                      <p className="text-sm font-medium mb-0.5 truncate">
                        {suggestion.node.title}
                      </p>
                    )}
                    {suggestion.estimatedHours != null && (
                      <p className="text-sm font-medium mb-0.5">
                        {suggestion.estimatedHours}h estimated
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mb-2">
                      {suggestion.reason}
                    </p>

                    {/* Actions */}
                    {!isApplied && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1 flex-1"
                          onClick={() => onApply(suggestion)}
                        >
                          <Check className="h-3 w-3" />
                          Apply
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() => onDismiss(suggestion.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    {isApplied && (
                      <p className="text-xs text-green-500 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Applied
                      </p>
                    )}
                  </motion.div>
                )
              })}

              {result.suggestions.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No suggestions generated.
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
