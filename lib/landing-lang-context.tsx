'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Lang } from './landing-i18n'

interface LangContextValue {
  lang: Lang
  toggleLang: () => void
}

const LangContext = createContext<LangContextValue>({ lang: 'en', toggleLang: () => {} })

export function LandingLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  const toggleLang = useCallback(() => setLang((l) => (l === 'en' ? 'fr' : 'en')), [])
  return <LangContext.Provider value={{ lang, toggleLang }}>{children}</LangContext.Provider>
}

export function useLang() {
  return useContext(LangContext)
}
