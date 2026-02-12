'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target,
  Flag,
  Puzzle,
  CheckSquare,
  GanttChart,
  Table2,
  LayoutGrid,
  ChevronRight,
  User,
  Clock,
  ArrowRight,
  MessageSquareText,
  Sparkles,
  Brain,
  Rocket,
  FileCode2,
  ClipboardCheck,
  Workflow,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// ─── Mock Data ──────────────────────────────────────────────

const DEMO_NODES = [
  { id: 'g1', type: 'goal', title: 'SaaS MVP Launch', status: 'in_progress', x: 60, y: 120, color: 'hsl(var(--node-goal))' },
  { id: 's1', type: 'subgoal', title: 'Auth System', status: 'completed', x: 260, y: 40, color: 'hsl(var(--node-subgoal))' },
  { id: 's2', type: 'subgoal', title: 'Dashboard', status: 'in_progress', x: 260, y: 200, color: 'hsl(var(--node-subgoal))' },
  { id: 'f1', type: 'feature', title: 'OAuth Login', status: 'completed', x: 470, y: 10, color: 'hsl(var(--node-feature))' },
  { id: 'f2', type: 'feature', title: 'User Roles', status: 'completed', x: 470, y: 80, color: 'hsl(var(--node-feature))' },
  { id: 'f3', type: 'feature', title: 'Analytics', status: 'in_progress', x: 470, y: 160, color: 'hsl(var(--node-feature))' },
  { id: 't1', type: 'task', title: 'Charts UI', status: 'not_started', x: 470, y: 230, color: 'hsl(var(--node-task))' },
  { id: 't2', type: 'task', title: 'API Routes', status: 'in_progress', x: 470, y: 300, color: 'hsl(var(--node-task))' },
]

const DEMO_EDGES = [
  { from: 'g1', to: 's1' },
  { from: 'g1', to: 's2' },
  { from: 's1', to: 'f1' },
  { from: 's1', to: 'f2' },
  { from: 's2', to: 'f3' },
  { from: 's2', to: 't1' },
  { from: 'f3', to: 't2' },
]

const STATUS_COLORS: Record<string, string> = {
  not_started: '#9ca3af',
  in_progress: '#3b82f6',
  completed: '#22c55e',
  blocked: '#ef4444',
}

const STATUS_LABELS: Record<string, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  blocked: 'Blocked',
}

const TYPE_ICONS: Record<string, typeof Target> = {
  goal: Target,
  subgoal: Flag,
  feature: Puzzle,
  task: CheckSquare,
}

const ASSIGNEES = ['Alice', 'Bob', 'Carol', 'Dan']

const TABLE_ROWS = [
  { id: 'f1', title: 'OAuth Login', type: 'feature', status: 'completed', assignee: 'Alice', hours: 16, priority: 'high' },
  { id: 'f2', title: 'User Roles', type: 'feature', status: 'completed', assignee: 'Bob', hours: 12, priority: 'high' },
  { id: 'f3', title: 'Analytics', type: 'feature', status: 'in_progress', assignee: 'Carol', hours: 24, priority: 'medium' },
  { id: 't1', title: 'Charts UI', type: 'task', status: 'not_started', assignee: 'Dan', hours: 8, priority: 'medium' },
  { id: 't2', title: 'API Routes', type: 'task', status: 'in_progress', assignee: 'Alice', hours: 10, priority: 'high' },
  { id: 's1', title: 'Auth System', type: 'subgoal', status: 'completed', assignee: 'Bob', hours: 40, priority: 'critical' },
  { id: 's2', title: 'Dashboard', type: 'subgoal', status: 'in_progress', assignee: 'Carol', hours: 48, priority: 'high' },
]

const GANTT_TASKS = [
  { id: 'g1', title: 'SaaS MVP Launch', start: 0, duration: 28, status: 'in_progress', color: 'hsl(var(--node-goal))' },
  { id: 's1', title: 'Auth System', start: 1, duration: 10, status: 'completed', color: 'hsl(var(--node-subgoal))' },
  { id: 'f1', title: 'OAuth Login', start: 1, duration: 4, status: 'completed', color: 'hsl(var(--node-feature))' },
  { id: 'f2', title: 'User Roles', start: 5, duration: 6, status: 'completed', color: 'hsl(var(--node-feature))' },
  { id: 's2', title: 'Dashboard', start: 8, duration: 18, status: 'in_progress', color: 'hsl(var(--node-subgoal))' },
  { id: 'f3', title: 'Analytics', start: 8, duration: 10, status: 'in_progress', color: 'hsl(var(--node-feature))' },
  { id: 't1', title: 'Charts UI', start: 18, duration: 5, status: 'not_started', color: 'hsl(var(--node-task))' },
  { id: 't2', title: 'API Routes', start: 12, duration: 6, status: 'in_progress', color: 'hsl(var(--node-task))' },
]

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400',
  high: 'bg-orange-500/20 text-orange-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  low: 'bg-green-500/20 text-green-400',
}

// ─── Canvas Demo ────────────────────────────────────────────

function CanvasNode({ node, delay, selected, onClick }: {
  node: typeof DEMO_NODES[0]
  delay: number
  selected: boolean
  onClick: () => void
}) {
  const Icon = TYPE_ICONS[node.type] || CheckSquare
  const w = node.type === 'goal' ? 160 : node.type === 'subgoal' ? 145 : 130
  const h = 44

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      style={{ cursor: 'pointer' }}
      onClick={onClick}
    >
      <motion.rect
        x={node.x}
        y={node.y}
        width={w}
        height={h}
        rx={10}
        fill="hsl(var(--background))"
        stroke={selected ? 'hsl(var(--primary))' : node.color}
        strokeWidth={selected ? 2.5 : 1.5}
        animate={{
          filter: selected ? `drop-shadow(0 0 12px ${node.color})` : 'none',
        }}
        transition={{ duration: 0.2 }}
      />
      <circle cx={node.x + 16} cy={node.y + h / 2} r={5} fill={STATUS_COLORS[node.status]} />
      <text
        x={node.x + 28}
        y={node.y + h / 2 - 4}
        fill="hsl(var(--foreground))"
        fontSize="11"
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
        style={{ pointerEvents: 'none' }}
      >
        {node.title}
      </text>
      <text
        x={node.x + 28}
        y={node.y + h / 2 + 10}
        fill="hsl(var(--muted-foreground))"
        fontSize="9"
        fontFamily="system-ui, sans-serif"
        style={{ pointerEvents: 'none' }}
      >
        {STATUS_LABELS[node.status]}
      </text>
    </motion.g>
  )
}

function CanvasEdge({ from, to, delay }: {
  from: typeof DEMO_NODES[0]
  to: typeof DEMO_NODES[0]
  delay: number
}) {
  const fw = from.type === 'goal' ? 160 : from.type === 'subgoal' ? 145 : 130
  const sx = from.x + fw
  const sy = from.y + 22
  const ex = to.x
  const ey = to.y + 22
  const mx = (sx + ex) / 2

  return (
    <motion.path
      d={`M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ey}, ${ex} ${ey}`}
      fill="none"
      stroke="hsl(var(--muted-foreground) / 0.3)"
      strokeWidth="1.5"
      strokeDasharray="6 4"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.6, delay }}
    />
  )
}

function CanvasDemo() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const nodeMap = Object.fromEntries(DEMO_NODES.map((n) => [n.id, n]))

  // Auto-cycle through nodes to show interactivity
  useEffect(() => {
    const ids = DEMO_NODES.map((n) => n.id)
    let i = 0
    const interval = setInterval(() => {
      setSelectedId(ids[i % ids.length])
      i++
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full aspect-[16/9] rounded-xl border bg-background/50 overflow-hidden shadow-2xl">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--muted-foreground) / 0.3) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      <svg viewBox="0 0 650 370" className="relative w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {DEMO_EDGES.map((edge, i) => (
          <CanvasEdge
            key={`${edge.from}-${edge.to}`}
            from={nodeMap[edge.from]}
            to={nodeMap[edge.to]}
            delay={0.3 + i * 0.08}
          />
        ))}
        {DEMO_NODES.map((node, i) => (
          <CanvasNode
            key={node.id}
            node={node}
            delay={i * 0.1}
            selected={selectedId === node.id}
            onClick={() => setSelectedId(node.id)}
          />
        ))}
      </svg>
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
    </div>
  )
}

// ─── Table Demo ─────────────────────────────────────────────

function TableDemo() {
  const [sortBy, setSortBy] = useState<'title' | 'status' | 'priority'>('priority')
  const [selectedRow, setSelectedRow] = useState<string | null>(null)

  const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
  const statusOrder: Record<string, number> = { in_progress: 0, not_started: 1, completed: 2, blocked: 3 }

  const sorted = [...TABLE_ROWS].sort((a, b) => {
    if (sortBy === 'priority') return (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9)
    if (sortBy === 'status') return (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9)
    return a.title.localeCompare(b.title)
  })

  // Auto-cycle rows
  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      setSelectedRow(sorted[i % sorted.length].id)
      i++
    }, 1800)
    return () => clearInterval(interval)
  }, [sorted])

  return (
    <div className="w-full rounded-xl border bg-background/50 overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b bg-muted/30">
              {[
                { key: 'title' as const, label: 'Task' },
                { key: 'status' as const, label: 'Status' },
                { key: 'priority' as const, label: 'Priority' },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => setSortBy(col.key)}
                  className={cn(
                    'px-4 py-2.5 text-left font-semibold cursor-pointer hover:text-primary transition-colors',
                    sortBy === col.key && 'text-primary'
                  )}
                >
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-2.5 text-left font-semibold">Assignee</th>
              <th className="px-4 py-2.5 text-left font-semibold">Est.</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const Icon = TYPE_ICONS[row.type] || CheckSquare
              return (
                <motion.tr
                  key={row.id}
                  layout
                  className={cn(
                    'border-b last:border-b-0 transition-colors cursor-pointer',
                    selectedRow === row.id ? 'bg-primary/10' : 'hover:bg-muted/30'
                  )}
                  onClick={() => setSelectedRow(row.id)}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="font-medium">{row.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: STATUS_COLORS[row.status] }}
                      />
                      <span className="text-muted-foreground">{STATUS_LABELS[row.status]}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase', PRIORITY_COLORS[row.priority])}>
                      {row.priority}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{row.assignee}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {row.hours}h
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Gantt Demo ─────────────────────────────────────────────

function GanttDemo() {
  const totalDays = 30
  const colW = 22
  const [hoveredTask, setHoveredTask] = useState<string | null>(null)

  // Auto-cycle
  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      setHoveredTask(GANTT_TASKS[i % GANTT_TASKS.length].id)
      i++
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  const days = Array.from({ length: totalDays }, (_, i) => i + 1)

  return (
    <div className="w-full rounded-xl border bg-background/50 overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <div className="flex min-w-0">
          {/* Left: task labels */}
          <div className="w-44 shrink-0 border-r">
            <div className="h-8 border-b bg-muted/30 flex items-center px-3 text-[10px] font-semibold text-muted-foreground">
              Task
            </div>
            {GANTT_TASKS.map((task) => (
              <div
                key={task.id}
                className={cn(
                  'h-9 flex items-center px-3 gap-2 text-xs border-b last:border-b-0 transition-colors cursor-pointer',
                  hoveredTask === task.id ? 'bg-primary/10' : 'hover:bg-muted/20'
                )}
                onMouseEnter={() => setHoveredTask(task.id)}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: STATUS_COLORS[task.status] }}
                />
                <span className="font-medium truncate">{task.title}</span>
              </div>
            ))}
          </div>

          {/* Right: day grid + bars */}
          <div className="flex-1">
            {/* Day headers */}
            <div className="flex h-8 border-b bg-muted/30" style={{ width: totalDays * colW }}>
              {days.map((d) => (
                <div
                  key={d}
                  className={cn(
                    'flex items-center justify-center text-[9px] font-medium border-r',
                    d === 12 ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground'
                  )}
                  style={{ width: colW }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Bars */}
            <div style={{ width: totalDays * colW }}>
              {GANTT_TASKS.map((task, idx) => {
                const barLeft = task.start * colW
                const barWidth = task.duration * colW
                const isHovered = hoveredTask === task.id

                return (
                  <div key={task.id} className="h-9 relative border-b last:border-b-0">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      {days.map((d) => (
                        <div
                          key={d}
                          className={cn('border-r h-full', d === 12 && 'bg-primary/5')}
                          style={{ width: colW }}
                        />
                      ))}
                    </div>

                    {/* Bar */}
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: barWidth, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 + idx * 0.08 }}
                      className={cn(
                        'absolute top-1.5 h-6 rounded-md flex items-center px-2 overflow-hidden transition-shadow',
                        isHovered && 'shadow-lg ring-1 ring-white/20'
                      )}
                      style={{
                        left: barLeft,
                        backgroundColor: task.status === 'completed' ? STATUS_COLORS.completed : task.color,
                        opacity: task.status === 'completed' ? 0.7 : 1,
                        cursor: 'grab',
                      }}
                      onMouseEnter={() => setHoveredTask(task.id)}
                    >
                      {barWidth > 60 && (
                        <span className="text-[9px] text-white font-medium truncate">{task.title}</span>
                      )}
                    </motion.div>
                  </div>
                )
              })}
            </div>

            {/* Today line */}
            <div
              className="absolute top-0 bottom-0 w-px bg-primary/40 z-10 pointer-events-none"
              style={{ left: `${12 * colW + 176}px` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Tabbed Showcase ────────────────────────────────────────

type ShowcaseTab = 'canvas' | 'table' | 'gantt'

const TABS: { key: ShowcaseTab; label: string; icon: typeof LayoutGrid; description: string }[] = [
  { key: 'canvas', label: 'Canvas', icon: LayoutGrid, description: 'Interactive DAG with 12 node types. Drag, connect, and organize your project visually.' },
  { key: 'table', label: 'Task Table', icon: Table2, description: 'Sort by priority, status, or name. Assign team members and track estimates.' },
  { key: 'gantt', label: 'Gantt Chart', icon: GanttChart, description: 'Drag bars to reschedule. Resize edges to adjust durations. Visual timeline of every task.' },
]

export function InteractiveShowcase() {
  const [activeTab, setActiveTab] = useState<ShowcaseTab>('canvas')

  // Auto-rotate tabs
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => {
        const idx = TABS.findIndex((t) => t.key === prev)
        return TABS[(idx + 1) % TABS.length].key
      })
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const currentTab = TABS.find((t) => t.key === activeTab)!

  return (
    <section className="py-20 sm:py-28 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            See Your Project, Your Way
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Switch between 6 views to find the perspective that fits how you think.
          </p>
        </motion.div>

        {/* Tab buttons */}
        <div className="flex justify-center gap-2 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Description */}
        <AnimatePresence mode="wait">
          <motion.p
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="text-center text-sm text-muted-foreground mb-6 max-w-lg mx-auto"
          >
            {currentTab.description}
          </motion.p>
        </AnimatePresence>

        {/* Demo area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.35 }}
          >
            {activeTab === 'canvas' && <CanvasDemo />}
            {activeTab === 'table' && <TableDemo />}
            {activeTab === 'gantt' && <GanttDemo />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

// ─── New Hero ───────────────────────────────────────────────

export function HeroSectionNew() {
  return (
    <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 70% 50% at 50% 30%, hsl(var(--primary) / 0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-muted/50 text-xs font-medium text-muted-foreground mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            One Prompt. One Plan. One Session.
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">
            Your Entire Project.{' '}
            <span className="text-primary">Planned in One Shot.</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
            Describe what you want to build. AI generates a complete project plan — goals, features,
            tasks, timelines, dependencies, PRDs, and implementation prompts — all connected,
            all ready to execute. Then hand the wheel to AI and ship.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
            >
              Start Planning — Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#pipeline"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              See how it works
              <ChevronRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </motion.div>

        {/* Value props */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center justify-center gap-6 sm:gap-10 mt-16 text-sm flex-wrap"
        >
          {[
            { value: '1', label: 'Prompt to Plan', icon: Zap },
            { value: '1', label: 'Session to Ship', icon: Rocket },
            { value: '0', label: 'Context Switching', icon: Brain },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-xl font-bold text-foreground">{stat.value}</div>
                <div className="text-muted-foreground text-xs">{stat.label}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── One-Shot Pipeline ──────────────────────────────────────

const PIPELINE_STEPS = [
  {
    icon: MessageSquareText,
    title: 'Describe Your Idea',
    description: 'One conversation. AI asks the right questions and understands your full vision — scope, audience, constraints.',
    accent: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    icon: Sparkles,
    title: 'AI Builds the Plan',
    description: 'In seconds, AI generates a complete project hierarchy: goals → subgoals → features → tasks, all connected with dependencies.',
    accent: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  {
    icon: Workflow,
    title: 'Everything, Connected',
    description: 'Timelines, assignments, estimates, PRDs, and implementation prompts — all linked to the same source of truth. One change ripples everywhere.',
    accent: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    icon: FileCode2,
    title: 'AI Generates the Artifacts',
    description: 'One click: PRDs, .cursorrules, CLAUDE.md, implementation prompts — all context-aware, ready to paste into your IDE.',
    accent: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: Rocket,
    title: 'Let AI Take the Lead',
    description: 'Hand your AI coding assistant a complete, structured plan. It knows every task, every dependency, every spec. Just build.',
    accent: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
]

export function OneShotPipeline() {
  const [activeStep, setActiveStep] = useState(0)

  // Auto-advance
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % PIPELINE_STEPS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="pipeline" className="py-20 sm:py-28 bg-muted/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            <Zap className="h-3 w-3" />
            ONE-SHOT PLANNING
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            From Idea to Finished Project.{' '}
            <span className="text-primary">In One Session.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            VisionPath doesn't just plan — it ties your <em>entire</em> project together.
            One prompt creates a complete, interconnected plan that AI can execute from start to finish.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Step list */}
          <div className="space-y-3">
            {PIPELINE_STEPS.map((step, i) => (
              <motion.button
                key={step.title}
                onClick={() => setActiveStep(i)}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className={cn(
                  'w-full text-left p-4 rounded-xl border transition-all duration-300 group',
                  activeStep === i
                    ? `${step.bg} ${step.border} shadow-lg`
                    : 'bg-background/50 border-border hover:border-muted-foreground/30'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                    activeStep === i ? step.bg : 'bg-muted/50'
                  )}>
                    <step.icon className={cn('h-4.5 w-4.5', activeStep === i ? step.accent : 'text-muted-foreground')} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground">STEP {i + 1}</span>
                      {activeStep === i && (
                        <motion.div
                          layoutId="pipeline-indicator"
                          className="w-1.5 h-1.5 rounded-full bg-primary"
                        />
                      )}
                    </div>
                    <h3 className={cn(
                      'text-sm font-semibold mt-0.5 transition-colors',
                      activeStep === i ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                    )}>
                      {step.title}
                    </h3>
                    <AnimatePresence>
                      {activeStep === i && (
                        <motion.p
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="text-xs text-muted-foreground leading-relaxed mt-1.5 overflow-hidden"
                        >
                          {step.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="sticky top-24 rounded-xl border bg-background/50 p-8 shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  {/* Step visual */}
                  <div className={cn('inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6', PIPELINE_STEPS[activeStep].bg)}>
                    {(() => {
                      const Icon = PIPELINE_STEPS[activeStep].icon
                      return <Icon className={cn('h-8 w-8', PIPELINE_STEPS[activeStep].accent)} />
                    })()}
                  </div>

                  <h3 className="text-xl font-bold mb-3">{PIPELINE_STEPS[activeStep].title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {PIPELINE_STEPS[activeStep].description}
                  </p>

                  {/* Progress dots */}
                  <div className="flex items-center justify-center gap-2">
                    {PIPELINE_STEPS.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveStep(i)}
                        className={cn(
                          'h-1.5 rounded-full transition-all duration-300',
                          activeStep === i ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                        )}
                      />
                    ))}
                  </div>

                  {/* Flow arrow chain */}
                  <div className="flex items-center justify-center gap-1 mt-8 flex-wrap">
                    {PIPELINE_STEPS.map((step, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <div className={cn(
                          'w-7 h-7 rounded-md flex items-center justify-center transition-all duration-300',
                          i <= activeStep ? step.bg : 'bg-muted/30',
                        )}>
                          <step.icon className={cn(
                            'h-3.5 w-3.5 transition-colors',
                            i <= activeStep ? step.accent : 'text-muted-foreground/40'
                          )} />
                        </div>
                        {i < PIPELINE_STEPS.length - 1 && (
                          <ChevronRight className={cn(
                            'h-3 w-3 transition-colors',
                            i < activeStep ? 'text-primary' : 'text-muted-foreground/20'
                          )} />
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
