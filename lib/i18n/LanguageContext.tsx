'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Lang, TranslationKey, translations } from './translations'

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('lang') as Lang | null
    if (stored === 'en' || stored === 'mr') {
      setLangState(stored)
    }
    setMounted(true)
  }, [])

  const setLang = (newLang: Lang) => {
    setLangState(newLang)
    localStorage.setItem('lang', newLang)
  }

  const t = (key: TranslationKey): string => {
    return translations[lang][key] ?? key
  }

  // Avoid hydration mismatch: render children with default lang on first pass
  if (!mounted) {
    const tDefault = (key: TranslationKey): string => translations['en'][key] ?? key
    return (
      <LanguageContext.Provider value={{ lang: 'en', setLang, t: tDefault }}>
        {children}
      </LanguageContext.Provider>
    )
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
