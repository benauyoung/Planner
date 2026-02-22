import type { FlowNode, FlowEdge } from '@/types/canvas'

/**
 * Simple force-directed (spring) layout engine.
 * Runs a fixed number of iterations synchronously and returns updated node positions.
 */

interface Vec2 {
  x: number
  y: number
}

const REPULSION_STRENGTH = 8000
const ATTRACTION_STRENGTH = 0.005
const HIERARCHY_GRAVITY = 0.02
const DAMPING = 0.85
const MIN_DISTANCE = 50
const ITERATIONS = 80

function distance(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy) || 1
}

export function springLayout(
  nodes: FlowNode[],
  edges: FlowEdge[]
): FlowNode[] {
  if (nodes.length === 0) return nodes

  // Initialize velocities
  const velocities = new Map<string, Vec2>()
  const positions = new Map<string, Vec2>()

  for (const node of nodes) {
    velocities.set(node.id, { x: 0, y: 0 })
    positions.set(node.id, { ...node.position })
  }

  // Build edge lookup
  const edgeList = edges.map((e) => ({ source: e.source, target: e.target }))

  // Build parent lookup from node data
  const parentMap = new Map<string, string>()
  for (const node of nodes) {
    const parentId = (node.data as Record<string, unknown>)?.parentId as string | null
    if (parentId) parentMap.set(node.id, parentId)
  }

  for (let iter = 0; iter < ITERATIONS; iter++) {
    const forces = new Map<string, Vec2>()
    for (const node of nodes) {
      forces.set(node.id, { x: 0, y: 0 })
    }

    // Repulsion between all node pairs (Coulomb-like)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const posA = positions.get(nodes[i].id)!
        const posB = positions.get(nodes[j].id)!
        const dist = Math.max(distance(posA, posB), MIN_DISTANCE)
        const force = REPULSION_STRENGTH / (dist * dist)

        const dx = (posA.x - posB.x) / dist
        const dy = (posA.y - posB.y) / dist

        const fA = forces.get(nodes[i].id)!
        const fB = forces.get(nodes[j].id)!
        fA.x += dx * force
        fA.y += dy * force
        fB.x -= dx * force
        fB.y -= dy * force
      }
    }

    // Attraction along edges (spring/Hooke-like)
    for (const edge of edgeList) {
      const posA = positions.get(edge.source)
      const posB = positions.get(edge.target)
      if (!posA || !posB) continue

      const dist = distance(posA, posB)
      const force = dist * ATTRACTION_STRENGTH

      const dx = (posB.x - posA.x) / dist
      const dy = (posB.y - posA.y) / dist

      const fA = forces.get(edge.source)
      const fB = forces.get(edge.target)
      if (fA) { fA.x += dx * force; fA.y += dy * force }
      if (fB) { fB.x -= dx * force; fB.y -= dy * force }
    }

    // Hierarchy gravity: children pulled to the right of their parent
    for (const [childId, parentId] of parentMap) {
      const childPos = positions.get(childId)
      const parentPos = positions.get(parentId)
      if (!childPos || !parentPos) continue

      const targetX = parentPos.x + 300
      const targetY = parentPos.y
      const f = forces.get(childId)
      if (f) {
        f.x += (targetX - childPos.x) * HIERARCHY_GRAVITY
        f.y += (targetY - childPos.y) * HIERARCHY_GRAVITY * 0.5
      }
    }

    // Apply forces with damping
    for (const node of nodes) {
      const vel = velocities.get(node.id)!
      const force = forces.get(node.id)!
      const pos = positions.get(node.id)!

      vel.x = (vel.x + force.x) * DAMPING
      vel.y = (vel.y + force.y) * DAMPING

      pos.x += vel.x
      pos.y += vel.y
    }
  }

  // Return nodes with updated positions
  return nodes.map((node) => ({
    ...node,
    position: positions.get(node.id) || node.position,
  }))
}
