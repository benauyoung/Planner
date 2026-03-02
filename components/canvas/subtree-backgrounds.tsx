'use client'

import { memo, useMemo } from 'react'
import { useReactFlow, useStore } from '@xyflow/react'
import { useProjectStore } from '@/stores/project-store'
import { NODE_CONFIG } from '@/lib/constants'

/**
 * Renders subtle colored background rectangles behind each top-level subtree
 * (direct children of the root/goal node) to visually group related nodes.
 */
export const SubtreeBackgrounds = memo(function SubtreeBackgrounds() {
    const nodes = useProjectStore((s) => s.currentProject?.nodes)
    const flowNodes = useProjectStore((s) => s.flowNodes)

    // Get the viewport transform to convert flow coordinates to screen coordinates
    const transform = useStore((s) => s.transform)
    const [tx, ty, zoom] = transform

    // Build subtree groups: each top-level child of root gets its own group
    const groups = useMemo(() => {
        if (!nodes || !flowNodes || flowNodes.length === 0) return []

        // Find root nodes (no parent)
        const rootIds = nodes.filter((n) => !n.parentId).map((n) => n.id)
        if (rootIds.length === 0) return []

        // Find direct children of root(s) — these define the subtree groups
        const topLevelChildren = nodes.filter(
            (n) => n.parentId && rootIds.includes(n.parentId)
        )

        // For each top-level child, collect all descendants
        const flowNodeMap = new Map(flowNodes.map((fn) => [fn.id, fn]))
        const nodeMap = new Map(nodes.map((n) => [n.id, n]))

        return topLevelChildren.map((groupRoot) => {
            const config = NODE_CONFIG[groupRoot.type]
            const descendants: string[] = [groupRoot.id]

            // BFS to collect all descendants
            const queue = [groupRoot.id]
            while (queue.length > 0) {
                const current = queue.shift()!
                const children = nodes.filter((n) => n.parentId === current)
                for (const child of children) {
                    descendants.push(child.id)
                    queue.push(child.id)
                }
            }

            // Find bounding box of all visible nodes in this subtree
            const visibleNodes = descendants
                .map((id) => flowNodeMap.get(id))
                .filter(Boolean)

            if (visibleNodes.length === 0) return null

            const padding = 16
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

            for (const fn of visibleNodes) {
                if (!fn) continue
                const nodeConfig = nodeMap.get(fn.id)
                const w = nodeConfig ? NODE_CONFIG[nodeConfig.type]?.width ?? 160 : 160
                const h = nodeConfig ? NODE_CONFIG[nodeConfig.type]?.height ?? 36 : 36

                minX = Math.min(minX, fn.position.x)
                minY = Math.min(minY, fn.position.y)
                maxX = Math.max(maxX, fn.position.x + w)
                maxY = Math.max(maxY, fn.position.y + h)
            }

            return {
                id: groupRoot.id,
                color: config.color,
                x: minX - padding,
                y: minY - padding,
                width: maxX - minX + padding * 2,
                height: maxY - minY + padding * 2,
            }
        }).filter(Boolean)
    }, [nodes, flowNodes])

    if (groups.length === 0) return null

    return (
        <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: -1 }}
        >
            <g transform={`translate(${tx}, ${ty}) scale(${zoom})`}>
                {groups.map((group) =>
                    group ? (
                        <rect
                            key={group.id}
                            x={group.x}
                            y={group.y}
                            width={group.width}
                            height={group.height}
                            rx={12}
                            ry={12}
                            fill={group.color}
                            fillOpacity={0.04}
                            stroke={group.color}
                            strokeOpacity={0.08}
                            strokeWidth={1}
                        />
                    ) : null
                )}
            </g>
        </svg>
    )
})
