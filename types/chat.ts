export type ChatPhase = 'onboarding' | 'greeting' | 'planning' | 'done'

export interface OnboardingAnswers {
  description: string
  projectType: string
  features: string[]
  audience: string
  timeline: string
  teamSize: string
  priorities: string[]
}

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
  questions?: string[]
}

export interface AIProgressiveResponse {
  message: string
  nodes: AIPlanNode[]
  suggestedTitle?: string | null
  done: boolean
}
