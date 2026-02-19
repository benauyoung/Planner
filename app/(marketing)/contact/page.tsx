'use client'

import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'

export default function ContactPage() {
  return (
    <section className="relative min-h-screen pt-32 pb-20 flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 80% 50% at 50% 40%, hsl(var(--primary) / 0.06) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative max-w-md mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Mail className="h-8 w-8 text-primary" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Get in Touch
          </h1>

          <p className="text-lg text-muted-foreground mb-8">
            Have a question, feedback, or just want to say hi? Drop us an email.
          </p>

          <a
            href="mailto:hello@tinybaguette.com"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground text-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Mail className="h-5 w-5" />
            hello@tinybaguette.com
          </a>
        </motion.div>
      </div>
    </section>
  )
}
