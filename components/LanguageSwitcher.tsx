'use client'

import { useEffect, useRef, useState } from 'react'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { Lang } from '@/lib/i18n/translations'

const LANGUAGES: { code: Lang; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
]

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const current = LANGUAGES.find(l => l.code === lang) ?? LANGUAGES[0]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        className="flex items-center gap-1.5 rounded-full border border-green-200 dark:border-green-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm font-medium text-green-800 dark:text-green-200 hover:border-green-400 dark:hover:border-green-500 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
      >
        <Globe className="size-4 flex-shrink-0" />
        <span className="hidden sm:inline">{current.native}</span>
        <ChevronDown
          className={`size-3.5 text-green-600 dark:text-green-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          aria-label="Select language"
          className="absolute right-0 top-full mt-2 w-36 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              role="option"
              aria-selected={lang === l.code}
              onClick={() => { setLang(l.code); setOpen(false) }}
              className="flex w-full items-center justify-between px-4 py-2.5 text-sm hover:bg-green-50 dark:hover:bg-green-950 transition-colors text-slate-800 dark:text-slate-200"
            >
              <span className="font-medium">{l.native}</span>
              {lang === l.code && (
                <Check className="size-4 text-green-600 dark:text-green-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
