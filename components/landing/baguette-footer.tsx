'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export function BaguetteFooter() {
    return (
        <footer className="relative py-20 sm:py-28 overflow-hidden">
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
                    style={{ color: '#9DAA96', letterSpacing: '0.25em' }}
                >
                    Paris &middot; Made with love &middot; 2026
                </motion.p>

                {/* Copyright */}
                <p className="text-xs" style={{ color: '#9DAA96' }}>
                    &copy; 2026 TinyBaguette. All rights reserved.
                </p>
            </div>
        </footer>
    )
}
