'use client'

import { motion } from 'framer-motion'
import { Compass } from 'lucide-react'

const floatingNodes = [
  { x: '15%', y: '25%', size: 48, color: 'var(--node-goal)', delay: 0 },
  { x: '75%', y: '20%', size: 36, color: 'var(--node-subgoal)', delay: 0.3 },
  { x: '30%', y: '70%', size: 32, color: 'var(--node-feature)', delay: 0.5 },
  { x: '65%', y: '65%', size: 40, color: 'var(--node-task)', delay: 0.2 },
  { x: '85%', y: '45%', size: 28, color: 'var(--node-notes)', delay: 0.7 },
  { x: '10%', y: '50%', size: 30, color: 'var(--node-moodboard)', delay: 0.4 },
]

export function DashboardLoader() {
  return (
    <div className="h-full flex items-center justify-center relative overflow-hidden">
      {/* Floating background nodes */}
      {floatingNodes.map((node, i) => (
        <motion.div
          key={i}
          className="absolute rounded-lg border opacity-[0.08]"
          style={{
            left: node.x,
            top: node.y,
            width: node.size,
            height: node.size * 0.6,
            borderColor: `hsl(${node.color})`,
            backgroundColor: `hsl(${node.color} / 0.15)`,
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: [0, 0.08, 0.04, 0.08],
            scale: [0.5, 1, 0.95, 1],
            y: [0, -8, 0, 8, 0],
          }}
          transition={{
            duration: 4,
            delay: node.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Dashed connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06]">
        <motion.line
          x1="15%" y1="25%" x2="75%" y2="20%"
          stroke="hsl(var(--foreground))"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.5, ease: 'easeOut' }}
        />
        <motion.line
          x1="30%" y1="70%" x2="65%" y2="65%"
          stroke="hsl(var(--foreground))"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.8, ease: 'easeOut' }}
        />
        <motion.line
          x1="75%" y1="20%" x2="85%" y2="45%"
          stroke="hsl(var(--foreground))"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 1.1, ease: 'easeOut' }}
        />
      </svg>

      {/* Center content */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated compass */}
        <motion.div
          className="relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
          <div className="relative w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Compass className="h-8 w-8 text-primary" />
          </div>
        </motion.div>

        {/* Text */}
        <div className="text-center space-y-2">
          <motion.h2
            className="text-lg font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Loading your workspace
          </motion.h2>
          <motion.div
            className="flex items-center gap-1 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{
                  duration: 1.2,
                  delay: i * 0.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
