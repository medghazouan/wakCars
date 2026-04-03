const prisma = require('./prisma');

/**
 * Recomputes reservations.payment_status from sum of non-refunded payments vs total_amount.
 */
async function syncReservationPaymentStatus(reservationId) {
  const reservation = await prisma.reservations.findUnique({
    where: { id: reservationId },
    include: { payments: true },
  });
  if (!reservation) return;

  const paid = reservation.payments
    .filter((p) => p.status !== 'REFUNDED')
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const total = Number(reservation.total_amount);

  let payment_status = 'UNPAID';
  if (paid >= total) payment_status = 'PAID';
  else if (paid > 0) payment_status = 'PARTIAL';

  await prisma.reservations.update({ where: { id: reservationId }, data: { payment_status } });
}

module.exports = { syncReservationPaymentStatus };
