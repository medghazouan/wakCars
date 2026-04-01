/** Operational alerts only (excludes technical / maintenance visits). */
export function getVisibleAlertCount(summary) {
  if (!summary) return 0
  return (
    (summary.overdueReservations ?? 0) +
    (summary.expiringInsurance ?? 0) +
    (summary.expiredInsurance ?? 0) +
    (summary.unpaidReservations ?? 0) +
    (summary.unresolvedDamages ?? 0)
  )
}
