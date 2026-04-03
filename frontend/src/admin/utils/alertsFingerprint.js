/** Stable snapshot of alert payload for “seen” comparison (badge clears until data changes). */
export function buildAlertsFingerprint(payload) {
  if (!payload?.summary) return ''
  const p = payload
  return JSON.stringify({
    s: p.summary,
    o: (p.overdueReservations || []).map((r) => r.id),
    u: (p.unpaidReservations || []).map((r) => r.id),
    e: (p.expiringInsurance || []).map((r) => r.id),
    x: (p.expiredInsurance || []).map((r) => r.id),
    d: (p.unresolvedDamages || []).map((r) => r.id),
  })
}

const STORAGE_KEY = 'wak_admin_alerts_ack_fp'

export function loadAcknowledgedAlertsFingerprint() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) || null
  } catch {
    return null
  }
}

export function saveAcknowledgedAlertsFingerprint(fp) {
  try {
    if (fp) sessionStorage.setItem(STORAGE_KEY, fp)
    else sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
