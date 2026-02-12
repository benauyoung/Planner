'use client'

import { motion } from 'framer-motion'
import { MessageSquareText, Sparkles, MousePointerClick } from 'lucide-react'

const steps = [
  {
    icon: MessageSquareText,
    title: 'Describe your idea',
    description: 'Write a single prompt in plain English. Tell us what you want to build. No templates, no forms.',
    accent: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Sparkles,
    title: 'AI generates your plan',
    description: 'Gemini AI breaks your idea into goals, features, and tasks, laid out as a visual DAG on an infinite canvas.',
    accent: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    icon: MousePointerClick,
    title: 'Refine & build',
    description: 'Drag nodes, add dependencies, attach PRDs and images. Export to Cursor, VS Code, or Markdown when ready.',
    accent: 'text-green-500',
    bg: 'bg-green-500/10',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From idea to actionable plan in under a minute. No setup, no learning curve.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative text-center"
            >
              {/* Step number connector */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] border-t-2 border-dashed border-border" />
              )}

              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${step.bg} mb-6`}>
                <step.icon className={`h-7 w-7 ${step.accent}`} />
              </div>

              <div className="mb-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Step {i + 1}
              </div>

              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
