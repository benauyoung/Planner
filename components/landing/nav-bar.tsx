'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Menu, X, ArrowRight, Loader2, Check } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '@/lib/landing-lang-context'
import { t } from '@/lib/landing-i18n'

export function LandingNavBar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { lang, toggleLang } = useLang()
  const [showEmailCapture, setShowEmailCapture] = useState(false)
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close popover on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowEmailCapture(false)
      }
    }
    if (showEmailCapture) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showEmailCapture])

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) {
      setError(t(lang, 'navEmailError'))
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'nav-get-started' }),
      })
      if (!res.ok) throw new Error('Failed')
      setSubmitted(true)
    } catch {
      setError(t(lang, 'navSomethingWrong'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-background/80 backdrop-blur-md border-b shadow-sm'
        : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="TinyBaguette" width={28} height={28} className="rounded" />
            <span className="font-bold text-xl">TinyBaguette</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t(lang, 'navFeatures')}
            </a>
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t(lang, 'navLogin')}
            </Link>

            {/* Get Started + Email Capture Popover */}
            <div className="relative" ref={popoverRef}>
              <button
                onClick={() => {
                  setShowEmailCapture(!showEmailCapture)
                  setMobileOpen(false)
                }}
                className="px-4 py-2 rounded-lg bg-[#4A7459] text-white text-sm font-medium hover:bg-[#3a5e47] transition-colors"
              >
                {t(lang, 'navGetStarted')}
              </button>

              <AnimatePresence>
                {showEmailCapture && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-[#8BAF8A]/30 bg-white shadow-2xl shadow-black/10 p-5"
                  >
                    {!submitted ? (
                      <>
                        <p className="text-sm font-semibold text-[hsl(103,18%,12%)] mb-1">{t(lang, 'navComingSoon')}</p>
                        <p className="text-xs text-[hsl(100,10%,38%)] mb-4">
                          {t(lang, 'navEmailPrompt')}
                        </p>
                        <input
                          type="email"
                          placeholder="you@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                          className="w-full px-3 py-2 rounded-lg border border-[hsl(40,20%,80%)] bg-[hsl(42,35%,97%)] text-sm text-[hsl(103,18%,12%)] placeholder:text-[hsl(100,10%,38%)]/40 focus:outline-none focus:ring-2 focus:ring-[#4A7459]/30 mb-2"
                          autoFocus
                        />
                        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
                        <button
                          onClick={handleSubmit}
                          disabled={submitting}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#4A7459] text-white text-sm font-semibold hover:bg-[#3a5e47] disabled:opacity-60 transition-colors"
                        >
                          {submitting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <ArrowRight className="h-3.5 w-3.5" />
                          )}
                          {submitting ? t(lang, 'navJoining') : t(lang, 'navNotifyMe')}
                        </button>
                        <p className="text-[10px] text-[hsl(100,10%,38%)]/50 mt-2 text-center">
                          {t(lang, 'navNoSpam')}
                        </p>
                      </>
                    ) : (
                      <div className="text-center py-2">
                        <div className="w-10 h-10 rounded-full bg-[#4A7459]/10 flex items-center justify-center mx-auto mb-3">
                          <Check className="h-5 w-5 text-[#4A7459]" />
                        </div>
                        <p className="text-sm font-semibold text-[hsl(103,18%,12%)] mb-1">{t(lang, 'navOnList')}</p>
                        <p className="text-xs text-[hsl(100,10%,38%)]">
                          {t(lang, 'navWillNotify')}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={toggleLang}
              className="ml-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide text-muted-foreground hover:text-foreground hover:bg-accent transition-colors border border-border"
              title={lang === 'en' ? 'Switch to French' : 'Switch to English'}
            >
              {lang === 'en' ? t(lang, 'switchToFr') : t(lang, 'switchToEn')}
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-md border-b overflow-hidden"
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

              {/* Mobile email capture */}
              {!submitted ? (
                <div className="space-y-2">
                  <p className="text-xs text-[hsl(100,10%,38%)]">{t(lang, 'navMobileComingSoon')}</p>
                  <input
                    type="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    className="w-full px-3 py-2 rounded-lg border border-[hsl(40,20%,80%)] bg-[hsl(42,35%,97%)] text-sm text-[hsl(103,18%,12%)] placeholder:text-[hsl(100,10%,38%)]/40 focus:outline-none focus:ring-2 focus:ring-[#4A7459]/30"
                  />
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="block w-full text-center px-4 py-2 rounded-lg bg-[#4A7459] text-white text-sm font-medium hover:bg-[#3a5e47] disabled:opacity-60 transition-colors"
                  >
                    {submitting ? t(lang, 'navJoining') : t(lang, 'navNotifyMe')}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4A7459]/10 text-[#4A7459] text-sm font-medium">
                  <Check className="h-4 w-4" />
                  {t(lang, 'navOnList')}
                </div>
              )}

              <button
                onClick={toggleLang}
                className="block w-full text-center px-4 py-2 rounded-lg text-xs font-semibold tracking-wide text-muted-foreground hover:text-foreground hover:bg-accent transition-colors border border-border"
              >
                {lang === 'en' ? t(lang, 'switchToFr') : t(lang, 'switchToEn')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
