'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Check } from 'lucide-react'
import { track } from '@vercel/analytics'
import Image from 'next/image'

export function CtaLanding() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'cta-landing' }),
      })
      if (!res.ok) throw new Error('Failed')
      track('waitlist_signup', { source: 'cta-landing' })
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="cta" className="py-24 bg-[hsl(150,25%,18%)]">
      <div className="container max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-lg mx-auto"
        >
          <h2 className="text-4xl md:text-5xl text-[hsl(40,33%,96%)] mb-4">
            Ready to plan?
          </h2>
          <p className="text-[hsl(40,33%,96%)]/70 mb-8">
            Join the waitlist or start building your first project plan for free.
          </p>

          {!submitted ? (
            <>
              <div className="flex gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError('') }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="your@email.com"
                  className="flex-1 bg-[hsl(40,33%,96%)]/10 border border-[hsl(40,33%,96%)]/20 rounded-lg px-4 py-3 text-sm text-[hsl(40,33%,96%)] placeholder:text-[hsl(40,33%,96%)]/40 outline-none focus:border-[hsl(25,60%,58%)] transition-colors"
                />
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-[hsl(25,60%,58%)] text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-[hsl(20,50%,42%)] transition-colors shrink-0 disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Notify Me'
                  )}
                </button>
              </div>
              {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
            </>
          ) : (
            <div className="flex items-center justify-center gap-2 text-[hsl(40,33%,96%)]">
              <Check className="h-5 w-5 text-[hsl(25,60%,58%)]" />
              <span className="text-sm font-medium">You&apos;re on the list! We&apos;ll be in touch.</span>
            </div>
          )}
        </motion.div>

        {/* Giant Baguette */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotate: -5 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 flex justify-center"
        >
          <Image
            src="/Baguettepng.png"
            alt="TinyBaguette"
            width={400}
            height={400}
            className="drop-shadow-2xl"
          />
        </motion.div>
      </div>
    </section>
  )
}
