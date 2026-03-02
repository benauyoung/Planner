'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
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
    Plus,
    Pencil,
    Trash2,
    Circle,
    CheckCircle2,
    Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { track } from '@vercel/analytics'

// ─── Types ───────────────────────────────────────────────────

type Phase = 'input' | 'loading' | 'canvas' | 'email'
type NodeStatus = 'not_started' | 'in_progress' | 'completed'

interface PlanNode {
    id: string
    type: 'goal' | 'subgoal' | 'feature' | 'task'
    title: string
    description: string
    parentId: string | null
    questions?: { id: string; question: string; options: string[] }[]
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

const ACTION_LIMIT = 10

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

const CHILD_TYPE: Record<string, PlanNode['type']> = {
    goal: 'subgoal',
    subgoal: 'feature',
    feature: 'task',
    task: 'task',
}

const STATUS_CONFIG: Record<NodeStatus, { color: string; label: string }> = {
    not_started: { color: 'rgba(28,36,24,0.25)', label: 'Not started' },
    in_progress: { color: '#3b82f6', label: 'In progress' },
    completed: { color: '#22c55e', label: 'Completed' },
}

const STATUS_ORDER: NodeStatus[] = ['not_started', 'in_progress', 'completed']

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

    const laid: LayoutNode[] = []
    let totalHeight = 0

    function positionNode(id: string, depth: number, yOffset: number) {
        const node = byId.get(id)!
        const kids = childrenMap.get(id) || []
        const myWidth = subtreeWidth.get(id) || NODE_W

        const x = depth * (NODE_W + H_GAP)
        let y: number

        if (kids.length === 0) {
            y = yOffset + (myWidth - NODE_H) / 2
        } else {
            let childY = yOffset
            for (const kid of kids) {
                positionNode(kid, depth + 1, childY)
                childY += (subtreeWidth.get(kid) || NODE_W) + V_GAP
            }
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

let nextNodeId = 1000

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
                <div className="relative w-20 h-20 rounded-3xl bg-[hsl(42,35%,97%)] flex items-center justify-center m-[3px]">
                    <Sparkles className="h-9 w-9 text-[#8BAF8A]" />
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
                        className="text-base font-semibold text-[hsl(103,18%,12%)]"
                    >
                        {LOADING_STEPS[step]}
                    </motion.p>
                </AnimatePresence>
                <p className="text-xs text-[hsl(100,10%,38%)] mt-2">Building your project plan…</p>
            </div>
            <div className="w-72 h-1.5 rounded-full bg-[hsl(40,18%,85%)] overflow-hidden">
                <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#4A7459] to-[#8BAF8A]/60"
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
        <div className="flex items-center gap-4 px-4 py-2.5 rounded-xl bg-[hsl(40,18%,85%)]/40 border border-[hsl(40,20%,80%)]">
            <span className="text-[11px] font-semibold text-[hsl(100,10%,38%)]">{nodes.length} nodes</span>
            <div className="w-px h-3 bg-[hsl(40,20%,80%)]" />
            {(['goal', 'subgoal', 'feature', 'task'] as const).map((type) =>
                counts[type] > 0 ? (
                    <div key={type} className="flex items-center gap-1.5">
                        <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: TYPE_COLORS[type] }}
                        />
                        <span className="text-[11px] text-[hsl(100,10%,38%)]">
                            {counts[type]} {TYPE_LABELS[type]}{counts[type] > 1 ? 's' : ''}
                        </span>
                    </div>
                ) : null
            )}
        </div>
    )
}

// ─── Progress Bar ───────────────────────────────────────────

function ActionProgress({ count, limit }: { count: number; limit: number }) {
    const pct = Math.min((count / limit) * 100, 100)
    return (
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[hsl(40,18%,85%)]/40 border border-[hsl(40,20%,80%)]">
            <span className="text-[11px] font-semibold text-[hsl(100,10%,38%)]">
                {count}/{limit} actions
            </span>
            <div className="w-24 h-1.5 rounded-full bg-[hsl(40,18%,85%)] overflow-hidden">
                <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#4A7459] to-[#3a5e47]"
                    animate={{ width: `${pct}%` }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                />
            </div>
        </div>
    )
}

// ─── Detail Sidebar ─────────────────────────────────────────

function DetailSidebar({
    node,
    allNodes,
    onClose,
    onSelectNode,
    answeredQuestions,
    onAnswerQuestion,
    nodeStatuses,
    onToggleStatus,
    onAddChild,
    onEditTitle,
    onDeleteNode,
    gated,
}: {
    node: LayoutNode
    allNodes: LayoutNode[]
    onClose: () => void
    onSelectNode: (id: string) => void
    answeredQuestions: Record<string, string>
    onAnswerQuestion: (nodeId: string, questionId: string, answer: string) => void
    nodeStatuses: Record<string, NodeStatus>
    onToggleStatus: (nodeId: string) => void
    onAddChild: (parentId: string, title: string) => void
    onEditTitle: (nodeId: string, newTitle: string) => void
    onDeleteNode: (nodeId: string) => void
    gated: boolean
}) {
    const Icon = TYPE_ICONS[node.type] || Target
    const parent = node.parentId ? allNodes.find((n) => n.id === node.parentId) : null
    const children = allNodes.filter((n) => n.parentId === node.id)
    const questions = node.questions || []
    const status = nodeStatuses[node.id] || 'not_started'
    const statusCfg = STATUS_CONFIG[status]

    const [editingTitle, setEditingTitle] = useState(false)
    const [titleDraft, setTitleDraft] = useState(node.title)
    const [addingChild, setAddingChild] = useState(false)
    const [childDraft, setChildDraft] = useState('')
    const titleInputRef = useRef<HTMLInputElement>(null)
    const childInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setTitleDraft(node.title)
        setEditingTitle(false)
        setAddingChild(false)
        setChildDraft('')
    }, [node.id, node.title])

    useEffect(() => {
        if (editingTitle) titleInputRef.current?.focus()
    }, [editingTitle])

    useEffect(() => {
        if (addingChild) childInputRef.current?.focus()
    }, [addingChild])

    function commitTitle() {
        const trimmed = titleDraft.trim()
        if (trimmed && trimmed !== node.title) {
            onEditTitle(node.id, trimmed)
        }
        setEditingTitle(false)
    }

    function commitChild() {
        const trimmed = childDraft.trim()
        if (trimmed) {
            onAddChild(node.id, trimmed)
            setChildDraft('')
            setAddingChild(false)
        }
    }

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
                        {/* Status toggle */}
                        <button
                            onClick={() => onToggleStatus(node.id)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-[hsl(40,18%,85%)]/60 hover:bg-[hsl(40,18%,85%)] transition-colors"
                            style={{ color: statusCfg.color }}
                            title={`Status: ${statusCfg.label}. Click to change.`}
                        >
                            {status === 'completed' ? (
                                <CheckCircle2 className="h-3 w-3" />
                            ) : status === 'in_progress' ? (
                                <Clock className="h-3 w-3" />
                            ) : (
                                <Circle className="h-3 w-3" />
                            )}
                            {statusCfg.label}
                        </button>
                    </div>
                    {editingTitle ? (
                        <input
                            ref={titleInputRef}
                            value={titleDraft}
                            onChange={(e) => setTitleDraft(e.target.value)}
                            onBlur={commitTitle}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') commitTitle()
                                if (e.key === 'Escape') { setEditingTitle(false); setTitleDraft(node.title) }
                            }}
                            className="w-full text-sm font-bold text-[hsl(103,18%,12%)] bg-[hsl(40,18%,85%)]/40 border border-[hsl(40,20%,80%)] rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[hsl(149,23%,37%)]/50"
                        />
                    ) : (
                        <div className="flex items-center gap-1.5 group">
                            <h3 className="text-sm font-bold text-[hsl(103,18%,12%)] leading-snug">{node.title}</h3>
                            <button
                                onClick={() => setEditingTitle(true)}
                                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[hsl(40,18%,85%)] transition-all text-[hsl(100,10%,38%)] hover:text-[hsl(103,18%,12%)]"
                                title="Edit title"
                            >
                                <Pencil className="h-3 w-3" />
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={() => onDeleteNode(node.id)}
                        className="p-1 rounded-md hover:bg-red-500/10 transition-colors text-[hsl(100,10%,38%)] hover:text-red-500"
                        title="Delete node"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md hover:bg-[hsl(40,18%,85%)] transition-colors text-[hsl(100,10%,38%)] hover:text-[hsl(103,18%,12%)]"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                {/* Description */}
                <div>
                    <p className="text-[12px] leading-relaxed text-[hsl(100,10%,38%)]">{node.description}</p>
                </div>

                {/* Parent */}
                {parent && (
                    <div>
                        <h4 className="text-[10px] uppercase tracking-wider text-[hsl(100,10%,38%)]/60 font-semibold mb-2">Parent</h4>
                        <button
                            onClick={() => onSelectNode(parent.id)}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-[hsl(40,18%,85%)]/40 border border-[hsl(40,20%,80%)] hover:bg-[hsl(40,18%,85%)]/70 transition-colors text-left"
                        >
                            <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: TYPE_COLORS[parent.type] }}
                            />
                            <span className="text-[11px] text-[hsl(103,18%,12%)]/70 truncate">{parent.title}</span>
                            <ChevronRight className="h-3 w-3 text-[hsl(100,10%,38%)]/50 ml-auto shrink-0" />
                        </button>
                    </div>
                )}

                {/* Children */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[10px] uppercase tracking-wider text-[hsl(100,10%,38%)]/60 font-semibold">
                            Children {children.length > 0 && `(${children.length})`}
                        </h4>
                        {!gated && (
                            <button
                                onClick={() => setAddingChild(true)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium text-[#4A7459] bg-[#4A7459]/10 hover:bg-[#4A7459]/20 transition-colors"
                                title="Add child node"
                            >
                                <Plus className="h-3 w-3" />
                                Add
                            </button>
                        )}
                    </div>
                    {children.length > 0 && (
                        <div className="space-y-1 mb-2">
                            {children.map((child) => (
                                <button
                                    key={child.id}
                                    onClick={() => onSelectNode(child.id)}
                                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-[hsl(40,18%,85%)]/40 border border-[hsl(40,20%,80%)] hover:bg-[hsl(40,18%,85%)]/70 transition-colors text-left"
                                >
                                    <span
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{ backgroundColor: TYPE_COLORS[child.type] }}
                                    />
                                    <span className="text-[11px] text-[hsl(103,18%,12%)]/70 truncate">{child.title}</span>
                                    <ChevronRight className="h-3 w-3 text-[hsl(100,10%,38%)]/50 ml-auto shrink-0" />
                                </button>
                            ))}
                        </div>
                    )}
                    {/* Add child inline form */}
                    <AnimatePresence>
                        {addingChild && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="flex items-center gap-2 mt-1">
                                    <input
                                        ref={childInputRef}
                                        value={childDraft}
                                        onChange={(e) => setChildDraft(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') commitChild()
                                            if (e.key === 'Escape') { setAddingChild(false); setChildDraft('') }
                                        }}
                                        placeholder={`New ${CHILD_TYPE[node.type] || 'task'}...`}
                                        className="flex-1 px-2.5 py-1.5 rounded-lg text-[11px] bg-[hsl(40,18%,85%)]/40 border border-[hsl(40,20%,80%)] text-[hsl(103,18%,12%)] placeholder:text-[hsl(100,10%,38%)]/40 focus:outline-none focus:ring-1 focus:ring-[hsl(149,23%,37%)]/40"
                                    />
                                    <button
                                        onClick={commitChild}
                                        disabled={!childDraft.trim()}
                                        className="p-1.5 rounded-lg bg-[#4A7459]/20 text-[#4A7459] hover:bg-[#4A7459]/30 disabled:opacity-30 transition-colors"
                                    >
                                        <Check className="h-3 w-3" />
                                    </button>
                                    <button
                                        onClick={() => { setAddingChild(false); setChildDraft('') }}
                                        className="p-1.5 rounded-lg bg-[hsl(40,18%,85%)]/60 text-[hsl(100,10%,38%)] hover:bg-[hsl(40,18%,85%)] transition-colors"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Questions */}
                {questions.length > 0 && (
                    <div>
                        <h4 className="text-[10px] uppercase tracking-wider text-[hsl(100,10%,38%)]/60 font-semibold mb-2 flex items-center gap-1.5">
                            <HelpCircle className="h-3 w-3" />
                            Planning Questions
                        </h4>
                        <div className="space-y-3">
                            {questions.slice(0, 3).map((q) => {
                                const answeredKey = `${node.id}:${q.id}`
                                const currentAnswer = answeredQuestions[answeredKey]
                                return (
                                    <div
                                        key={q.id}
                                        className="rounded-xl bg-[hsl(40,18%,85%)]/30 border border-[hsl(40,20%,80%)] p-3"
                                    >
                                        <p className="text-[11px] text-[hsl(103,18%,12%)]/70 font-medium mb-2">{q.question}</p>
                                        <div className="space-y-1">
                                            {q.options.map((opt) => {
                                                const isSelected = currentAnswer === opt
                                                return (
                                                    <button
                                                        key={opt}
                                                        onClick={() => {
                                                            if (!gated && !isSelected) {
                                                                onAnswerQuestion(node.id, q.id, opt)
                                                            }
                                                        }}
                                                        disabled={gated}
                                                        className={cn(
                                                            'flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg transition-colors text-left',
                                                            isSelected
                                                                ? 'bg-[#4A7459]/15 border border-[#4A7459]/30'
                                                                : 'bg-[hsl(40,18%,85%)]/30 hover:bg-[hsl(40,18%,85%)]/60 border border-transparent',
                                                            gated && !isSelected && 'opacity-50 cursor-not-allowed'
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            'w-3.5 h-3.5 rounded-full border shrink-0 flex items-center justify-center transition-colors',
                                                            isSelected
                                                                ? 'border-[#4A7459] bg-[#4A7459]'
                                                                : 'border-[hsl(40,20%,80%)]'
                                                        )}>
                                                            {isSelected && (
                                                                <motion.div
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    transition={{ type: 'spring', stiffness: 300 }}
                                                                >
                                                                    <Check className="h-2 w-2 text-white" />
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                        <span className={cn(
                                                            'text-[10px] transition-colors',
                                                            isSelected ? 'text-[#4A7459]' : 'text-[hsl(100,10%,38%)]'
                                                        )}>
                                                            {opt}
                                                        </span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                        {currentAnswer && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-center gap-1 mt-2 text-[9px] text-green-400/70"
                                            >
                                                <Check className="h-2.5 w-2.5" />
                                                Answer saved
                                            </motion.div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Sign up hint */}
                <div className="rounded-xl bg-gradient-to-br from-[#4A7459]/10 to-[#8BAF8A]/10 border border-[#4A7459]/20 p-4">
                    <div className="flex items-start gap-2.5">
                        <Lightbulb className="h-4 w-4 text-[#8BAF8A] shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[11px] text-[hsl(103,18%,12%)]/70 font-medium mb-1">Want to refine this plan?</p>
                            <p className="text-[10px] text-[hsl(100,10%,38%)] leading-relaxed">
                                Sign up to get AI-powered suggestions, drag-and-drop editing, and PRD generation.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

// ─── Email Gate Overlay ─────────────────────────────────────

function EmailGateOverlay({
    onSubmitEmail,
    emailSubmitting,
    appTitle,
}: {
    onSubmitEmail: (email: string) => void
    emailSubmitting: boolean
    appTitle: string
}) {
    const [email, setEmail] = useState('')

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-20 flex items-center justify-center"
        >
            {/* Frosted backdrop */}
            <div className="absolute inset-0 bg-[#EBE7DC]/80 backdrop-blur-md" />

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 20 }}
                className="relative z-10 w-full max-w-sm rounded-2xl border border-[hsl(40,20%,80%)] bg-[hsl(42,35%,97%)] shadow-2xl shadow-black/10 p-8 text-center mx-4"
            >
                <div className="w-14 h-14 rounded-2xl bg-[#4A7459]/10 flex items-center justify-center mx-auto mb-5">
                    <Sparkles className="h-7 w-7 text-[#8BAF8A]" />
                </div>
                <h3 className="text-xl font-bold text-[hsl(103,18%,12%)] mb-2">You&apos;re on a roll!</h3>
                <p className="text-sm text-[hsl(100,10%,38%)] mb-6">
                    Enter your email to keep building{' '}
                    <span className="font-medium text-[hsl(103,18%,12%)]">{appTitle}</span> with the full planning canvas, AI tools, and more.
                </p>

                <div className="space-y-3">
                    <input
                        type="email"
                        placeholder="you@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && email.includes('@')) onSubmitEmail(email) }}
                        className="w-full px-4 py-3 rounded-xl border border-[hsl(40,20%,80%)] bg-[hsl(40,18%,85%)]/40 text-sm text-[hsl(103,18%,12%)] placeholder:text-[hsl(100,10%,38%)]/40 focus:outline-none focus:ring-2 focus:ring-[hsl(149,23%,37%)]/30"
                        autoFocus
                    />
                    <button
                        onClick={() => onSubmitEmail(email)}
                        disabled={emailSubmitting || !email.includes('@')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#4A7459] text-white text-sm font-semibold hover:bg-[#3a5e47] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-[#4A7459]/20"
                    >
                        {emailSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Mail className="h-4 w-4" />
                        )}
                        {emailSubmitting ? 'Joining…' : 'Continue Planning'}
                    </button>
                </div>
                <p className="text-[10px] text-[hsl(100,10%,38%)]/50 mt-4">
                    No credit card required
                </p>
            </motion.div>
        </motion.div>
    )
}

// ─── Interactive Canvas ──────────────────────────────────────

function InteractiveCanvas({
    nodes,
    setNodes,
    onContinue,
    actionCount,
    onRecordAction,
    answeredQuestions,
    onAnswerQuestion,
    nodeStatuses,
    onToggleStatus,
    onAddChild,
    onEditTitle,
    onDeleteNode,
    gated,
    onSubmitEmail,
    emailSubmitting,
    appTitle,
}: {
    nodes: PlanNode[]
    setNodes: React.Dispatch<React.SetStateAction<PlanNode[]>>
    onContinue: () => void
    actionCount: number
    onRecordAction: () => void
    answeredQuestions: Record<string, string>
    onAnswerQuestion: (nodeId: string, questionId: string, answer: string) => void
    nodeStatuses: Record<string, NodeStatus>
    onToggleStatus: (nodeId: string) => void
    onAddChild: (parentId: string, title: string) => void
    onEditTitle: (nodeId: string, newTitle: string) => void
    onDeleteNode: (nodeId: string) => void
    gated: boolean
    onSubmitEmail: (email: string) => void
    emailSubmitting: boolean
    appTitle: string
}) {
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const svgRef = useRef<HTMLDivElement>(null)

    const { laid, width, height } = useMemo(() => layoutTree(nodes), [nodes])
    const selectedNode = selectedId ? laid.find((n) => n.id === selectedId) || null : null

    const laidMap = useMemo(() => new Map(laid.map((n) => [n.id, n])), [laid])

    const edges = useMemo(() => {
        const result: { from: LayoutNode; to: LayoutNode }[] = []
        for (const node of laid) {
            if (node.parentId && laidMap.has(node.parentId)) {
                result.push({ from: laidMap.get(node.parentId)!, to: node })
            }
        }
        return result
    }, [laid, laidMap])

    // Clear selection if node was deleted
    useEffect(() => {
        if (selectedId && !nodes.find(n => n.id === selectedId)) {
            setSelectedId(null)
        }
    }, [nodes, selectedId])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-3"
        >
            {/* Header row */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                    <StatsStrip nodes={nodes} />
                    <ActionProgress count={actionCount} limit={ACTION_LIMIT} />
                </div>
                <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    onClick={onContinue}
                    className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4A7459] text-white text-sm font-semibold hover:bg-[#3a5e47] transition-all shadow-lg shadow-[#4A7459]/25 hover:shadow-xl hover:shadow-[#4A7459]/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                    Continue Planning
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </motion.button>
            </div>

            {/* Canvas + Sidebar */}
            <div className="relative flex rounded-2xl border border-[hsl(40,20%,80%)] bg-[hsl(42,35%,97%)] overflow-hidden" style={{ minHeight: 320 }}>
                {/* SVG Canvas */}
                <div
                    ref={svgRef}
                    className="flex-1 relative"
                    style={{ minHeight: 300 }}
                >
                    {/* Dot grid bg */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-30"
                        style={{
                            backgroundImage: 'radial-gradient(circle, rgba(28,36,24,0.08) 1px, transparent 1px)',
                            backgroundSize: '24px 24px',
                        }}
                    />

                    <svg
                        viewBox={`-20 -20 ${Math.max(width, 500) + 40} ${Math.max(height, 300) + 40}`}
                        className="relative w-full h-full"
                        preserveAspectRatio="xMidYMid meet"
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
                                    stroke="rgba(28,36,24,0.12)"
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
                            const status = nodeStatuses[node.id] || 'not_started'
                            const statusColor = STATUS_CONFIG[status].color
                            const hasAnswers = (node.questions || []).some(
                                q => answeredQuestions[`${node.id}:${q.id}`]
                            )

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

                                    {/* Answered glow */}
                                    {hasAnswers && !isSelected && (
                                        <rect
                                            x={node.x - 2}
                                            y={node.y - 2}
                                            width={node.w + 4}
                                            height={node.h + 4}
                                            rx={13}
                                            fill="none"
                                            stroke="#3b82f6"
                                            strokeWidth={1}
                                            opacity={0.3}
                                        />
                                    )}

                                    {/* Card background */}
                                    <rect
                                        x={node.x}
                                        y={node.y}
                                        width={node.w}
                                        height={node.h}
                                        rx={11}
                                        fill={isSelected ? `${color}15` : 'rgba(250,249,246,0.95)'}
                                        stroke={isSelected ? color : `${color}50`}
                                        strokeWidth={isSelected ? 1.5 : 1}
                                    />

                                    {/* Status dot (top-left) */}
                                    <circle
                                        cx={node.x + 12}
                                        cy={node.y + node.h / 2}
                                        r={3.5}
                                        fill={statusColor}
                                    />

                                    {/* Title */}
                                    <text
                                        x={node.x + 22}
                                        y={node.y + 17}
                                        fill="rgba(28,36,24,0.85)"
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
                            animate={{ width: 300, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="border-l border-white/[0.08] bg-white/[0.02] shrink-0 overflow-hidden"
                        >
                            <DetailSidebar
                                node={selectedNode}
                                allNodes={laid}
                                onClose={() => setSelectedId(null)}
                                onSelectNode={setSelectedId}
                                answeredQuestions={answeredQuestions}
                                onAnswerQuestion={onAnswerQuestion}
                                nodeStatuses={nodeStatuses}
                                onToggleStatus={onToggleStatus}
                                onAddChild={onAddChild}
                                onEditTitle={onEditTitle}
                                onDeleteNode={onDeleteNode}
                                gated={gated}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Email gate overlay */}
                <AnimatePresence>
                    {gated && (
                        <EmailGateOverlay
                            onSubmitEmail={onSubmitEmail}
                            emailSubmitting={emailSubmitting}
                            appTitle={appTitle}
                        />
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
                Click any node to explore · Answer questions and add nodes to build your plan
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
    const [emailSubmitted, setEmailSubmitted] = useState(false)
    const [emailSubmitting, setEmailSubmitting] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Interactive tutorial state
    const [actionCount, setActionCount] = useState(0)
    const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, string>>({})
    const [nodeStatuses, setNodeStatuses] = useState<Record<string, NodeStatus>>({})
    const [gated, setGated] = useState(false)

    // Rotate placeholder
    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDER_IDEAS.length)
        }, 3200)
        return () => clearInterval(interval)
    }, [])

    // ─── Action tracking ────────────────────────────────────────

    const recordAction = useCallback(() => {
        setActionCount((prev) => {
            const next = prev + 1
            if (next >= ACTION_LIMIT) {
                setTimeout(() => setGated(true), 400)
            }
            return next
        })
    }, [])

    const handleAnswerQuestion = useCallback((nodeId: string, questionId: string, answer: string) => {
        const key = `${nodeId}:${questionId}`
        setAnsweredQuestions((prev) => {
            if (prev[key]) return prev // already answered, don't double-count
            return { ...prev, [key]: answer }
        })
        recordAction()
    }, [recordAction])

    const handleAddChild = useCallback((parentId: string, title: string) => {
        const parentNode = planNodes.find(n => n.id === parentId)
        const childType = parentNode ? CHILD_TYPE[parentNode.type] : 'task'
        const newNode: PlanNode = {
            id: `demo-${++nextNodeId}`,
            type: childType,
            title,
            description: `User-created ${childType} under "${parentNode?.title || 'parent'}"`,
            parentId,
        }
        setPlanNodes((prev) => [...prev, newNode])
        recordAction()
    }, [planNodes, recordAction])

    const handleToggleStatus = useCallback((nodeId: string) => {
        setNodeStatuses((prev) => {
            const current = prev[nodeId] || 'not_started'
            const idx = STATUS_ORDER.indexOf(current)
            const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length]
            return { ...prev, [nodeId]: next }
        })
    }, [])

    const handleEditTitle = useCallback((nodeId: string, newTitle: string) => {
        setPlanNodes((prev) =>
            prev.map((n) => (n.id === nodeId ? { ...n, title: newTitle } : n))
        )
    }, [])

    const handleDeleteNode = useCallback((nodeId: string) => {
        setPlanNodes((prev) => {
            const node = prev.find(n => n.id === nodeId)
            if (!node) return prev
            // Re-parent children to deleted node's parent
            return prev
                .filter(n => n.id !== nodeId)
                .map(n => n.parentId === nodeId ? { ...n, parentId: node.parentId } : n)
        })
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

            const nodes: PlanNode[] = (data.nodes || []).map((n: PlanNode, i: number) => ({
                id: n.id,
                type: n.type,
                title: n.title,
                description: n.description,
                parentId: n.parentId,
                questions: (n.questions || []).map((q: { question: string; options: string[] }, qi: number) => ({
                    id: `q-${n.id}-${qi}`,
                    question: q.question,
                    options: q.options,
                })),
            }))

            if (nodes.length === 0) throw new Error('No plan nodes generated')

            setPlanNodes(nodes)
            setSuggestedTitle(data.suggestedTitle || null)
            setActionCount(0)
            setAnsweredQuestions({})
            setNodeStatuses({})
            setGated(false)
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

    async function handleEmailSubmit(email: string) {
        if (!email.includes('@') || !email.includes('.')) return
        setEmailSubmitting(true)
        try {
            await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, prompt, appTitle: suggestedTitle || '' }),
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
            className="relative pt-24 pb-14 sm:pt-28 sm:pb-20 overflow-hidden"
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
                            'radial-gradient(circle, rgba(28,36,24,0.04) 1px, transparent 1px)',
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
                                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#4A7459]/20 bg-[#4A7459]/10 text-xs font-medium text-[#4A7459] mb-5"
                                >
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Try it now -- free
                                </motion.div>
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-[hsl(103,18%,12%)] mb-4">
                                    Start planning{' '}
                                    <span className="italic" style={{ color: '#4A7459' }}>
                                        your project
                                    </span>
                                </h2>
                                <p className="text-base sm:text-lg text-[hsl(100,10%,38%)] max-w-xl mx-auto">
                                    Describe your idea and watch it transform into an interactive project plan.
                                </p>
                            </div>

                            <div className="max-w-3xl mx-auto">
                                <div className="relative rounded-2xl border border-[hsl(40,20%,80%)] bg-[hsl(42,35%,97%)] shadow-2xl shadow-black/5 overflow-hidden">
                                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-[#4A7459]/10 pointer-events-none" />

                                    <div className="p-5 sm:p-7">
                                        <textarea
                                            ref={textareaRef}
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder={PLACEHOLDER_IDEAS[placeholderIdx]}
                                            rows={4}
                                            className="w-full bg-transparent text-base sm:text-lg resize-none focus:outline-none placeholder:text-[hsl(100,10%,38%)]/40 text-[hsl(103,18%,12%)] leading-relaxed"
                                        />

                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[hsl(40,20%,80%)]">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {EXAMPLE_CHIPS.map((chip) => (
                                                    <button
                                                        key={chip}
                                                        onClick={() => handleChipClick(chip)}
                                                        className="px-3 py-1 rounded-full text-xs font-medium bg-[hsl(40,18%,85%)]/60 text-[hsl(100,10%,38%)] hover:bg-[hsl(40,18%,85%)] hover:text-[hsl(103,18%,12%)] transition-colors"
                                                    >
                                                        {chip}
                                                    </button>
                                                ))}
                                            </div>

                                            <button
                                                onClick={handleBuild}
                                                disabled={!prompt.trim()}
                                                className="shrink-0 ml-3 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#4A7459] text-white text-sm font-semibold hover:bg-[#3a5e47] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#4A7459]/20"
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

                                <p className="text-center text-xs text-[hsl(100,10%,38%)]/50 mt-4">
                                    Press{' '}
                                    <kbd className="px-1.5 py-0.5 rounded border border-[hsl(40,20%,80%)] bg-[hsl(40,18%,85%)]/40 text-[10px] font-mono text-[hsl(100,10%,38%)]">
                                        Enter
                                    </kbd>{' '}
                                    to plan ·{' '}
                                    <kbd className="px-1.5 py-0.5 rounded border border-[hsl(40,20%,80%)] bg-[hsl(40,18%,85%)]/40 text-[10px] font-mono text-[hsl(100,10%,38%)]">
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
                                <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(103,18%,12%)] mb-2 tracking-tight">
                                    {appTitle}
                                </h2>
                                <p className="text-sm text-[hsl(100,10%,38%)] max-w-md mx-auto">
                                    Explore your plan. Click nodes, answer questions, and add new items to build it out.
                                </p>
                            </motion.div>

                            <InteractiveCanvas
                                nodes={planNodes}
                                setNodes={setPlanNodes}
                                onContinue={() => setPhase('email')}
                                actionCount={actionCount}
                                onRecordAction={recordAction}
                                answeredQuestions={answeredQuestions}
                                onAnswerQuestion={handleAnswerQuestion}
                                nodeStatuses={nodeStatuses}
                                onToggleStatus={handleToggleStatus}
                                onAddChild={handleAddChild}
                                onEditTitle={handleEditTitle}
                                onDeleteNode={handleDeleteNode}
                                gated={gated}
                                onSubmitEmail={handleEmailSubmit}
                                emailSubmitting={emailSubmitting}
                                appTitle={appTitle}
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
                                    <div className="rounded-2xl border border-[hsl(40,20%,80%)] bg-[hsl(42,35%,97%)] shadow-2xl shadow-black/5 p-8 text-center">
                                        <div className="w-14 h-14 rounded-2xl bg-[#4A7459]/10 flex items-center justify-center mx-auto mb-5">
                                            <Sparkles className="h-7 w-7 text-[#8BAF8A]" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-[hsl(103,18%,12%)] mb-2">Keep building!</h2>
                                        <p className="text-sm text-[hsl(100,10%,38%)] mb-6">
                                            Enter your email to access the full canvas for{' '}
                                            <span className="font-medium text-[hsl(103,18%,12%)]">{appTitle}</span> with AI tools,
                                            drag-and-drop editing, and more.
                                        </p>

                                        <div className="space-y-3">
                                            <input
                                                type="email"
                                                placeholder="you@email.com"
                                                id="email-phase-input"
                                                onChange={(e) => {
                                                    const el = e.target as HTMLInputElement
                                                    el.dataset.value = el.value
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const el = e.target as HTMLInputElement
                                                        handleEmailSubmit(el.value)
                                                    }
                                                }}
                                                className="w-full px-4 py-3 rounded-xl border border-[hsl(40,20%,80%)] bg-[hsl(40,18%,85%)]/40 text-sm text-[hsl(103,18%,12%)] placeholder:text-[hsl(100,10%,38%)]/40 focus:outline-none focus:ring-2 focus:ring-[hsl(149,23%,37%)]/30"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => {
                                                    const el = document.getElementById('email-phase-input') as HTMLInputElement
                                                    if (el) handleEmailSubmit(el.value)
                                                }}
                                                disabled={emailSubmitting}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#4A7459] text-white text-sm font-semibold hover:bg-[#3a5e47] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-lg shadow-[#4A7459]/20"
                                            >
                                                {emailSubmitting ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Mail className="h-4 w-4" />
                                                )}
                                                {emailSubmitting ? 'Joining…' : 'Get Started Free'}
                                            </button>
                                        </div>

                                        <p className="text-[10px] text-[hsl(100,10%,38%)]/50 mt-4">
                                            No credit card required
                                        </p>

                                        <button
                                            onClick={() => setPhase('canvas')}
                                            className="mt-4 text-xs text-[hsl(100,10%,38%)] hover:text-[hsl(103,18%,12%)] transition-colors"
                                        >
                                            ← Back to plan
                                        </button>
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="rounded-2xl border border-[hsl(40,20%,80%)] bg-[hsl(42,35%,97%)] shadow-2xl shadow-black/5 p-8 text-center"
                                    >
                                        <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-5">
                                            <Check className="h-7 w-7 text-green-500" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-[hsl(103,18%,12%)] mb-2">You&apos;re in!</h2>
                                        <p className="text-sm text-[hsl(100,10%,38%)] mb-6">
                                            We&apos;ll send you access to continue building{' '}
                                            <span className="font-medium text-[hsl(103,18%,12%)]">{appTitle}</span> with the full planning canvas.
                                        </p>
                                        <button
                                            onClick={() => {
                                                setPhase('input')
                                                setPrompt('')
                                                setEmailSubmitted(false)
                                                setPlanNodes([])
                                                setActionCount(0)
                                                setAnsweredQuestions({})
                                                setNodeStatuses({})
                                                setGated(false)
                                            }}
                                            className="text-sm text-[#4A7459] hover:text-[#3a5e47] font-medium transition-colors"
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
