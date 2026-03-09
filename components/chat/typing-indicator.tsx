'use client'

import { motion } from 'framer-motion'
import { Bot } from 'lucide-react'

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="absolute inset-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 blur-[6px] opacity-40" />
        <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center ring-2 ring-offset-2 ring-offset-background ring-violet-500/30">
          <Bot className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* Bubble */}
      <div className="bg-gradient-to-br from-secondary/80 to-secondary border border-border/50 rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-medium">Thinking</span>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
