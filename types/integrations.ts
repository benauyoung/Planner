export type IntegrationType = 'github' | 'slack' | 'linear'

export type IntegrationStatus = 'disconnected' | 'connected' | 'error'

export interface IntegrationConfig {
  type: IntegrationType
  status: IntegrationStatus
  connectedAt?: number
  settings: Record<string, string>
}

export interface GitHubIntegration extends IntegrationConfig {
  type: 'github'
  settings: {
    owner: string
    repo: string
    token: string
  }
}

export interface SlackIntegration extends IntegrationConfig {
  type: 'slack'
  settings: {
    webhookUrl: string
    channel: string
  }
}

export interface LinearIntegration extends IntegrationConfig {
  type: 'linear'
  settings: {
    apiKey: string
    teamId: string
  }
}

export type Integration = GitHubIntegration | SlackIntegration | LinearIntegration

export interface GitHubIssue {
  number: number
  title: string
  state: 'open' | 'closed'
  url: string
  linkedNodeId: string
}

export interface SlackNotification {
  type: 'status_change' | 'comment' | 'assignment' | 'sprint_update'
  message: string
  timestamp: number
}
