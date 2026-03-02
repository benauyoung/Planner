'use client'

import { useState, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Loader2, Check, ChevronDown } from 'lucide-react'
import { addEmailToWaitlist } from '@/services/firestore'
import { track } from '@vercel/analytics'

// ─── French editorial palette ────────────────────────────────
// Vert d'eau · celadon · cream · parchment
const C = {
    bg: '#F4F0E6',              // warm parchment / cream
    surface: '#EDE9DE',         // slightly darker cream for blobs
    sage: '#8BAF8A',            // vert d'eau / celadon
    sageDark: '#4A7459',        // deeper sage for button
    sageLight: '#B8D4C0',       // pale mint
    text: '#1C2418',            // near-black with green undertone
    subtext: '#5C6B57',         // muted sage-gray
    muted: '#9DAA96',           // very muted
    border: 'rgba(139,175,138,0.35)',
}

// ─── Email capture ───────────────────────────────────────────
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
            <div
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-medium"
                style={{ background: 'rgba(74,116,89,0.10)', border: '1px solid rgba(74,116,89,0.30)', color: C.sageDark }}
            >
                <Check className="h-4 w-4" />
                <span>You&apos;re on the list!</span>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md">
            <div className="flex gap-2">
                <input
                    type="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle') }}
                    className="flex-1 px-4 py-3.5 rounded-xl text-sm focus:outline-none transition-all"
                    style={{
                        background: 'rgba(255,255,255,0.70)',
                        border: status === 'error' ? '1px solid rgba(220,80,60,0.5)' : `1px solid ${C.border}`,
                        color: C.text,
                        boxShadow: '0 1px 4px rgba(139,175,138,0.10)',
                    }}
                    onFocus={e => (e.target.style.border = `1px solid ${C.sage}`)}
                    onBlur={e => (e.target.style.border = status === 'error' ? '1px solid rgba(220,80,60,0.5)' : `1px solid ${C.border}`)}
                />
                <button
                    type="submit"
                    disabled={status === 'loading' || !email.trim()}
                    className="px-5 py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0 flex items-center gap-2"
                    style={{
                        background: `linear-gradient(135deg, ${C.sageDark} 0%, #3a5e47 100%)`,
                        boxShadow: '0 2px 12px rgba(74,116,89,0.30)',
                    }}
                >
                    {status === 'loading' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>Join <ArrowRight className="h-3.5 w-3.5" /></>
                    )}
                </button>
            </div>
            {status === 'error' && (
                <p className="text-xs mt-2 text-center" style={{ color: 'rgb(180,60,60)' }}>Invalid email — please try again.</p>
            )}
            <p className="text-[11px] mt-2.5 text-center tracking-wide" style={{ color: C.muted }}>
                Free &middot; No credit card &middot; Join 500+ creators
            </p>
        </form>
    )
}

// ─── Background ───────────────────────────────────────────────
function LightBg() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Parchment base */}
            <div className="absolute inset-0" style={{ background: C.bg }} />

            {/* Soft sage blob — top left */}
            <motion.div
                className="absolute rounded-full"
                style={{
                    top: -120, left: -120, width: 600, height: 600,
                    background: `radial-gradient(circle, rgba(184,212,192,0.40) 0%, transparent 70%)`,
                    filter: 'blur(80px)',
                }}
                animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
                transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Blush/rose blob — top right */}
            <motion.div
                className="absolute rounded-full"
                style={{
                    top: -60, right: -60, width: 480, height: 480,
                    background: `radial-gradient(circle, rgba(226,168,162,0.28) 0%, transparent 70%)`,
                    filter: 'blur(90px)',
                }}
                animate={{ x: [0, -25, 0], y: [0, 35, 0] }}
                transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            />

            {/* Sage blob — bottom right */}
            <motion.div
                className="absolute rounded-full"
                style={{
                    bottom: -80, right: -80, width: 500, height: 500,
                    background: `radial-gradient(circle, rgba(139,175,138,0.25) 0%, transparent 70%)`,
                    filter: 'blur(100px)',
                }}
                animate={{ x: [0, -30, 0], y: [0, -25, 0] }}
                transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
            />

            {/* Blush blob — bottom left */}
            <motion.div
                className="absolute rounded-full"
                style={{
                    bottom: -20, left: '10%', width: 350, height: 350,
                    background: `radial-gradient(circle, rgba(220,165,158,0.18) 0%, transparent 70%)`,
                    filter: 'blur(70px)',
                }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 7 }}
            />

            {/* Fine linen-texture dots */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(139,175,138,0.12) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />

            {/* Thin sage horizontal rule under nav */}
            <div
                className="absolute left-0 right-0"
                style={{ top: 64, height: 1, background: 'rgba(139,175,138,0.20)' }}
            />
        </div>
    )
}

// ─── Main hero ────────────────────────────────────────────────
export function HeroConversion() {
    const ref = useRef<HTMLElement>(null)
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
    const opacity = useTransform(scrollYProgress, [0, 0.45], [1, 0])
    const y = useTransform(scrollYProgress, [0, 0.45], [0, -30])

    return (
        <section
            ref={ref}
            className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16"
            style={{ background: C.bg }}
        >
            <LightBg />

            <motion.div
                style={{ opacity, y }}
                className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center"
            >
                {/* Editorial eyebrow */}
                <div className="flex items-center gap-3 justify-center mb-7">
                    <div className="h-px w-8" style={{ background: C.sage + '60' }} />
                    <span
                        className="font-light uppercase"
                        style={{ fontSize: 10, color: C.sage, letterSpacing: '0.3em' }}
                    >
                        Paris &middot; Made for you &middot; 2026
                    </span>
                    <div className="h-px w-8" style={{ background: C.sage + '60' }} />
                </div>

                {/* Headline */}
                <h1
                    className="font-extrabold tracking-tight leading-[1.04] mb-5"
                    style={{ fontSize: 'clamp(3rem, 9vw, 7rem)', color: C.text }}
                >
                    <span className="block">Big ideas.</span>
                    <span
                        className="block italic"
                        style={{
                            background: `linear-gradient(110deg, ${C.sageDark} 0%, ${C.sage} 50%, ${C.sageLight} 100%)`,
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
                    style={{ color: C.subtext }}
                >
                    Your idea deserves to exist. Build your store,
                    portfolio, or app in minutes &mdash; no coding needed.
                </p>

                {/* Email capture */}
                <HeroEmailCapture />

                {/* See how it works */}
                <div className="mt-7">
                    <a
                        href="#features"
                        className="inline-flex items-center gap-1.5 transition-colors"
                        style={{ color: C.muted, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500 }}
                        onMouseEnter={e => (e.currentTarget.style.color = C.sageDark)}
                        onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
                    >
                        See how it works
                        <ChevronDown className="h-3.5 w-3.5" />
                    </a>
                </div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
            >
                <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5"
                    style={{ border: `1px solid ${C.border}` }}
                >
                    <div className="w-1 h-2 rounded-full" style={{ background: C.sage + '50' }} />
                </motion.div>
            </motion.div>
        </section>
    )
}
