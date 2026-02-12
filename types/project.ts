export type NodeType = 'goal' | 'subgoal' | 'feature' | 'task' | 'moodboard' | 'notes' | 'connector'

export type NodeStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked'

export type ProjectPhase = 'planning' | 'active'

export type Priority = 'critical' | 'high' | 'medium' | 'low' | 'none'

export interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  color: string
}

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
  assigneeId?: string
  priority?: Priority
  dueDate?: number
  estimatedHours?: number
  tags?: string[]
}

export type EdgeType = 'hierarchy' | 'blocks' | 'depends_on'

export interface ProjectEdge {
  id: string
  source: string
  target: string
  edgeType?: EdgeType
  label?: string
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
  isPublic?: boolean
  shareId?: string
  team?: TeamMember[]
}
