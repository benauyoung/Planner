'use client'

import { motion } from 'framer-motion'
import { Building2, Award, Zap, Clock, Layers, Star } from 'lucide-react'
import type { Lang } from '@/lib/landing-i18n'
import { t } from '@/lib/landing-i18n'

interface TrustBarBProps {
    lang?: Lang
}

export function TrustBarB({ lang = 'en' }: TrustBarBProps) {
    const stats = [
        { value: t(lang, 'trustStat1Value'), label: t(lang, 'trustStat1Label'), icon: Star },
        { value: t(lang, 'trustStat2Value'), label: t(lang, 'trustStat2Label'), icon: Layers },
        { value: t(lang, 'trustStat3Value'), label: t(lang, 'trustStat3Label'), icon: Clock },
        { value: t(lang, 'trustStat4Value'), label: t(lang, 'trustStat4Label'), icon: Zap },
    ]

    return (
        <section className="py-16 border-y">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Label */}
                <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-10"
                >
                    {t(lang, 'trustBarLabel')}
                </motion.p>

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
                    {stats.map((stat, i) => {
                        const Icon = stat.icon
                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.08 }}
                                className="flex flex-col items-center text-center gap-2"
                            >
                                <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center mb-1">
                                    <Icon className="h-5 w-5 text-primary" />
                                </div>
                                <div className="text-3xl font-extrabold tracking-tight">{stat.value}</div>
                                <div className="text-sm text-muted-foreground">{stat.label}</div>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-border mx-auto mb-10" />

                {/* Badges */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12"
                >
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <Building2 className="h-5 w-5" />
                        <span className="text-sm font-medium tracking-wide">{t(lang, 'trustBadge1')}</span>
                    </div>
                    <div className="hidden sm:block w-px h-5 bg-border" />
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <Award className="h-5 w-5" />
                        <span className="text-sm font-medium tracking-wide">{t(lang, 'trustBadge2')}</span>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
