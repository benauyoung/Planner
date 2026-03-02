'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ChevronDown, Sparkles } from 'lucide-react'
import Link from 'next/link'
import type { Lang } from '@/lib/landing-i18n'
import { t } from '@/lib/landing-i18n'

// ─── Animated grid background ───────────────────────────────
function GridBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Base dark layer */}
            <div className="absolute inset-0 bg-[#050812]" />

            {/* Aurora blob 1 */}
            <motion.div
                className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full opacity-25"
                style={{
                    background: 'radial-gradient(circle, hsl(217 91% 60% / 0.6) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                }}
                animate={{
                    x: [0, 60, 0],
                    y: [0, 40, 0],
                    scale: [1, 1.15, 1],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Aurora blob 2 */}
            <motion.div
                className="absolute top-1/3 right-[-200px] w-[600px] h-[600px] rounded-full opacity-20"
                style={{
                    background: 'radial-gradient(circle, hsl(263 70% 60% / 0.7) 0%, transparent 70%)',
                    filter: 'blur(100px)',
                }}
                animate={{
                    x: [0, -50, 0],
                    y: [0, 60, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            />

            {/* Aurora blob 3 */}
            <motion.div
                className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full opacity-15"
                style={{
                    background: 'radial-gradient(circle, hsl(142 71% 45% / 0.5) 0%, transparent 70%)',
                    filter: 'blur(90px)',
                }}
                animate={{
                    x: [0, 40, 0],
                    y: [0, -30, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
            />

            {/* Dot grid */}
            <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                }}
            />

            {/* Bottom fade to background */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-background pointer-events-none" />
        </div>
    )
}

// ─── Animated node graph strip ───────────────────────────────
const HERO_NODES = [
    { id: 'g', label: 'Goal', x: 0, color: '#f97316', w: 80 },
    { id: 's1', label: 'Subgoal', x: 120, color: '#3b82f6', w: 90 },
    { id: 's2', label: 'Subgoal', x: 120, color: '#3b82f6', w: 90 },
    { id: 'f1', label: 'Feature', x: 252, color: '#22c55e', w: 84 },
    { id: 'f2', label: 'Feature', x: 252, color: '#22c55e', w: 84 },
    { id: 't1', label: 'Task', x: 378, color: '#8b5cf6', w: 72 },
    { id: 't2', label: 'Task', x: 378, color: '#8b5cf6', w: 72 },
    { id: 't3', label: 'Task', x: 378, color: '#8b5cf6', w: 72 },
]

const NODE_Y: Record<string, number> = {
    g: 28, s1: 8, s2: 48, f1: 0, f2: 38, t1: 0, t2: 28, t3: 56,
}

const EDGES = [
    { from: 'g', fromY: 28, to: 's1', toY: 8 },
    { from: 'g', fromY: 28, to: 's2', toY: 48 },
    { from: 's1', fromY: 8, to: 'f1', toY: 0 },
    { from: 's1', fromY: 8, to: 'f2', toY: 38 },
    { from: 'f1', fromY: 0, to: 't1', toY: 0 },
    { from: 'f2', fromY: 38, to: 't2', toY: 28 },
    { from: 's2', fromY: 48, to: 't3', toY: 56 },
]

function NodeStrip() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="relative mx-auto w-full max-w-lg overflow-hidden"
            style={{ height: 92 }}
        >
            <svg viewBox="0 0 480 88" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Project planning node graph">
                {/* Edges */}
                {EDGES.map((e, i) => {
                    const fromNode = HERO_NODES.find(n => n.id === e.from)!
                    const toNode = HERO_NODES.find(n => n.id === e.to)!
                    const sx = fromNode.x + fromNode.w
                    const sy = e.fromY + 12
                    const ex = toNode.x
                    const ey = e.toY + 12
                    const mx = (sx + ex) / 2
                    return (
                        <motion.path
                            key={`${e.from}-${e.to}`}
                            d={`M ${sx} ${sy} C ${mx} ${sy} ${mx} ${ey} ${ex} ${ey}`}
                            fill="none"
                            stroke="rgba(255,255,255,0.12)"
                            strokeWidth="1.5"
                            strokeDasharray="5 4"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 1.2 + i * 0.1 }}
                        />
                    )
                })}
                {/* Nodes */}
                {HERO_NODES.map((node, i) => (
                    <motion.g
                        key={node.id}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.35, delay: 1.0 + i * 0.07, type: 'spring', stiffness: 200 }}
                    >
                        <rect
                            x={node.x}
                            y={NODE_Y[node.id]}
                            width={node.w}
                            height={24}
                            rx={6}
                            fill="rgba(255,255,255,0.04)"
                            stroke={node.color}
                            strokeWidth="1"
                            strokeOpacity="0.6"
                        />
                        <circle cx={node.x + 10} cy={NODE_Y[node.id] + 12} r={3} fill={node.color} opacity="0.8" />
                        <text
                            x={node.x + 18}
                            y={NODE_Y[node.id] + 15}
                            fill="rgba(255,255,255,0.65)"
                            fontSize="8"
                            fontWeight="600"
                            fontFamily="system-ui, sans-serif"
                        >
                            {node.label}
                        </text>
                    </motion.g>
                ))}
            </svg>
            {/* Right fade */}
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#050812] to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#050812] to-transparent pointer-events-none" />
        </motion.div>
    )
}

// ─── Main Hero ───────────────────────────────────────────────

interface HeroSectionProps {
    lang?: Lang
}

export function HeroSection({ lang = 'en' }: HeroSectionProps) {
    const ref = useRef<HTMLElement>(null)
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
    const y = useTransform(scrollYProgress, [0, 0.5], [0, -40])

    return (
        <section
            ref={ref}
            className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16"
        >
            <GridBackground />

            <motion.div
                style={{ opacity, y }}
                className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center"
            >
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-xs font-medium text-white/70 mb-8"
                >
                    <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                    {t(lang, 'heroBadge')}
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] mb-6"
                >
                    <span className="block">{t(lang, 'heroHeadlineStart')}</span>
                    <span
                        className="block"
                        style={{
                            background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #34d399 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        {t(lang, 'heroHeadlineAccent')}
                    </span>
                    <span className="block text-white/80">{t(lang, 'heroHeadlineEnd')}</span>
                </motion.h1>

                {/* Subtext */}
                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.35 }}
                    className="max-w-2xl text-lg sm:text-xl text-white/55 leading-relaxed mb-10"
                >
                    {t(lang, 'heroSubtext')}
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4 items-center mb-6"
                >
                    <Link
                        href="/login"
                        className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-base font-semibold text-white shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)',
                            boxShadow: '0 4px 32px rgba(99,102,241,0.4), 0 0 0 1px rgba(255,255,255,0.08)',
                        }}
                    >
                        {t(lang, 'heroCta')}
                        <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>

                    <a
                        href="#features"
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-medium text-white/60 border border-white/10 hover:border-white/20 hover:text-white/80 transition-all backdrop-blur-sm"
                    >
                        {t(lang, 'heroCtaSecondary')}
                        <ChevronDown className="h-4 w-4" />
                    </a>
                </motion.div>

                {/* Social proof micro-text */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="text-xs text-white/30"
                >
                    {t(lang, 'heroSocialProof')}
                </motion.p>

                {/* Node graph strip */}
                <div className="mt-16 w-full">
                    <NodeStrip />
                </div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
            >
                <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-5 h-8 rounded-full border border-white/15 flex items-start justify-center pt-1.5"
                >
                    <div className="w-1 h-2 rounded-full bg-white/30" />
                </motion.div>
            </motion.div>
        </section>
    )
}
