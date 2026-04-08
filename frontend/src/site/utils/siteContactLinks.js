/** Keys in `site_settings` (admin Paramètres). */
export const SITE_SETTING_KEYS = {
  facebook: 'footer_facebook_url',
  instagram: 'footer_instagram_url',
  phone: 'footer_phone',
  email: 'footer_email',
  address: 'footer_address',
  openingHours: 'footer_opening_hours',
  description: 'footer_description',
  whatsapp: 'footer_whatsapp_phone',
  /** @deprecated prefer `google_maps_embed`; kept for older DB rows */
  mapEmbed: 'footer_map_embed_url',
}

/** Google Maps iframe `src` (embed URL). Primary key matches common `site_settings` naming. */
export const MAP_EMBED_SETTING_KEYS = ['google_maps_embed', 'footer_map_embed_url']

/**
 * DB often uses `contact_*` / `business_hours`; older docs used `footer_*`.
 * First non-empty wins.
 */
export const PHONE_SETTING_KEYS = ['contact_phone', 'footer_phone']
export const EMAIL_SETTING_KEYS = ['contact_email', 'footer_email']
export const WHATSAPP_SETTING_KEYS = ['contact_whatsapp', 'footer_whatsapp_phone']
export const OPENING_HOURS_SETTING_KEYS = ['business_hours', 'footer_opening_hours']
/** Short blurb: explicit footer copy, else global tagline */
export const DESCRIPTION_SETTING_KEYS = ['footer_description', 'site_tagline']

export function pickFirstNonEmpty(settings, keys) {
  for (const key of keys) {
    const v = settings[key]
    if (v == null) continue
    const str = String(v).trim()
    if (str !== '') return str
  }
  return ''
}

export function addressSettingKeys(lang) {
  const isAr = String(lang || '').toLowerCase() === 'ar'
  return isAr
    ? ['contact_address_ar', 'contact_address_fr', 'footer_address']
    : ['contact_address_fr', 'footer_address']
}

export function telHref(phone) {
  const compact = String(phone).replace(/[\s().-]/g, '')
  if (!compact) return '#'
  return compact.startsWith('+') ? `tel:${compact}` : `tel:${compact.replace(/\D/g, '')}`
}

export function safeHttpUrl(url) {
  try {
    const u = new URL(String(url).trim())
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : ''
  } catch {
    return ''
  }
}

/** Digits only for https://wa.me/{digits} */
export function waMeDigits(phone) {
  return String(phone).replace(/\D/g, '')
}

export function waMeHref(phone) {
  const digits = waMeDigits(phone)
  return digits ? `https://wa.me/${digits}` : ''
}

const MAP_EMBED_HOSTS = new Set([
  'google.com',
  'www.google.com',
  'maps.google.com',
  'www.maps.google.com',
])

/**
 * Only URLs meant for iframes. Plain /maps/place/… or share links set X-Frame-Options
 * and Chrome shows "www.google.com refused to connect."
 */
function isEmbeddableGoogleMapsUrl(u) {
  const host = u.hostname.toLowerCase()
  if (!MAP_EMBED_HOSTS.has(host) && !host.endsWith('.google.com')) return false
  const path = u.pathname.toLowerCase()
  if (path.includes('/maps/embed') || path.includes('/maps/d/embed')) return true
  const output = u.searchParams.get('output')
  if (output === 'embed' && path.includes('/maps')) return true
  return false
}

export function safeMapsEmbedUrl(url) {
  try {
    const u = new URL(String(url).trim())
    if (u.protocol !== 'https:') return ''
    if (!isEmbeddableGoogleMapsUrl(u)) return ''
    return u.href
  } catch {
    return ''
  }
}

/**
 * Pin coords from a Maps place/share URL (!3d lat !4d lng). Fallback: @lat,lng,15z in path.
 */
function extractLatLngZoomFromGoogleMapsUrl(urlString) {
  const s = String(urlString)
  const pin = s.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/)
  let zoom = 15
  const at = s.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?),(\d+)z/i)
  if (at) zoom = Math.min(21, Math.max(1, parseInt(at[3], 10) || 15))
  if (pin) return { lat: pin[1], lng: pin[2], zoom }
  if (at) return { lat: at[1], lng: at[2], zoom }
  return null
}

/**
 * `google_maps_embed` may be a real embed (`/maps/embed?…`) or a place link (`/maps/place/…`).
 * Place links cannot load in an iframe; we rebuild an `output=embed` URL from coordinates in the string.
 */
export function normalizeGoogleMapsIframeSrc(raw) {
  const trimmed = String(raw || '').trim()
  if (!trimmed) return ''
  const direct = safeMapsEmbedUrl(trimmed)
  if (direct) return direct
  try {
    const u = new URL(trimmed)
    if (u.protocol !== 'https:') return ''
    const host = u.hostname.toLowerCase()
    if (!MAP_EMBED_HOSTS.has(host) && !host.endsWith('.google.com')) return ''
    if (!u.pathname.toLowerCase().includes('/maps')) return ''
    const llz = extractLatLngZoomFromGoogleMapsUrl(trimmed)
    if (!llz) return ''
    const q = `${llz.lat},${llz.lng}`
    return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed&z=${llz.zoom}`
  } catch {
    return ''
  }
}
