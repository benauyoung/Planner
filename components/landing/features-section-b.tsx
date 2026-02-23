'use client'

import { motion } from 'framer-motion'
import type { Lang } from '@/lib/landing-i18n'
import { t } from '@/lib/landing-i18n'
import { FeaturesTabs } from '@/components/landing/features-tabs'

interface FeaturesSectionBProps {
    lang?: Lang
}

export function FeaturesSectionB({ lang = 'en' }: FeaturesSectionBProps) {
    return (
        <div className="relative" style={{ background: '#050812' }}>
            {/* Top fade from hero */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#050812] to-transparent pointer-events-none z-10" />

            {/* Premium section header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-white/60 uppercase tracking-wider mb-5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        {t(lang, 'featuresSectionBadge')}
                    </div>

                    <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white">
                        {t(lang, 'featuresSectionTitle')}
                    </h2>
                    <p className="text-lg text-white/50 max-w-xl mx-auto">
                        {t(lang, 'featuresSectionSubtext')}
                    </p>
                </motion.div>
            </div>

            {/* Full interactive demo — rendered on dark background via CSS override */}
            <div className="features-dark-override">
                <FeaturesTabs />
            </div>

            {/* Bottom fade to background */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-background pointer-events-none" />
        </div>
    )
}
