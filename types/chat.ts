export type ChatPhase = 'onboarding' | 'greeting' | 'refining' | 'planning' | 'done'

export interface OnboardingAnswers {
  description: string
  projectType: string
  features: string[]
  audience?: string
  timeline?: string
  teamSize?: string
  priorities?: string[]
  dynamicAnswers?: Record<string, string | string[]>
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface AINodeQuestion {
  question: string
  options: string[]
}

export interface AIPlanNode {
  id: string
  type: 'goal' | 'subgoal' | 'feature' | 'task' | 'spec' | 'prd' | 'schema' | 'prompt' | 'reference'
  title: string
  description: string
  parentId: string | null
  questions?: (string | AINodeQuestion)[]
}

export interface AIProgressiveResponse {
  message: string
  nodes: AIPlanNode[]
  suggestedTitle?: string | null
  done: boolean
}

export type RefinementCategory = 'scope' | 'technical' | 'priority' | 'audience' | 'timeline'

export interface AIRefinementQuestion {
  id: string
  question: string
  options: string[]
  category: RefinementCategory
}

export interface AIRefinementResponse {
  message: string
  questions: AIRefinementQuestion[]
  readyToBuild: boolean
  suggestedTitle?: string | null
}
