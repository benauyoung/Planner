export interface AgentKnowledgeEntry {
  id: string
  type: 'text' | 'faq' | 'url'
  title: string
  content: string
  createdAt: number
}

export interface AgentAction {
  id: string
  type: 'collect_info' | 'redirect' | 'webhook' | 'show_card'
  label: string
  config: Record<string, string>
}

export interface AgentTheme {
  primaryColor: string
  position: 'bottom-right' | 'bottom-left'
  avatarUrl?: string
  bubbleText?: string
}

export interface AgentBehaviorRule {
  id: string
  rule: string
}

export interface Agent {
  id: string
  name: string
  description: string
  greeting: string
  persona: string
  systemPrompt: string
  knowledge: AgentKnowledgeEntry[]
  actions: AgentAction[]
  rules: AgentBehaviorRule[]
  theme: AgentTheme
  model: 'gemini-2.0-flash' | 'gemini-1.5-pro'
  isPublished: boolean
  createdAt: number
  updatedAt: number
}
