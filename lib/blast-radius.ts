import type { Project } from '@/types/project'

/**
 * Compute the blast radius for a given node: all nodes that are
 * downstream via `blocks` or `depends_on` edges, plus all child
 * nodes in the hierarchy.
 */
export function getBlastRadius(nodeId: string, project: Project): Set<string> {
  const affected = new Set<string>()
  const visited = new Set<string>()

  function traverse(currentId: string) {
    if (visited.has(currentId)) return
    visited.add(currentId)

    // Children in the hierarchy
    const children = project.nodes.filter((n) => n.parentId === currentId)
    for (const child of children) {
      affected.add(child.id)
      traverse(child.id)
    }

    // Nodes this node blocks (source → target means source blocks target)
    const blockedEdges = project.edges.filter(
      (e) => e.source === currentId && (e.edgeType === 'blocks' || e.edgeType === 'depends_on')
    )
    for (const edge of blockedEdges) {
      affected.add(edge.target)
      traverse(edge.target)
    }

    // Also traverse reverse depends_on: if something depends on currentId, it's affected
    const dependentEdges = project.edges.filter(
      (e) => e.target === currentId && e.edgeType === 'depends_on'
    )
    for (const edge of dependentEdges) {
      affected.add(edge.source)
      // Don't recurse further on reverse depends_on to avoid cycles
    }
  }

  traverse(nodeId)
  // Remove the node itself from the affected set
  affected.delete(nodeId)

  return affected
}

/**
 * Get a summary of blast radius impact.
 */
export function getBlastRadiusSummary(
  nodeId: string,
  project: Project
): { total: number; byType: Record<string, number>; nodeIds: string[] } {
  const affected = getBlastRadius(nodeId, project)
  const byType: Record<string, number> = {}

  for (const id of affected) {
    const node = project.nodes.find((n) => n.id === id)
    if (node) {
      byType[node.type] = (byType[node.type] || 0) + 1
    }
  }

  return {
    total: affected.size,
    byType,
    nodeIds: Array.from(affected),
  }
}
