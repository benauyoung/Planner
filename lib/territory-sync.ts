import type { PlanNode, ProjectEdge } from '@/types/project'

/**
 * Territory sync — diff engine, merge logic, conflict detection.
 *
 * Compares canvas state (current) with territory file state (incoming)
 * and produces a merge plan with additions, updates, deletions, and conflicts.
 */

export interface NodeDiff {
  id: string
  action: 'add' | 'update' | 'delete' | 'conflict'
  canvasNode?: PlanNode
  territoryNode?: PlanNode
  fields?: string[] // which fields changed (for updates/conflicts)
}

export interface EdgeDiff {
  id: string
  action: 'add' | 'delete'
  edge: ProjectEdge
}

export interface SyncDiff {
  nodes: NodeDiff[]
  edges: EdgeDiff[]
  summary: {
    added: number
    updated: number
    deleted: number
    conflicts: number
    edgesAdded: number
    edgesDeleted: number
  }
}

/**
 * Compare canvas nodes/edges with territory nodes/edges.
 * Direction: territory → canvas (import merge).
 */
export function diffTerritoryToCanvas(
  canvasNodes: PlanNode[],
  canvasEdges: ProjectEdge[],
  territoryNodes: PlanNode[],
  territoryEdges: ProjectEdge[]
): SyncDiff {
  const canvasMap = new Map(canvasNodes.map((n) => [n.id, n]))
  const territoryMap = new Map(territoryNodes.map((n) => [n.id, n]))

  const nodeDiffs: NodeDiff[] = []

  // Nodes in territory but not in canvas → add
  for (const tNode of territoryNodes) {
    const cNode = canvasMap.get(tNode.id)
    if (!cNode) {
      nodeDiffs.push({ id: tNode.id, action: 'add', territoryNode: tNode })
      continue
    }

    // Both exist → check for changes
    const changedFields = getChangedFields(cNode, tNode)
    if (changedFields.length > 0) {
      // If only territory changed (canvas is "original"), it's an update
      // If both changed, it's a conflict
      // Since we don't track original state, treat all changes as updates
      // The user can review in the UI
      nodeDiffs.push({
        id: tNode.id,
        action: 'update',
        canvasNode: cNode,
        territoryNode: tNode,
        fields: changedFields,
      })
    }
  }

  // Nodes in canvas but not in territory → delete
  for (const cNode of canvasNodes) {
    if (!territoryMap.has(cNode.id)) {
      nodeDiffs.push({ id: cNode.id, action: 'delete', canvasNode: cNode })
    }
  }

  // Edge diffs (dependency edges only — hierarchy edges are derived from parentId)
  const canvasDeps = canvasEdges.filter((e) => e.edgeType && e.edgeType !== 'hierarchy')
  const territoryDeps = territoryEdges.filter((e) => e.edgeType && e.edgeType !== 'hierarchy')

  const canvasEdgeSet = new Set(canvasDeps.map((e) => `${e.source}|${e.edgeType}|${e.target}`))
  const territoryEdgeSet = new Set(territoryDeps.map((e) => `${e.source}|${e.edgeType}|${e.target}`))

  const edgeDiffs: EdgeDiff[] = []

  for (const tEdge of territoryDeps) {
    const key = `${tEdge.source}|${tEdge.edgeType}|${tEdge.target}`
    if (!canvasEdgeSet.has(key)) {
      edgeDiffs.push({ id: tEdge.id, action: 'add', edge: tEdge })
    }
  }

  for (const cEdge of canvasDeps) {
    const key = `${cEdge.source}|${cEdge.edgeType}|${cEdge.target}`
    if (!territoryEdgeSet.has(key)) {
      edgeDiffs.push({ id: cEdge.id, action: 'delete', edge: cEdge })
    }
  }

  return {
    nodes: nodeDiffs,
    edges: edgeDiffs,
    summary: {
      added: nodeDiffs.filter((d) => d.action === 'add').length,
      updated: nodeDiffs.filter((d) => d.action === 'update').length,
      deleted: nodeDiffs.filter((d) => d.action === 'delete').length,
      conflicts: nodeDiffs.filter((d) => d.action === 'conflict').length,
      edgesAdded: edgeDiffs.filter((d) => d.action === 'add').length,
      edgesDeleted: edgeDiffs.filter((d) => d.action === 'delete').length,
    },
  }
}

/**
 * Compare canvas nodes/edges with territory nodes/edges.
 * Direction: canvas → territory (export diff).
 */
export function diffCanvasToTerritory(
  canvasNodes: PlanNode[],
  canvasEdges: ProjectEdge[],
  territoryNodes: PlanNode[],
  territoryEdges: ProjectEdge[]
): SyncDiff {
  // Reverse the direction
  return diffTerritoryToCanvas(territoryNodes, territoryEdges, canvasNodes, canvasEdges)
}

/**
 * Apply a merge: take territory changes and merge into canvas nodes.
 * Returns the merged node list and edge list.
 */
export function applyMerge(
  canvasNodes: PlanNode[],
  canvasEdges: ProjectEdge[],
  diff: SyncDiff,
  acceptedIds?: Set<string> // if provided, only apply these diffs
): { nodes: PlanNode[]; edges: ProjectEdge[] } {
  const nodeMap = new Map(canvasNodes.map((n) => [n.id, { ...n }]))

  for (const nd of diff.nodes) {
    if (acceptedIds && !acceptedIds.has(nd.id)) continue

    switch (nd.action) {
      case 'add':
        if (nd.territoryNode) {
          nodeMap.set(nd.id, nd.territoryNode)
        }
        break
      case 'update':
        if (nd.territoryNode) {
          // Merge: territory values overwrite canvas for changed fields
          const existing = nodeMap.get(nd.id)
          if (existing) {
            nodeMap.set(nd.id, { ...existing, ...nd.territoryNode })
          } else {
            nodeMap.set(nd.id, nd.territoryNode)
          }
        }
        break
      case 'delete':
        nodeMap.delete(nd.id)
        break
      case 'conflict':
        // For conflicts, prefer territory if accepted
        if (nd.territoryNode) {
          const existing = nodeMap.get(nd.id)
          if (existing) {
            nodeMap.set(nd.id, { ...existing, ...nd.territoryNode })
          }
        }
        break
    }
  }

  const mergedNodes = Array.from(nodeMap.values())

  // Rebuild hierarchy edges from parentId
  const hierarchyEdges = mergedNodes
    .filter((n) => n.parentId)
    .map((n) => ({
      id: `${n.parentId}-${n.id}`,
      source: n.parentId!,
      target: n.id,
    }))

  // Merge dependency edges
  const existingDeps = canvasEdges.filter((e) => e.edgeType && e.edgeType !== 'hierarchy')
  const depMap = new Map(existingDeps.map((e) => [`${e.source}|${e.edgeType}|${e.target}`, e]))

  for (const ed of diff.edges) {
    if (acceptedIds && !acceptedIds.has(ed.id)) continue
    const key = `${ed.edge.source}|${ed.edge.edgeType}|${ed.edge.target}`
    if (ed.action === 'add') {
      depMap.set(key, ed.edge)
    } else if (ed.action === 'delete') {
      depMap.delete(key)
    }
  }

  const mergedEdges: ProjectEdge[] = [
    ...hierarchyEdges,
    ...Array.from(depMap.values()),
  ]

  return { nodes: mergedNodes, edges: mergedEdges }
}

// ── Helpers ──

function getChangedFields(a: PlanNode, b: PlanNode): string[] {
  const fields: string[] = []

  if (a.title !== b.title) fields.push('title')
  if (a.description !== b.description) fields.push('description')
  if (a.status !== b.status) fields.push('status')
  if (a.type !== b.type) fields.push('type')
  if (a.parentId !== b.parentId) fields.push('parentId')
  if (a.collapsed !== b.collapsed) fields.push('collapsed')
  if (a.priority !== b.priority) fields.push('priority')
  if (a.assigneeId !== b.assigneeId) fields.push('assignee')
  if (a.content !== b.content) fields.push('content')
  if (a.sprintId !== b.sprintId) fields.push('sprint')
  if (JSON.stringify(a.tags) !== JSON.stringify(b.tags)) fields.push('tags')
  if (JSON.stringify(a.acceptanceCriteria) !== JSON.stringify(b.acceptanceCriteria)) fields.push('acceptanceCriteria')

  return fields
}
