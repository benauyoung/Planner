'use client'

import { motion } from 'framer-motion'
import { Sparkles, Clock, Heart } from 'lucide-react'

const SIGNALS = [
    { icon: Sparkles, text: 'IA native' },
    { icon: Heart, text: 'Pensé pour vous' },
    { icon: Clock, text: 'En quelques minutes' },
]

export function SocialProofStrip() {
    return (
        <div style={{ borderTop: '1px solid rgba(139,175,138,0.20)', borderBottom: '1px solid rgba(139,175,138,0.20)', background: 'rgba(230,180,175,0.08)' }}>
            <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
                {SIGNALS.map((s, i) => (
                    <motion.div
                        key={s.text}
                        initial={{ opacity: 0, y: 6 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center gap-2"
                        style={{ color: '#5C6B57' }}
                    >
                        <s.icon className="h-3.5 w-3.5" style={{ color: '#8BAF8A' }} />
                        <span className="text-xs tracking-widest uppercase font-medium">{s.text}</span>
                        {i < SIGNALS.length - 1 && (
                            <span className="hidden sm:block ml-4 sm:ml-6 h-3 w-px" style={{ background: 'rgba(139,175,138,0.35)' }} />
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
