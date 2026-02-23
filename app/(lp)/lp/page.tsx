'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Lang } from '@/lib/landing-i18n'
import { HeroSection } from '@/components/landing/hero-section'
import { FeaturesSectionB } from '@/components/landing/features-section-b'
import { HeroPromptB } from '@/components/landing/hero-prompt-b'

function LpContent() {
    const searchParams = useSearchParams()
    const langParam = searchParams.get('lang')
    const lang: Lang = langParam === 'fr' ? 'fr' : 'en'

    return (
        <>
            <HeroSection lang={lang} />
            <FeaturesSectionB lang={lang} />
            <HeroPromptB lang={lang} />
        </>
    )
}

export default function LpPage() {
    return (
        <Suspense>
            <LpContent />
        </Suspense>
    )
}
