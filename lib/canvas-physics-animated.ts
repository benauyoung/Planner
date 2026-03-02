import type { FlowNode, FlowEdge } from '@/types/canvas'

interface Vec2 {
  x: number
  y: number
}

const REPULSION_STRENGTH = 20000
const ATTRACTION_STRENGTH = 0.008
const REST_LENGTH = 150
const HIERARCHY_GRAVITY = 0.025
const DAMPING = 0.80
const MIN_DISTANCE = 50
const ITERATIONS_PER_FRAME = 5
const MAX_FRAMES = 600
const KINETIC_ENERGY_THRESHOLD = 0.5

function distance(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy) || 1
}

export interface SpringSimulation {
  start: (
    nodes: FlowNode[],
    edges: FlowEdge[],
    onUpdate: (nodes: FlowNode[]) => void,
    onComplete: () => void
  ) => void
  stop: () => void
  pinNode: (id: string, position: Vec2) => void
  unpinNode: (id: string) => void
  updatePinnedPosition: (id: string, position: Vec2) => void
  isRunning: () => boolean
}

export function createSpringSimulation(): SpringSimulation {
  let running = false
  let rafId: number | null = null
  const pinnedNodes = new Map<string, Vec2>()

  let positions: Map<string, Vec2>
  let velocities: Map<string, Vec2>
  let nodeList: FlowNode[]
  let edgeList: { source: string; target: string }[]
  let parentMap: Map<string, string>

  function step() {
    const forces = new Map<string, Vec2>()
    for (const node of nodeList) {
      forces.set(node.id, { x: 0, y: 0 })
    }

    // Repulsion between all node pairs
    for (let i = 0; i < nodeList.length; i++) {
      for (let j = i + 1; j < nodeList.length; j++) {
        const posA = positions.get(nodeList[i].id)!
        const posB = positions.get(nodeList[j].id)!
        const dist = Math.max(distance(posA, posB), MIN_DISTANCE)
        const force = REPULSION_STRENGTH / (dist * dist)

        const dx = (posA.x - posB.x) / dist
        const dy = (posA.y - posB.y) / dist

        const fA = forces.get(nodeList[i].id)!
        const fB = forces.get(nodeList[j].id)!
        fA.x += dx * force
        fA.y += dy * force
        fB.x -= dx * force
        fB.y -= dy * force
      }
    }

    // Spring attraction along edges
    for (const edge of edgeList) {
      const posA = positions.get(edge.source)
      const posB = positions.get(edge.target)
      if (!posA || !posB) continue

      const dist = distance(posA, posB)
      const stretch = dist - REST_LENGTH
      if (stretch <= 0) continue

      const force = stretch * ATTRACTION_STRENGTH
      const dx = (posB.x - posA.x) / dist
      const dy = (posB.y - posA.y) / dist

      const fA = forces.get(edge.source)
      const fB = forces.get(edge.target)
      if (fA) { fA.x += dx * force; fA.y += dy * force }
      if (fB) { fB.x -= dx * force; fB.y -= dy * force }
    }

    // Hierarchy gravity
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

    // Apply forces (skip pinned nodes)
    let totalKE = 0
    for (const node of nodeList) {
      if (pinnedNodes.has(node.id)) {
        const pinPos = pinnedNodes.get(node.id)!
        positions.set(node.id, { x: pinPos.x, y: pinPos.y })
        velocities.set(node.id, { x: 0, y: 0 })
        continue
      }

      const vel = velocities.get(node.id)!
      const force = forces.get(node.id)!
      const pos = positions.get(node.id)!

      vel.x = (vel.x + force.x) * DAMPING
      vel.y = (vel.y + force.y) * DAMPING

      pos.x += vel.x
      pos.y += vel.y

      totalKE += vel.x * vel.x + vel.y * vel.y
    }

    return totalKE
  }

  function buildResult(): FlowNode[] {
    return nodeList.map((node) => ({
      ...node,
      position: positions.get(node.id) || node.position,
    }))
  }

  return {
    start(nodes, edges, onUpdate, onComplete) {
      if (running) return
      running = true

      nodeList = nodes
      edgeList = edges.map((e) => ({ source: e.source, target: e.target }))

      positions = new Map()
      velocities = new Map()
      parentMap = new Map()

      for (const node of nodes) {
        positions.set(node.id, {
          x: node.position.x + (Math.random() - 0.5) * 20,
          y: node.position.y + (Math.random() - 0.5) * 20,
        })
        velocities.set(node.id, { x: 0, y: 0 })
        const parentId = (node.data as Record<string, unknown>)?.parentId as string | null
        if (parentId) parentMap.set(node.id, parentId)
      }

      let frameCount = 0

      function tick() {
        if (!running) return

        let totalKE = 0
        for (let i = 0; i < ITERATIONS_PER_FRAME; i++) {
          totalKE = step()
        }

        onUpdate(buildResult())
        frameCount++

        if (totalKE < KINETIC_ENERGY_THRESHOLD || frameCount >= MAX_FRAMES) {
          running = false
          rafId = null
          onComplete()
          return
        }

        rafId = requestAnimationFrame(tick)
      }

      rafId = requestAnimationFrame(tick)
    },

    stop() {
      running = false
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
      pinnedNodes.clear()
    },

    pinNode(id, position) {
      pinnedNodes.set(id, { x: position.x, y: position.y })
    },

    unpinNode(id) {
      pinnedNodes.delete(id)
    },

    updatePinnedPosition(id, position) {
      if (pinnedNodes.has(id)) {
        pinnedNodes.set(id, { x: position.x, y: position.y })
      }
    },

    isRunning() {
      return running
    },
  }
}
