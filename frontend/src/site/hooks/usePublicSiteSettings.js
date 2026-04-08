import { useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLanguage } from './useLanguage'
import api from '../services/api'

/**
 * Public site settings (`GET /settings?lang=`) shared by footer, contact, booking, etc.
 */
export function usePublicSiteSettings() {
  const { currentLanguage } = useLanguage()
  const query = useQuery({
    queryKey: ['settings', currentLanguage],
    queryFn: () => api.get('/settings', { params: { lang: currentLanguage } }),
    staleTime: 5 * 60 * 1000,
  })

  const settings = useMemo(() => query.data?.data ?? {}, [query.data])

  const pick = useCallback(
    (key, fallback) => {
      const v = settings[key]
      if (v == null) return fallback
      const str = String(v).trim()
      return str !== '' ? str : fallback
    },
    [settings]
  )

  return { ...query, settings, pick }
}
