import { useTranslation } from 'react-i18next'
import { useCallback } from 'react'

export const useLanguage = () => {
  const { i18n, t } = useTranslation()

  const currentLanguage = i18n.language
  const isRTL = currentLanguage === 'ar'

  const toggleLanguage = useCallback(() => {
    const newLang = currentLanguage === 'fr' ? 'ar' : 'fr'
    i18n.changeLanguage(newLang)
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = newLang
  }, [currentLanguage, i18n])

  const setLanguage = useCallback((lang) => {
    if (lang === 'fr' || lang === 'ar') {
      i18n.changeLanguage(lang)
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
      document.documentElement.lang = lang
    }
  }, [i18n])

  const getLocalizedField = useCallback((obj, field) => {
    if (!obj) return ''
    const localizedField = `${field}_${currentLanguage}`
    return obj[localizedField] || obj[`${field}_fr`] || obj[field] || ''
  }, [currentLanguage])

  return {
    t,
    currentLanguage,
    isRTL,
    toggleLanguage,
    setLanguage,
    getLocalizedField,
  }
}

export default useLanguage
