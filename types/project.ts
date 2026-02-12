export type NodeType =
  | 'goal' | 'subgoal' | 'feature' | 'task'
  | 'moodboard' | 'notes' | 'connector'
  | 'spec' | 'prd' | 'schema' | 'prompt' | 'reference'

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

export interface NodeComment {
  id: string
  authorId: string
  authorName: string
  authorColor: string
  content: string
  createdAt: number
}

export interface ActivityEvent {
  id: string
  type: 'status_change' | 'assignment' | 'priority_change' | 'comment' | 'node_created' | 'node_deleted' | 'node_updated'
  nodeId: string
  nodeTitle: string
  actorName: string
  detail: string
  timestamp: number
}

export type SprintStatus = 'planning' | 'active' | 'completed'

export interface Sprint {
  id: string
  name: string
  startDate: number
  endDate: number
  nodeIds: string[]
  status: SprintStatus
}

export type DocumentBlock =
  | { id: string; type: 'heading'; level: 1 | 2 | 3; content: string }
  | { id: string; type: 'paragraph'; content: string }
  | { id: string; type: 'code'; language: string; content: string }
  | { id: string; type: 'checklist'; items: { text: string; checked: boolean }[] }
  | { id: string; type: 'divider' }
  | { id: string; type: 'callout'; emoji: string; content: string }

export interface NodeDocument {
  id: string
  blocks: DocumentBlock[]
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
  comments?: NodeComment[]
  sprintId?: string
  document?: NodeDocument
  // Document node fields
  version?: string
  schemaType?: 'data_model' | 'api_contract' | 'database' | 'other'
  promptType?: 'implementation' | 'refactor' | 'test' | 'review'
  targetTool?: 'cursor' | 'windsurf' | 'claude' | 'generic'
  referenceType?: 'link' | 'file' | 'image'
  url?: string
  acceptanceCriteria?: string[]
}

export type EdgeType =
  | 'hierarchy' | 'blocks' | 'depends_on'
  | 'informs' | 'defines' | 'implements' | 'references' | 'supersedes'

export interface ProjectEdge {
  id: string
  source: string
  target: string
  edgeType?: EdgeType
  label?: string
}

export interface ProjectVersion {
  id: string
  name: string
  snapshot: {
    nodes: PlanNode[]
    edges: ProjectEdge[]
    title: string
    description: string
  }
  parentVersionId?: string
  createdAt: number
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
  activity?: ActivityEvent[]
  sprints?: Sprint[]
  versions?: ProjectVersion[]
  currentVersionId?: string
}
