export type NodeType = 'goal' | 'subgoal' | 'feature' | 'task' | 'moodboard' | 'notes' | 'connector'

export type NodeStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked'

export type ProjectPhase = 'planning' | 'active'

export interface NodeQuestion {
  id: string
  question: string
  answer: string
  options?: string[]
  isCustom?: boolean
}

export interface NodePRD {
  id: string
  title: string
  content: string
  updatedAt: number
}

export interface NodePrompt {
  id: string
  title: string
  content: string
  updatedAt: number
}

export interface PlanNode {
  id: string
  type: NodeType
  title: string
  description: string
  status: NodeStatus
  parentId: string | null
  collapsed: boolean
  questions: NodeQuestion[]
  content?: string
  images?: string[]
  prds?: NodePRD[]
  prompts?: NodePrompt[]
}

export interface ProjectEdge {
  id: string
  source: string
  target: string
}

export interface Project {
  id: string
  userId: string
  title: string
  description: string
  phase: ProjectPhase
  nodes: PlanNode[]
  edges: ProjectEdge[]
  createdAt: number
  updatedAt: number
}
