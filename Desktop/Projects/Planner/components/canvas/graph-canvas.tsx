'use client'

import { useCallback, useEffect, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  BackgroundVariant,
} from '@xyflow/react'
import { useProjectStore } from '@/stores/project-store'
import { useUIStore } from '@/stores/ui-store'
import { useAutoLayout } from '@/hooks/use-auto-layout'
import { nodeTypes } from './nodes/node-types'
import { CanvasToolbar } from './canvas-toolbar'
import { NODE_CONFIG } from '@/lib/constants'
import type { NodeType } from '@/types/project'

export function GraphCanvas() {
  const { flowNodes, flowEdges, setFlowNodes, setFlowEdges } = useProjectStore()
  const selectNode = useUIStore((s) => s.selectNode)
  const { getLayoutedElements } = useAutoLayout()
  const { fitView } = useReactFlow()
  const prevNodeCountRef = useRef(0)

  // Auto-layout when node count changes (progressive building)
  useEffect(() => {
    if (flowNodes.length > 0 && flowNodes.length !== prevNodeCountRef.current) {
      const { nodes, edges } = getLayoutedElements(flowNodes, flowEdges)
      setFlowNodes(nodes)
      setFlowEdges(edges)
      prevNodeCountRef.current = flowNodes.length
      setTimeout(() => fitView({ padding: 0.2, duration: 500 }), 50)
    }
  }, [flowNodes.length, flowEdges, getLayoutedElements, setFlowNodes, setFlowEdges, fitView, flowNodes])

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      const updated = applyNodeChanges(changes, flowNodes) as typeof flowNodes
      setFlowNodes(updated)
    },
    [flowNodes, setFlowNodes]
  )

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      const updated = applyEdgeChanges(changes, flowEdges)
      setFlowEdges(updated)
    },
    [flowEdges, setFlowEdges]
  )

  const handleReLayout = useCallback(() => {
    const { nodes, edges } = getLayoutedElements(flowNodes, flowEdges)
    setFlowNodes(nodes)
    setFlowEdges(edges)
    setTimeout(() => fitView({ padding: 0.2 }), 50)
  }, [flowNodes, flowEdges, getLayoutedElements, setFlowNodes, setFlowEdges, fitView])

  const handlePaneClick = useCallback(() => {
    selectNode(null)
  }, [selectNode])

  return (
    <div className="relative w-full h-full">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
        }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) => {
            const nodeType = (node.data?.nodeType || node.type) as NodeType
            return NODE_CONFIG[nodeType]?.color || '#888'
          }}
          maskColor="rgba(0,0,0,0.1)"
          pannable
          zoomable
        />
      </ReactFlow>
      <CanvasToolbar onReLayout={handleReLayout} />
    </div>
  )
}
