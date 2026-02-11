'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  BackgroundVariant,
} from '@xyflow/react'
import { useProjectStore } from '@/stores/project-store'
import { useUIStore } from '@/stores/ui-store'
import { useAutoLayout } from '@/hooks/use-auto-layout'
import { nodeTypes } from './nodes/node-types'
import { CanvasToolbar } from './canvas-toolbar'
import { NodeContextMenu } from './context-menu/node-context-menu'
import { PaneContextMenu } from './context-menu/pane-context-menu'
import { NODE_CONFIG } from '@/lib/constants'
import { getBlastRadius } from '@/lib/blast-radius'
import type { NodeType } from '@/types/project'
import type { Node } from '@xyflow/react'

export function GraphCanvas() {
  const { flowNodes, flowEdges, setFlowNodes, setFlowEdges } = useProjectStore()
  const selectNode = useUIStore((s) => s.selectNode)
  const selectedNodeId = useUIStore((s) => s.selectedNodeId)
  const { getLayoutedElements } = useAutoLayout()
  const { fitView } = useReactFlow()
  const prevNodeCountRef = useRef(0)
  const [contextMenu, setContextMenu] = useState<{
    nodeId: string
    position: { x: number; y: number }
  } | null>(null)
  const [paneContextMenu, setPaneContextMenu] = useState<{
    position: { x: number; y: number }
    canvasPosition: { x: number; y: number }
  } | null>(null)
  const connectNodes = useProjectStore((s) => s.connectNodes)
  const addDependencyEdge = useProjectStore((s) => s.addDependencyEdge)
  const currentProject = useProjectStore((s) => s.currentProject)
  const reactFlowInstance = useReactFlow()
  const blastRadiusMode = useUIStore((s) => s.blastRadiusMode)
  const pendingEdge = useUIStore((s) => s.pendingEdge)

  // Compute blast radius affected node IDs
  const blastRadiusIds = useCallback(() => {
    if (!blastRadiusMode || !selectedNodeId || !currentProject) return new Set<string>()
    return getBlastRadius(selectedNodeId, currentProject)
  }, [blastRadiusMode, selectedNodeId, currentProject])

  // Apply blast radius dimming to flow nodes
  const displayNodes = useMemo(() => {
    if (!blastRadiusMode || !selectedNodeId) return flowNodes
    const affected = blastRadiusIds()
    if (affected.size === 0) return flowNodes
    return flowNodes.map((node) => {
      const isAffected = affected.has(node.id) || node.id === selectedNodeId
      return {
        ...node,
        style: {
          ...node.style,
          opacity: isAffected ? 1 : 0.25,
          transition: 'opacity 0.3s ease',
        },
      }
    })
  }, [flowNodes, blastRadiusMode, selectedNodeId, blastRadiusIds])

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

  // Zoom to selected node and its direct connections
  useEffect(() => {
    if (!selectedNodeId) return
    const node = flowNodes.find((n) => n.id === selectedNodeId)
    if (!node) return

    // Collect the selected node + its parent + children
    const relatedIds = new Set([selectedNodeId])
    flowEdges.forEach((e) => {
      if (e.source === selectedNodeId || e.target === selectedNodeId) {
        relatedIds.add(e.source)
        relatedIds.add(e.target)
      }
    })

    setTimeout(() => {
      fitView({
        nodes: flowNodes.filter((n) => relatedIds.has(n.id)),
        padding: 0.4,
        duration: 400,
        maxZoom: 1.2,
      })
    }, 50)
  }, [selectedNodeId, flowNodes, flowEdges, fitView])

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

  const onConnect: OnConnect = useCallback(
    (connection) => {
      if (connection.source && connection.target) {
        if (pendingEdge && pendingEdge.sourceId === connection.source) {
          addDependencyEdge(connection.source, connection.target, pendingEdge.edgeType)
          useUIStore.getState().cancelEdgeCreation()
        } else {
          connectNodes(connection.source, connection.target)
        }
      }
    },
    [connectNodes, addDependencyEdge, pendingEdge]
  )

  const handlePaneClick = useCallback(() => {
    selectNode(null)
    setContextMenu(null)
    setPaneContextMenu(null)
  }, [selectNode])

  const handlePaneContextMenu = useCallback(
    (event: MouseEvent | React.MouseEvent) => {
      event.preventDefault()
      const canvasPos = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      setPaneContextMenu({
        position: { x: event.clientX, y: event.clientY },
        canvasPosition: canvasPos,
      })
      setContextMenu(null)
    },
    [reactFlowInstance]
  )

  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault()
      setContextMenu({
        nodeId: node.id,
        position: { x: event.clientX, y: event.clientY },
      })
    },
    []
  )

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null)
  }, [])

  return (
    <div className="relative w-full h-full">
      <ReactFlow
        nodes={displayNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={handlePaneClick}
        onPaneContextMenu={handlePaneContextMenu}
        onNodeContextMenu={handleNodeContextMenu}
        nodeTypes={nodeTypes}
        connectOnClick={false}
        defaultEdgeOptions={{
          type: 'bezier',
          animated: false,
          style: { strokeDasharray: '6 4', strokeWidth: 1.5 },
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
      {contextMenu && (
        <NodeContextMenu
          nodeId={contextMenu.nodeId}
          position={contextMenu.position}
          onClose={handleCloseContextMenu}
        />
      )}
      {paneContextMenu && (
        <PaneContextMenu
          position={paneContextMenu.position}
          canvasPosition={paneContextMenu.canvasPosition}
          onClose={() => setPaneContextMenu(null)}
        />
      )}
    </div>
  )
}
