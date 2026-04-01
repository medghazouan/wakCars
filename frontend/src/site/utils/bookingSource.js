const ALLOWED = [
  'WEBSITE',
  'WHATSAPP',
  'PHONE',
  'INSTAGRAM',
  'FACEBOOK',
  'REFERRAL',
  'PARTNER',
  'OTHER',
]

/** Maps ?source=whatsapp → WHATSAPP; default WEBSITE (PRD). */
export function normalizeBookingSource(raw) {
  if (raw == null || raw === '') return 'WEBSITE'
  const u = String(raw)
    .trim()
    .toUpperCase()
    .replace(/-/g, '_')
  if (ALLOWED.includes(u)) return u
  return 'OTHER'
}
