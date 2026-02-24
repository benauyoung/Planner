'use client'

import { motion } from 'framer-motion'
import { Sparkles, Clock, Lock } from 'lucide-react'

const SIGNALS = [
    { icon: Sparkles, text: 'IA native' },
    { icon: Clock, text: 'En quelques minutes' },
    { icon: Lock, text: 'Toujours gratuit' },
]

export function SocialProofStrip() {
    return (
        <div className="relative border-y border-white/6 bg-white/[0.02]">
            <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
                {SIGNALS.map((s, i) => (
                    <motion.div
                        key={s.text}
                        initial={{ opacity: 0, y: 6 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center gap-2 text-white/40"
                    >
                        <s.icon className="h-3.5 w-3.5" />
                        <span className="text-xs tracking-widest uppercase font-medium">{s.text}</span>
                        {i < SIGNALS.length - 1 && (
                            <span className="hidden sm:block ml-4 sm:ml-6 h-3 w-px bg-white/15" />
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
