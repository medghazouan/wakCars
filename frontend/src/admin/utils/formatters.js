export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

/** Short axis labels e.g. $3.5k */
export function formatCompactCurrency(amount) {
  const n = Number(amount)
  if (!Number.isFinite(n) || n === 0) return '$0'
  if (Math.abs(n) >= 1000) {
    const k = n / 1000
    const s = k >= 10 || k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)
    return `$${s}k`
  }
  return formatCurrency(n)
}

export function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

export function formatDateTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
