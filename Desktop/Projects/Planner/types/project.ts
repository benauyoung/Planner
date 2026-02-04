export type NodeType = 'goal' | 'subgoal' | 'feature' | 'task'

export type NodeStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked'

export type ProjectPhase = 'planning' | 'active'

export interface PlanNode {
  id: string
  type: NodeType
  title: string
  description: string
  status: NodeStatus
  parentId: string | null
  collapsed: boolean
}

export interface ProjectEdge {
  id: string
  source: string
  target: string
}

export interface Project {
  id: string
  title: string
  description: string
  phase: ProjectPhase
  nodes: PlanNode[]
  edges: ProjectEdge[]
  createdAt: number
  updatedAt: number
}
