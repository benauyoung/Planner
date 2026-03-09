'use client'

import { useState, useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { track } from '@vercel/analytics'
import Image from 'next/image'

const SUGGESTIONS = ['Online Boutique', 'Fitness App', 'Recipe Platform', 'Portfolio Site', 'Learning Hub']

const HEADLINE_WORDS = ['Plan', 'it.', 'Build', 'it.', 'Ship', 'it.']

export function HeroLanding() {
  const [prompt, setPrompt] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleBuild() {
    if (!prompt.trim()) return
    track('hero_plan_click', { prompt: prompt.slice(0, 100) })
    const el = document.getElementById('planning-playground')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleBuild()
    }
  }

  return (
    <section className="relative min-h-screen flex items-end pb-20 pt-16 overflow-hidden">
      {/* Full-bleed cinematic background */}
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.8, ease: 'easeOut' }}
        className="absolute inset-0"
      >
        <Image
          src="/hero-bg.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
      </motion.div>

      {/* Dark cinematic overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[hsl(30,10%,15%)]/90 via-[hsl(30,10%,15%)]/50 to-[hsl(30,10%,15%)]/20" />

      {/* Film grain texture */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
        }}
      />

      <div className="container max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-8"
          >
            <span className="text-xs font-medium text-[hsl(42,60%,72%)]">
              ✦ Plan first, build with confidence
            </span>
          </motion.div>

          {/* Giant staggered headline */}
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 mb-6">
            {HEADLINE_WORDS.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + i * 0.1 }}
                className={`text-6xl md:text-8xl lg:text-9xl leading-[1] ${
                  i % 2 === 0
                    ? 'text-[hsl(40,33%,96%)]'
                    : 'italic text-[hsl(42,60%,72%)]'
                }`}
              >
                {word}
              </motion.span>
            ))}
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.4 }}
            className="text-lg md:text-xl text-[hsl(40,33%,96%)]/70 max-w-2xl mx-auto mb-10"
          >
            Every great project starts with a great plan. Describe your idea and
            get a structured roadmap before you write a single line of code.
          </motion.p>

          {/* Input Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-[hsl(40,30%,98%)]/95 backdrop-blur-md rounded-2xl shadow-2xl border border-[hsl(35,20%,85%)]/50 p-5">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="A recipe sharing platform with AI meal planning..."
                className="w-full bg-transparent resize-none border-none outline-none text-[hsl(30,10%,15%)] placeholder:text-[hsl(30,10%,45%)]/60 min-h-[80px] text-sm"
              />
              <div className="flex items-center justify-between mt-2 pt-3 border-t border-[hsl(35,20%,85%)]">
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button
                      key={s}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 1.7 + i * 0.05 }}
                      onClick={() => {
                        setPrompt(s)
                        textareaRef.current?.focus()
                      }}
                      className="text-xs bg-[hsl(40,20%,90%)] hover:bg-[hsl(38,25%,88%)] text-[hsl(30,10%,45%)] rounded-full px-3 py-1 transition-colors"
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
                <button
                  onClick={handleBuild}
                  disabled={!prompt.trim()}
                  className="bg-[hsl(150,20%,32%)] text-[hsl(40,33%,96%)] rounded-lg px-5 py-2 text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5 shrink-0 ml-3 disabled:opacity-30"
                >
                  Plan <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="text-xs text-[hsl(40,33%,96%)]/40 mt-3"
            >
              <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">Enter</kbd> to plan ·{' '}
              <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">Shift+Enter</kbd> for new line
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
