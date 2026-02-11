'use client'

import { motion } from 'framer-motion'
import { Building2, Award } from 'lucide-react'

export function TrustBar() {
  return (
    <section className="py-10 border-y bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16"
        >
          <div className="flex items-center gap-3 text-muted-foreground">
            <Building2 className="h-5 w-5" />
            <span className="text-sm font-medium tracking-wide uppercase">Station 8 Developed</span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-border" />
          <div className="flex items-center gap-3 text-muted-foreground">
            <Award className="h-5 w-5" />
            <span className="text-sm font-medium tracking-wide uppercase">Pioneers VC Approved</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
