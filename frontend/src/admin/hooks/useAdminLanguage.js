import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const AR_FONT_ID = 'wak-admin-noto-arabic'

/**
 * Admin UI strings (namespace `admin`) + global FR/AR toggle aligned with the public site.
 * Default language is French (see i18n config fallbackLng).
 */
export function useAdminLanguage() {
  const { t, i18n } = useTranslation('admin')
  const currentLanguage = i18n.language?.startsWith('ar') ? 'ar' : 'fr'
  const isRTL = currentLanguage === 'ar'

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = currentLanguage

    if (isRTL && !document.getElementById(AR_FONT_ID)) {
      const link = document.createElement('link')
      link.id = AR_FONT_ID
      link.href =
        'https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@700;800&family=Noto+Sans+Arabic:wght@400;500&display=swap'
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }
  }, [isRTL, currentLanguage])

  const toggleLanguage = useCallback(() => {
    const next = currentLanguage === 'fr' ? 'ar' : 'fr'
    i18n.changeLanguage(next)
  }, [currentLanguage, i18n])

  const setLanguage = useCallback(
    (lang) => {
      if (lang === 'fr' || lang === 'ar') i18n.changeLanguage(lang)
    },
    [i18n]
  )

  return {
    t,
    i18n,
    currentLanguage,
    isRTL,
    toggleLanguage,
    setLanguage,
  }
}
