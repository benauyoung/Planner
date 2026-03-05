'use client'

import { motion } from 'framer-motion'
import { Sparkles, Clock, Heart } from 'lucide-react'
import { useLang } from '@/lib/landing-lang-context'
import { t } from '@/lib/landing-i18n'

export function SocialProofStrip() {
    const { lang } = useLang()

    const SIGNALS = [
        { icon: Sparkles, key: 'spAiNative' as const },
        { icon: Heart, key: 'spBuiltForYou' as const },
        { icon: Clock, key: 'spInMinutes' as const },
    ]

    return (
        <div
            className="relative overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #3B5440 0%, #4A6B52 50%, #3D5C45 100%)',
            }}
        >
            {/* Subtle texture overlay */}
            <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                }}
            />
            <div className="relative max-w-3xl mx-auto px-6 py-5 flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
                {SIGNALS.map((s, i) => (
                    <motion.div
                        key={s.key}
                        initial={{ opacity: 0, y: 6 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center gap-2"
                    >
                        <s.icon className="h-3.5 w-3.5 text-emerald-300/80" />
                        <span className="text-xs tracking-widest uppercase font-medium text-white/85">{t(lang, s.key)}</span>
                        {i < SIGNALS.length - 1 && (
                            <span className="hidden sm:block ml-4 sm:ml-6 h-3 w-px bg-white/20" />
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
