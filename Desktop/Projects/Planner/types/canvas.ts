import type { Node, Edge } from '@xyflow/react'
import type { NodeType, NodeStatus } from './project'

export interface PlanNodeData {
  label: string
  description: string
  nodeType: NodeType
  status: NodeStatus
  collapsed: boolean
  parentId: string | null
  [key: string]: unknown
}

export type FlowNode = Node<PlanNodeData>
export type FlowEdge = Edge
