'use client'

import { useState, useRef, useEffect } from 'react'
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
  Search,
  Bell,
  User,
  Heart,
  Star,
  BarChart3,
  Settings,
  ChevronRight,
  Play,
  Image as ImageIcon,
  Zap,
  TrendingUp,
  Users,
  Calendar,
  MessageCircle,
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
  accent: string
  accentRgb: string
  gradient: string
  features: string[]
  stats?: { label: string; value: string }[]
  layout: 'hero' | 'dashboard' | 'feed'
}

const PAGE_CONFIGS: {
  icon: typeof Globe
  accent: string
  accentRgb: string
  gradient: string
  layout: 'hero' | 'dashboard' | 'feed'
}[] = [
  { icon: Globe, accent: '#f97316', accentRgb: '249,115,22', gradient: 'from-orange-500/20 via-amber-500/10 to-transparent', layout: 'hero' },
  { icon: Layout, accent: '#3b82f6', accentRgb: '59,130,246', gradient: 'from-blue-500/20 via-indigo-500/10 to-transparent', layout: 'dashboard' },
  { icon: Layers, accent: '#8b5cf6', accentRgb: '139,92,246', gradient: 'from-violet-500/20 via-purple-500/10 to-transparent', layout: 'feed' },
]

function derivePages(nodes: AIPlanNode[], title: string): GeneratedPage[] {
  const subgoals = nodes.filter((n) => n.type === 'subgoal')
  const features = nodes.filter((n) => n.type === 'feature')
  const sources = subgoals.length >= 2 ? subgoals : features
  const pages: GeneratedPage[] = []

  const goalNode = nodes.find((n) => n.type === 'goal')
  const homeFeatures = features.slice(0, 3).map((f) => f.title)
  if (homeFeatures.length < 3) homeFeatures.push('Smart notifications', 'Quick actions')

  pages.push({
    name: 'Home',
    route: '/',
    ...PAGE_CONFIGS[0],
    features: homeFeatures.slice(0, 3),
    stats: [
      { label: 'Active', value: '2.4k' },
      { label: 'Today', value: '128' },
      { label: 'Growth', value: '+24%' },
    ],
  })

  const pageSources = sources.slice(0, 2)
  pageSources.forEach((source, i) => {
    const children = nodes.filter((n) => n.parentId === source.id)
    const featureNames = children.slice(0, 3).map((c) => c.title)
    if (featureNames.length < 2) featureNames.push('Real-time sync', 'Smart filters')

    pages.push({
      name: source.title.length > 18 ? source.title.slice(0, 16) + '...' : source.title,
      route: `/${source.title.toLowerCase().replace(/\s+/g, '-').slice(0, 12)}`,
      ...PAGE_CONFIGS[(i + 1) % PAGE_CONFIGS.length],
      features: featureNames.slice(0, 3),
      stats: [
        { label: 'Items', value: `${Math.floor(Math.random() * 50) + 12}` },
        { label: 'Updated', value: 'Now' },
      ],
    })
  })

  return pages
}

// ─── Loading Animation ───────────────────────────────────────

const LOADING_STEPS = [
  'Analyzing your idea...',
  'Designing your pages...',
  'Building components...',
  'Polishing the UI...',
]

function LoadingState() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => Math.min(prev + 1, LOADING_STEPS.length - 1))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-8">
      <div className="relative">
        <motion.div
          className="absolute inset-0 rounded-3xl"
          style={{ background: 'conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--primary) / 0.2), hsl(var(--primary)))' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        <div className="relative w-20 h-20 rounded-3xl bg-background flex items-center justify-center m-[3px]">
          <Sparkles className="h-9 w-9 text-primary" />
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
            className="text-base font-semibold text-foreground"
          >
            {LOADING_STEPS[step]}
          </motion.p>
        </AnimatePresence>
        <p className="text-xs text-muted-foreground mt-2">Generating your frontend...</p>
      </div>
      <div className="w-72 h-1.5 rounded-full bg-muted/50 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.6))' }}
          initial={{ width: '0%' }}
          animate={{ width: '85%' }}
          transition={{ duration: 10, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

// ─── Premium Page Preview Card ───────────────────────────────

const MOCK_ICONS_ROW_1 = [Heart, Star, BarChart3, Settings]
const MOCK_ICONS_ROW_2 = [Zap, TrendingUp, Users, Calendar]

function PagePreviewCard({ page, delay, appTitle }: { page: GeneratedPage; delay: number; appTitle: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.92, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      transition={{ duration: 0.6, delay, type: 'spring', damping: 20 }}
      className="group relative rounded-2xl overflow-hidden"
      style={{ perspective: '1000px' }}
    >
      {/* Outer glow */}
      <div
        className="absolute -inset-[1px] rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(135deg, ${page.accent}40, transparent 50%, ${page.accent}20)` }}
      />

      {/* Card body */}
      <div className="relative rounded-2xl border border-white/[0.08] bg-[#0c0c0f] overflow-hidden">
        {/* Browser chrome — ultra minimal */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex gap-1.5">
            <div className="w-[7px] h-[7px] rounded-full bg-[#ff5f57]" />
            <div className="w-[7px] h-[7px] rounded-full bg-[#febc2e]" />
            <div className="w-[7px] h-[7px] rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] ml-2">
            <Globe className="h-2.5 w-2.5 shrink-0 text-white/30" />
            <span className="text-[10px] font-mono text-white/40 tracking-wide">{appTitle.toLowerCase().replace(/\s+/g, '')}.app{page.route}</span>
          </div>
        </div>

        {/* Page content — dark premium UI */}
        <div className="relative min-h-[260px]">
          {/* Background gradient glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-32 opacity-30 blur-3xl pointer-events-none"
            style={{ background: `radial-gradient(ellipse, ${page.accent}, transparent 70%)` }}
          />

          {/* Top nav */}
          <div className="relative flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: `${page.accent}25` }}>
                <page.icon className="h-3 w-3" style={{ color: page.accent }} />
              </div>
              <span className="text-[11px] font-bold text-white/90 tracking-tight">{page.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-3 w-3 text-white/25" />
              <Bell className="h-3 w-3 text-white/25" />
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/10" />
            </div>
          </div>

          {page.layout === 'hero' && (
            <div className="px-4 pb-4">
              {/* Hero section */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: delay + 0.3 }}
                className="rounded-xl p-4 mb-3 relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${page.accent}18, ${page.accent}08)`, border: `1px solid ${page.accent}15` }}
              >
                <div className="flex items-center gap-1 mb-2">
                  <Sparkles className="h-3 w-3" style={{ color: page.accent }} />
                  <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: page.accent }}>Welcome</span>
                </div>
                <div className="h-2 w-3/4 rounded-full bg-white/15 mb-1.5" />
                <div className="h-2 w-1/2 rounded-full bg-white/8" />
                <motion.div
                  className="mt-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-semibold text-white"
                  style={{ backgroundColor: page.accent }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: delay + 0.5 }}
                >
                  Get Started <ChevronRight className="h-2.5 w-2.5" />
                </motion.div>
              </motion.div>

              {/* Stats row */}
              {page.stats && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {page.stats.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: delay + 0.4 + i * 0.08 }}
                      className="rounded-lg bg-white/[0.04] border border-white/[0.06] p-2 text-center"
                    >
                      <div className="text-[11px] font-bold text-white/90">{stat.value}</div>
                      <div className="text-[8px] text-white/35 uppercase tracking-wider">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Feature cards */}
              <div className="space-y-1.5">
                {page.features.map((feature, i) => {
                  const Icon = MOCK_ICONS_ROW_1[i % MOCK_ICONS_ROW_1.length]
                  return (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: delay + 0.5 + i * 0.1, type: 'spring', damping: 20 }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05] group/item hover:bg-white/[0.06] transition-colors"
                    >
                      <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: `${page.accent}15` }}>
                        <Icon className="h-3 w-3" style={{ color: page.accent }} />
                      </div>
                      <span className="text-[10px] text-white/70 font-medium flex-1 truncate">{feature}</span>
                      <ChevronRight className="h-2.5 w-2.5 text-white/15" />
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {page.layout === 'dashboard' && (
            <div className="px-4 pb-4">
              {/* Mini chart area */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: delay + 0.3 }}
                className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 mb-3"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="h-3 w-3" style={{ color: page.accent }} />
                    <span className="text-[9px] font-semibold text-white/60 uppercase tracking-wider">Overview</span>
                  </div>
                  <div className="flex gap-1">
                    {['1D', '1W', '1M'].map((t) => (
                      <span key={t} className="text-[8px] px-1.5 py-0.5 rounded text-white/30 bg-white/[0.04]">{t}</span>
                    ))}
                  </div>
                </div>
                {/* Fake chart bars */}
                <div className="flex items-end gap-1 h-12">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 50].map((h, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{ backgroundColor: i === 9 ? page.accent : `${page.accent}30` }}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: delay + 0.4 + i * 0.03, duration: 0.4, type: 'spring' }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Stats + features */}
              {page.stats && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {page.stats.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: delay + 0.5 + i * 0.08 }}
                      className="rounded-lg bg-white/[0.04] border border-white/[0.06] p-2.5"
                    >
                      <div className="text-[12px] font-bold text-white/90">{stat.value}</div>
                      <div className="text-[8px] text-white/35 uppercase tracking-wider">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="space-y-1.5">
                {page.features.map((feature, i) => {
                  const Icon = MOCK_ICONS_ROW_2[i % MOCK_ICONS_ROW_2.length]
                  return (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: delay + 0.6 + i * 0.1, type: 'spring', damping: 20 }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05]"
                    >
                      <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: `${page.accent}15` }}>
                        <Icon className="h-3 w-3" style={{ color: page.accent }} />
                      </div>
                      <span className="text-[10px] text-white/70 font-medium flex-1 truncate">{feature}</span>
                      <div className="w-8 h-1 rounded-full" style={{ backgroundColor: `${page.accent}30` }} />
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {page.layout === 'feed' && (
            <div className="px-4 pb-4">
              {/* Tab bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.25 }}
                className="flex gap-1 mb-3"
              >
                {['All', 'Popular', 'New'].map((tab, i) => (
                  <span
                    key={tab}
                    className="text-[9px] px-2.5 py-1 rounded-full font-medium"
                    style={i === 0 ? { backgroundColor: `${page.accent}20`, color: page.accent } : { color: 'rgba(255,255,255,0.3)' }}
                  >
                    {tab}
                  </span>
                ))}
              </motion.div>

              {/* Feed cards */}
              {page.features.map((feature, i) => {
                const Icon = MOCK_ICONS_ROW_1[i % MOCK_ICONS_ROW_1.length]
                return (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: delay + 0.35 + i * 0.12, type: 'spring', damping: 20 }}
                    className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 mb-2"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${page.accent}25, ${page.accent}10)` }}>
                        <Icon className="h-3.5 w-3.5" style={{ color: page.accent }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-semibold text-white/80 mb-1 truncate">{feature}</div>
                        <div className="flex gap-3">
                          <div className="h-1.5 w-full rounded-full bg-white/[0.06]" />
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1">
                            <Heart className="h-2.5 w-2.5 text-white/20" />
                            <span className="text-[8px] text-white/25">{Math.floor(Math.random() * 40) + 5}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-2.5 w-2.5 text-white/20" />
                            <span className="text-[8px] text-white/25">{Math.floor(Math.random() * 15) + 2}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Bottom nav bar */}
          <div className="px-4 pb-3">
            <div className="flex items-center justify-around py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              {[Globe, Layout, Zap, User].map((Icon, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: delay + 0.7 + i * 0.05 }}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color: i === 0 ? page.accent : 'rgba(255,255,255,0.2)' }} />
                </motion.div>
              ))}
            </div>
          </div>
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

  const appTitle = suggestedTitle || 'Your App'

  return (
    <section id="hero-prompt" className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
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

      <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-10"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-500/20 bg-green-500/10 text-xs font-medium text-green-400 mb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                  </motion.div>
                  {generatedPages.length} Pages Generated
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight">
                  {appTitle}
                </h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Here&apos;s a preview of your app. Click continue to get the full project with code, canvas, and AI tools.
                </p>
              </motion.div>

              {/* Page preview grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-5xl mx-auto mb-10">
                {generatedPages.map((page, i) => (
                  <PagePreviewCard key={page.name} page={page} delay={0.15 + i * 0.18} appTitle={appTitle} />
                ))}
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="text-center"
              >
                <button
                  onClick={() => setPhase('email')}
                  className="group relative inline-flex items-center gap-2.5 px-10 py-4 rounded-2xl bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Continue Building</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <p className="text-xs text-muted-foreground mt-4">
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
                      Check your inbox at <span className="font-medium text-foreground">{emailValue}</span> to access your full project for <span className="font-medium text-foreground">{appTitle}</span>.
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
