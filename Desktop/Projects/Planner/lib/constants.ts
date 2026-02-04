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
}

export const DAGRE_CONFIG = {
  rankdir: 'TB' as const,
  nodesep: 60,
  ranksep: 80,
  marginx: 40,
  marginy: 40,
}

export const STATUS_COLORS = {
  not_started: 'bg-gray-300 dark:bg-gray-600',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
  blocked: 'bg-red-500',
}
