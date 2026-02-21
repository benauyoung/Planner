import type { PlanNode, NodeType, Project } from '@/types/project'

export type PrdStatus =
  | 'needs_questions' // eligible node, no questions yet
  | 'answering'       // has questions, not enough answered, no PRD
  | 'ready'           // enough answers, no non-stale PRD — generate now
  | 'generated'       // has a non-stale PRD
  | 'stale'           // has PRDs but all are stale (re-generate)
  | 'export_ready'    // non-stale PRD + 100% questions answered

const PRD_ELIGIBLE: Set<NodeType> = new Set(['goal', 'subgoal', 'feature', 'task'])

/** Returns null for non-eligible node types. */
export function getNodePrdStatus(node: PlanNode): PrdStatus | null {
  if (!PRD_ELIGIBLE.has(node.type)) return null

  const questions = node.questions ?? []
  const answered = questions.filter((q) => (q.answer ?? '').trim()).length
  const total = questions.length

  const prds = node.prds ?? []
  const nonStalePrds = prds.filter((p) => !p.isStale)
  const hasPrd = nonStalePrds.length > 0
  const allStale = prds.length > 0 && nonStalePrds.length === 0

  if (allStale) return 'stale'

  if (hasPrd) {
    return total > 0 && answered === total ? 'export_ready' : 'generated'
  }

  if (total === 0) return 'needs_questions'

  // "ready" = at least 2 answered OR all answered
  const readyThreshold = answered >= 2 || (total > 0 && answered === total)
  if (readyThreshold) return 'ready'

  return 'answering'
}

export interface PrdStatusConfig {
  label: string
  description: string
  dot: string        // Tailwind bg color class for the dot
  badge: string      // Tailwind classes for badge bg + text
  priority: number   // lower = more urgent
}

export const PRD_STATUS_CONFIG: Record<PrdStatus, PrdStatusConfig> = {
  needs_questions: {
    label: 'No questions',
    description: 'Generate questions to start building context',
    dot: 'bg-muted-foreground/40',
    badge: 'bg-muted text-muted-foreground',
    priority: 1,
  },
  answering: {
    label: 'Answering',
    description: 'Answer more questions before generating a PRD',
    dot: 'bg-amber-400',
    badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    priority: 2,
  },
  ready: {
    label: 'Ready',
    description: 'Enough context to generate a PRD',
    dot: 'bg-blue-500',
    badge: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    priority: 0,
  },
  stale: {
    label: 'Stale',
    description: 'PRD exists but questions were answered after generation',
    dot: 'bg-orange-400',
    badge: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
    priority: 0,
  },
  generated: {
    label: 'Generated',
    description: 'PRD generated and up to date',
    dot: 'bg-green-500',
    badge: 'bg-green-500/15 text-green-600 dark:text-green-400',
    priority: 3,
  },
  export_ready: {
    label: 'Export ready',
    description: 'PRD generated and all questions answered',
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    priority: 4,
  },
}

export interface ProjectPrdSummary {
  total: number
  needsQuestions: number
  answering: number
  ready: number
  stale: number
  generated: number
  exportReady: number
  /** Nodes that need attention (ready or stale) */
  actionable: number
}

export function getProjectPrdSummary(project: Project): ProjectPrdSummary {
  const eligible = project.nodes.filter((n) => PRD_ELIGIBLE.has(n.type))
  let needsQuestions = 0, answering = 0, ready = 0, stale = 0, generated = 0, exportReady = 0

  for (const node of eligible) {
    const s = getNodePrdStatus(node)
    if (s === 'needs_questions') needsQuestions++
    else if (s === 'answering') answering++
    else if (s === 'ready') ready++
    else if (s === 'stale') stale++
    else if (s === 'generated') generated++
    else if (s === 'export_ready') exportReady++
  }

  return {
    total: eligible.length,
    needsQuestions,
    answering,
    ready,
    stale,
    generated,
    exportReady,
    actionable: ready + stale,
  }
}
