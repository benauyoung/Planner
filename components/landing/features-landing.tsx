'use client'

import { motion } from 'framer-motion'
import { Map, Palette, Bot, Plug } from 'lucide-react'

const FEATURES = [
  {
    icon: Map,
    title: 'Visual Planning',
    description:
      'Interactive canvas with goals, subgoals, features, and tasks, all connected in a living tree.',
  },
  {
    icon: Palette,
    title: 'Beautiful Design',
    description:
      'Auto-generated project blueprints that look good enough to share with stakeholders.',
  },
  {
    icon: Bot,
    title: 'AI Agents',
    description:
      'Smart agents break down your idea into actionable steps, estimate scope, and suggest features.',
  },
  {
    icon: Plug,
    title: 'Integrations',
    description:
      'Export to Jira, Linear, Notion, or GitHub. Your plan goes where your team already works.',
  },
]

export function FeaturesLanding() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl text-foreground mb-4">
            Big Ideas. <span className="text-[hsl(25,60%,58%)]">TinyBaguette.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Plan your project in minutes, not weeks.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -6 }}
              className="bg-card border border-border rounded-2xl p-6 group cursor-default"
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-4 group-hover:bg-[hsl(25,60%,58%)]/10 transition-colors">
                <f.icon className="w-5 h-5 text-[hsl(150,20%,32%)] group-hover:text-[hsl(25,60%,58%)] transition-colors" />
              </div>
              <h3 className="text-lg text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
