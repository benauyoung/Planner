'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Loader2, Check, ChevronDown } from 'lucide-react'
import { addEmailToWaitlist } from '@/services/firestore'
import { track } from '@vercel/analytics'

// ─── Inline email capture ───────────────────────────────────
function HeroEmailCapture() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!email.trim() || status === 'loading') return
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email.trim())) { setStatus('error'); return }
        setStatus('loading')
        try {
            await addEmailToWaitlist(email.trim(), 'landing')
            track('waitlist_signup', { source: 'landing_hero' })
            setStatus('success')
            setEmail('')
        } catch { setStatus('error') }
    }

    if (status === 'success') {
        return (
            <div className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium">
                <Check className="h-4 w-4" />
                <span>Parfait — vous êtes sur la liste.</span>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md">
            <div className="flex gap-2">
                <input
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle') }}
                    className="flex-1 px-4 py-3.5 rounded-xl text-white placeholder:text-white/35 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all backdrop-blur-sm"
                    style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: status === 'error' ? '1px solid rgba(248,113,113,0.5)' : '1px solid rgba(255,255,255,0.10)',
                    }}
                />
                <button
                    type="submit"
                    disabled={status === 'loading' || !email.trim()}
                    className="px-5 py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0 flex items-center gap-2"
                    style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                        boxShadow: '0 2px 16px rgba(99,102,241,0.4)',
                    }}
                >
                    {status === 'loading' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>Rejoindre <ArrowRight className="h-3.5 w-3.5" /></>
                    )}
                </button>
            </div>
            {status === 'error' && (
                <p className="text-xs text-red-400/80 mt-2 text-center">Email invalide — réessayez.</p>
            )}
            <p className="text-[11px] mt-2.5 text-center tracking-wide" style={{ color: 'rgba(255,255,255,0.22)' }}>
                Gratuit · Aucune carte requise · Rejoignez 500+ créateurs
            </p>
        </form>
    )
}

// ─── Background ─────────────────────────────────────────────
function DarkBg() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0" style={{ background: '#050812' }} />
            {/* Aurora blobs */}
            <motion.div
                className="absolute -top-40 -left-40 rounded-full"
                style={{ width: 700, height: 700, background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)', filter: 'blur(80px)' }}
                animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
                transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="absolute rounded-full"
                style={{ top: '40%', right: -100, width: 500, height: 500, background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)', filter: 'blur(100px)' }}
                animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
                transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
            />
            {/* Subtle dot grid */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
            />
            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0" style={{ height: 160, background: 'linear-gradient(to bottom, transparent, hsl(var(--background)))' }} />
        </div>
    )
}

// ─── Main hero ──────────────────────────────────────────────
export function HeroConversion() {
    const ref = useRef<HTMLElement>(null)
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
    const opacity = useTransform(scrollYProgress, [0, 0.45], [1, 0])
    const y = useTransform(scrollYProgress, [0, 0.45], [0, -30])

    // Mount check for animations — avoids SSR/hydration flash
    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])

    return (
        <section
            ref={ref}
            className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16"
        >
            <DarkBg />

            <motion.div
                style={{ opacity: mounted ? opacity : 1, y: mounted ? y : 0 }}
                className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center"
            >
                {/* French editorial eyebrow */}
                <div className="flex items-center gap-3 justify-center mb-6">
                    <div className="h-px w-8" style={{ background: 'rgba(255,255,255,0.15)' }} />
                    <span className="text-[10px] font-light tracking-[0.3em] uppercase" style={{ color: 'rgba(255,255,255,0.28)' }}>Paris · IA · 2026</span>
                    <div className="h-px w-8" style={{ background: 'rgba(255,255,255,0.15)' }} />
                </div>

                {/* Headline */}
                <h1
                    className="text-white font-extrabold tracking-tight leading-[1.04] mb-5"
                    style={{ fontSize: 'clamp(3rem, 9vw, 7rem)' }}
                >
                    <span className="block">Grandes idées.</span>
                    <span
                        className="block italic"
                        style={{
                            background: 'linear-gradient(100deg, #60a5fa 0%, #c084fc 45%, #f472b6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        TinyBaguette.
                    </span>
                </h1>

                {/* Subtext */}
                <p
                    className="text-lg sm:text-xl max-w-xl leading-relaxed mb-8 font-light"
                    style={{ color: 'rgba(255,255,255,0.45)' }}
                >
                    Créez votre site ou app mobile en quelques minutes,
                    puis ajoutez votre propre agent IA.
                </p>

                {/* Email capture — above fold CTA */}
                <HeroEmailCapture />

                {/* See how it works */}
                <div className="mt-7">
                    <a
                        href="#features"
                        className="inline-flex items-center gap-1.5 transition-colors"
                        style={{ color: 'rgba(255,255,255,0.22)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500 }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.22)')}
                    >
                        Voir comment ça marche
                        <ChevronDown className="h-3.5 w-3.5" />
                    </a>
                </div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
            >
                <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5"
                    style={{ border: '1px solid rgba(255,255,255,0.10)' }}
                >
                    <div className="w-1 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.20)' }} />
                </motion.div>
            </motion.div>
        </section>
    )
}
