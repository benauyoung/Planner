'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Sparkles,
  Loader2,
  Globe,
  Layers,
  Shield,
  Layout,
  Mail,
  Check,
  X,
} from 'lucide-react'
import type { AIPlanNode } from '@/types/chat'

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

type Phase = 'input' | 'loading' | 'preview' | 'email'

// ─── Page preview generation from plan nodes ─────────────────

interface GeneratedPage {
  name: string
  route: string
  icon: typeof Globe
  color: string
  sections: string[]
}

const PAGE_ICONS = [Globe, Layout, Layers, Shield]
const PAGE_COLORS = ['#f97316', '#3b82f6', '#22c55e', '#8b5cf6']

function derivePages(nodes: AIPlanNode[], title: string): GeneratedPage[] {
  // Find subgoals or top-level features to create pages from
  const subgoals = nodes.filter((n) => n.type === 'subgoal')
  const features = nodes.filter((n) => n.type === 'feature')

  // Build pages from subgoals (or features if no subgoals)
  const sources = subgoals.length >= 2 ? subgoals : features
  const pages: GeneratedPage[] = []

  // Always add a Home page
  const goalNode = nodes.find((n) => n.type === 'goal')
  pages.push({
    name: 'Home',
    route: '/',
    icon: Globe,
    color: PAGE_COLORS[0],
    sections: [
      `Hero: ${title || goalNode?.title || 'Welcome'}`,
      'Navigation bar',
      'Feature highlights',
      'Call to action',
    ],
  })

  // Add 2 pages from the plan
  const pageSources = sources.slice(0, 2)
  pageSources.forEach((source, i) => {
    const children = nodes.filter((n) => n.parentId === source.id)
    const sectionNames = children.slice(0, 3).map((c) => c.title)
    if (sectionNames.length < 2) sectionNames.push('Loading state', 'Empty state')

    pages.push({
      name: source.title.length > 16 ? source.title.slice(0, 14) + '...' : source.title,
      route: `/${source.title.toLowerCase().replace(/\s+/g, '-').slice(0, 12)}`,
      icon: PAGE_ICONS[(i + 1) % PAGE_ICONS.length],
      color: PAGE_COLORS[(i + 1) % PAGE_COLORS.length],
      sections: sectionNames,
    })
  })

  return pages
}

// ─── Loading Animation ───────────────────────────────────────

const LOADING_STEPS = [
  'Analyzing your idea...',
  'Designing your pages...',
  'Building the frontend...',
]

function LoadingState() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => Math.min(prev + 1, LOADING_STEPS.length - 1))
    }, 2200)
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

// ─── Page Preview Card ───────────────────────────────────────

function PagePreviewCard({ page, delay }: { page: GeneratedPage; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-xl border bg-background/80 backdrop-blur-sm overflow-hidden shadow-lg"
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b bg-muted/30">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-400/60" />
          <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
          <div className="w-2 h-2 rounded-full bg-green-400/60" />
        </div>
        <div className="flex-1 flex items-center gap-1.5 px-2 py-0.5 rounded bg-background/80 text-[10px] font-mono text-muted-foreground ml-2">
          <Globe className="h-2.5 w-2.5 shrink-0 text-green-500" />
          yourapp.com{page.route}
        </div>
      </div>

      {/* Page content mockup */}
      <div className="p-4">
        {/* Nav bar */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/30">
          <div className="flex items-center gap-1.5">
            <page.icon className="h-3.5 w-3.5" style={{ color: page.color }} />
            <span className="text-xs font-semibold">{page.name}</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-8 h-1.5 rounded-full bg-muted/60" />
            <div className="w-8 h-1.5 rounded-full bg-muted/60" />
            <div className="w-8 h-1.5 rounded-full bg-muted/60" />
          </div>
        </div>

        {/* Hero block */}
        <div
          className="rounded-lg h-16 mb-3 flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${page.color}20, ${page.color}08)` }}
        >
          <span className="text-[10px] font-medium" style={{ color: page.color }}>{page.name}</span>
        </div>

        {/* Content sections */}
        <div className="space-y-2">
          {page.sections.map((section, i) => (
            <motion.div
              key={section}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.3 + i * 0.1 }}
              className="flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: page.color }} />
              <span className="text-[11px] text-muted-foreground">{section}</span>
            </motion.div>
          ))}
        </div>

        {/* Bottom skeleton */}
        <div className="mt-3 pt-2 border-t border-border/30 flex gap-2">
          <div className="h-2 rounded-full bg-muted/40 flex-1" />
          <div className="h-2 rounded-full bg-muted/40 w-1/4" />
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Component ──────────────────────────────────────────

export function HeroPrompt() {
  const [phase, setPhase] = useState<Phase>('input')
  const [prompt, setPrompt] = useState('')
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [generatedPages, setGeneratedPages] = useState<GeneratedPage[]>([])
  const [suggestedTitle, setSuggestedTitle] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [emailValue, setEmailValue] = useState('')
  const [emailSubmitted, setEmailSubmitted] = useState(false)
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

      const nodes: AIPlanNode[] = data.nodes || []
      const title = data.suggestedTitle || null

      // Derive frontend page previews from the plan
      const pages = derivePages(nodes, title || prompt.trim())
      setGeneratedPages(pages)
      setSuggestedTitle(title)
      setPhase('preview')
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
    setPrompt(`Build a ${chip.toLowerCase()} with user authentication, a dashboard, and core CRUD functionality.`)
    textareaRef.current?.focus()
  }

  function handleEmailSubmit() {
    if (emailValue.includes('@') && emailValue.includes('.')) {
      setEmailSubmitted(true)
    }
  }

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
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-muted/50 text-xs font-medium text-muted-foreground mb-8">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  AI-Powered Project Planning
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-4">
                  What are you{' '}
                  <span className="text-primary">building?</span>
                </h1>

                <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
                  Describe your project and we&apos;ll generate a complete frontend preview in seconds.
                </p>
              </div>

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
          {phase === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-green-500/10 text-xs font-medium text-green-500 mb-4">
                  <Sparkles className="h-3.5 w-3.5" />
                  Frontend Generated
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                  {suggestedTitle || 'Your App'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {generatedPages.length} pages generated from your idea
                </p>
              </div>

              {/* Page preview grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {generatedPages.map((page, i) => (
                  <PagePreviewCard key={page.name} page={page} delay={i * 0.15} />
                ))}
              </div>

              {/* CTA to continue */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-center mt-8"
              >
                <button
                  onClick={() => setPhase('email')}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
                >
                  Continue Building
                  <ArrowRight className="h-5 w-5" />
                </button>
                <p className="text-xs text-muted-foreground mt-3">
                  Get the full project plan, canvas, and more
                </p>
              </motion.div>

              {error && (
                <p className="text-center text-sm text-red-500 mt-4">{error}</p>
              )}
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
                  <div className="rounded-2xl border bg-background/80 backdrop-blur-sm shadow-2xl shadow-primary/5 p-8 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                      <Sparkles className="h-7 w-7 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Almost there!</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      Enter your email to access the full project canvas with your {generatedPages.length} pages, plan nodes, and AI tools.
                    </p>

                    <div className="space-y-3">
                      <input
                        type="email"
                        placeholder="you@email.com"
                        value={emailValue}
                        onChange={(e) => setEmailValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleEmailSubmit() }}
                        className="w-full px-4 py-3 rounded-xl border bg-muted/20 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        autoFocus
                      />
                      <button
                        onClick={handleEmailSubmit}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                      >
                        <Mail className="h-4 w-4" />
                        Get Started Free
                      </button>
                    </div>

                    <p className="text-[10px] text-muted-foreground mt-4">No credit card required &middot; Free forever</p>

                    <button
                      onClick={() => setPhase('preview')}
                      className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      &larr; Back to preview
                    </button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl border bg-background/80 backdrop-blur-sm shadow-2xl shadow-primary/5 p-8 text-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-5">
                      <Check className="h-7 w-7 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">You&apos;re in!</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      Check your inbox at <span className="font-medium text-foreground">{emailValue}</span> to access your full project for <span className="font-medium text-foreground">{suggestedTitle || 'your app'}</span>.
                    </p>
                    <button
                      onClick={() => {
                        setPhase('input')
                        setPrompt('')
                        setEmailValue('')
                        setEmailSubmitted(false)
                        setGeneratedPages([])
                      }}
                      className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      Build another project &rarr;
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
