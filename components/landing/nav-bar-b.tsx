'use client'

import { Suspense } from 'react'
import { useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Lang } from '@/lib/landing-i18n'
import { t } from '@/lib/landing-i18n'

// ─── Language switcher ────────────────────────────────────────

function LangSwitcher({ lang, currentPath }: { lang: Lang; currentPath: string }) {
    const otherLang: Lang = lang === 'en' ? 'fr' : 'en'
    const href = `${currentPath}?lang=${otherLang}`
    return (
        <Link
            href={href}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-white/15 bg-white/5 text-xs font-semibold text-white/60 hover:text-white hover:border-white/30 transition-all"
        >
            <span className="text-[10px]">{lang === 'en' ? '🇫🇷' : '🇬🇧'}</span>
            {lang === 'en' ? 'FR' : 'EN'}
        </Link>
    )
}

// ─── Navbar inner (reads search params) ───────────────────────

function NavBarInner() {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const langParam = searchParams.get('lang')
    const lang: Lang = langParam === 'fr' ? 'fr' : 'en'
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? 'bg-background/80 backdrop-blur-xl border-b border-white/10 shadow-sm'
                    : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/lp" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <Image src="/logo.png" alt="TinyBaguette" width={28} height={28} className="rounded" />
                        <span className={`font-bold text-xl ${scrolled ? '' : 'text-white'}`}>TinyBaguette</span>
                    </Link>

                    {/* Desktop links */}
                    <div className="hidden md:flex items-center gap-5">
                        <a
                            href="#features"
                            className={`text-sm transition-colors ${scrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/60 hover:text-white'}`}
                        >
                            {t(lang, 'navFeatures')}
                        </a>
                        <Link
                            href="/login"
                            className={`text-sm transition-colors ${scrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/60 hover:text-white'}`}
                        >
                            {t(lang, 'navLogin')}
                        </Link>
                        <LangSwitcher lang={lang} currentPath={pathname} />
                        <Link
                            href="/login"
                            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                            style={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                                boxShadow: '0 2px 12px rgba(99,102,241,0.35)',
                            }}
                        >
                            {t(lang, 'navGetStarted')}
                        </Link>
                    </div>

                    {/* Mobile toggle */}
                    <div className="md:hidden flex items-center gap-3">
                        <LangSwitcher lang={lang} currentPath={pathname} />
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className={`p-2 rounded-md transition-colors ${scrolled ? 'hover:bg-accent' : 'hover:bg-white/10 text-white'}`}
                        >
                            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-background/95 backdrop-blur-xl border-b overflow-hidden"
                    >
                        <div className="px-4 py-4 space-y-3">
                            <a
                                href="#features"
                                onClick={() => setMobileOpen(false)}
                                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {t(lang, 'navFeatures')}
                            </a>
                            <Link
                                href="/login"
                                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {t(lang, 'navLogin')}
                            </Link>
                            <Link
                                href="/login"
                                onClick={() => setMobileOpen(false)}
                                className="block w-full text-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                            >
                                {t(lang, 'navGetStarted')}
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}

export function NavBarB() {
    return (
        <Suspense>
            <NavBarInner />
        </Suspense>
    )
}
