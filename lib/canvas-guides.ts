export interface GuideLine {
  orientation: 'horizontal' | 'vertical'
  position: number // x for vertical, y for horizontal
  from: number
  to: number
}

interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export function snapToGridPosition(
  x: number,
  y: number,
  gridSize: number
): { x: number; y: number } {
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize,
  }
}

export function computeSmartGuides(
  draggedNode: Rect,
  allNodes: Rect[],
  threshold = 5
): { guides: GuideLine[]; snappedPosition: { x: number; y: number } } {
  const guides: GuideLine[] = []
  let snappedX = draggedNode.x
  let snappedY = draggedNode.y
  let closestDx = threshold + 1
  let closestDy = threshold + 1

  const dragCx = draggedNode.x + draggedNode.width / 2
  const dragCy = draggedNode.y + draggedNode.height / 2
  const dragRight = draggedNode.x + draggedNode.width
  const dragBottom = draggedNode.y + draggedNode.height

  // Reference points for the dragged node
  const dragXRefs = [
    { value: draggedNode.x, offset: 0 },            // left
    { value: dragCx, offset: -draggedNode.width / 2 }, // center
    { value: dragRight, offset: -draggedNode.width },   // right
  ]
  const dragYRefs = [
    { value: draggedNode.y, offset: 0 },              // top
    { value: dragCy, offset: -draggedNode.height / 2 }, // center
    { value: dragBottom, offset: -draggedNode.height },  // bottom
  ]

  for (const other of allNodes) {
    const otherCx = other.x + other.width / 2
    const otherCy = other.y + other.height / 2
    const otherRight = other.x + other.width
    const otherBottom = other.y + other.height

    const otherXRefs = [other.x, otherCx, otherRight]
    const otherYRefs = [other.y, otherCy, otherBottom]

    // Check vertical alignment (x-axis snap)
    for (const dragRef of dragXRefs) {
      for (const otherX of otherXRefs) {
        const dx = Math.abs(dragRef.value - otherX)
        if (dx < threshold && dx < closestDx) {
          closestDx = dx
          snappedX = otherX + dragRef.offset
        }
        if (dx < threshold) {
          const minY = Math.min(draggedNode.y, dragBottom, other.y, otherBottom)
          const maxY = Math.max(draggedNode.y, dragBottom, other.y, otherBottom)
          guides.push({
            orientation: 'vertical',
            position: otherX,
            from: minY,
            to: maxY,
          })
        }
      }
    }

    // Check horizontal alignment (y-axis snap)
    for (const dragRef of dragYRefs) {
      for (const otherY of otherYRefs) {
        const dy = Math.abs(dragRef.value - otherY)
        if (dy < threshold && dy < closestDy) {
          closestDy = dy
          snappedY = otherY + dragRef.offset
        }
        if (dy < threshold) {
          const minX = Math.min(draggedNode.x, dragRight, other.x, otherRight)
          const maxX = Math.max(draggedNode.x, dragRight, other.x, otherRight)
          guides.push({
            orientation: 'horizontal',
            position: otherY,
            from: minX,
            to: maxX,
          })
        }
      }
    }
  }

  return { guides, snappedPosition: { x: snappedX, y: snappedY } }
}
