/** PRD: booking source captured at submission — normalized uppercase tokens. */
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

function normalizeBookingSource(raw) {
  if (raw == null || raw === '') return 'WEBSITE'
  const u = String(raw)
    .trim()
    .toUpperCase()
    .replace(/-/g, '_')
  if (ALLOWED.includes(u)) return u
  return 'OTHER'
}

module.exports = { normalizeBookingSource, ALLOWED_BOOKING_SOURCES: ALLOWED }
