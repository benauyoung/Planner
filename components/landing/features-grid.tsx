'use client'

import { motion } from 'framer-motion'
import {
  Network,
  BotMessageSquare,
  FileImage,
  Zap,
  Download,
  LayoutTemplate,
} from 'lucide-react'

const features = [
  {
    icon: Network,
    title: 'Visual DAG Canvas',
    description: 'Infinite canvas with 7 node types. See your entire project as an interactive graph.',
  },
  {
    icon: BotMessageSquare,
    title: 'AI Co-Pilot',
    description: 'Gemini-powered planning chat that understands your project hierarchy and context.',
  },
  {
    icon: FileImage,
    title: 'Rich Content',
    description: 'Attach images, mood boards, PRDs, and IDE prompts to any node.',
  },
  {
    icon: Zap,
    title: 'Dependency Tracking',
    description: 'See the blast radius of any change. Typed edges show blocks and dependencies.',
  },
  {
    icon: Download,
    title: 'Export Anywhere',
    description: 'Markdown, JSON, .cursorrules, CLAUDE.md. Straight to your IDE or clipboard.',
  },
  {
    icon: LayoutTemplate,
    title: 'Templates',
    description: 'Start from pre-built project blueprints. Auth systems, APIs, landing pages, and more.',
  },
]

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need to Plan</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A complete visual planning toolkit that bridges the gap between thinking and building.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group p-6 rounded-xl border bg-background hover:shadow-lg hover:border-primary/30 transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
