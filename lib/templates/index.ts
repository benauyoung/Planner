import { AUTH_SYSTEM_TEMPLATE } from './auth-system'
import { CRUD_API_TEMPLATE } from './crud-api'
import { LANDING_PAGE_TEMPLATE } from './landing-page'

export interface PlanTemplate {
  title: string
  description: string
  nodeCount: number
  tags: string[]
  nodes: import('@/types/chat').AIPlanNode[]
}

export const TEMPLATES: PlanTemplate[] = [
  AUTH_SYSTEM_TEMPLATE,
  CRUD_API_TEMPLATE,
  LANDING_PAGE_TEMPLATE,
]
