'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  useUpdateNodeInternals,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type OnSelectionChangeFunc,
  type NodeChange,
  applyNodeChanges,
  applyEdgeChanges,
  BackgroundVariant,
} from '@xyflow/react'
import { useZoomLevel } from '@/hooks/use-zoom-level'
import { useProjectStore } from '@/stores/project-store'
import { useUIStore } from '@/stores/ui-store'
import { useAutoLayout } from '@/hooks/use-auto-layout'
import { nodeTypes } from './nodes/node-types'
import { CanvasToolbar } from './canvas-toolbar'
import { NodeContextMenu } from './context-menu/node-context-menu'
import { PaneContextMenu } from './context-menu/pane-context-menu'
import { SmartGuidesOverlay } from './smart-guides-overlay'
import { NODE_CONFIG } from '@/lib/constants'
import { getBlastRadius } from '@/lib/blast-radius'
import { snapToGridPosition, computeSmartGuides, type GuideLine } from '@/lib/canvas-guides'
import { BulkActionsBar } from './bulk-actions-bar'
import { PrdBottomStrip } from './prd-bottom-strip'
import { TerritorySyncPanel } from './territory-sync-panel'
import { SubtreeBackgrounds } from './subtree-backgrounds'
import type { NodeType } from '@/types/project'
import type { Node } from '@xyflow/react'

export function GraphCanvas() {
  const { flowNodes, flowEdges, setFlowNodes, setFlowEdges } = useProjectStore()
  const selectNode = useUIStore((s) => s.selectNode)
  const selectedNodeId = useUIStore((s) => s.selectedNodeId)
  const { getLayoutedElements } = useAutoLayout()
  const { fitView } = useReactFlow()
  const prevNodeCountRef = useRef(0)
  const [territorySyncOpen, setTerritorySyncOpen] = useState(false)
  const [contextMenu, setContextMenu] = useState<{
    nodeId: string
    position: { x: number; y: number }
  } | null>(null)
  const [paneContextMenu, setPaneContextMenu] = useState<{
    position: { x: number; y: number }
    canvasPosition: { x: number; y: number }
  } | null>(null)
  const [smartGuides, setSmartGuides] = useState<GuideLine[]>([])
  const connectNodes = useProjectStore((s) => s.connectNodes)
  const addDependencyEdge = useProjectStore((s) => s.addDependencyEdge)
  const currentProject = useProjectStore((s) => s.currentProject)
  const reactFlowInstance = useReactFlow()
  const updateNodeInternals = useUpdateNodeInternals()
  const lod = useZoomLevel()
  const blastRadiusMode = useUIStore((s) => s.blastRadiusMode)
  const pendingEdge = useUIStore((s) => s.pendingEdge)
  const selectedNodeIds = useUIStore((s) => s.selectedNodeIds)
  const setSelectedNodes = useUIStore((s) => s.setSelectedNodes)
  const minimapOpen = useUIStore((s) => s.minimapOpen)
  const snapToGrid = useUIStore((s) => s.snapToGrid)
  const gridSize = useUIStore((s) => s.gridSize)
  const showSmartGuides = useUIStore((s) => s.showSmartGuides)
  const layoutMode = useUIStore((s) => s.layoutMode)
  const setSpringSimulationRunning = useUIStore((s) => s.setSpringSimulationRunning)


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
      setTimeout(() => fitView({ padding: 0.2, duration: 500, maxZoom: 0.9 }), 50)
    }
  }, [flowNodes.length, flowEdges, getLayoutedElements, setFlowNodes, setFlowEdges, fitView, flowNodes])

  // When LOD tier changes, bulk-update all node internals so edges re-route to new handle positions
  useEffect(() => {
    if (flowNodes.length === 0) return
    const ids = flowNodes.map((n) => n.id)
    const raf = requestAnimationFrame(() => updateNodeInternals(ids))
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lod])

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
      // Intercept position changes for snap-to-grid and smart guides
      const processedChanges = changes.map((change) => {
        if (change.type !== 'position' || !change.position) return change

        const posChange = change as NodeChange & { dragging?: boolean; position?: { x: number; y: number }; id: string }
        if (!posChange.dragging || !posChange.position) return change

        if (snapToGrid) {
          const snapped = snapToGridPosition(posChange.position.x, posChange.position.y, gridSize)
          return { ...posChange, position: snapped }
        }

        if (showSmartGuides) {
          // Find the dragged node to get its dimensions
          const draggedFlowNode = flowNodes.find((n) => n.id === posChange.id)
          if (draggedFlowNode) {
            const width = (draggedFlowNode.measured?.width ?? draggedFlowNode.width) || 200
            const height = (draggedFlowNode.measured?.height ?? draggedFlowNode.height) || 100
            const draggedRect = {
              x: posChange.position.x,
              y: posChange.position.y,
              width,
              height,
            }
            const otherRects = flowNodes
              .filter((n) => n.id !== posChange.id)
              .map((n) => ({
                x: n.position.x,
                y: n.position.y,
                width: (n.measured?.width ?? n.width) || 200,
                height: (n.measured?.height ?? n.height) || 100,
              }))
            const { guides, snappedPosition } = computeSmartGuides(draggedRect, otherRects)
            setSmartGuides(guides)
            return { ...posChange, position: snappedPosition }
          }
        }

        return change
      })

      // Clear smart guides when drag ends
      const anyDragEnd = changes.some(
        (c) => c.type === 'position' && (c as NodeChange & { dragging?: boolean }).dragging === false
      )
      if (anyDragEnd) {
        setSmartGuides([])
      }

      const updated = applyNodeChanges(processedChanges, flowNodes) as typeof flowNodes
      setFlowNodes(updated)
    },
    [flowNodes, setFlowNodes, snapToGrid, gridSize, showSmartGuides]
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

  const onSelectionChange: OnSelectionChangeFunc = useCallback(
    ({ nodes: selectedNodes }) => {
      const ids = selectedNodes.map((n) => n.id)
      if (ids.length > 1) {
        setSelectedNodes(ids)
      }
    },
    [setSelectedNodes]
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
        selectionOnDrag
        multiSelectionKeyCode="Shift"
        onSelectionChange={onSelectionChange}
        defaultEdgeOptions={{
          type: 'bezier',
          animated: false,
          style: { strokeDasharray: '6 4', strokeWidth: 1.5, stroke: 'hsl(var(--muted-foreground) / 0.2)' },
        }}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 0.9 }}
        minZoom={0.15}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={snapToGrid ? BackgroundVariant.Lines : BackgroundVariant.Dots}
          gap={snapToGrid ? gridSize : 20}
          size={snapToGrid ? 0.5 : 1}
        />
        <Controls showInteractive={false} />
        {minimapOpen && (
          <MiniMap
            nodeColor={(node) => {
              const nodeType = (node.data?.nodeType || node.type) as NodeType
              return NODE_CONFIG[nodeType]?.color || '#888'
            }}
            maskColor="rgba(0,0,0,0.1)"
            pannable
            zoomable
          />
        )}
      </ReactFlow>
      <SubtreeBackgrounds />
      {showSmartGuides && !snapToGrid && smartGuides.length > 0 && (
        <SmartGuidesOverlay guides={smartGuides} />
      )}
      <CanvasToolbar
        onReLayout={handleReLayout}
        onToggleTerritorySync={() => setTerritorySyncOpen((p) => !p)}
        territorySyncOpen={territorySyncOpen}
      />
      {selectedNodeIds.size > 1 && (
        <BulkActionsBar />
      )}
      <PrdBottomStrip />
      {territorySyncOpen && (
        <TerritorySyncPanel onClose={() => setTerritorySyncOpen(false)} />
      )}
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
