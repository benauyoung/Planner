'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Sparkles, Loader2, Target, Flag, Puzzle, CheckSquare, Rocket } from 'lucide-react'
import { signInAsDemo } from '@/services/auth'
import { useProjectStore } from '@/stores/project-store'
import type { AIPlanNode } from '@/types/chat'
import * as persistence from '@/services/persistence'

const PLACEHOLDER_IDEAS = [
  'A music festival app with live lineups and friend meetups...',
  'A fitness challenge app where friends compete on goals...',
  'A recipe app that generates meal plans from your fridge...',
  'A travel planner that builds custom itineraries with AI...',
  'A pet adoption platform with local shelter matching...',
]

const EXAMPLE_CHIPS = [
  'Festival App',
  'Fitness Tracker',
  'Travel Planner',
  'Recipe App',
  'Social Platform',
]

type Phase = 'input' | 'loading' | 'preview' | 'redirecting'

// ─── Node type config ────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  goal: 'hsl(25, 95%, 53%)',
  subgoal: 'hsl(217, 91%, 60%)',
  feature: 'hsl(142, 71%, 45%)',
  task: 'hsl(263, 70%, 60%)',
  spec: 'hsl(200, 80%, 60%)',
  prd: 'hsl(270, 60%, 65%)',
  schema: 'hsl(175, 60%, 52%)',
  prompt: 'hsl(152, 60%, 52%)',
  reference: 'hsl(220, 15%, 55%)',
}

const TYPE_ICONS: Record<string, typeof Target> = {
  goal: Target,
  subgoal: Flag,
  feature: Puzzle,
  task: CheckSquare,
}

const DEPTH_MAP: Record<string, number> = {
  goal: 0,
  subgoal: 1,
  feature: 2,
  task: 3,
  spec: 1,
  prd: 2,
  schema: 2,
  prompt: 3,
  reference: 3,
}

// ─── Auto-layout ─────────────────────────────────────────────

interface LayoutNode {
  id: string
  type: string
  title: string
  parentId: string | null
  x: number
  y: number
  w: number
}

function layoutNodes(nodes: AIPlanNode[]): LayoutNode[] {
  const colWidth = 200
  const rowHeight = 52
  const nodeWidth = 160
  const startX = 30
  const startY = 20

  // Group by depth
  const depthGroups: Map<number, AIPlanNode[]> = new Map()
  for (const node of nodes) {
    const depth = DEPTH_MAP[node.type] ?? 2
    if (!depthGroups.has(depth)) depthGroups.set(depth, [])
    depthGroups.get(depth)!.push(node)
  }

  const result: LayoutNode[] = []
  for (const [depth, group] of depthGroups) {
    group.forEach((node, idx) => {
      result.push({
        id: node.id,
        type: node.type,
        title: node.title.length > 20 ? node.title.slice(0, 18) + '...' : node.title,
        parentId: node.parentId,
        x: startX + depth * colWidth,
        y: startY + idx * rowHeight,
        w: nodeWidth,
      })
    })
  }

  return result
}

// ─── Mini Canvas ─────────────────────────────────────────────

function MiniCanvas({ nodes }: { nodes: AIPlanNode[] }) {
  const laid = useMemo(() => layoutNodes(nodes), [nodes])
  const nodeMap = useMemo(() => Object.fromEntries(laid.map((n) => [n.id, n])), [laid])

  // Calculate viewBox
  const maxX = Math.max(...laid.map((n) => n.x + n.w), 600) + 40
  const maxY = Math.max(...laid.map((n) => n.y + 40), 200) + 40

  const edges = laid.filter((n) => n.parentId && nodeMap[n.parentId])

  return (
    <div className="relative w-full rounded-xl border bg-background/60 overflow-hidden">
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--muted-foreground) / 0.3) 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      />
      <svg
        viewBox={`0 0 ${maxX} ${maxY}`}
        className="relative w-full"
        style={{ minHeight: 240, maxHeight: 400 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Edges */}
        {edges.map((node, i) => {
          const parent = nodeMap[node.parentId!]
          if (!parent) return null
          const sx = parent.x + parent.w
          const sy = parent.y + 20
          const ex = node.x
          const ey = node.y + 20
          const mx = (sx + ex) / 2
          return (
            <motion.path
              key={`edge-${node.id}`}
              d={`M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ey}, ${ex} ${ey}`}
              fill="none"
              stroke="hsl(var(--muted-foreground) / 0.25)"
              strokeWidth="1.5"
              strokeDasharray="6 4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.04 }}
            />
          )
        })}

        {/* Nodes */}
        {laid.map((node, i) => {
          const color = TYPE_COLORS[node.type] || TYPE_COLORS.task
          return (
            <motion.g
              key={node.id}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: 0.1 + i * 0.06 }}
            >
              <rect
                x={node.x}
                y={node.y}
                width={node.w}
                height={38}
                rx={8}
                fill="hsl(var(--background))"
                stroke={color}
                strokeWidth={1.5}
              />
              <circle cx={node.x + 14} cy={node.y + 19} r={4} fill={color} />
              <text
                x={node.x + 26}
                y={node.y + 16}
                fill="hsl(var(--foreground))"
                fontSize="10"
                fontWeight="600"
                fontFamily="system-ui, sans-serif"
              >
                {node.title}
              </text>
              <text
                x={node.x + 26}
                y={node.y + 28}
                fill="hsl(var(--muted-foreground))"
                fontSize="8"
                fontFamily="system-ui, sans-serif"
              >
                {node.type}
              </text>
            </motion.g>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Loading Animation ───────────────────────────────────────

const LOADING_STEPS = [
  'Analyzing your idea...',
  'Creating project goals...',
  'Breaking down features...',
  'Mapping tasks & dependencies...',
]

function LoadingState() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => Math.min(prev + 1, LOADING_STEPS.length - 1))
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </div>
      <div className="text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="text-sm font-medium text-foreground"
          >
            {LOADING_STEPS[step]}
          </motion.p>
        </AnimatePresence>
        <p className="text-xs text-muted-foreground mt-2">This usually takes 5-10 seconds</p>
      </div>
      {/* Progress bar */}
      <div className="w-64 h-1 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: '90%' }}
          transition={{ duration: 12, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────

export function HeroPrompt() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('input')
  const [prompt, setPrompt] = useState('')
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [generatedNodes, setGeneratedNodes] = useState<AIPlanNode[]>([])
  const [suggestedTitle, setSuggestedTitle] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDER_IDEAS.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

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
              content: `I want to plan a new project. Here's my idea:\n\n${prompt.trim()}\n\nPlease build a comprehensive project plan immediately with goals, subgoals, features, and tasks. Be thorough.`,
            },
          ],
        }),
      })

      if (!res.ok) throw new Error('Failed to generate plan')

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setGeneratedNodes(data.nodes || [])
      setSuggestedTitle(data.suggestedTitle || null)
      setPhase('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setPhase('input')
    }
  }

  async function handleContinue() {
    if (phase !== 'preview') return
    setPhase('redirecting')

    try {
      // Auto sign-in as demo user
      await signInAsDemo()

      // Create the project with the generated nodes
      const project = useProjectStore.getState().ingestPlan(
        {
          title: suggestedTitle || 'My Project',
          description: prompt.trim(),
          nodes: generatedNodes,
        },
        'demo-user'
      )

      // Persist the project
      try {
        await persistence.createProject(project)
      } catch {
        // Persistence may fail in dev — project is already in store
      }

      // Navigate to the project canvas
      router.push(`/project/${project.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
      setPhase('preview')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleBuild()
    }
  }

  function handleChipClick(chip: string) {
    setPrompt(`Build a ${chip.toLowerCase()} with user authentication, a dashboard, and core CRUD functionality.`)
    textareaRef.current?.focus()
  }

  // Count nodes by type for summary
  const nodeSummary = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const n of generatedNodes) {
      counts[n.type] = (counts[n.type] || 0) + 1
    }
    return counts
  }, [generatedNodes])

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 80% 60% at 50% 40%, hsl(var(--primary) / 0.06) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <div className="text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-muted/50 text-xs font-medium text-muted-foreground mb-8">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  AI-Powered Project Planning
                </div>

                {/* Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-4">
                  What are you{' '}
                  <span className="text-primary">building?</span>
                </h1>

                <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
                  Describe your project and we&apos;ll generate a complete plan with goals, features, tasks, and timelines.
                </p>
              </div>

              {/* Prompt Input Card */}
              <div className="max-w-3xl mx-auto">
                <div className="relative rounded-2xl border bg-background/80 backdrop-blur-sm shadow-2xl shadow-primary/5 overflow-hidden">
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-primary/10 pointer-events-none" />

                  <div className="p-4 sm:p-6">
                    <textarea
                      ref={textareaRef}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={PLACEHOLDER_IDEAS[placeholderIdx]}
                      rows={4}
                      className="w-full bg-transparent text-base sm:text-lg resize-none focus:outline-none placeholder:text-muted-foreground/50 leading-relaxed"
                    />

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-2 flex-wrap">
                        {EXAMPLE_CHIPS.map((chip) => (
                          <button
                            key={chip}
                            onClick={() => handleChipClick(chip)}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={handleBuild}
                        disabled={!prompt.trim()}
                        className="shrink-0 ml-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
                      >
                        Build
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-center text-sm text-red-500 mt-4">{error}</p>
                )}

                <p className="text-center text-xs text-muted-foreground/60 mt-4">
                  Press <kbd className="px-1.5 py-0.5 rounded border bg-muted/50 text-[10px] font-mono">Enter</kbd> to build &middot; <kbd className="px-1.5 py-0.5 rounded border bg-muted/50 text-[10px] font-mono">Shift+Enter</kbd> for new line
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
              <LoadingState />
            </motion.div>
          )}

          {/* ─── PREVIEW PHASE ─── */}
          {(phase === 'preview' || phase === 'redirecting') && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Title */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-green-500/10 text-xs font-medium text-green-500 mb-4">
                  <CheckSquare className="h-3.5 w-3.5" />
                  Plan Generated
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                  {suggestedTitle || 'Your Project Plan'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {generatedNodes.length} nodes generated
                  {Object.entries(nodeSummary).length > 0 && (
                    <span>
                      {' — '}
                      {Object.entries(nodeSummary)
                        .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
                        .join(', ')}
                    </span>
                  )}
                </p>
              </div>

              {/* Mini Canvas */}
              <MiniCanvas nodes={generatedNodes} />

              {/* CTA */}
              <div className="text-center mt-8">
                <button
                  onClick={handleContinue}
                  disabled={phase === 'redirecting'}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 disabled:opacity-60 transition-all shadow-lg shadow-primary/25"
                >
                  {phase === 'redirecting' ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Opening project...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-5 w-5" />
                      Continue Building
                    </>
                  )}
                </button>
                <p className="text-xs text-muted-foreground mt-3">
                  Opens in the full project canvas with all nodes loaded
                </p>
              </div>

              {error && (
                <p className="text-center text-sm text-red-500 mt-4">{error}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
