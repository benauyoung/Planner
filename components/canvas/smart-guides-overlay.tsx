'use client'

import { useStore } from '@xyflow/react'
import type { GuideLine } from '@/lib/canvas-guides'

interface SmartGuidesOverlayProps {
  guides: GuideLine[]
}

export function SmartGuidesOverlay({ guides }: SmartGuidesOverlayProps) {
  const transform = useStore((s) => s.transform)
  const [tx, ty, zoom] = transform

  if (guides.length === 0) return null

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 5 }}
    >
      <g transform={`translate(${tx}, ${ty}) scale(${zoom})`}>
        {guides.map((guide, i) => (
          <line
            key={i}
            x1={guide.orientation === 'vertical' ? guide.position : guide.from}
            y1={guide.orientation === 'horizontal' ? guide.position : guide.from}
            x2={guide.orientation === 'vertical' ? guide.position : guide.to}
            y2={guide.orientation === 'horizontal' ? guide.position : guide.to}
            stroke="hsl(var(--primary))"
            strokeWidth={1 / zoom}
            strokeDasharray={`${4 / zoom} ${3 / zoom}`}
            opacity={0.7}
          />
        ))}
      </g>
    </svg>
  )
}
