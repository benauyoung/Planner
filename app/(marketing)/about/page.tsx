'use client'

import { motion } from 'framer-motion'

export default function AboutPage() {
  return (
    <section className="relative min-h-screen pt-32 pb-20">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 80% 50% at 50% 30%, hsl(var(--primary) / 0.06) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-8">
            About <span className="text-primary">TinyBaguette</span>
          </h1>

          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              Let&apos;s be real. Nobody actually likes Jira. We built TinyBaguette because we were
              tired of staring at empty Notion pages and complex Gantt charts while our AI agents sat
              there waiting for instructions.
            </p>

            <p>
              TinyBaguette is the only &ldquo;pre-processor&rdquo; for your workflow. We take your
              half-baked ideas, toss them into our AI oven, and hand you back a perfectly sliced
              implementation plan. After it&apos;s built, we help you refine your product with an
              overview of the entire project and real-time AI edits. The best part? Its code is
              structured perfectly, and easy for AI to understand. It&apos;s built for the builders
              who want to skip the meetings and go straight to the &ldquo;Aha!&rdquo; moment.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-12 rounded-2xl border bg-muted/30 p-8"
          >
            <h2 className="text-2xl font-bold mb-3">Our Philosophy</h2>
            <p className="text-xl text-muted-foreground font-medium">
              Less bloat. More bread. Just keep shipping.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
