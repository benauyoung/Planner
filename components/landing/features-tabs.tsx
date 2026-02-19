'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Workflow,
  FileText,
  ArrowRight,
  Shield,
  Globe,
  Layers,
  Pencil,
  MessageSquare,
  Bot,
  Send,
  Plug,
  GitBranch,
  Check,
  Database,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// ─── Types ───────────────────────────────────────────────────

type FeatureTab = 'planning' | 'design' | 'agents' | 'integrations'

const TABS: { key: FeatureTab; label: string; icon: typeof Workflow; description: string }[] = [
  {
    key: 'planning',
    label: 'Planning',
    icon: Workflow,
    description: 'Visual project planning with an interactive canvas. Break down goals into features and tasks.',
  },
  {
    key: 'design',
    label: 'Design',
    icon: FileText,
    description: 'Design and preview your application pages. Edit content and layout visually.',
  },
  {
    key: 'agents',
    label: 'Agents',
    icon: Bot,
    description: 'Create, teach, and deploy an AI chatbot to your website in seconds.',
  },
  {
    key: 'integrations',
    label: 'Integrations',
    icon: Plug,
    description: 'Connect your favorite tools in one click. Supabase, GitHub, and more.',
  },
]

// ─── Planning Demo ──────────────────────────────────────────

const PLAN_NODES = [
  { id: 'g1', type: 'goal', title: 'Festival App', x: 30, y: 70, w: 130, color: 'hsl(var(--node-goal))', step: 0 },
  { id: 's1', type: 'subgoal', title: 'Live Lineup', x: 195, y: 15, w: 120, color: 'hsl(var(--node-subgoal))', step: 1 },
  { id: 's2', type: 'subgoal', title: 'Social Feed', x: 195, y: 125, w: 120, color: 'hsl(var(--node-subgoal))', step: 1 },
  { id: 'f1', type: 'feature', title: 'Set Reminders', x: 345, y: 5, w: 115, color: 'hsl(var(--node-feature))', step: 2 },
  { id: 'f2', type: 'feature', title: 'Stage Map', x: 345, y: 55, w: 115, color: 'hsl(var(--node-feature))', step: 2 },
  { id: 'f3', type: 'feature', title: 'Photo Wall', x: 345, y: 105, w: 115, color: 'hsl(var(--node-feature))', step: 3 },
  { id: 't1', type: 'task', title: 'Friend Meetups', x: 345, y: 155, w: 115, color: 'hsl(var(--node-task))', step: 3 },
  { id: 't2', type: 'task', title: 'Live Chat', x: 345, y: 205, w: 115, color: 'hsl(var(--node-task))', step: 4 },
]

const PLAN_EDGES = [
  { from: 'g1', to: 's1', step: 1 },
  { from: 'g1', to: 's2', step: 1 },
  { from: 's1', to: 'f1', step: 2 },
  { from: 's1', to: 'f2', step: 2 },
  { from: 's2', to: 'f3', step: 3 },
  { from: 's2', to: 't1', step: 3 },
  { from: 'f3', to: 't2', step: 4 },
]

const STATUS_COLORS: Record<string, string> = {
  goal: '#f97316',
  subgoal: '#3b82f6',
  feature: '#22c55e',
  task: '#8b5cf6',
}

interface ChatMsg {
  role: 'ai' | 'user'
  text: string
  step: number // which build step this message triggers
}

const PLANNING_CHAT: ChatMsg[] = [
  { role: 'user', text: 'I want to build a music festival app', step: 0 },
  { role: 'ai', text: 'Great idea! I\'ll create a Festival App plan. What are the main areas — lineup, social, or both?', step: 0 },
  { role: 'user', text: 'Both! Live lineup schedules and a social feed for attendees', step: 1 },
  { role: 'ai', text: 'Adding Live Lineup and Social Feed as core pillars. Should users set reminders for sets?', step: 1 },
  { role: 'user', text: 'Yes, and an interactive stage map too', step: 2 },
  { role: 'ai', text: 'Done — Set Reminders and Stage Map added. Want a photo sharing feature for the social feed?', step: 2 },
  { role: 'user', text: 'Definitely, plus friend meetup coordination', step: 3 },
  { role: 'ai', text: 'Added Photo Wall and Friend Meetups. I\'ll also add a Live Chat for real-time messaging.', step: 4 },
]

function PlanningDemo() {
  const nodeMap = Object.fromEntries(PLAN_NODES.map((n) => [n.id, n]))
  const [visibleStep, setVisibleStep] = useState(-1)
  const [visibleMsgs, setVisibleMsgs] = useState(0)

  // Auto-play the chat sequence
  useEffect(() => {
    let msgIndex = 0
    const timers: ReturnType<typeof setTimeout>[] = []

    function showNext() {
      if (msgIndex >= PLANNING_CHAT.length) return
      msgIndex++
      setVisibleMsgs(msgIndex)

      const msg = PLANNING_CHAT[msgIndex - 1]
      // When an AI message appears, update the visible build step
      if (msg.role === 'ai') {
        timers.push(setTimeout(() => {
          setVisibleStep(msg.step)
        }, 200))
      }

      // Schedule next message
      const delay = msg.role === 'user' ? 900 : 1100
      timers.push(setTimeout(showNext, delay))
    }

    // Start after a brief delay
    timers.push(setTimeout(showNext, 400))

    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="relative w-full aspect-[16/9] rounded-xl border bg-background/60 overflow-hidden flex">
      {/* Canvas area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Dot grid background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--muted-foreground) / 0.3) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Toolbar */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          {['goal', 'subgoal', 'feature', 'task'].map((type) => (
            <div
              key={type}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/80 backdrop-blur-sm text-[9px] font-medium text-muted-foreground border"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[type] }} />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </div>
          ))}
        </div>

        <svg viewBox="0 0 480 250" className="relative w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Edges */}
          {PLAN_EDGES.map((edge) => {
            const from = nodeMap[edge.from]
            const to = nodeMap[edge.to]
            const sx = from.x + from.w
            const sy = from.y + 18
            const ex = to.x
            const ey = to.y + 18
            const mx = (sx + ex) / 2
            return (
              <motion.path
                key={`${edge.from}-${edge.to}`}
                d={`M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ey}, ${ex} ${ey}`}
                fill="none"
                stroke="hsl(var(--muted-foreground) / 0.25)"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={visibleStep >= edge.step ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            )
          })}

          {/* Nodes */}
          {PLAN_NODES.map((node) => (
            <motion.g
              key={node.id}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={visibleStep >= node.step ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.35, type: 'spring', stiffness: 200 }}
            >
              <rect
                x={node.x}
                y={node.y}
                width={node.w}
                height={36}
                rx={8}
                fill="hsl(var(--background))"
                stroke={node.color}
                strokeWidth={1.5}
              />
              <circle cx={node.x + 12} cy={node.y + 18} r={3.5} fill={node.color} />
              <text
                x={node.x + 22}
                y={node.y + 15}
                fill="hsl(var(--foreground))"
                fontSize="9"
                fontWeight="600"
                fontFamily="system-ui, sans-serif"
              >
                {node.title}
              </text>
              <text
                x={node.x + 22}
                y={node.y + 26}
                fill="hsl(var(--muted-foreground))"
                fontSize="7"
                fontFamily="system-ui, sans-serif"
              >
                {node.type}
              </text>
            </motion.g>
          ))}
        </svg>
      </div>

      {/* AI Chat sidebar */}
      <div className="w-52 border-l bg-muted/10 flex flex-col shrink-0">
        <div className="px-3 py-2 border-b flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-semibold">AI Planner</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          <AnimatePresence>
            {PLANNING_CHAT.slice(0, visibleMsgs).map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                className={cn(
                  'flex gap-1.5',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.role === 'ai' && (
                  <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-2.5 w-2.5 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    'rounded-lg px-2 py-1 text-[8px] leading-relaxed max-w-[140px]',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/60 text-foreground'
                  )}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {/* Typing indicator */}
          {visibleMsgs < PLANNING_CHAT.length && visibleMsgs > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-1.5 items-center"
            >
              <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Bot className="h-2.5 w-2.5 text-primary" />
              </div>
              <div className="flex gap-0.5 px-2 py-1.5">
                {[0, 1, 2].map((d) => (
                  <motion.div
                    key={d}
                    className="w-1 h-1 rounded-full bg-muted-foreground/40"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: d * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>
        {/* Input mock */}
        <div className="px-2 py-2 border-t">
          <div className="flex items-center gap-1 rounded-md border bg-muted/20 px-2 py-1">
            <span className="flex-1 text-[8px] text-muted-foreground/50">Ask the AI planner...</span>
            <Send className="h-2.5 w-2.5 text-muted-foreground/30" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Pages Demo ─────────────────────────────────────────────

// Helper: convert hsl(h, s%, l%) to hsl(h s% l% / alpha) for transparent variants
function accentAlpha(hsl: string, alpha: number): string {
  const m = hsl.match(/hsl\((\d+),?\s*(\d+)%,?\s*(\d+)%\)/)
  if (!m) return hsl
  return `hsl(${m[1]} ${m[2]}% ${m[3]}% / ${alpha})`
}

interface MiniPage {
  id: string
  name: string
  route: string
  status: 'Live' | 'Draft'
  icon: typeof Globe
  accent: string
}

const MINI_PAGES: MiniPage[] = [
  { id: 'home', name: 'Home', route: '/', status: 'Live', icon: Globe, accent: 'hsl(280, 80%, 60%)' },
  { id: 'lineup', name: 'Lineup', route: '/lineup', status: 'Live', icon: Layers, accent: 'hsl(340, 75%, 55%)' },
  { id: 'map', name: 'Map', route: '/map', status: 'Live', icon: Globe, accent: 'hsl(142, 71%, 45%)' },
  { id: 'tickets', name: 'Tickets', route: '/tickets', status: 'Live', icon: FileText, accent: 'hsl(25, 95%, 53%)' },
  { id: 'profile', name: 'Profile', route: '/profile', status: 'Draft', icon: Shield, accent: 'hsl(217, 91%, 60%)' },
  { id: 'feed', name: 'Feed', route: '/feed', status: 'Draft', icon: Layers, accent: 'hsl(200, 80%, 55%)' },
]

// Dashed connection lines between pages (simulating page flow / navigation)
const PAGE_CONNECTIONS = [
  { from: 'home', to: 'lineup' },
  { from: 'home', to: 'map' },
  { from: 'home', to: 'tickets' },
  { from: 'lineup', to: 'profile' },
  { from: 'lineup', to: 'feed' },
]

function MiniWebpage({ page, isSelected, isEditing, onClick, delay, accentOverride, showLineupImage }: {
  page: MiniPage
  isSelected: boolean
  isEditing: boolean
  onClick: () => void
  delay: number
  accentOverride?: string | null
  showLineupImage?: boolean
}) {
  const accent = accentOverride || page.accent
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className={cn(
        'rounded-lg overflow-hidden cursor-pointer shadow-sm',
        isSelected
          ? 'shadow-lg scale-[1.02]'
          : 'hover:shadow-md'
      )}
      style={{
        border: `1.5px solid ${accentAlpha(accent, 0.27)}`,
        boxShadow: isSelected ? `0 0 12px ${accentAlpha(accent, 0.19)}` : undefined,
        transition: 'border-color 0.6s ease, box-shadow 0.6s ease',
        backgroundColor: 'hsl(var(--background) / 0.9)',
      }}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 border-b" style={{ backgroundColor: accentAlpha(accent, 0.04), borderColor: accentAlpha(accent, 0.13), transition: 'all 0.6s ease' }}>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400/60" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/60" />
          <div className="w-1.5 h-1.5 rounded-full bg-green-400/60" />
        </div>
        <div className="flex-1 flex items-center gap-1 px-2 py-0.5 rounded text-[7px] font-mono text-muted-foreground" style={{ backgroundColor: accentAlpha(accent, 0.06), transition: 'background-color 0.6s ease' }}>
          <Globe className="h-2 w-2 shrink-0" style={{ color: accent, transition: 'color 0.6s ease' }} />
          vibefest.com{page.route}
        </div>
        <span className={cn(
          'text-[6px] font-bold px-1 py-0.5 rounded',
          page.status === 'Live' ? 'bg-green-500/15 text-green-500' : 'bg-muted text-muted-foreground'
        )}>
          {page.status}
        </span>
      </div>

      {/* Page content */}
      {page.id === 'home' && <HomePageContent isEditing={isEditing} accent={accent} />}
      {page.id === 'lineup' && <LineupPageContent isEditing={isEditing} accent={accent} showImage={showLineupImage} />}
      {page.id === 'map' && <MapPageContent isEditing={isEditing} accent={accent} />}
      {page.id === 'tickets' && <TicketsPageContent isEditing={isEditing} accent={accent} />}
      {page.id === 'profile' && <ProfilePageContent isEditing={isEditing} accent={accent} />}
      {page.id === 'feed' && <FeedPageContent isEditing={isEditing} accent={accent} />}

      {/* Page label */}
      <div className="flex items-center justify-between px-2 py-1 border-t" style={{ backgroundColor: accentAlpha(accent, 0.03), borderColor: accentAlpha(accent, 0.13), transition: 'all 0.6s ease' }}>
        <div className="flex items-center gap-1">
          <page.icon className="h-2.5 w-2.5" style={{ color: accent, transition: 'color 0.6s ease' }} />
          <span className="text-[8px] font-semibold">{page.name}</span>
        </div>
        {isEditing && (
          <span className="text-[7px] text-primary font-medium flex items-center gap-0.5">
            <Pencil className="h-2 w-2" /> Editing
          </span>
        )}
      </div>
    </motion.div>
  )
}

// ─── Individual page content renderers ───────────────────────

function EditableText({ text, isEditing, className }: { text: string; isEditing: boolean; className?: string }) {
  return isEditing ? (
    <span className={cn(className, 'border-b border-dashed border-primary/50')}>
      {text}<span className="animate-pulse text-primary text-[8px]">|</span>
    </span>
  ) : (
    <span className={className}>{text}</span>
  )
}

function HomePageContent({ isEditing, accent }: { isEditing: boolean; accent: string }) {
  return (
    <div className="p-2 space-y-1.5" style={{ minHeight: 120, transition: 'all 0.6s ease' }}>
      {/* Nav */}
      <div className="flex items-center justify-between rounded px-1.5 py-0.5" style={{ backgroundColor: accentAlpha(accent, 0.08), transition: 'all 0.6s ease' }}>
        <span className="text-[8px] font-bold" style={{ color: accent, transition: 'color 0.6s ease' }}>🎵 Vibe Fest</span>
        <div className="flex gap-1.5">
          {['Lineup', 'Map', 'Tickets'].map((l) => (
            <span key={l} className="text-[6px]" style={{ color: accentAlpha(accent, 0.67), transition: 'color 0.6s ease' }}>{l}</span>
          ))}
        </div>
      </div>
      {/* Hero */}
      <div className="text-center py-2">
        <EditableText text="Summer Vibe Fest 2026" isEditing={isEditing} className="text-[10px] font-bold block" />
        <EditableText text="3 days · 50 artists · 1 unforgettable weekend" isEditing={isEditing} className="text-[7px] text-muted-foreground block mt-0.5" />
        <div className="mt-1.5 inline-block px-2 py-0.5 rounded text-[7px] font-semibold text-white" style={{ backgroundColor: accent, transition: 'background-color 0.6s ease' }}>
          Get Tickets
        </div>
      </div>
      {/* Highlights */}
      <div className="grid grid-cols-3 gap-1">
        {[{ e: '🎤', t: 'Live Music' }, { e: '🍕', t: 'Food Court' }, { e: '🎨', t: 'Art Walk' }].map((f) => (
          <div key={f.t} className="rounded p-1 text-center" style={{ border: `1px solid ${accentAlpha(accent, 0.2)}`, backgroundColor: accentAlpha(accent, 0.06), transition: 'all 0.6s ease' }}>
            <div className="text-[8px]">{f.e}</div>
            <div className="text-[6px] font-semibold" style={{ color: accent, transition: 'color 0.6s ease' }}>{f.t}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LineupPageContent({ isEditing, accent, showImage }: { isEditing: boolean; accent: string; showImage?: boolean }) {
  return (
    <div className="p-2 space-y-1.5" style={{ minHeight: 120, transition: 'all 0.6s ease' }}>
      <EditableText text="Lineup" isEditing={isEditing} className="text-[9px] font-bold block" />
      {/* Hero image - appears when AI adds it */}
      <div className="relative rounded overflow-hidden" style={{ height: showImage ? 48 : 0, opacity: showImage ? 1 : 0, transition: 'height 0.6s ease, opacity 0.6s ease' }}>
        <img
          src="https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=400&h=120&fit=crop&crop=center"
          alt="Concert"
          className="w-full h-full object-cover"
          style={{ filter: `saturate(1.2) brightness(0.9)` }}
        />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${accentAlpha(accent, 0.6)}, transparent)`, transition: 'background 0.6s ease' }} />
        <span className="absolute bottom-1 left-1.5 text-[6px] font-bold text-white drop-shadow">🎤 Headliner: Bad Bunny</span>
      </div>
      {/* Day tabs */}
      <div className="flex gap-1">
        {['Fri', 'Sat', 'Sun'].map((d, i) => (
          <div key={d} className={cn('px-2 py-0.5 rounded text-[6px] font-semibold', i !== 0 && 'text-muted-foreground')} style={i === 0 ? { backgroundColor: accent, color: 'white', transition: 'all 0.6s ease' } : { border: `1px solid ${accentAlpha(accent, 0.2)}`, transition: 'all 0.6s ease' }}>{d}</div>
        ))}
      </div>
      {/* Artist list */}
      <div className="space-y-1">
        {[
          { time: '7:00 PM', name: 'Luna Ray', stage: 'Main Stage' },
          { time: '8:30 PM', name: 'The Neons', stage: 'Echo Tent' },
          { time: '10:00 PM', name: 'DJ Nova', stage: 'Main Stage' },
          { time: '11:30 PM', name: 'Dreamwave', stage: 'Sunset Stage' },
        ].map((a) => (
          <div key={a.name} className="flex items-center gap-1.5 rounded px-1.5 py-1" style={{ border: `1px solid ${accentAlpha(accent, 0.13)}`, backgroundColor: accentAlpha(accent, 0.03), transition: 'all 0.6s ease' }}>
            <span className="text-[6px] w-8 shrink-0" style={{ color: accent, transition: 'color 0.6s ease' }}>{a.time}</span>
            <span className="text-[7px] font-semibold flex-1">{a.name}</span>
            <span className="text-[5px] text-muted-foreground">{a.stage}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MapPageContent({ isEditing, accent }: { isEditing: boolean; accent: string }) {
  return (
    <div className="p-2 space-y-1.5" style={{ minHeight: 120, transition: 'all 0.6s ease' }}>
      <EditableText text="Festival Map" isEditing={isEditing} className="text-[9px] font-bold block" />
      {/* Mini map grid */}
      <div className="rounded p-1.5 grid grid-cols-4 grid-rows-3 gap-1" style={{ minHeight: 70, border: `1px solid ${accentAlpha(accent, 0.13)}`, transition: 'all 0.6s ease' }}>
        <div className="col-span-2 rounded flex items-center justify-center text-[6px] font-semibold" style={{ backgroundColor: accentAlpha(accent, 0.13), color: accent, transition: 'all 0.6s ease' }}>🎤 Main Stage</div>
        <div className="rounded flex items-center justify-center text-[5px]" style={{ backgroundColor: accentAlpha(accent, 0.07), color: accent, transition: 'all 0.6s ease' }}>🌳 Chill Zone</div>
        <div className="rounded flex items-center justify-center text-[5px]" style={{ backgroundColor: accentAlpha(accent, 0.07), color: accent, transition: 'all 0.6s ease' }}>🍕 Food</div>
        <div className="rounded flex items-center justify-center text-[5px]" style={{ backgroundColor: accentAlpha(accent, 0.07), color: accent, transition: 'all 0.6s ease' }}>🎪 Echo Tent</div>
        <div className="rounded flex items-center justify-center text-[5px]" style={{ backgroundColor: accentAlpha(accent, 0.07), color: accent, transition: 'all 0.6s ease' }}>🎨 Art Walk</div>
        <div className="col-span-2 rounded flex items-center justify-center text-[5px]" style={{ backgroundColor: accentAlpha(accent, 0.08), color: accent, transition: 'all 0.6s ease' }}>🌅 Sunset Stage</div>
      </div>
      <div className="flex gap-1">
        <div className="flex-1 rounded p-1 text-center text-[6px]" style={{ border: `1px solid ${accentAlpha(accent, 0.2)}`, color: accent, transition: 'all 0.6s ease' }}>📍 Find Friends</div>
        <div className="flex-1 rounded p-1 text-center text-[6px]" style={{ border: `1px solid ${accentAlpha(accent, 0.2)}`, color: accent, transition: 'all 0.6s ease' }}>🚻 Facilities</div>
      </div>
    </div>
  )
}

function TicketsPageContent({ isEditing, accent }: { isEditing: boolean; accent: string }) {
  return (
    <div className="p-2 space-y-1.5" style={{ minHeight: 120, transition: 'all 0.6s ease' }}>
      <EditableText text="Tickets" isEditing={isEditing} className="text-[9px] font-bold block" />
      <div className="grid grid-cols-3 gap-1">
        {[
          { name: 'Day Pass', price: '$89', perks: ['1 day access', 'General area'] },
          { name: 'Weekend', price: '$199', perks: ['Full 3 days', 'VIP lounge'], highlight: true },
          { name: 'Backstage', price: '$499', perks: ['All access', 'Meet artists'] },
        ].map((tier) => (
          <div key={tier.name} className="rounded p-1.5 text-center" style={{ border: `1px solid ${tier.highlight ? accent : accentAlpha(accent, 0.2)}`, backgroundColor: tier.highlight ? accentAlpha(accent, 0.07) : 'transparent', transition: 'all 0.6s ease' }}>
            <div className="text-[7px] font-semibold" style={{ color: tier.highlight ? accent : undefined, transition: 'color 0.6s ease' }}>{tier.name}</div>
            <div className="text-[10px] font-bold">{tier.price}</div>
            {tier.perks.map((p) => (
              <div key={p} className="text-[5px] text-muted-foreground mt-0.5">{p}</div>
            ))}
            <div className="mt-1 rounded py-0.5 text-[5px] font-semibold text-white" style={{ backgroundColor: accent, transition: 'background-color 0.6s ease' }}>
              {tier.highlight ? 'Best Value' : 'Select'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FeedPageContent({ isEditing, accent }: { isEditing: boolean; accent: string }) {
  return (
    <div className="p-2 space-y-1.5" style={{ minHeight: 120, transition: 'all 0.6s ease' }}>
      <EditableText text="Live Feed" isEditing={isEditing} className="text-[9px] font-bold block" />
      {[
        { user: '📸 Alex', text: 'Luna Ray is KILLING it right now!!', time: '2m ago' },
        { user: '🎶 Maya', text: 'Heading to Echo Tent, anyone coming?', time: '5m ago' },
        { user: '🔥 Jake', text: 'This sunset stage view is unreal', time: '8m ago' },
      ].map((post) => (
        <div key={post.user} className="rounded p-1.5" style={{ border: `1px solid ${accentAlpha(accent, 0.13)}`, backgroundColor: accentAlpha(accent, 0.03), transition: 'all 0.6s ease' }}>
          <div className="flex items-center justify-between">
            <span className="text-[7px] font-semibold" style={{ color: accent, transition: 'color 0.6s ease' }}>{post.user}</span>
            <span className="text-[5px] text-muted-foreground">{post.time}</span>
          </div>
          <div className="text-[6px] text-foreground/80 mt-0.5">{post.text}</div>
          <div className="flex gap-2 mt-1">
            <span className="text-[5px]" style={{ color: accent, transition: 'color 0.6s ease' }}>♥ Like</span>
            <span className="text-[5px]" style={{ color: accent, transition: 'color 0.6s ease' }}>↩ Reply</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function ProfilePageContent({ isEditing, accent }: { isEditing: boolean; accent: string }) {
  return (
    <div className="p-2 space-y-1 text-center" style={{ minHeight: 120, transition: 'all 0.6s ease' }}>
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full mx-auto flex items-center justify-center text-[10px] border-2" style={{ borderColor: accent, backgroundColor: accentAlpha(accent, 0.13), transition: 'all 0.6s ease' }}>
        🎧
      </div>
      <EditableText text="Alex Rivera" isEditing={isEditing} className="text-[9px] font-bold block" />
      <EditableText text="Festival Veteran · 5 events" isEditing={isEditing} className="text-[6px] text-muted-foreground block" />
      <div className="grid grid-cols-3 gap-1 pt-1">
        {[{ v: '12', l: 'Saved Sets' }, { v: '48', l: 'Photos' }, { v: '8', l: 'Friends' }].map((s) => (
          <div key={s.l} className="text-center rounded p-0.5" style={{ backgroundColor: accentAlpha(accent, 0.06), transition: 'all 0.6s ease' }}>
            <div className="text-[8px] font-bold" style={{ color: accent, transition: 'color 0.6s ease' }}>{s.v}</div>
            <div className="text-[5px] text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>
      <div className="inline-block px-3 py-0.5 rounded text-[6px] font-semibold text-white" style={{ backgroundColor: accent, transition: 'background-color 0.6s ease' }}>Edit Profile</div>
    </div>
  )
}


// ─── Canvas connection lines (SVG overlay) ───────────────────

function PageConnectionLines({ pagePositions }: { pagePositions: Map<string, { x: number; y: number; w: number; h: number }> }) {
  const lines = PAGE_CONNECTIONS.map((conn) => {
    const from = pagePositions.get(conn.from)
    const to = pagePositions.get(conn.to)
    if (!from || !to) return null

    const sx = from.x + from.w
    const sy = from.y + from.h / 2
    const ex = to.x
    const ey = to.y + to.h / 2
    const mx = (sx + ex) / 2

    return { key: `${conn.from}-${conn.to}`, d: `M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ey}, ${ex} ${ey}` }
  }).filter(Boolean) as { key: string; d: string }[]

  return (
    <>
      <defs>
        <marker id="arrow-end" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
          <path d="M 0 0 L 6 2.5 L 0 5" fill="none" stroke="hsl(var(--muted-foreground) / 0.25)" strokeWidth="1" />
        </marker>
        <marker id="arrow-start" markerWidth="6" markerHeight="5" refX="1" refY="2.5" orient="auto-start-reverse">
          <path d="M 6 0 L 0 2.5 L 6 5" fill="none" stroke="hsl(var(--muted-foreground) / 0.25)" strokeWidth="1" />
        </marker>
      </defs>
      {lines.map((line, i) => (
        <motion.path
          key={line.key}
          d={line.d}
          fill="none"
          stroke="hsl(var(--muted-foreground) / 0.15)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          markerStart="url(#arrow-start)"
          markerEnd="url(#arrow-end)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
        />
      ))}
    </>
  )
}

interface PagesChatMsg {
  role: 'ai' | 'user'
  text: string
}

const PAGES_CHAT_SEQUENCE: { msg: PagesChatMsg; delayAfter: number; action?: 'change-pink' | 'add-image' }[] = [
  { msg: { role: 'user', text: 'Can you change the accent color to pink across all pages?' }, delayAfter: 1000 },
  { msg: { role: 'ai', text: 'Updating the accent color to pink on all 6 pages...' }, delayAfter: 600, action: 'change-pink' },
  { msg: { role: 'ai', text: 'Done! All pages now use a pink accent.' }, delayAfter: 1200 },
  { msg: { role: 'user', text: 'Now add a hero image to the Lineup page' }, delayAfter: 1000 },
  { msg: { role: 'ai', text: 'Adding a concert hero image to the Lineup page...' }, delayAfter: 500, action: 'add-image' },
  { msg: { role: 'ai', text: 'Done! Added a headliner banner to the Lineup page.' }, delayAfter: 0 },
]

function PagesDemo() {
  const [selectedPage, setSelectedPage] = useState<string | null>(null)
  const [accentOverride, setAccentOverride] = useState<string | null>(null)
  const [showLineupImage, setShowLineupImage] = useState(false)
  const [chatMsgs, setChatMsgs] = useState<PagesChatMsg[]>([])
  const [chatPhase, setChatPhase] = useState<'waiting' | 'playing' | 'done'>('waiting')

  // Auto-play the chat sequence after a delay
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    let idx = 0

    function playNext() {
      if (idx >= PAGES_CHAT_SEQUENCE.length) {
        setChatPhase('done')
        return
      }
      const entry = PAGES_CHAT_SEQUENCE[idx]
      idx++
      setChatMsgs((prev) => [...prev, entry.msg])

      if (entry.action === 'change-pink') {
        timers.push(setTimeout(() => {
          setAccentOverride('hsl(330, 80%, 60%)')
        }, 350))
      }
      if (entry.action === 'add-image') {
        timers.push(setTimeout(() => {
          setShowLineupImage(true)
        }, 350))
      }

      if (entry.delayAfter > 0) {
        timers.push(setTimeout(playNext, entry.delayAfter))
      } else {
        setChatPhase('done')
      }
    }

    // Start the chat sequence after pages have loaded
    timers.push(setTimeout(() => {
      setChatPhase('playing')
      playNext()
    }, 2000))

    return () => timers.forEach(clearTimeout)
  }, [])

  // Layout: 2 rows x 3 cols grid with known positions for SVG lines
  const cols = 3
  const cellW = 195
  const cellH = 185
  const gapX = 18
  const gapY = 14
  const padX = 8
  const padY = 8

  const pagePositions = new Map<string, { x: number; y: number; w: number; h: number }>()
  MINI_PAGES.forEach((page, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    pagePositions.set(page.id, {
      x: padX + col * (cellW + gapX),
      y: padY + row * (cellH + gapY),
      w: cellW,
      h: cellH,
    })
  })

  const totalW = padX * 2 + cols * cellW + (cols - 1) * gapX
  const totalH = padY * 2 + 2 * cellH + gapY

  return (
    <div className="relative w-full rounded-xl border bg-background/60 overflow-hidden">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--muted-foreground) / 0.3) 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      />

      {/* Connection lines SVG overlay */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        viewBox={`0 0 ${totalW} ${totalH}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <PageConnectionLines pagePositions={pagePositions} />
      </svg>

      {/* Page grid */}
      <div className="relative z-10 grid grid-cols-3 gap-x-[18px] gap-y-[14px] p-[8px]">
        {MINI_PAGES.map((page, i) => (
          <MiniWebpage
            key={page.id}
            page={page}
            isSelected={selectedPage === page.id}
            isEditing={selectedPage === page.id}
            onClick={() => setSelectedPage(selectedPage === page.id ? null : page.id)}
            delay={i * 0.08}
            accentOverride={accentOverride}
            showLineupImage={page.id === 'lineup' ? showLineupImage : undefined}
          />
        ))}
      </div>

      {/* AI Chat overlay bar */}
      <AnimatePresence>
        {chatPhase !== 'waiting' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-0 left-0 right-0 z-20 border-t bg-background/95 backdrop-blur-sm"
          >
            {/* Chat messages */}
            <div className="px-4 py-2 space-y-1.5 max-h-24 overflow-y-auto">
              <AnimatePresence>
                {chatMsgs.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn('flex gap-2 items-start', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                  >
                    {msg.role === 'ai' && (
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Bot className="h-3 w-3 text-primary" />
                      </div>
                    )}
                    <div className={cn(
                      'rounded-lg px-3 py-1.5 text-[10px] leading-relaxed max-w-[70%]',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/60 text-foreground'
                    )}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {/* Typing indicator when playing */}
              {chatPhase === 'playing' && chatMsgs.length < PAGES_CHAT_SEQUENCE.length && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 items-center">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Bot className="h-3 w-3 text-primary" />
                  </div>
                  <div className="flex gap-0.5 px-3 py-2">
                    {[0, 1, 2].map((d) => (
                      <motion.div
                        key={d}
                        className="w-1 h-1 rounded-full bg-muted-foreground/40"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: d * 0.2 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
            {/* Input bar */}
            <div className="px-4 py-2 border-t">
              <div className="flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-1.5">
                <span className="flex-1 text-[10px] text-muted-foreground/50">Ask AI to edit your pages...</span>
                <Send className="h-3 w-3 text-muted-foreground/30" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Agents Demo ─────────────────────────────────────────────

function AgentsDemo() {
  const [botName, setBotName] = useState('')
  const [greeting, setGreeting] = useState('')
  const [phase, setPhase] = useState<'typing-name' | 'typing-greeting' | 'deploying' | 'live' | 'chatting'>('typing-name')
  const [deployProgress, setDeployProgress] = useState(0)
  const [visibleMsgs, setVisibleMsgs] = useState(0)

  const targetName = 'Bella'
  const targetGreeting = "Hey! \u{1F44B} I'm Bella, your festival guide. Ask me anything!"

  const LIVE_CHAT: { role: 'user' | 'bot'; text: string }[] = [
    { role: 'user', text: 'When does the main stage open?' },
    { role: 'bot', text: 'The main stage opens at 4 PM on Friday! I\'d recommend getting there early for the best spots. \u{1F3B6}' },
    { role: 'user', text: 'Who\'s headlining Saturday?' },
    { role: 'bot', text: 'Saturday\'s headliner is Luna Ray at 10 PM on the Main Stage. She\'s incredible live! \u2728' },
  ]

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    let t = 500

    // Phase 1: Type bot name character by character
    for (let i = 0; i < targetName.length; i++) {
      const idx = i
      timers.push(setTimeout(() => {
        setBotName(targetName.slice(0, idx + 1))
      }, t))
      t += 150
    }
    t += 625

    // Phase 2: Type greeting character by character
    timers.push(setTimeout(() => setPhase('typing-greeting'), t))
    for (let i = 0; i < targetGreeting.length; i++) {
      const idx = i
      timers.push(setTimeout(() => {
        setGreeting(targetGreeting.slice(0, idx + 1))
      }, t))
      t += 31
    }
    t += 750

    // Phase 3: Deploy
    timers.push(setTimeout(() => setPhase('deploying'), t))
    for (let p = 0; p <= 100; p += 5) {
      timers.push(setTimeout(() => setDeployProgress(p), t + p * 10))
    }
    t += 1125

    // Phase 4: Live
    timers.push(setTimeout(() => setPhase('live'), t))
    t += 750

    // Phase 5: Chat messages
    timers.push(setTimeout(() => setPhase('chatting'), t))
    LIVE_CHAT.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleMsgs(i + 1), t + i * 1250))
    })

    return () => timers.forEach(clearTimeout)
  }, [])

  const isTypingName = phase === 'typing-name'
  const isTypingGreeting = phase === 'typing-greeting'
  const isDeploying = phase === 'deploying'
  const isLiveOrLater = phase === 'live' || phase === 'chatting'
  const isChatting = phase === 'chatting'

  return (
    <div className="relative w-full aspect-[16/9] rounded-xl border bg-background/60 overflow-hidden flex">
      {/* Left: Agent Builder Config */}
      <div className="flex-1 border-r flex flex-col overflow-hidden">
        <div className="px-3 py-2 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-semibold">Agent Builder</span>
          </div>
          {isLiveOrLater && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[7px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-500 flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </motion.span>
          )}
        </div>

        <div className="flex-1 p-3 space-y-2.5 overflow-hidden">
          {/* Name field */}
          <div>
            <div className="text-[8px] font-medium text-muted-foreground mb-0.5">Name</div>
            <div className={cn(
              'px-2 py-1 rounded border text-[9px] transition-colors',
              isTypingName ? 'border-primary bg-primary/5' : 'bg-muted/20'
            )}>
              {botName || <span className="text-muted-foreground/40">Enter bot name...</span>}
              {isTypingName && <span className="animate-pulse text-primary">|</span>}
            </div>
          </div>

          {/* Greeting field */}
          <div>
            <div className="text-[8px] font-medium text-muted-foreground mb-0.5">Greeting</div>
            <div className={cn(
              'px-2 py-1 rounded border text-[9px] min-h-[32px] transition-colors',
              isTypingGreeting ? 'border-primary bg-primary/5' : 'bg-muted/20'
            )}>
              {greeting || <span className="text-muted-foreground/40">Enter greeting message...</span>}
              {isTypingGreeting && <span className="animate-pulse text-primary">|</span>}
            </div>
          </div>

          {/* Knowledge section */}
          <div>
            <div className="text-[8px] font-medium text-muted-foreground mb-1">Knowledge</div>
            <div className="space-y-1">
              {[
                { type: 'FAQ', title: 'Festival schedule & stages' },
                { type: 'FAQ', title: 'Ticket pricing & upgrades' },
                { type: 'TEXT', title: 'Venue map & directions' },
              ].map((entry, i) => (
                <motion.div
                  key={entry.title}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded border bg-muted/10 text-[8px]"
                >
                  <span className={cn(
                    'text-[6px] font-bold px-1 py-0.5 rounded',
                    entry.type === 'FAQ' ? 'text-purple-500 bg-purple-500/15' : 'text-blue-500 bg-blue-500/15'
                  )}>{entry.type}</span>
                  <span className="truncate">{entry.title}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Deploy button / progress / status */}
          <div className="pt-1">
            {isDeploying ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-1"
              >
                <div className="flex items-center justify-between text-[8px]">
                  <span className="text-muted-foreground">Deploying to website...</span>
                  <span className="font-medium text-primary">{deployProgress}%</span>
                </div>
                <div className="h-1 rounded-full bg-muted/30 overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${deployProgress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </motion.div>
            ) : isLiveOrLater ? (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1.5 text-[8px] text-green-500 font-medium"
              >
                <Globe className="h-3 w-3" />
                Deployed to vibefest.com
              </motion.div>
            ) : (
              <div className={cn(
                'flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[9px] font-medium transition-all',
                botName && greeting
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/30 text-muted-foreground/50'
              )}>
                <Globe className="h-3 w-3" />
                Deploy to Website
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: User's website with floating chat widget */}
      <div className="w-[280px] flex flex-col shrink-0 relative">
        {/* Browser chrome - their website */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-b bg-muted/30">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-green-400/60" />
          </div>
          <div className="flex-1 flex items-center gap-1 px-2 py-0.5 rounded bg-background/80 text-[7px] font-mono text-muted-foreground">
            <Globe className="h-2 w-2 shrink-0 text-green-500" />
            vibefest.com
          </div>
        </div>

        {/* Website content */}
        <div className="flex-1 overflow-hidden bg-background/90 relative">
          {/* Mini website mockup */}
          <div className="p-3 space-y-2">
            {/* Site nav */}
            <div className="flex items-center justify-between rounded px-2 py-1 bg-violet-500/8">
              <span className="text-[8px] font-bold text-violet-500">{'\u{1F3B5}'} Vibe Fest</span>
              <div className="flex gap-2">
                {['Lineup', 'Tickets', 'Map'].map((l) => (
                  <span key={l} className="text-[6px] text-violet-500/60">{l}</span>
                ))}
              </div>
            </div>
            {/* Hero */}
            <div className="text-center py-3">
              <div className="text-[10px] font-bold">Summer Vibe Fest 2026</div>
              <div className="text-[7px] text-muted-foreground mt-0.5">3 days &middot; 50 artists &middot; 1 weekend</div>
              <div className="mt-1.5 inline-block px-2.5 py-0.5 rounded text-[7px] font-semibold text-white bg-violet-500">Get Tickets</div>
            </div>
            {/* Feature cards */}
            <div className="grid grid-cols-3 gap-1.5">
              {[{ e: '\u{1F3A4}', t: 'Live Music' }, { e: '\u{1F355}', t: 'Food Court' }, { e: '\u{1F3A8}', t: 'Art Walk' }].map((f) => (
                <div key={f.t} className="rounded p-1.5 text-center border border-violet-500/15 bg-violet-500/5">
                  <div className="text-[9px]">{f.e}</div>
                  <div className="text-[6px] font-semibold text-violet-500">{f.t}</div>
                </div>
              ))}
            </div>
            {/* Lineup preview */}
            <div className="space-y-1">
              <div className="text-[8px] font-semibold">Lineup</div>
              {[
                { time: '7 PM', name: 'Luna Ray', stage: 'Main' },
                { time: '9 PM', name: 'The Neons', stage: 'Echo' },
                { time: '11 PM', name: 'DJ Nova', stage: 'Main' },
              ].map((a) => (
                <div key={a.name} className="flex items-center gap-1.5 rounded px-1.5 py-0.5 border border-violet-500/10 bg-violet-500/3">
                  <span className="text-[6px] text-violet-500 w-6 shrink-0">{a.time}</span>
                  <span className="text-[7px] font-medium flex-1">{a.name}</span>
                  <span className="text-[5px] text-muted-foreground">{a.stage}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Floating chat widget - appears during/after greeting typing */}
          <AnimatePresence>
            {(isTypingGreeting || isDeploying || isLiveOrLater || isChatting) && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                className="absolute bottom-2 right-2 left-2 rounded-xl border shadow-xl bg-background/95 backdrop-blur-sm overflow-hidden flex flex-col"
                style={{ maxHeight: isLiveOrLater ? 200 : 120 }}
              >
                {/* Widget header */}
                <div className="px-2.5 py-1.5 flex items-center gap-2 bg-primary shrink-0">
                  <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                    <Bot className="h-2.5 w-2.5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[8px] font-semibold text-white truncate">
                      {botName || <span className="text-white/40">Bot Name</span>}
                    </div>
                    <div className="text-[6px] text-white/60">
                      {isLiveOrLater ? 'Online' : 'Preview'}
                    </div>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="text-white text-[8px]">&minus;</span>
                  </div>
                </div>

                {/* Chat messages */}
                <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5">
                  {/* Greeting - updates live */}
                  {(greeting || isTypingGreeting) && (
                    <div className="flex gap-1">
                      <div className="w-3.5 h-3.5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="h-2 w-2 text-primary" />
                      </div>
                      <div className="bg-muted/60 rounded-lg rounded-tl-none px-1.5 py-1 text-[7px] max-w-[85%] leading-relaxed">
                        {greeting || '...'}
                      </div>
                    </div>
                  )}

                  {/* Live visitor chat */}
                  <AnimatePresence>
                    {isChatting && LIVE_CHAT.slice(0, visibleMsgs).map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className={cn('flex gap-1', msg.role === 'user' ? 'justify-end' : '')}
                      >
                        {msg.role === 'bot' && (
                          <div className="w-3.5 h-3.5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                            <Bot className="h-2 w-2 text-primary" />
                          </div>
                        )}
                        <div className={cn(
                          'rounded-lg px-1.5 py-1 text-[7px] leading-relaxed max-w-[80%]',
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                            : 'bg-muted/60 text-foreground rounded-tl-none'
                        )}>
                          {msg.text}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Typing indicator */}
                  {isChatting && visibleMsgs > 0 && visibleMsgs < LIVE_CHAT.length && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1">
                      <div className="w-3.5 h-3.5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Bot className="h-2 w-2 text-primary" />
                      </div>
                      <div className="flex gap-0.5 px-1.5 py-1">
                        {[0, 1, 2].map((d) => (
                          <motion.div
                            key={d}
                            className="w-1 h-1 rounded-full bg-muted-foreground/40"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: d * 0.2 }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Input */}
                <div className="px-1.5 py-1.5 border-t shrink-0">
                  <div className="flex items-center gap-1 rounded-full border bg-muted/20 px-2 py-0.5">
                    <span className="flex-1 text-[7px] text-muted-foreground/50">Type a message...</span>
                    <div className="w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
                      <Send className="h-1.5 w-1.5 text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat bubble FAB - shown before widget opens */}
          {isTypingName && (
            <div className="absolute bottom-2 right-2">
              <div className="w-8 h-8 rounded-full bg-primary shadow-lg flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Integrations Demo ───────────────────────────────────────

const INTEGRATIONS = [
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Database, Auth & Storage',
    color: '#3ECF8E',
    icon: (
      <svg viewBox="0 0 109 113" className="h-5 w-5" fill="none">
        <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#sb-a)" />
        <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#sb-b)" fillOpacity="0.2" />
        <path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.04075L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z" fill="#3ECF8E" />
        <defs>
          <linearGradient id="sb-a" x1="53.9738" y1="54.974" x2="94.1635" y2="71.8295" gradientUnits="userSpaceOnUse">
            <stop stopColor="#249361" /><stop offset="1" stopColor="#3ECF8E" />
          </linearGradient>
          <linearGradient id="sb-b" x1="36.1558" y1="30.578" x2="54.4844" y2="65.0806" gradientUnits="userSpaceOnUse">
            <stop /><stop offset="1" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    ),
    features: ['Postgres Database', 'Row Level Security', 'Auth & Users', 'Realtime Sync'],
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Repos, Issues & CI/CD',
    color: '#f0f0f0',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
    features: ['Sync Repositories', 'Import Issues', 'Auto-deploy', 'Branch Tracking'],
  },
]

function IntegrationsDemo() {
  const [connectedIds, setConnectedIds] = useState<string[]>([])
  const [connectingId, setConnectingId] = useState<string | null>(null)
  const [syncedItems, setSyncedItems] = useState<Record<string, number>>({})

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    // Auto-connect Supabase
    timers.push(setTimeout(() => setConnectingId('supabase'), 800))
    timers.push(setTimeout(() => {
      setConnectedIds(['supabase'])
      setConnectingId(null)
    }, 2000))

    // Sync Supabase items
    for (let i = 1; i <= 4; i++) {
      timers.push(setTimeout(() => setSyncedItems((prev) => ({ ...prev, supabase: i })), 2200 + i * 300))
    }

    // Auto-connect GitHub
    timers.push(setTimeout(() => setConnectingId('github'), 3800))
    timers.push(setTimeout(() => {
      setConnectedIds(['supabase', 'github'])
      setConnectingId(null)
    }, 5000))

    // Sync GitHub items
    for (let i = 1; i <= 4; i++) {
      timers.push(setTimeout(() => setSyncedItems((prev) => ({ ...prev, github: i })), 5200 + i * 300))
    }

    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="relative w-full aspect-[16/9] rounded-xl border bg-background/60 overflow-hidden flex">
      {/* Left: Integration Cards */}
      <div className="flex-1 border-r flex flex-col overflow-hidden">
        <div className="px-3 py-2 border-b flex items-center gap-2">
          <Plug className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-semibold">Integrations</span>
          <span className="ml-auto text-[8px] text-muted-foreground">{connectedIds.length} connected</span>
        </div>

        <div className="flex-1 p-3 space-y-3 overflow-hidden">
          {INTEGRATIONS.map((integration, idx) => {
            const isConnected = connectedIds.includes(integration.id)
            const isConnecting = connectingId === integration.id
            const synced = syncedItems[integration.id] || 0

            return (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                className={cn(
                  'rounded-lg border p-2.5 transition-all',
                  isConnected ? 'border-green-500/30 bg-green-500/5' : isConnecting ? 'border-primary/30 bg-primary/5' : 'bg-muted/10'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: integration.color + '15', color: integration.color }}
                  >
                    {integration.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] font-semibold">{integration.name}</div>
                    <div className="text-[7px] text-muted-foreground">{integration.description}</div>
                  </div>
                  {isConnected ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
                    >
                      <Check className="h-3 w-3 text-white" />
                    </motion.div>
                  ) : isConnecting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-primary" />
                    </motion.div>
                  ) : (
                    <div className="px-2 py-0.5 rounded text-[7px] font-medium bg-muted/30 text-muted-foreground">
                      Connect
                    </div>
                  )}
                </div>

                {/* Feature sync progress */}
                {(isConnected || isConnecting) && (
                  <div className="space-y-1 mt-1.5">
                    {integration.features.map((feature, fi) => {
                      const isSynced = fi < synced
                      return (
                        <motion.div
                          key={feature}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * fi }}
                          className="flex items-center gap-1.5 text-[8px]"
                        >
                          {isSynced ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 300 }}
                            >
                              <Check className="h-2.5 w-2.5 text-green-500" />
                            </motion.div>
                          ) : (
                            <div className="w-2.5 h-2.5 rounded-full border border-muted-foreground/20" />
                          )}
                          <span className={cn(isSynced ? 'text-foreground' : 'text-muted-foreground/50')}>
                            {feature}
                          </span>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Right: Live sync feed */}
      <div className="w-56 flex flex-col shrink-0">
        <div className="px-3 py-2 border-b flex items-center gap-2">
          <RefreshCw className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-semibold">Sync Activity</span>
        </div>

        <div className="flex-1 overflow-hidden p-2 space-y-1.5">
          {[
            { icon: Database, text: 'Connected to Supabase project', color: 'text-green-500', delay: 2.0 },
            { icon: Shield, text: 'Row Level Security enabled', color: 'text-green-500', delay: 2.5 },
            { icon: Database, text: 'Synced 12 tables from schema', color: 'text-emerald-500', delay: 3.0 },
            { icon: Database, text: 'Auth providers configured', color: 'text-emerald-500', delay: 3.4 },
            { icon: GitBranch, text: 'Connected to GitHub repo', color: 'text-purple-500', delay: 5.0 },
            { icon: GitBranch, text: 'Imported 8 open issues', color: 'text-purple-500', delay: 5.5 },
            { icon: GitBranch, text: 'Webhook configured for pushes', color: 'text-violet-500', delay: 5.9 },
            { icon: GitBranch, text: 'Branch protection rules synced', color: 'text-violet-500', delay: 6.3 },
          ].map((item, i) => (
            <SyncFeedItem key={i} icon={item.icon} text={item.text} color={item.color} delay={item.delay} />
          ))}
        </div>

        {/* Status bar */}
        <div className="px-3 py-1.5 border-t bg-muted/10">
          <div className="flex items-center gap-1.5 text-[7px] text-muted-foreground">
            <div className={cn(
              'w-1.5 h-1.5 rounded-full',
              connectedIds.length === 2 ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/30'
            )} />
            {connectedIds.length === 2 ? 'All integrations synced' : connectedIds.length === 1 ? '1 integration connected' : 'Waiting for connections...'}
          </div>
        </div>
      </div>
    </div>
  )
}

function SyncFeedItem({ icon: Icon, text, color, delay }: { icon: typeof Database; text: string; color: string; delay: number }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay * 1000)
    return () => clearTimeout(timer)
  }, [delay])

  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: -8, height: 0 }}
      animate={{ opacity: 1, x: 0, height: 'auto' }}
      transition={{ duration: 0.25 }}
      className="flex items-start gap-1.5 text-[8px] py-1 border-b border-muted/20 last:border-0"
    >
      <Icon className={cn('h-3 w-3 shrink-0 mt-0.5', color)} />
      <span className="text-foreground/80 leading-relaxed">{text}</span>
      <span className="ml-auto text-[6px] text-muted-foreground/50 shrink-0 mt-0.5">just now</span>
    </motion.div>
  )
}

// ─── Feature Tabs Section ───────────────────────────────────

export function FeaturesTabs() {
  const [activeTab, setActiveTab] = useState<FeatureTab>('planning')
  const currentTab = TABS.find((t) => t.key === activeTab)!

  return (
    <section id="features" className="py-20 sm:py-28 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need to{' '}
            <span className="text-primary">Ship</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Plan your architecture, design your pages, and define your backend — all from one place.
          </p>
        </motion.div>

        {/* Tab buttons */}
        <div className="flex justify-center gap-2 mb-4">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
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

        {/* Tab description */}
        <AnimatePresence mode="wait">
          <motion.p
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="text-center text-sm text-muted-foreground mb-8 max-w-lg mx-auto"
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
            {activeTab === 'planning' && <PlanningDemo />}
            {activeTab === 'design' && <PagesDemo />}
            {activeTab === 'agents' && <AgentsDemo />}
            {activeTab === 'integrations' && <IntegrationsDemo />}
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-2"
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            Try It Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
