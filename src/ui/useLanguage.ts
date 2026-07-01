'use client';

import { useCallback, useState } from 'react';
import { getDefaultLanguage, setStoredLanguage, translations, type Language, type Translation } from '../platform/i18n';

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => getDefaultLanguage());

  const t = translations[language];

  const changeLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    setStoredLanguage(lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    const next: Language = language === 'ru' ? 'en' : 'ru';
    changeLanguage(next);
  }, [language, changeLanguage]);

  return { language, t, changeLanguage, toggleLanguage };
}

export type { Language, Translation };
