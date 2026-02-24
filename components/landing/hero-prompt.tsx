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
  Zap,
  TrendingUp,
  Users,
  Calendar,
  MessageCircle,
} from 'lucide-react'
import type { AIPlanNode } from '@/types/chat'
import { track } from '@vercel/analytics'

const PLACEHOLDER_IDEAS = [
  'An online boutique for handmade jewelry and artisan accessories...',
  'A wellness app to track self-care routines and daily rituals...',
  'A portfolio site for a freelance illustrator or designer...',
  'A beauty brand landing page with skincare tips and a shop...',
  'A community platform for female entrepreneurs to connect...',
]

const EXAMPLE_CHIPS = [
  'Boutique en ligne',
  'App bien-être',
  'Portfolio créatif',
  'Beauty Brand',
  'Lifestyle Blog',
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

  const homeFeatures = features.slice(0, 3).map((f) => f.title)
  if (homeFeatures.length < 3) homeFeatures.push('Smart notifications', 'Quick actions')

  pages.push({
    name: 'Home',
    route: '/',
    ...PAGE_CONFIGS[0],
    features: homeFeatures.slice(0, 3),
    stats: [
      { label: 'Active Users', value: '2.4k' },
      { label: 'Today', value: '128' },
      { label: 'Growth', value: '+24%' },
    ],
  })

  const pageSources = sources.slice(0, 2)
  pageSources.forEach((source, i) => {
    const children = nodes.filter((n) => n.parentId === source.id)
    const featureNames = children.slice(0, 3).map((c) => c.title)
    if (featureNames.length < 2) featureNames.push('Real-time sync', 'Smart filters')

    const pageStats = i === 0
      ? [{ label: 'Users', value: '1.2k' }, { label: 'Uptime', value: '99.9%' }, { label: 'Revenue', value: '$8.4k' }]
      : [{ label: 'Posts', value: '284' }, { label: 'Members', value: '1.8k' }, { label: 'Today', value: '+42' }]

    pages.push({
      name: source.title.length > 18 ? source.title.slice(0, 16) + '...' : source.title,
      route: `/${source.title.toLowerCase().replace(/\s+/g, '-').slice(0, 12)}`,
      ...PAGE_CONFIGS[(i + 1) % PAGE_CONFIGS.length],
      features: featureNames.slice(0, 3),
      stats: pageStats,
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

// ─── Page Preview Cards ───────────────────────────────────────

const MOCK_ICONS_ROW_1 = [Heart, Star, BarChart3, Settings]
const MOCK_ICONS_ROW_2 = [Zap, TrendingUp, Users, Calendar]

// Hero layout — landing page style
function HeroContent({ page, appTitle, delay }: { page: GeneratedPage; appTitle: string; delay: number }) {
  return (
    <div className="relative flex flex-col" style={{ minHeight: 290 }}>
      {/* Background radial glow */}
      <div
        className="absolute top-0 inset-x-0 h-44 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 110% 80% at 50% -5%, ${page.accent}35, transparent 72%)`, opacity: 0.8 }}
      />

      {/* Nav bar */}
      <div className="relative flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${page.accent}25` }}>
            <page.icon className="h-3 w-3" style={{ color: page.accent }} />
          </div>
          <span className="text-[11px] font-bold tracking-tight" style={{ color: 'rgba(255,255,255,0.92)' }}>{appTitle}</span>
        </div>
        <div className="flex items-center gap-3">
          {['Features', 'Pricing', 'Docs'].map((l) => (
            <span key={l} className="text-[9px]" style={{ color: 'rgba(255,255,255,0.32)' }}>{l}</span>
          ))}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.45 }}
            className="px-2.5 py-1 rounded-lg text-[9px] font-semibold text-white"
            style={{ backgroundColor: page.accent, boxShadow: `0 2px 10px ${page.accent}50` }}
          >
            Sign up free
          </motion.div>
        </div>
      </div>

      {/* Hero */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-5 pt-5 pb-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.2 }}
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-semibold mb-3"
          style={{ backgroundColor: `${page.accent}18`, color: page.accent, border: `1px solid ${page.accent}30` }}
        >
          <Sparkles className="h-2.5 w-2.5" />
          Now in beta
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.28 }}
          className="text-[22px] font-extrabold leading-[1.1] mb-2 tracking-tight"
          style={{ color: 'rgba(255,255,255,0.95)', textShadow: `0 0 50px ${page.accent}60` }}
        >
          {appTitle}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.38 }}
          className="text-[10px] leading-relaxed mb-4 max-w-[190px]"
          style={{ color: 'rgba(255,255,255,0.42)' }}
        >
          {page.features[0] || 'The smartest way to bring your idea to life'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.47 }}
          className="flex items-center gap-2"
        >
          <div
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-semibold text-white"
            style={{ backgroundColor: page.accent, boxShadow: `0 4px 14px ${page.accent}45` }}
          >
            Get started <ArrowRight className="h-2.5 w-2.5" />
          </div>
          <div
            className="px-3.5 py-1.5 rounded-xl text-[10px]"
            style={{ color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.09)' }}
          >
            Learn more
          </div>
        </motion.div>
      </div>

      {/* Feature cards */}
      <div className="relative px-4 pb-4 grid grid-cols-3 gap-2">
        {page.features.slice(0, 3).map((feature, i) => {
          const Icon = MOCK_ICONS_ROW_1[i % MOCK_ICONS_ROW_1.length]
          return (
            <motion.div
              key={feature}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: delay + 0.55 + i * 0.08, type: 'spring', damping: 22 }}
              className="rounded-xl p-2.5"
              style={{ backgroundColor: `${page.accent}09`, border: `1px solid ${page.accent}20` }}
            >
              <Icon className="h-3 w-3 mb-1.5" style={{ color: page.accent }} />
              <div className="text-[9px] font-semibold leading-snug" style={{ color: 'rgba(255,255,255,0.75)' }}>
                {feature}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// Dashboard layout — SaaS app style
function DashboardContent({ page, appTitle, delay }: { page: GeneratedPage; appTitle: string; delay: number }) {
  const stats = page.stats?.length
    ? page.stats
    : [{ label: 'Active', value: '2.4k' }, { label: 'Growth', value: '+24%' }, { label: 'Score', value: '98' }]
  const chartHeights = [38, 60, 42, 78, 52, 88, 68, 82, 56, 92, 72, 48]
  const shortPageName = page.name.length > 11 ? page.name.slice(0, 9) + '…' : page.name

  return (
    <div className="flex" style={{ minHeight: 290 }}>
      {/* Sidebar */}
      <div className="w-[86px] flex flex-col shrink-0 pt-3" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="px-3 mb-4 flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: `${page.accent}22` }}>
            <page.icon className="h-2.5 w-2.5" style={{ color: page.accent }} />
          </div>
          <span className="text-[9px] font-bold truncate" style={{ color: 'rgba(255,255,255,0.82)' }}>{appTitle}</span>
        </div>
        <div className="px-2 space-y-0.5 flex-1">
          {['Overview', 'Analytics', shortPageName, 'Settings'].map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.2 + i * 0.06 }}
              className="px-2 py-1.5 rounded-lg text-[8px] truncate"
              style={i === 2
                ? { backgroundColor: `${page.accent}20`, color: page.accent, fontWeight: 600 }
                : { color: 'rgba(255,255,255,0.28)' }
              }
            >
              {item}
            </motion.div>
          ))}
        </div>
        {/* User avatar at bottom */}
        <div className="px-3 pb-3 mt-auto">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[7px] font-bold text-white" style={{ backgroundColor: `${page.accent}60` }}>
            AR
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-3 flex flex-col gap-2 overflow-hidden">
        {/* Header row */}
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] font-bold" style={{ color: 'rgba(255,255,255,0.85)' }}>{shortPageName}</span>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px]" style={{ backgroundColor: `${page.accent}15`, color: page.accent }}>
            <span className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: page.accent }} />
            Live
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-1.5">
          {stats.slice(0, 3).map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: delay + 0.28 + i * 0.07 }}
              className="rounded-xl p-2"
              style={{ backgroundColor: `${page.accent}09`, border: `1px solid ${page.accent}18` }}
            >
              <div className="text-[14px] font-extrabold leading-tight" style={{ color: page.accent }}>{stat.value}</div>
              <div className="text-[7px] uppercase tracking-wider mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.4 }}
          className="rounded-xl p-2.5"
          style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>Activity</span>
            <div className="flex gap-0.5">
              {['1W', '1M', '3M'].map((t, i) => (
                <span
                  key={t}
                  className="text-[7px] px-1.5 py-0.5 rounded"
                  style={i === 0
                    ? { backgroundColor: `${page.accent}22`, color: page.accent }
                    : { color: 'rgba(255,255,255,0.18)' }
                  }
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-[2px] h-10">
            {chartHeights.map((h, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-sm"
                style={{ backgroundColor: i >= 10 ? page.accent : `${page.accent}32` }}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: delay + 0.44 + i * 0.025, duration: 0.35, type: 'spring' }}
              />
            ))}
          </div>
        </motion.div>

        {/* Item rows */}
        <div className="space-y-1.5">
          {page.features.slice(0, 3).map((feature, i) => {
            const Icon = MOCK_ICONS_ROW_2[i % MOCK_ICONS_ROW_2.length]
            return (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.54 + i * 0.07 }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                style={{ backgroundColor: 'rgba(255,255,255,0.025)' }}
              >
                <Icon className="h-2.5 w-2.5 shrink-0" style={{ color: page.accent }} />
                <span className="text-[9px] flex-1 truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>{feature}</span>
                <span
                  className="text-[7px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: `${page.accent}18`, color: page.accent }}
                >
                  Active
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Feed layout — social/content app style
function FeedContent({ page, appTitle, delay }: { page: GeneratedPage; appTitle: string; delay: number }) {
  const posts = [
    { initials: 'AR', name: 'Alex R.', time: '2m', content: page.features[0] || 'Just shipped something exciting', likes: 24, replies: 8 },
    { initials: 'MK', name: 'Maya K.', time: '14m', content: page.features[1] || 'Working on a new feature', likes: 17, replies: 4 },
    { initials: 'JL', name: 'Jake L.', time: '1h', content: page.features[2] || 'The results are incredible', likes: 41, replies: 11 },
  ]

  return (
    <div className="flex flex-col" style={{ minHeight: 290 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-[12px] font-bold tracking-tight" style={{ color: 'rgba(255,255,255,0.9)' }}>{page.name}</span>
        <div className="flex items-center gap-2">
          <Search className="h-3 w-3" style={{ color: 'rgba(255,255,255,0.25)' }} />
          <Bell className="h-3 w-3" style={{ color: 'rgba(255,255,255,0.25)' }} />
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold text-white" style={{ backgroundColor: page.accent }}>
            AR
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-0.5 px-3 py-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {['All', 'Popular', 'New'].map((tab, i) => (
          <span
            key={tab}
            className="px-2.5 py-1 rounded-full text-[9px] font-medium"
            style={i === 0
              ? { backgroundColor: `${page.accent}18`, color: page.accent }
              : { color: 'rgba(255,255,255,0.27)' }
            }
          >
            {tab}
          </span>
        ))}
      </div>

      {/* Feed posts */}
      <div className="flex-1 px-3 py-2.5 space-y-2 overflow-hidden">
        {posts.map((post, i) => (
          <motion.div
            key={post.initials + i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.28 + i * 0.12, type: 'spring', damping: 22 }}
            className="rounded-xl p-2.5"
            style={{ backgroundColor: 'rgba(255,255,255,0.028)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="flex items-start gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[7px] font-bold text-white shrink-0"
                style={{ backgroundColor: i === 0 ? page.accent : i === 1 ? `${page.accent}bb` : `${page.accent}80` }}
              >
                {post.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[9px] font-semibold" style={{ color: 'rgba(255,255,255,0.82)' }}>{post.name}</span>
                  <span className="text-[7px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{post.time} ago</span>
                </div>
                <p className="text-[9px] leading-relaxed truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{post.content}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[8px] flex items-center gap-1" style={{ color: `${page.accent}95` }}>
                    <Heart className="h-2 w-2" /> {post.likes}
                  </span>
                  <span className="text-[8px] flex items-center gap-1" style={{ color: `${page.accent}95` }}>
                    <MessageCircle className="h-2 w-2" /> {post.replies}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function PagePreviewCard({ page, delay, appTitle }: { page: GeneratedPage; delay: number; appTitle: string }) {
  const shortTitle = appTitle.length > 14 ? appTitle.slice(0, 12) + '…' : appTitle
  const urlSlug = appTitle.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16)

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.91 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.65, delay, type: 'spring', damping: 18 }}
      className="group relative rounded-2xl overflow-hidden"
    >
      {/* Outer accent border/glow */}
      <div
        className="absolute -inset-[1px] rounded-2xl opacity-55 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(145deg, ${page.accent}55, transparent 55%, ${page.accent}22)` }}
      />

      {/* Card body */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #10101a 0%, #0c0c12 100%)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Browser chrome */}
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.018)' }}
        >
          <div className="flex gap-1.5 shrink-0">
            <div className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: '#ff5f57' }} />
            <div className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: '#febc2e' }} />
            <div className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: '#28c840' }} />
          </div>
          <div
            className="flex-1 flex items-center gap-1.5 px-2.5 py-1 rounded-md mx-1"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <Globe className="h-2.5 w-2.5 shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }} />
            <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.28)' }}>
              {urlSlug}.app{page.route}
            </span>
          </div>
        </div>

        {/* Page content */}
        {page.layout === 'hero' && <HeroContent page={page} appTitle={shortTitle} delay={delay} />}
        {page.layout === 'dashboard' && <DashboardContent page={page} appTitle={shortTitle} delay={delay} />}
        {page.layout === 'feed' && <FeedContent page={page} appTitle={shortTitle} delay={delay} />}
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
  const [emailSubmitting, setEmailSubmitting] = useState(false)
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
      // Silently succeed - don't block UX on network errors
    } finally {
      track('waitlist_signup', { source: 'hero_prompt' })
      setEmailSubmitting(false)
      setEmailSubmitted(true)
    }
  }

  const appTitle = suggestedTitle || 'Your App'

  return (
    <section id="hero-prompt" className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
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
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-4">
                  What are you{' '}
                  <span className="text-primary">building?</span>
                </h1>

                <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
                  Describe your project and we&apos;ll generate it.
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
                        disabled={emailSubmitting}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary/20"
                      >
                        {emailSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                        {emailSubmitting ? 'Joining...' : 'Get Started Free'}
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
