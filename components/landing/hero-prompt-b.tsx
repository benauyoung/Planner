'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Sparkles, Loader2, Mail, Check } from 'lucide-react'
import type { Lang } from '@/lib/landing-i18n'
import { t } from '@/lib/landing-i18n'

const PLACEHOLDER_IDEAS_EN = [
    'A music festival app with live lineups and friend meetups...',
    'A fitness challenge app where friends compete on goals...',
    'A recipe app that generates meal plans from your fridge...',
    'A travel planner that builds custom itineraries with AI...',
]

const PLACEHOLDER_IDEAS_FR = [
    'Une app de festival de musique avec lineups et retrouvailles...',
    'Une app fitness où des amis se défient sur leurs objectifs...',
    'Une app de recettes qui génère des menus depuis votre frigo...',
    'Un planificateur de voyage avec itinéraires IA personnalisés...',
]

const EXAMPLE_CHIPS_EN = ['Festival App', 'Fitness Tracker', 'Travel Planner', 'Recipe App', 'Social Platform']
const EXAMPLE_CHIPS_FR = ['App Festival', 'Suivi Fitness', 'Planificateur Voyage', 'App Recettes', 'Réseau Social']

interface HeroPromptBProps {
    lang?: Lang
}

export function HeroPromptB({ lang = 'en' }: HeroPromptBProps) {
    const [prompt, setPrompt] = useState('')
    const [placeholderIdx, setPlaceholderIdx] = useState(0)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const placeholders = lang === 'fr' ? PLACEHOLDER_IDEAS_FR : PLACEHOLDER_IDEAS_EN
    const chips = lang === 'fr' ? EXAMPLE_CHIPS_FR : EXAMPLE_CHIPS_EN

    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIdx((prev) => (prev + 1) % placeholders.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [placeholders.length])

    function handleChipClick(chip: string) {
        setPrompt(
            lang === 'fr'
                ? `Créer un ${chip.toLowerCase()} avec authentification, tableau de bord et fonctionnalités CRUD.`
                : `Build a ${chip.toLowerCase()} with user authentication, a dashboard, and core CRUD functionality.`
        )
        textareaRef.current?.focus()
    }

    return (
        <section id="hero-prompt" className="relative py-24 sm:py-32">
            {/* Background accent */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(ellipse 70% 50% at 50% 40%, hsl(var(--primary) / 0.05) 0%, transparent 70%)',
                }}
            />
            <div
                className="absolute inset-0 opacity-[0.025] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                }}
            />

            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-10"
                >
                    <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
                        {t(lang, 'heroPromptHeadline')}{' '}
                        <span className="text-primary">{t(lang, 'heroPromptHeadlineAccent')}</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                        {t(lang, 'heroPromptSubtext')}
                    </p>
                </motion.div>

                {/* Prompt box */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="max-w-3xl mx-auto"
                >
                    <div className="relative rounded-2xl border bg-background/80 backdrop-blur-sm shadow-2xl shadow-primary/5 overflow-hidden">
                        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-primary/10 pointer-events-none" />
                        <div className="p-4 sm:p-6">
                            <textarea
                                ref={textareaRef}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={placeholders[placeholderIdx]}
                                rows={4}
                                className="w-full bg-transparent text-base sm:text-lg resize-none focus:outline-none placeholder:text-muted-foreground/50 leading-relaxed"
                            />
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                                <div className="flex items-center gap-2 flex-wrap">
                                    {chips.map((chip) => (
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
                                    disabled={!prompt.trim()}
                                    className="shrink-0 ml-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
                                >
                                    {lang === 'fr' ? 'Générer' : 'Build'}
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <p className="text-center text-xs text-muted-foreground/60 mt-4">
                        {lang === 'fr'
                            ? <>Appuyez sur <kbd className="px-1.5 py-0.5 rounded border bg-muted/50 text-[10px] font-mono">Entrée</kbd> pour générer</>
                            : <>Press <kbd className="px-1.5 py-0.5 rounded border bg-muted/50 text-[10px] font-mono">Enter</kbd> to build</>
                        }
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
