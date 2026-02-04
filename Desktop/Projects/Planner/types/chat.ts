export type ChatPhase = 'greeting' | 'planning' | 'done'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface AIPlanNode {
  id: string
  type: 'goal' | 'subgoal' | 'feature' | 'task'
  title: string
  description: string
  parentId: string | null
}

export interface AIProgressiveResponse {
  message: string
  nodes: AIPlanNode[]
  suggestedTitle?: string | null
  done: boolean
}
