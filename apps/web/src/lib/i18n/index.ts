'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { en, type TranslationKeys } from './locales/en'
import { ptBR } from './locales/pt-BR'
import { es } from './locales/es'

export type SupportedLanguage = 'en' | 'pt-BR' | 'es'

const LOCALES: Record<SupportedLanguage, TranslationKeys> = {
  'en': en,
  'pt-BR': ptBR,
  'es': es,
}

interface I18nContextValue {
  t: TranslationKeys
  language: SupportedLanguage
}

const I18nContext = createContext<I18nContextValue>({
  t: en,
  language: 'en',
})

export function useTranslation() {
  return useContext(I18nContext)
}

export { I18nContext, LOCALES }
export type { TranslationKeys }
