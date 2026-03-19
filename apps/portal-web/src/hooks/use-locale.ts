'use client';

import { useState, useCallback } from 'react';
import { type Locale, t as translate } from '@/lib/i18n';

export function useLocale() {
  const [locale, setLocale] = useState<Locale>('vi');

  const t = useCallback(
    (key: string, params?: Record<string, string>) => translate(key, locale, params),
    [locale]
  );

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === 'vi' ? 'en' : 'vi'));
  }, []);

  return { locale, setLocale, toggleLocale, t };
}
