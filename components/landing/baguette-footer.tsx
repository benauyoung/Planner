'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useLang } from '@/lib/landing-lang-context'
import { t } from '@/lib/landing-i18n'

export function BaguetteFooter() {
    const { lang } = useLang()

    return (
        <footer
            className="relative py-20 sm:py-28 overflow-hidden"
            style={{
                background: 'linear-gradient(180deg, #D9D3C3 0%, #C8C1AF 40%, #B8B09C 100%)',
            }}
        >
            {/* Subtle texture */}
            <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(28,36,24,0.08) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />
            {/* Top edge fade for blending */}
            <div
                className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
                style={{
                    background: 'linear-gradient(180deg, hsl(42 28% 91%) 0%, transparent 100%)',
                }}
            />

            <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
                {/* Big baguette logo */}
                <motion.div
                    initial={{ opacity: 0, y: 30, rotate: -5 }}
                    whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="mb-10"
                >
                    <Image
                        src="/Baguettepng.png"
                        alt="TinyBaguette"
                        width={500}
                        height={300}
                        unoptimized
                        className="w-[320px] sm:w-[420px] lg:w-[500px] h-auto drop-shadow-2xl"
                        priority={false}
                    />
                </motion.div>

                {/* Tagline */}
                <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-sm font-light tracking-widest uppercase mb-8"
                    style={{ color: '#5C6B57', letterSpacing: '0.25em' }}
                >
                    {t(lang, 'bfTagline')}
                </motion.p>

                {/* Copyright */}
                <p className="text-xs" style={{ color: '#6B7A65' }}>
                    {t(lang, 'bfCopyright')}
                </p>
            </div>
        </footer>
    )
}
