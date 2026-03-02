'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const FAQS = [
  {
    q: 'What is TinyBaguette?',
    a: 'TinyBaguette is an in-browser coding and planning assistant currently in development. It is the first tool that lets you vibe code an AI for your personal website. No setup, no terminal, just you and your ideas.',
  },
  {
    q: 'What makes it different from other AI tools?',
    a: 'TinyBaguette uses a new technique of AI architecture that produces better, more context-aware results than standard approaches. Everything runs in the browser. No installs, no infrastructure to manage.',
  },
  {
    q: 'When will it be available?',
    a: 'TinyBaguette is an active development project. Join the waitlist and you will be among the first to get access when we launch.',
  },
  {
    q: 'Do I need to know how to code?',
    a: 'No. The whole point is that you should not have to. Describe what you want, and TinyBaguette handles the planning, building, and shipping of your personal website with AI.',
  },
  {
    q: 'What can I build with it?',
    a: 'TinyBaguette is focused on personal websites and web projects. If you have an idea for a site, a portfolio, or a small web app, TinyBaguette is built to help you ship it fast.',
  },
  {
    q: 'Is it free?',
    a: 'Pricing details will be announced closer to launch. Join the waitlist to stay updated and lock in early access.',
  },
]

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">Frequently asked questions</h2>
          <p className="text-muted-foreground text-lg">Everything you need to know before you start planning.</p>
        </motion.div>

        <div className="divide-y border rounded-xl overflow-hidden">
          {FAQS.map((faq, i) => {
            const isOpen = open === i
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <button
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-muted/40 transition-colors"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-${i}`}
                >
                  <span className="font-medium text-base">{faq.q}</span>
                  {isOpen ? (
                    <Minus className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-${i}`}
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-muted-foreground leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
