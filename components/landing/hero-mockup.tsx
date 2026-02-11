'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

const mockNodes = [
  { id: 'goal', label: 'SaaS MVP', type: 'goal', x: 40, y: 100, color: 'var(--node-goal)' },
  { id: 'sub1', label: 'Auth System', type: 'subgoal', x: 200, y: 40, color: 'var(--node-subgoal)' },
  { id: 'sub2', label: 'Dashboard', type: 'subgoal', x: 200, y: 160, color: 'var(--node-subgoal)' },
  { id: 'feat1', label: 'OAuth Login', type: 'feature', x: 380, y: 10, color: 'var(--node-feature)' },
  { id: 'feat2', label: 'User Roles', type: 'feature', x: 380, y: 75, color: 'var(--node-feature)' },
  { id: 'feat3', label: 'Analytics', type: 'feature', x: 380, y: 140, color: 'var(--node-feature)' },
  { id: 'task1', label: 'Charts UI', type: 'task', x: 380, y: 205, color: 'var(--node-task)' },
]

const mockEdges = [
  { from: 'goal', to: 'sub1' },
  { from: 'goal', to: 'sub2' },
  { from: 'sub1', to: 'feat1' },
  { from: 'sub1', to: 'feat2' },
  { from: 'sub2', to: 'feat3' },
  { from: 'sub2', to: 'task1' },
]

function getNodeCenter(node: typeof mockNodes[0]) {
  return { x: node.x + 70, y: node.y + 20 }
}

function CurvedEdge({ from, to, delay }: { from: typeof mockNodes[0]; to: typeof mockNodes[0]; delay: number }) {
  const start = getNodeCenter(from)
  const end = getNodeCenter(to)
  const midX = (start.x + end.x) / 2

  const d = `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`

  return (
    <motion.path
      d={d}
      fill="none"
      stroke="hsl(var(--muted-foreground) / 0.3)"
      strokeWidth="1.5"
      strokeDasharray="6 4"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.8, delay: delay + 0.3, ease: 'easeOut' }}
    />
  )
}

function MockNode({ node, delay }: { node: typeof mockNodes[0]; delay: number }) {
  const [hovered, setHovered] = useState(false)

  const typeLabels: Record<string, string> = {
    goal: 'Goal',
    subgoal: 'Subgoal',
    feature: 'Feature',
    task: 'Task',
  }

  return (
    <motion.g
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <motion.rect
        x={node.x}
        y={node.y}
        width={140}
        height={40}
        rx={8}
        fill={hovered ? 'hsl(var(--secondary))' : 'hsl(var(--background))'}
        stroke={`hsl(${node.color})`}
        strokeWidth={hovered ? 2 : 1.5}
        style={{ cursor: 'pointer', filter: hovered ? `drop-shadow(0 0 8px hsl(${node.color} / 0.4))` : 'none' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        animate={{ scale: hovered ? 1.03 : 1 }}
        transition={{ duration: 0.15 }}
      />
      <motion.circle
        cx={node.x + 14}
        cy={node.y + 20}
        r={4}
        fill={`hsl(${node.color})`}
        animate={{ scale: hovered ? 1.3 : 1 }}
        transition={{ duration: 0.15 }}
      />
      <text
        x={node.x + 24}
        y={node.y + 18}
        fill="hsl(var(--foreground))"
        fontSize="11"
        fontWeight="600"
        fontFamily="var(--font-inter), system-ui, sans-serif"
        style={{ pointerEvents: 'none' }}
      >
        {node.label}
      </text>
      <text
        x={node.x + 24}
        y={node.y + 31}
        fill="hsl(var(--muted-foreground))"
        fontSize="9"
        fontFamily="var(--font-inter), system-ui, sans-serif"
        style={{ pointerEvents: 'none' }}
      >
        {typeLabels[node.type]}
      </text>
    </motion.g>
  )
}

export function HeroMockup() {
  const nodeMap = Object.fromEntries(mockNodes.map((n) => [n.id, n]))

  return (
    <div className="relative w-full max-w-[560px] aspect-[4/3] rounded-xl border bg-canvas overflow-hidden shadow-2xl">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--muted-foreground) / 0.3) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      <svg
        viewBox="0 0 560 280"
        className="relative w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Edges */}
        {mockEdges.map((edge, i) => (
          <CurvedEdge
            key={`${edge.from}-${edge.to}`}
            from={nodeMap[edge.from]}
            to={nodeMap[edge.to]}
            delay={i * 0.1}
          />
        ))}

        {/* Nodes */}
        {mockNodes.map((node, i) => (
          <MockNode key={node.id} node={node} delay={i * 0.12} />
        ))}
      </svg>

      {/* Subtle gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-canvas to-transparent pointer-events-none" />
    </div>
  )
}
