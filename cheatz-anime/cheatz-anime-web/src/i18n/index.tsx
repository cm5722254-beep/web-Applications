'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import en from './en.json'

type Locale = 'en'
type TranslationDict = typeof en

const translations: Record<Locale, TranslationDict> = { en }

interface I18nContextValue {
  locale: Locale
  t: (key: string) => string
  setLocale: (l: Locale) => void
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale] = useState<Locale>('en')

  const setLocale = useCallback((_l: Locale) => {
    // English only
  }, [])

  const t = useCallback(
    (key: string): string => {
      const parts = key.split('.')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let val: any = translations.en
      for (const p of parts) {
        val = val?.[p]
      }
      return typeof val === 'string' ? val : key
    },
    []
  )

  return <I18nContext.Provider value={{ locale, t, setLocale }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
