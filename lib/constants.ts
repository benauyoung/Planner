import type { NodeType } from '@/types/project'

export const NODE_CONFIG: Record<NodeType, {
  label: string
  color: string
  bgClass: string
  borderClass: string
  textClass: string
  badgeClass: string
  icon: string
  width: number
  height: number
}> = {
  goal: {
    label: 'Goal',
    color: 'hsl(var(--node-goal))',
    bgClass: 'bg-orange-50 dark:bg-orange-950/30',
    borderClass: 'border-node-goal',
    textClass: 'text-orange-700 dark:text-orange-300',
    badgeClass: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
    icon: 'Target',
    width: 280,
    height: 120,
  },
  subgoal: {
    label: 'Subgoal',
    color: 'hsl(var(--node-subgoal))',
    bgClass: 'bg-blue-50 dark:bg-blue-950/30',
    borderClass: 'border-node-subgoal',
    textClass: 'text-blue-700 dark:text-blue-300',
    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    icon: 'Flag',
    width: 260,
    height: 110,
  },
  feature: {
    label: 'Feature',
    color: 'hsl(var(--node-feature))',
    bgClass: 'bg-green-50 dark:bg-green-950/30',
    borderClass: 'border-node-feature',
    textClass: 'text-green-700 dark:text-green-300',
    badgeClass: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    icon: 'Puzzle',
    width: 240,
    height: 100,
  },
  task: {
    label: 'Task',
    color: 'hsl(var(--node-task))',
    bgClass: 'bg-violet-50 dark:bg-violet-950/30',
    borderClass: 'border-node-task',
    textClass: 'text-violet-700 dark:text-violet-300',
    badgeClass: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300',
    icon: 'CheckSquare',
    width: 220,
    height: 90,
  },
  moodboard: {
    label: 'Mood Board',
    color: 'hsl(var(--node-moodboard))',
    bgClass: 'bg-pink-50 dark:bg-pink-950/30',
    borderClass: 'border-node-moodboard',
    textClass: 'text-pink-700 dark:text-pink-300',
    badgeClass: 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300',
    icon: 'ImagePlus',
    width: 300,
    height: 250,
  },
  notes: {
    label: 'Notes',
    color: 'hsl(var(--node-notes))',
    bgClass: 'bg-amber-50 dark:bg-amber-950/30',
    borderClass: 'border-node-notes',
    textClass: 'text-amber-700 dark:text-amber-300',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    icon: 'FileText',
    width: 320,
    height: 200,
  },
  connector: {
    label: 'Connector',
    color: 'hsl(var(--node-connector))',
    bgClass: 'bg-slate-50 dark:bg-slate-950/30',
    borderClass: 'border-node-connector',
    textClass: 'text-slate-700 dark:text-slate-300',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300',
    icon: 'Circle',
    width: 120,
    height: 40,
  },
}

export const NODE_CHILD_TYPE: Record<NodeType, NodeType | null> = {
  goal: 'subgoal',
  subgoal: 'feature',
  feature: 'task',
  task: null,
  moodboard: null,
  notes: null,
  connector: null,
}

export const DAGRE_CONFIG = {
  rankdir: 'LR' as const,
  nodesep: 40,
  ranksep: 100,
  marginx: 40,
  marginy: 40,
}

export const STATUS_COLORS = {
  not_started: 'bg-gray-300 dark:bg-gray-600',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
  blocked: 'bg-red-500',
}
