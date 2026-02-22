import type { FlowNode } from '@/types/canvas'

/**
 * Alignment and distribution helpers for multi-selected canvas nodes.
 * All functions return a new array of nodes with updated positions.
 */

export function alignTop(nodes: FlowNode[], selectedIds: Set<string>): FlowNode[] {
  const selected = nodes.filter((n) => selectedIds.has(n.id))
  if (selected.length < 2) return nodes
  const minY = Math.min(...selected.map((n) => n.position.y))
  return nodes.map((n) =>
    selectedIds.has(n.id) ? { ...n, position: { ...n.position, y: minY } } : n
  )
}

export function alignMiddle(nodes: FlowNode[], selectedIds: Set<string>): FlowNode[] {
  const selected = nodes.filter((n) => selectedIds.has(n.id))
  if (selected.length < 2) return nodes
  const avgY = selected.reduce((sum, n) => sum + n.position.y + (n.height ?? 100) / 2, 0) / selected.length
  return nodes.map((n) =>
    selectedIds.has(n.id) ? { ...n, position: { ...n.position, y: avgY - (n.height ?? 100) / 2 } } : n
  )
}

export function alignBottom(nodes: FlowNode[], selectedIds: Set<string>): FlowNode[] {
  const selected = nodes.filter((n) => selectedIds.has(n.id))
  if (selected.length < 2) return nodes
  const maxY = Math.max(...selected.map((n) => n.position.y + (n.height ?? 100)))
  return nodes.map((n) =>
    selectedIds.has(n.id) ? { ...n, position: { ...n.position, y: maxY - (n.height ?? 100) } } : n
  )
}

export function alignLeft(nodes: FlowNode[], selectedIds: Set<string>): FlowNode[] {
  const selected = nodes.filter((n) => selectedIds.has(n.id))
  if (selected.length < 2) return nodes
  const minX = Math.min(...selected.map((n) => n.position.x))
  return nodes.map((n) =>
    selectedIds.has(n.id) ? { ...n, position: { ...n.position, x: minX } } : n
  )
}

export function alignCenter(nodes: FlowNode[], selectedIds: Set<string>): FlowNode[] {
  const selected = nodes.filter((n) => selectedIds.has(n.id))
  if (selected.length < 2) return nodes
  const avgX = selected.reduce((sum, n) => sum + n.position.x + (n.width ?? 240) / 2, 0) / selected.length
  return nodes.map((n) =>
    selectedIds.has(n.id) ? { ...n, position: { ...n.position, x: avgX - (n.width ?? 240) / 2 } } : n
  )
}

export function alignRight(nodes: FlowNode[], selectedIds: Set<string>): FlowNode[] {
  const selected = nodes.filter((n) => selectedIds.has(n.id))
  if (selected.length < 2) return nodes
  const maxX = Math.max(...selected.map((n) => n.position.x + (n.width ?? 240)))
  return nodes.map((n) =>
    selectedIds.has(n.id) ? { ...n, position: { ...n.position, x: maxX - (n.width ?? 240) } } : n
  )
}

export function distributeHorizontal(nodes: FlowNode[], selectedIds: Set<string>): FlowNode[] {
  const selected = nodes.filter((n) => selectedIds.has(n.id))
  if (selected.length < 3) return nodes
  const sorted = [...selected].sort((a, b) => a.position.x - b.position.x)
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  const totalWidth = sorted.reduce((sum, n) => sum + (n.width ?? 240), 0)
  const totalSpace = (last.position.x + (last.width ?? 240)) - first.position.x - totalWidth
  const gap = totalSpace / (sorted.length - 1)

  const posMap = new Map<string, number>()
  let currentX = first.position.x
  for (const n of sorted) {
    posMap.set(n.id, currentX)
    currentX += (n.width ?? 240) + gap
  }

  return nodes.map((n) =>
    posMap.has(n.id) ? { ...n, position: { ...n.position, x: posMap.get(n.id)! } } : n
  )
}

export function distributeVertical(nodes: FlowNode[], selectedIds: Set<string>): FlowNode[] {
  const selected = nodes.filter((n) => selectedIds.has(n.id))
  if (selected.length < 3) return nodes
  const sorted = [...selected].sort((a, b) => a.position.y - b.position.y)
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  const totalHeight = sorted.reduce((sum, n) => sum + (n.height ?? 100), 0)
  const totalSpace = (last.position.y + (last.height ?? 100)) - first.position.y - totalHeight
  const gap = totalSpace / (sorted.length - 1)

  const posMap = new Map<string, number>()
  let currentY = first.position.y
  for (const n of sorted) {
    posMap.set(n.id, currentY)
    currentY += (n.height ?? 100) + gap
  }

  return nodes.map((n) =>
    posMap.has(n.id) ? { ...n, position: { ...n.position, y: posMap.get(n.id)! } } : n
  )
}
