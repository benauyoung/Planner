'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowRight,
    Sparkles,
    Loader2,
    Mail,
    Check,
    ChevronRight,
    Target,
    Layers,
    Puzzle,
    ListChecks,
    X,
    HelpCircle,
    Lightbulb,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { track } from '@vercel/analytics'

// ─── Types ───────────────────────────────────────────────────

type Phase = 'input' | 'loading' | 'canvas' | 'email'

interface PlanNode {
    id: string
    type: 'goal' | 'subgoal' | 'feature' | 'task'
    title: string
    description: string
    parentId: string | null
    questions?: { question: string; options: string[] }[]
}

interface LayoutNode extends PlanNode {
    x: number
    y: number
    w: number
    h: number
    depth: number
    children: string[]
}

// ─── Constants ───────────────────────────────────────────────

const PLACEHOLDER_IDEAS = [
    'A recipe sharing platform with AI meal planning...',
    'An online marketplace for handmade crafts...',
    'A fitness app that tracks workouts and nutrition...',
    'A community platform for language learners...',
    'A portfolio builder for creative professionals...',
]

const EXAMPLE_CHIPS = [
    'Online Boutique',
    'Fitness App',
    'Recipe Platform',
    'Portfolio Site',
    'Learning Hub',
]

const LOADING_STEPS = [
    'Analyzing your idea…',
    'Designing the structure…',
    'Building your plan…',
    'Organizing nodes…',
]

const TYPE_ICONS: Record<string, typeof Target> = {
    goal: Target,
    subgoal: Layers,
    feature: Puzzle,
    task: ListChecks,
}

const TYPE_COLORS: Record<string, string> = {
    goal: '#f97316',
    subgoal: '#3b82f6',
    feature: '#22c55e',
    task: '#8b5cf6',
}

const TYPE_LABELS: Record<string, string> = {
    goal: 'Goal',
    subgoal: 'Subgoal',
    feature: 'Feature',
    task: 'Task',
}

// ─── Tree layout helper ──────────────────────────────────────

const NODE_W = 140
const NODE_H = 42
const H_GAP = 30
const V_GAP = 10

function layoutTree(nodes: PlanNode[]): { laid: LayoutNode[]; width: number; height: number } {
    if (nodes.length === 0) return { laid: [], width: 0, height: 0 }

    const byId = new Map(nodes.map((n) => [n.id, n]))
    const childrenMap = new Map<string, string[]>()
    const roots: string[] = []

    for (const n of nodes) {
        if (!childrenMap.has(n.id)) childrenMap.set(n.id, [])
        if (n.parentId && byId.has(n.parentId)) {
            const siblings = childrenMap.get(n.parentId) || []
            siblings.push(n.id)
            childrenMap.set(n.parentId, siblings)
        } else {
            roots.push(n.id)
        }
    }

    // Compute subtree widths bottom-up
    const subtreeWidth = new Map<string, number>()
    function calcWidth(id: string): number {
        const kids = childrenMap.get(id) || []
        if (kids.length === 0) {
            subtreeWidth.set(id, NODE_H)
            return NODE_H
        }
        const total = kids.reduce((sum, kid) => sum + calcWidth(kid), 0) + (kids.length - 1) * V_GAP
        subtreeWidth.set(id, Math.max(total, NODE_W))
        return subtreeWidth.get(id)!
    }

    for (const r of roots) calcWidth(r)

    // Position: left-to-right (depth = x), top-to-bottom (siblings = y)
    const laid: LayoutNode[] = []
    let totalHeight = 0

    function positionNode(id: string, depth: number, yOffset: number) {
        const node = byId.get(id)!
        const kids = childrenMap.get(id) || []
        const myWidth = subtreeWidth.get(id) || NODE_W

        // Center this node vertically in its subtree
        const x = depth * (NODE_W + H_GAP)
        let y: number

        if (kids.length === 0) {
            y = yOffset + (myWidth - NODE_H) / 2
        } else {
            // Position children first
            let childY = yOffset
            for (const kid of kids) {
                positionNode(kid, depth + 1, childY)
                childY += (subtreeWidth.get(kid) || NODE_W) + V_GAP
            }
            // Center parent among its children
            const firstChild = laid.find((l) => l.id === kids[0])
            const lastChild = laid.find((l) => l.id === kids[kids.length - 1])
            y = firstChild && lastChild
                ? (firstChild.y + lastChild.y) / 2
                : yOffset
        }

        totalHeight = Math.max(totalHeight, y + NODE_H)

        laid.push({
            ...node,
            x,
            y,
            w: NODE_W,
            h: NODE_H,
            depth,
            children: kids,
        })
    }

    let yOff = 12
    for (const r of roots) {
        positionNode(r, 0, yOff)
        yOff += (subtreeWidth.get(r) || NODE_H) + V_GAP * 2
    }

    const maxDepth = Math.max(...laid.map((n) => n.depth))
    const width = (maxDepth + 1) * (NODE_W + H_GAP) + 20

    return { laid, width, height: totalHeight + 20 }
}

// ─── Loading Animation ───────────────────────────────────────

function LoadingPhase() {
    const [step, setStep] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => Math.min(prev + 1, LOADING_STEPS.length - 1))
        }, 1800)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="flex flex-col items-center justify-center py-24 gap-8">
            <div className="relative">
                <motion.div
                    className="absolute inset-0 rounded-3xl"
                    style={{ background: 'conic-gradient(from 0deg, #3b82f6, #3b82f620, #3b82f6)' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
                <div className="relative w-20 h-20 rounded-3xl bg-[#0a0e1a] flex items-center justify-center m-[3px]">
                    <Sparkles className="h-9 w-9 text-blue-400" />
                </div>
            </div>
            <div className="text-center">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={step}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="text-base font-semibold text-white"
                    >
                        {LOADING_STEPS[step]}
                    </motion.p>
                </AnimatePresence>
                <p className="text-xs text-white/40 mt-2">Building your project plan…</p>
            </div>
            <div className="w-72 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400/60"
                    initial={{ width: '0%' }}
                    animate={{ width: '85%' }}
                    transition={{ duration: 8, ease: 'easeOut' }}
                />
            </div>
        </div>
    )
}

// ─── Stats Strip ────────────────────────────────────────────

function StatsStrip({ nodes }: { nodes: PlanNode[] }) {
    const counts = useMemo(() => {
        const c = { goal: 0, subgoal: 0, feature: 0, task: 0 }
        for (const n of nodes) c[n.type]++
        return c
    }, [nodes])

    return (
        <div className="flex items-center gap-4 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <span className="text-[11px] font-semibold text-white/60">{nodes.length} nodes</span>
            <div className="w-px h-3 bg-white/10" />
            {(['goal', 'subgoal', 'feature', 'task'] as const).map((type) =>
                counts[type] > 0 ? (
                    <div key={type} className="flex items-center gap-1.5">
                        <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: TYPE_COLORS[type] }}
                        />
                        <span className="text-[11px] text-white/50">
                            {counts[type]} {TYPE_LABELS[type]}{counts[type] > 1 ? 's' : ''}
                        </span>
                    </div>
                ) : null
            )}
        </div>
    )
}

// ─── Detail Sidebar ─────────────────────────────────────────

function DetailSidebar({
    node,
    allNodes,
    onClose,
    onSelectNode,
}: {
    node: LayoutNode
    allNodes: LayoutNode[]
    onClose: () => void
    onSelectNode: (id: string) => void
}) {
    const Icon = TYPE_ICONS[node.type] || Target
    const parent = node.parentId ? allNodes.find((n) => n.id === node.parentId) : null
    const children = allNodes.filter((n) => n.parentId === node.id)
    const questions = node.questions || []

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full flex flex-col overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-start justify-between px-5 py-4 border-b border-white/[0.08]">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-white"
                            style={{ backgroundColor: TYPE_COLORS[node.type] + '30', color: TYPE_COLORS[node.type] }}
                        >
                            <Icon className="h-3 w-3" />
                            {TYPE_LABELS[node.type]}
                        </span>
                    </div>
                    <h3 className="text-sm font-bold text-white leading-snug">{node.title}</h3>
                </div>
                <button
                    onClick={onClose}
                    className="shrink-0 p-1 rounded-md hover:bg-white/10 transition-colors text-white/40 hover:text-white/70"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                {/* Description */}
                <div>
                    <p className="text-[12px] leading-relaxed text-white/60">{node.description}</p>
                </div>

                {/* Parent */}
                {parent && (
                    <div>
                        <h4 className="text-[10px] uppercase tracking-wider text-white/30 font-semibold mb-2">Parent</h4>
                        <button
                            onClick={() => onSelectNode(parent.id)}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-colors text-left"
                        >
                            <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: TYPE_COLORS[parent.type] }}
                            />
                            <span className="text-[11px] text-white/70 truncate">{parent.title}</span>
                            <ChevronRight className="h-3 w-3 text-white/25 ml-auto shrink-0" />
                        </button>
                    </div>
                )}

                {/* Children */}
                {children.length > 0 && (
                    <div>
                        <h4 className="text-[10px] uppercase tracking-wider text-white/30 font-semibold mb-2">
                            Children ({children.length})
                        </h4>
                        <div className="space-y-1">
                            {children.map((child) => (
                                <button
                                    key={child.id}
                                    onClick={() => onSelectNode(child.id)}
                                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-colors text-left"
                                >
                                    <span
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{ backgroundColor: TYPE_COLORS[child.type] }}
                                    />
                                    <span className="text-[11px] text-white/70 truncate">{child.title}</span>
                                    <ChevronRight className="h-3 w-3 text-white/25 ml-auto shrink-0" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Questions */}
                {questions.length > 0 && (
                    <div>
                        <h4 className="text-[10px] uppercase tracking-wider text-white/30 font-semibold mb-2 flex items-center gap-1.5">
                            <HelpCircle className="h-3 w-3" />
                            Planning Questions
                        </h4>
                        <div className="space-y-3">
                            {questions.slice(0, 3).map((q, qi) => (
                                <div
                                    key={qi}
                                    className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-3"
                                >
                                    <p className="text-[11px] text-white/70 font-medium mb-2">{q.question}</p>
                                    <div className="space-y-1">
                                        {q.options.map((opt, oi) => (
                                            <div
                                                key={oi}
                                                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer group"
                                            >
                                                <div className="w-3.5 h-3.5 rounded-full border border-white/20 group-hover:border-blue-400/50 transition-colors shrink-0" />
                                                <span className="text-[10px] text-white/50 group-hover:text-white/70 transition-colors">{opt}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sign up hint */}
                <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-4">
                    <div className="flex items-start gap-2.5">
                        <Lightbulb className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[11px] text-white/70 font-medium mb-1">Want to refine this plan?</p>
                            <p className="text-[10px] text-white/40 leading-relaxed">
                                Sign up to answer these questions, add nodes, and get AI-powered suggestions.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

// ─── Interactive Canvas ──────────────────────────────────────

function InteractiveCanvas({
    nodes,
    onContinue,
}: {
    nodes: PlanNode[]
    onContinue: () => void
}) {
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const svgRef = useRef<HTMLDivElement>(null)
    const [scrollOffset, setScrollOffset] = useState({ x: 0, y: 0 })

    const { laid, width, height } = useMemo(() => layoutTree(nodes), [nodes])
    const selectedNode = selectedId ? laid.find((n) => n.id === selectedId) || null : null

    // Build a map for edge lookup
    const laidMap = useMemo(() => new Map(laid.map((n) => [n.id, n])), [laid])

    // Edges: parent → child
    const edges = useMemo(() => {
        const result: { from: LayoutNode; to: LayoutNode }[] = []
        for (const node of laid) {
            if (node.parentId && laidMap.has(node.parentId)) {
                result.push({ from: laidMap.get(node.parentId)!, to: node })
            }
        }
        return result
    }, [laid, laidMap])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-3"
        >
            {/* Header row */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <StatsStrip nodes={nodes} />
                <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    onClick={onContinue}
                    className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-400 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                    Continue Planning
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </motion.button>
            </div>

            {/* Canvas + Sidebar */}
            <div className="flex rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden" style={{ minHeight: 320 }}>
                {/* SVG Canvas */}
                <div
                    ref={svgRef}
                    className="flex-1 overflow-auto relative"
                    style={{ maxHeight: 400 }}
                >
                    {/* Dot grid bg */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-20"
                        style={{
                            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
                            backgroundSize: '24px 24px',
                        }}
                    />

                    <svg
                        viewBox={`0 0 ${Math.max(width, 500)} ${Math.max(height, 300)}`}
                        className="relative w-full"
                        style={{ minWidth: Math.max(width, 500), minHeight: Math.max(height, 300) }}
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* Edges */}
                        {edges.map((edge, i) => {
                            const sx = edge.from.x + edge.from.w
                            const sy = edge.from.y + edge.from.h / 2
                            const ex = edge.to.x
                            const ey = edge.to.y + edge.to.h / 2
                            const mx = (sx + ex) / 2

                            return (
                                <motion.path
                                    key={`${edge.from.id}-${edge.to.id}`}
                                    d={`M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ey}, ${ex} ${ey}`}
                                    fill="none"
                                    stroke="rgba(255,255,255,0.12)"
                                    strokeWidth="1.5"
                                    strokeDasharray="6 4"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.2 + i * 0.03 }}
                                />
                            )
                        })}

                        {/* Nodes */}
                        {laid.map((node, i) => {
                            const isSelected = selectedId === node.id
                            const color = TYPE_COLORS[node.type]
                            const Icon = TYPE_ICONS[node.type]

                            return (
                                <motion.g
                                    key={node.id}
                                    initial={{ opacity: 0, scale: 0.7 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{
                                        duration: 0.4,
                                        delay: 0.15 + i * 0.04,
                                        type: 'spring',
                                        stiffness: 180,
                                        damping: 18,
                                    }}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setSelectedId(isSelected ? null : node.id)}
                                >
                                    {/* Selection glow */}
                                    {isSelected && (
                                        <rect
                                            x={node.x - 3}
                                            y={node.y - 3}
                                            width={node.w + 6}
                                            height={node.h + 6}
                                            rx={14}
                                            fill="none"
                                            stroke={color}
                                            strokeWidth={2}
                                            strokeDasharray="4 2"
                                            opacity={0.5}
                                        />
                                    )}

                                    {/* Card background */}
                                    <rect
                                        x={node.x}
                                        y={node.y}
                                        width={node.w}
                                        height={node.h}
                                        rx={11}
                                        fill={isSelected ? `${color}15` : 'rgba(10,14,26,0.85)'}
                                        stroke={isSelected ? color : `${color}40`}
                                        strokeWidth={isSelected ? 1.5 : 1}
                                    />

                                    {/* Type indicator dot */}
                                    <circle
                                        cx={node.x + 12}
                                        cy={node.y + node.h / 2}
                                        r={3.5}
                                        fill={color}
                                    />

                                    {/* Title */}
                                    <text
                                        x={node.x + 22}
                                        y={node.y + 17}
                                        fill="rgba(255,255,255,0.9)"
                                        fontSize="10"
                                        fontWeight="600"
                                        fontFamily="system-ui, -apple-system, sans-serif"
                                    >
                                        {node.title.length > 16 ? node.title.slice(0, 14) + '…' : node.title}
                                    </text>

                                    {/* Type label */}
                                    <text
                                        x={node.x + 22}
                                        y={node.y + 29}
                                        fill={color}
                                        fontSize="8"
                                        fontWeight="500"
                                        fontFamily="system-ui, -apple-system, sans-serif"
                                        opacity={0.7}
                                    >
                                        {TYPE_LABELS[node.type]}
                                    </text>

                                    {/* Children count badge */}
                                    {node.children.length > 0 && (
                                        <>
                                            <rect
                                                x={node.x + node.w - 26}
                                                y={node.y + node.h / 2 - 8}
                                                width={18}
                                                height={16}
                                                rx={4}
                                                fill={`${color}22`}
                                            />
                                            <text
                                                x={node.x + node.w - 17}
                                                y={node.y + node.h / 2 + 4}
                                                fill={color}
                                                fontSize="9"
                                                fontWeight="600"
                                                textAnchor="middle"
                                                fontFamily="system-ui, sans-serif"
                                            >
                                                {node.children.length}
                                            </text>
                                        </>
                                    )}
                                </motion.g>
                            )
                        })}
                    </svg>
                </div>

                {/* Detail Sidebar */}
                <AnimatePresence mode="wait">
                    {selectedNode && (
                        <motion.div
                            key={selectedNode.id}
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 280, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="border-l border-white/[0.08] bg-white/[0.02] shrink-0 overflow-hidden"
                        >
                            <DetailSidebar
                                node={selectedNode}
                                allNodes={laid}
                                onClose={() => setSelectedId(null)}
                                onSelectNode={setSelectedId}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Subtle CTA bar at bottom */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-center text-xs text-white/30"
            >
                Click any node to explore · Sign up to continue building with AI
            </motion.p>
        </motion.div>
    )
}

// ─── Main Component ──────────────────────────────────────────

export function PlanningPlayground() {
    const [phase, setPhase] = useState<Phase>('input')
    const [prompt, setPrompt] = useState('')
    const [placeholderIdx, setPlaceholderIdx] = useState(0)
    const [planNodes, setPlanNodes] = useState<PlanNode[]>([])
    const [suggestedTitle, setSuggestedTitle] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [emailValue, setEmailValue] = useState('')
    const [emailSubmitted, setEmailSubmitted] = useState(false)
    const [emailSubmitting, setEmailSubmitting] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Rotate placeholder
    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDER_IDEAS.length)
        }, 3200)
        return () => clearInterval(interval)
    }, [])

    // ─── Handlers ─────────────────────────────────────────────

    async function handleBuild() {
        if (!prompt.trim() || phase !== 'input') return
        setPhase('loading')
        setError(null)

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        {
                            role: 'user',
                            content: `I want to plan a new project. Here's my idea:\n\n${prompt.trim()}\n\nPlease build a comprehensive project plan immediately with goals, subgoals, features, and tasks. Be thorough and generate at least 12-18 nodes with a clear hierarchy.`,
                        },
                    ],
                }),
            })

            if (!res.ok) throw new Error('Failed to generate plan')

            const data = await res.json()
            if (data.error) throw new Error(data.error)

            const nodes: PlanNode[] = (data.nodes || []).map((n: PlanNode) => ({
                id: n.id,
                type: n.type,
                title: n.title,
                description: n.description,
                parentId: n.parentId,
                questions: n.questions,
            }))

            if (nodes.length === 0) throw new Error('No plan nodes generated')

            setPlanNodes(nodes)
            setSuggestedTitle(data.suggestedTitle || null)
            setPhase('canvas')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
            setPhase('input')
        }
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleBuild()
        }
    }

    function handleChipClick(chip: string) {
        setPrompt(`Build a ${chip.toLowerCase()} with user accounts, a dashboard, and core features.`)
        textareaRef.current?.focus()
    }

    async function handleEmailSubmit() {
        if (!emailValue.includes('@') || !emailValue.includes('.')) return
        setEmailSubmitting(true)
        try {
            await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailValue, prompt, appTitle: suggestedTitle || '' }),
            })
        } catch {
            // Silently succeed to not block UX
        } finally {
            track('waitlist_signup', { source: 'planning_playground' })
            setEmailSubmitting(false)
            setEmailSubmitted(true)
        }
    }

    const appTitle = suggestedTitle || 'Your Project'

    // ─── Render ───────────────────────────────────────────────

    return (
        <section
            id="planning-playground"
            className="features-dark-override relative py-14 sm:py-20 overflow-hidden"
        >
            {/* Background effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage:
                            'radial-gradient(ellipse 80% 50% at 50% 30%, rgba(59,130,246,0.06) 0%, transparent 70%)',
                    }}
                />
                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
                        backgroundSize: '32px 32px',
                    }}
                />
            </div>

            <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <AnimatePresence mode="wait">
                    {/* ─── INPUT PHASE ─── */}
                    {phase === 'input' && (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20, scale: 0.98 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="text-center mb-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-xs font-medium text-blue-400 mb-5"
                                >
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Try it now — free
                                </motion.div>
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white mb-4">
                                    Start planning{' '}
                                    <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                        your project
                                    </span>
                                </h2>
                                <p className="text-base sm:text-lg text-white/50 max-w-xl mx-auto">
                                    Describe your idea and watch it transform into an interactive project plan.
                                </p>
                            </div>

                            <div className="max-w-3xl mx-auto">
                                <div className="relative rounded-2xl border border-white/[0.1] bg-white/[0.04] backdrop-blur-sm shadow-2xl shadow-blue-500/5 overflow-hidden">
                                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-blue-500/10 pointer-events-none" />

                                    <div className="p-5 sm:p-7">
                                        <textarea
                                            ref={textareaRef}
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder={PLACEHOLDER_IDEAS[placeholderIdx]}
                                            rows={4}
                                            className="w-full bg-transparent text-base sm:text-lg resize-none focus:outline-none placeholder:text-white/25 text-white leading-relaxed"
                                        />

                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.08]">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {EXAMPLE_CHIPS.map((chip) => (
                                                    <button
                                                        key={chip}
                                                        onClick={() => handleChipClick(chip)}
                                                        className="px-3 py-1 rounded-full text-xs font-medium bg-white/[0.06] text-white/40 hover:bg-white/[0.12] hover:text-white/70 transition-colors"
                                                    >
                                                        {chip}
                                                    </button>
                                                ))}
                                            </div>

                                            <button
                                                onClick={handleBuild}
                                                disabled={!prompt.trim()}
                                                className="shrink-0 ml-3 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
                                            >
                                                Plan
                                                <ArrowRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-center text-sm text-red-400 mt-4">{error}</p>
                                )}

                                <p className="text-center text-xs text-white/25 mt-4">
                                    Press{' '}
                                    <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/[0.05] text-[10px] font-mono text-white/40">
                                        Enter
                                    </kbd>{' '}
                                    to plan ·{' '}
                                    <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/[0.05] text-[10px] font-mono text-white/40">
                                        Shift+Enter
                                    </kbd>{' '}
                                    for new line
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* ─── LOADING PHASE ─── */}
                    {phase === 'loading' && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            <LoadingPhase />
                        </motion.div>
                    )}

                    {/* ─── CANVAS PHASE ─── */}
                    {phase === 'canvas' && (
                        <motion.div
                            key="canvas"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Canvas header */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-center mb-8"
                            >
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-500/20 bg-green-500/10 text-xs font-medium text-green-400 mb-4">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.3, type: 'spring' }}
                                    >
                                        <Check className="h-3.5 w-3.5" />
                                    </motion.div>
                                    Plan Generated
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
                                    {appTitle}
                                </h2>
                                <p className="text-sm text-white/40 max-w-md mx-auto">
                                    Explore your project plan. Click any node to see details, questions, and relationships.
                                </p>
                            </motion.div>

                            <InteractiveCanvas
                                nodes={planNodes}
                                onContinue={() => setPhase('email')}
                            />
                        </motion.div>
                    )}

                    {/* ─── EMAIL PHASE ─── */}
                    {phase === 'email' && (
                        <motion.div
                            key="email"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="max-w-md mx-auto">
                                {!emailSubmitted ? (
                                    <div className="rounded-2xl border border-white/[0.1] bg-white/[0.04] backdrop-blur-sm shadow-2xl shadow-blue-500/5 p-8 text-center">
                                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-5">
                                            <Sparkles className="h-7 w-7 text-blue-400" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-white mb-2">Keep building!</h2>
                                        <p className="text-sm text-white/50 mb-6">
                                            Enter your email to access the full canvas for{' '}
                                            <span className="font-medium text-white/80">{appTitle}</span> with AI tools,
                                            drag-and-drop editing, and more.
                                        </p>

                                        <div className="space-y-3">
                                            <input
                                                type="email"
                                                placeholder="you@email.com"
                                                value={emailValue}
                                                onChange={(e) => setEmailValue(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') handleEmailSubmit() }}
                                                className="w-full px-4 py-3 rounded-xl border border-white/[0.1] bg-white/[0.06] text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                                autoFocus
                                            />
                                            <button
                                                onClick={handleEmailSubmit}
                                                disabled={emailSubmitting}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-500/20"
                                            >
                                                {emailSubmitting ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Mail className="h-4 w-4" />
                                                )}
                                                {emailSubmitting ? 'Joining…' : 'Get Started Free'}
                                            </button>
                                        </div>

                                        <p className="text-[10px] text-white/25 mt-4">
                                            No credit card required · Free forever
                                        </p>

                                        <button
                                            onClick={() => setPhase('canvas')}
                                            className="mt-4 text-xs text-white/30 hover:text-white/60 transition-colors"
                                        >
                                            ← Back to plan
                                        </button>
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="rounded-2xl border border-white/[0.1] bg-white/[0.04] backdrop-blur-sm shadow-2xl shadow-blue-500/5 p-8 text-center"
                                    >
                                        <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-5">
                                            <Check className="h-7 w-7 text-green-500" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-white mb-2">You&apos;re in!</h2>
                                        <p className="text-sm text-white/50 mb-6">
                                            Check your inbox at{' '}
                                            <span className="font-medium text-white">{emailValue}</span> to access
                                            your full project canvas for{' '}
                                            <span className="font-medium text-white">{appTitle}</span>.
                                        </p>
                                        <button
                                            onClick={() => {
                                                setPhase('input')
                                                setPrompt('')
                                                setEmailValue('')
                                                setEmailSubmitted(false)
                                                setPlanNodes([])
                                            }}
                                            className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                                        >
                                            Plan another project →
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    )
}
