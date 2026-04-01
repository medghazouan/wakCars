/** Base path for the staff dashboard (single-SPA combined frontend). */
export const ADMIN_BASE = '/admin'

/** @param {string} path Absolute segment after admin, e.g. "/dashboard" or "fleet/new" */
export function adminPath(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${ADMIN_BASE}${p}`
}
