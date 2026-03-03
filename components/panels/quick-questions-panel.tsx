'use client'

import { useMemo, useState, useCallback } from 'react'
import { X, HelpCircle, ChevronDown, ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui-store'
import { useProjectStore } from '@/stores/project-store'
import { NODE_CONFIG } from '@/lib/constants'
import { authFetch } from '@/lib/auth-fetch'
import { buildNodeContext } from '@/lib/node-context'
import type { PlanNode, NodeQuestion } from '@/types/project'

interface NodeGroup {
  node: PlanNode
  unanswered: NodeQuestion[]
}

function QuestionItem({
  node,
  question,
}: {
  node: PlanNode
  question: NodeQuestion
}) {
  const answerNodeQuestion = useProjectStore((s) => s.answerNodeQuestion)

  if (question.options && question.options.length > 0) {
    return (
      <div className="space-y-1.5">
        <p className="text-sm font-medium">{question.question}</p>
        <div className="flex flex-wrap gap-1.5">
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => answerNodeQuestion(node.id, question.id, option)}
              className={cn(
                'text-xs px-2.5 py-1.5 rounded-md border transition-colors',
                (question.answer ?? '') === option
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50 hover:bg-primary/5'
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">{question.question}</p>
      <textarea
        value={question.answer}
        onChange={(e) => answerNodeQuestion(node.id, question.id, e.target.value)}
        placeholder="Type your answer..."
        rows={2}
        className="w-full text-xs px-2.5 py-1.5 rounded-md border bg-card text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/50"
      />
    </div>
  )
}

function NodeGroupSection({
  group,
  defaultExpanded,
}: {
  group: NodeGroup
  defaultExpanded: boolean
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const config = NODE_CONFIG[group.node.type]

  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
      >
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        )}
        <span className={cn('text-[10px] font-semibold uppercase tracking-wide shrink-0', config.textClass)}>
          {config.label}
        </span>
        <span className="flex-1 text-sm font-medium truncate">{group.node.title}</span>
        <span className="text-[10px] text-muted-foreground shrink-0">
          {group.unanswered.length} unanswered
        </span>
      </button>
      {expanded && (
        <div className="px-3 pb-3 space-y-3">
          {group.unanswered.map((q) => (
            <QuestionItem key={q.id} node={group.node} question={q} />
          ))}
        </div>
      )}
    </div>
  )
}

export function QuickQuestionsPanel() {
  const quickQuestionsPanelOpen = useUIStore((s) => s.quickQuestionsPanelOpen)
  const setQuickQuestionsPanelOpen = useUIStore((s) => s.setQuickQuestionsPanelOpen)
  const currentProject = useProjectStore((s) => s.currentProject)
  const addNodeQuestions = useProjectStore((s) => s.addNodeQuestions)
  const [generatingFor, setGeneratingFor] = useState<Set<string>>(new Set())

  const { groups, totalUnanswered, totalQuestions, nodesWithoutQuestions } = useMemo(() => {
    if (!currentProject) return { groups: [], totalUnanswered: 0, totalQuestions: 0, nodesWithoutQuestions: [] as PlanNode[] }

    const g: NodeGroup[] = []
    let unanswered = 0
    let total = 0
    const noQ: PlanNode[] = []

    for (const node of currentProject.nodes) {
      total += node.questions.length
      const uq = node.questions.filter((q) => !(q.answer ?? '').trim())
      unanswered += uq.length
      if (uq.length > 0) {
        g.push({ node, unanswered: uq })
      }
      if (node.questions.length === 0) {
        noQ.push(node)
      }
    }

    return { groups: g, totalUnanswered: unanswered, totalQuestions: total, nodesWithoutQuestions: noQ }
  }, [currentProject])

  const generateQuestionsForNode = useCallback(async (node: PlanNode) => {
    if (!currentProject || generatingFor.has(node.id)) return
    setGeneratingFor((prev) => new Set(prev).add(node.id))
    try {
      const context = buildNodeContext(node.id, currentProject)
      const res = await authFetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context }),
      })
      const data = await res.json()
      if (data.questions) {
        addNodeQuestions(node.id, data.questions)
      }
    } catch {
      // silently fail
    } finally {
      setGeneratingFor((prev) => {
        const next = new Set(prev)
        next.delete(node.id)
        return next
      })
    }
  }, [currentProject, generatingFor, addNodeQuestions])

  const generateAllMissing = useCallback(async () => {
    for (const node of nodesWithoutQuestions) {
      await generateQuestionsForNode(node)
    }
  }, [nodesWithoutQuestions, generateQuestionsForNode])

  if (!quickQuestionsPanelOpen) return null

  const answeredCount = totalQuestions - totalUnanswered
  const progressPct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0

  return (
    <div className="absolute top-0 right-0 h-full w-80 z-30 flex flex-col bg-background border-l shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Quick Questions</span>
          {totalUnanswered > 0 && (
            <span className="flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
              {totalUnanswered}
            </span>
          )}
        </div>
        <button
          onClick={() => setQuickQuestionsPanelOpen(false)}
          className="p-1 rounded hover:bg-muted transition-colors"
          aria-label="Close quick questions panel"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Progress */}
      <div className="px-4 py-3 border-b shrink-0 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {answeredCount}/{totalQuestions} questions answered
          </span>
          <span className="font-medium">{progressPct}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Generate questions for nodes without any */}
      {nodesWithoutQuestions.length > 0 && (
        <div className="px-4 py-2.5 border-b shrink-0">
          <button
            onClick={generateAllMissing}
            disabled={generatingFor.size > 0}
            className="flex items-center gap-2 w-full text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
          >
            {generatingFor.size > 0 ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <HelpCircle className="h-3.5 w-3.5" />
            )}
            Generate questions for {nodesWithoutQuestions.length} node{nodesWithoutQuestions.length > 1 ? 's' : ''} without questions
          </button>
        </div>
      )}

      {/* Node groups */}
      <div className="flex-1 overflow-y-auto">
        {groups.length === 0 && nodesWithoutQuestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
            <HelpCircle className="h-6 w-6 opacity-30" />
            <p className="text-sm">All questions answered</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
            <HelpCircle className="h-6 w-6 opacity-30" />
            <p className="text-sm">No unanswered questions yet</p>
            <p className="text-xs">Generate questions for nodes above</p>
          </div>
        ) : (
          <div>
            {groups.map((group, i) => (
              <NodeGroupSection
                key={group.node.id}
                group={group}
                defaultExpanded={i === 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
