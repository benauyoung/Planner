import { useCallback } from 'react'
import dagre from 'dagre'
import type { FlowNode, FlowEdge } from '@/types/canvas'
import { NODE_CONFIG, DAGRE_CONFIG } from '@/lib/constants'
import type { NodeType } from '@/types/project'

export function useAutoLayout() {
  const getLayoutedElements = useCallback(
    (nodes: FlowNode[], edges: FlowEdge[]): { nodes: FlowNode[]; edges: FlowEdge[] } => {
      if (nodes.length === 0) return { nodes, edges }

      const g = new dagre.graphlib.Graph()
      g.setDefaultEdgeLabel(() => ({}))
      g.setGraph({
        rankdir: DAGRE_CONFIG.rankdir,
        nodesep: DAGRE_CONFIG.nodesep,
        ranksep: DAGRE_CONFIG.ranksep,
        marginx: DAGRE_CONFIG.marginx,
        marginy: DAGRE_CONFIG.marginy,
      })

      nodes.forEach((node) => {
        const nodeType = (node.data.nodeType || node.type) as NodeType
        const config = NODE_CONFIG[nodeType] || NODE_CONFIG.task
        g.setNode(node.id, {
          width: config.width,
          // +4 safety margin: pill nodes have fixed height
          height: config.height + 4,
        })
      })

      edges.forEach((edge) => {
        g.setEdge(edge.source, edge.target)
      })

      dagre.layout(g)

      const layoutedNodes = nodes.map((node) => {
        const nodeType = (node.data.nodeType || node.type) as NodeType
        const config = NODE_CONFIG[nodeType] || NODE_CONFIG.task
        const dagreNode = g.node(node.id)
        return {
          ...node,
          position: {
            x: dagreNode.x - config.width / 2,
            y: dagreNode.y - (config.height + 4) / 2,
          },
        }
      })

      return { nodes: layoutedNodes, edges }
    },
    []
  )

  return { getLayoutedElements }
}
