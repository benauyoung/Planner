'use client'

import { useEffect, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  BackgroundVariant,
} from '@xyflow/react'
import type { Project } from '@/types/project'
import type { FlowNode, FlowEdge } from '@/types/canvas'
import { nodeTypes } from '@/components/canvas/nodes/node-types'
import { useAutoLayout } from '@/hooks/use-auto-layout'
import { NODE_CONFIG } from '@/lib/constants'
import type { NodeType, EdgeType } from '@/types/project'
import Link from 'next/link'

const EDGE_STYLES: Record<EdgeType, { strokeDasharray?: string; stroke: string; animated: boolean }> = {
  hierarchy: { stroke: 'hsl(var(--border))', animated: false },
  blocks: { strokeDasharray: '8 4', stroke: 'hsl(0 84% 60%)', animated: true },
  depends_on: { strokeDasharray: '8 4', stroke: 'hsl(217 91% 60%)', animated: false },
}

function projectToFlow(project: Project): { flowNodes: FlowNode[]; flowEdges: FlowEdge[] } {
  const flowNodes: FlowNode[] = project.nodes.map((node) => ({
    id: node.id,
    type: node.type,
    position: { x: 0, y: 0 },
    data: {
      label: node.title,
      description: node.description,
      nodeType: node.type,
      status: node.status,
      collapsed: false,
      parentId: node.parentId,
      questionsTotal: node.questions?.length ?? 0,
      questionsAnswered: node.questions?.filter((q) => (q.answer ?? '').trim() !== '').length ?? 0,
      content: node.content,
      images: node.images,
      prds: node.prds,
      prompts: node.prompts,
    },
    width: NODE_CONFIG[node.type]?.width ?? 220,
    height: NODE_CONFIG[node.type]?.height ?? 90,
  }))

  const visibleIds = new Set(flowNodes.map((n) => n.id))

  const hierarchyEdges: FlowEdge[] = project.nodes
    .filter((node) => node.parentId && visibleIds.has(node.id) && visibleIds.has(node.parentId!))
    .map((node) => ({
      id: `hierarchy-${node.parentId}-${node.id}`,
      source: node.parentId!,
      target: node.id,
      type: 'bezier',
      animated: false,
      style: { strokeDasharray: '6 4', strokeWidth: 1.5 },
    }))

  const depEdges: FlowEdge[] = (project.edges || [])
    .filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target))
    .map((e) => {
      const edgeType = e.edgeType || 'hierarchy'
      const style = EDGE_STYLES[edgeType]
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'bezier',
        animated: style.animated,
        label: e.label || (edgeType === 'blocks' ? 'blocks' : edgeType === 'depends_on' ? 'depends on' : undefined),
        style: {
          stroke: style.stroke,
          strokeWidth: 2,
          ...(style.strokeDasharray ? { strokeDasharray: style.strokeDasharray } : {}),
        },
      }
    })

  return { flowNodes, flowEdges: [...hierarchyEdges, ...depEdges] }
}

interface SharedPlanViewProps {
  project: Project
}

export function SharedPlanView({ project }: SharedPlanViewProps) {
  const { fitView } = useReactFlow()
  const { getLayoutedElements } = useAutoLayout()
  const hasLayouted = useRef(false)

  const { flowNodes: rawNodes, flowEdges: rawEdges } = projectToFlow(project)
  const { nodes, edges } = hasLayouted.current
    ? { nodes: rawNodes, edges: rawEdges }
    : getLayoutedElements(rawNodes, rawEdges)

  useEffect(() => {
    if (!hasLayouted.current && nodes.length > 0) {
      hasLayouted.current = true
      setTimeout(() => fitView({ padding: 0.2, duration: 500 }), 100)
    }
  }, [nodes, fitView])

  const total = project.nodes.length
  const completed = project.nodes.filter((n) => n.status === 'completed').length
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b px-6 py-3 flex items-center justify-between bg-background/80 backdrop-blur-sm">
        <div>
          <h1 className="text-lg font-bold">{project.title}</h1>
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {completed}/{total} complete ({progress}%)
          </div>
          <Link
            href="/"
            className="text-sm text-primary hover:underline"
          >
            Made with VisionPath
          </Link>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          connectOnClick={false}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          defaultEdgeOptions={{
            type: 'bezier',
            animated: false,
            style: { strokeDasharray: '6 4', strokeWidth: 1.5 },
          }}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls showInteractive={false} />
          <MiniMap
            nodeStrokeWidth={3}
            zoomable
            pannable
          />
        </ReactFlow>
      </div>
    </div>
  )
}
