import type { Node, Edge } from '@xyflow/react'
import type { NodeType, NodeStatus, NodePRD, NodePrompt } from './project'

export interface PlanNodeData {
  label: string
  description: string
  nodeType: NodeType
  status: NodeStatus
  collapsed: boolean
  parentId: string | null
  questionsTotal: number
  questionsAnswered: number
  content?: string
  images?: string[]
  prds?: NodePRD[]
  prompts?: NodePrompt[]
  [key: string]: unknown
}

export type FlowNode = Node<PlanNodeData>
export type FlowEdge = Edge
